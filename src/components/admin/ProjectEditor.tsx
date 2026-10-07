'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { publicationTypeLabels, type Project, type Publication, type PublicationType } from '@/data';
import { saveProject } from '@/app/actions/projects';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { compressToWebp } from '@/lib/image-compress';
import { IMAGES_BUCKET, IMAGE_MAX_BYTES, IMAGE_TYPES, imagePathFromUrl, storageErrorMessage } from '@/lib/storage';
import { Upload, ChevronUp, ChevronDown, Plus, X } from 'lucide-react';

interface ProjectEditorProps {
  id: string;
  initialProject: Project | null;
  nextOrder: number;
}

const publicationTypes = Object.keys(publicationTypeLabels) as PublicationType[];

const sizeError = (name: string, bytes: number) =>
  `"${name}": pesa ${(bytes / 1024 / 1024).toFixed(1)} MB y el máximo es ${IMAGE_MAX_BYTES / 1024 / 1024} MB.`;

const label = 'font-mono text-xs uppercase tracking-widest text-neutral-500';
const input =
  'w-full rounded-none border-0 border-b border-neutral-300 bg-transparent py-2 text-base text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blueprint';
const ghostBtn =
  'inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-blueprint';
const imgBtn =
  'flex h-10 w-10 shrink-0 items-center justify-center text-neutral-400 transition-colors hover:text-blueprint disabled:opacity-30 disabled:hover:text-neutral-400 sm:h-8 sm:w-8';
const iconBtn =
  'flex h-8 w-8 shrink-0 items-center justify-center text-neutral-400 transition-colors hover:text-blueprint disabled:opacity-30 disabled:hover:text-neutral-400';

function Section({
  number,
  title,
  className = '',
  children,
}: {
  number: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`min-w-0 border border-neutral-200 bg-white p-4 sm:p-6 ${className}`}>
      <h3 className="mb-6 flex items-baseline gap-3 border-b border-neutral-200 pb-3">
        <span className="font-mono text-xs tracking-widest text-blueprint">{number}</span>
        <span className="font-heading text-lg font-bold tracking-tight text-neutral-900">
          {title}
        </span>
      </h3>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Field({ label: text, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={label}>{text}</label>
      {children}
    </div>
  );
}

export default function ProjectEditor({ id, initialProject, nextOrder }: ProjectEditorProps) {
  const isNew = id === 'new';

  const [project, setProject] = useState<Project>(() => {
    if (!isNew && initialProject) return { ...initialProject };
    return {
      id: crypto.randomUUID(),
      title: '',
      status: 'Anteproyecto',
      published: false,
      order: nextOrder,
      location: '',
      year: '',
      area: '',
      architects: 'Studio ACAA',
      associatedArchitects: '',
      collaborators: '',
      instagramUrl: '',
      partnerLinks: [],
      publications: [],
      images: [],
    };
  });
  const [isUploading, setIsUploading] = useState(false);
  const [stage, setStage] = useState<'processing' | 'uploading'>('processing');
  const [uploadError, setUploadError] = useState('');
  const uploadedIds = useRef(new Set<string>());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProject({ ...project, [name]: value });
  };

  const partnerLinks = project.partnerLinks ?? [];
  const publications = project.publications ?? [];

  const updatePartnerLink = (index: number, value: string) => {
    setProject({ ...project, partnerLinks: partnerLinks.map((l, i) => (i === index ? value : l)) });
  };
  const addPartnerLink = () => setProject({ ...project, partnerLinks: [...partnerLinks, ''] });
  const removePartnerLink = (index: number) => {
    setProject({ ...project, partnerLinks: partnerLinks.filter((_, i) => i !== index) });
  };

  const updatePublication = (index: number, changes: Partial<Publication>) => {
    setProject({
      ...project,
      publications: publications.map((p, i) => (i === index ? { ...p, ...changes } : p)),
    });
  };
  const addPublication = () => {
    setProject({ ...project, publications: [...publications, { name: '', type: 'revista_digital', url: '' }] });
  };
  const removePublication = (index: number) => {
    setProject({ ...project, publications: publications.filter((_, i) => i !== index) });
  };

  const addImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const errors: string[] = [];
    const valid = Array.from(files).filter((file) => {
      if (!(file.type in IMAGE_TYPES)) {
        errors.push(`"${file.name}": formato no permitido (solo JPG, PNG o WebP).`);
        return false;
      }
      if (file.size > IMAGE_MAX_BYTES) {
        errors.push(sizeError(file.name, file.size));
        return false;
      }
      return true;
    });
    setUploadError(errors.join('\n'));
    if (!valid.length) return;
    setIsUploading(true);
    setStage('processing');
    // Se comprime de a una para no tener varias fotos grandes decodificadas en memoria a la vez.
    const processed: { name: string; blob: Blob }[] = [];
    for (const file of valid) {
      try {
        const blob = await compressToWebp(file);
        if (blob.size > IMAGE_MAX_BYTES) errors.push(sizeError(file.name, blob.size));
        else processed.push({ name: file.name, blob });
      } catch (error) {
        errors.push(`"${file.name}": ${error instanceof Error ? error.message : 'no se pudo procesar la imagen.'}`);
      }
    }
    setStage('uploading');
    const supabase = createSupabaseClient();
    const results = await Promise.allSettled(processed.map(async ({ name, blob }) => {
      const id = crypto.randomUUID();
      const path = `projects/${project.id}/${id}.webp`;
      const { error } = await supabase.storage.from(IMAGES_BUCKET).upload(path, blob, {
        cacheControl: '31536000', contentType: 'image/webp', upsert: false,
      });
      if (error) throw new Error(`"${name}": ${storageErrorMessage(error)}`);
      const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
      return { id, url: data.publicUrl, order: 0 };
    }));
    const added = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
    results.forEach((result) => {
      if (result.status === 'rejected') errors.push(result.reason instanceof Error ? result.reason.message : 'No se pudo subir una imagen.');
    });
    added.forEach((image) => uploadedIds.current.add(image.id));
    setProject((current) => ({
      ...current,
      images: [...current.images, ...added].map((image, index) => ({ ...image, order: index + 1 })),
    }));
    setUploadError(errors.join('\n'));
    setIsUploading(false);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === project.images.length - 1) return;

    const newImages = [...project.images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    setProject({ ...project, images: newImages });
  };

  const removeImage = (imageId: string) => {
    const image = project.images.find((img) => img.id === imageId);
    setProject({ ...project, images: project.images.filter(img => img.id !== imageId) });
    // Subida en esta sesión y todavía sin guardar: nadie la referencia, se borra ya.
    // Las imágenes ya guardadas se borran del bucket en saveProject(), así cancelar no deja filas rotas.
    const path = image && uploadedIds.current.has(imageId) ? imagePathFromUrl(image.url) : null;
    if (path) {
      uploadedIds.current.delete(imageId);
      createSupabaseClient().storage.from(IMAGES_BUCKET).remove([path]).then(({ error }) => {
        if (error) setUploadError(`No se pudo borrar el archivo del almacenamiento: ${storageErrorMessage(error)}`);
      });
    }
  };

  const handleSave = async () => {
    try {
      const result = await saveProject({
        ...project,
        partnerLinks: partnerLinks.filter(l => l.trim() !== ''),
        publications: publications.filter(p => p.name.trim() !== ''),
      });
      // Los fallos controlados llegan como { error }; el éxito redirige y nunca vuelve acá.
      if (result?.error) toast.error(result.error);
    } catch (error) {
      // redirect() de la Server Action se propaga como excepción NEXT_REDIRECT: es éxito, no un error.
      const digest = (error as { digest?: unknown } | null)?.digest;
      if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
        // El Toaster vive en el layout de /admin, así que el toast sigue visible tras la redirección.
        toast.success('Proyecto guardado.');
        throw error;
      }
      // Cualquier otra excepción llega sin detalle desde el servidor (Next lo oculta en producción).
      toast.error('No se pudo guardar el proyecto. Revisá tu conexión e intentá de nuevo.');
    }
  };

  return (
    <div>
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-4 font-mono text-xs uppercase tracking-widest text-neutral-400">
            <Link href="/admin" className="hover:text-blueprint">Proyectos</Link> / {isNew ? 'Nuevo proyecto' : project.title}
          </div>
          <h1 className="break-words font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {isNew ? 'Nuevo proyecto' : project.title}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Link
            href="/admin"
            className="border border-neutral-300 px-6 py-3 text-center text-xs uppercase tracking-widest text-neutral-900 transition-colors hover:border-blueprint hover:text-blueprint"
          >
            Cancelar
          </Link>
          <button
            onClick={handleSave}
            className="bg-neutral-900 px-6 py-3 text-xs uppercase tracking-widest text-white transition-colors hover:bg-neutral-700"
          >
            Guardar cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:auto-rows-fr lg:grid-cols-2">
        <Section number="01" title="Información básica">
          <Field label="Nombre del proyecto">
            <input type="text" name="title" value={project.title} onChange={handleChange} className={input} />
          </Field>
          <Field label="Ubicación">
            <input type="text" name="location" value={project.location} onChange={handleChange} className={input} />
          </Field>
          <div className="grid grid-cols-2 gap-6">
            <Field label="Año">
              <input type="text" name="year" value={project.year} onChange={handleChange} className={input} />
            </Field>
            <Field label="Superficie (m²)">
              <input type="text" name="area" value={project.area} onChange={handleChange} className={input} />
            </Field>
          </div>
          <Field label="Estado de avance">
            <select name="status" value={project.status} onChange={handleChange} className={input}>
              <option value="Anteproyecto">En proyecto</option>
              <option value="En obra">En construcción</option>
              <option value="Completado">Completado</option>
            </select>
          </Field>
        </Section>

        <Section number="02" title="Equipo y créditos">
          <Field label="Arquitectos">
            <input type="text" name="architects" value={project.architects} onChange={handleChange} className={input} />
          </Field>
          <Field label="Arquitectos asociados">
            <input type="text" name="associatedArchitects" value={project.associatedArchitects || ''} onChange={handleChange} className={input} />
          </Field>
          <Field label="Colaboradores">
            <textarea
              name="collaborators"
              value={project.collaborators || ''}
              onChange={handleChange}
              rows={3}
              className={`${input} resize-y`}
            />
          </Field>
        </Section>

        <Section number="03" title="Estado en el sitio">
          <div className="flex items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={project.published}
              aria-label="Publicado"
              onClick={() => setProject({ ...project, published: !project.published })}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                project.published ? 'bg-blueprint' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  project.published ? 'translate-x-5' : ''
                }`}
              />
            </button>
            <span className="font-mono text-sm uppercase tracking-widest text-neutral-900">
              {project.published ? 'Publicado' : 'Borrador'}
            </span>
          </div>
          <p className="text-sm text-neutral-500">
            {project.published
              ? 'Visible en la vista Inicio del sitio.'
              : 'Solo visible en el Admin hasta que lo publiques.'}
          </p>

          <div className="border-t border-neutral-200 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className={label}>Publicaciones</span>
              <button type="button" onClick={addPublication} className={ghostBtn}>
                <Plus size={14} /> Agregar publicación
              </button>
            </div>
            {publications.length === 0 ? (
              <p className="text-sm text-neutral-400">Sin publicaciones.</p>
            ) : (
              <div className="max-h-52 divide-y divide-neutral-200 overflow-y-auto overflow-x-hidden">
                {publications.map((pub, index) => (
                  <div key={index} className="flex flex-col gap-1 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={pub.name}
                        onChange={(e) => updatePublication(index, { name: e.target.value })}
                        className={`${input} min-w-0 basis-full py-1 text-sm sm:flex-1 sm:basis-0`}
                        placeholder="ArchDaily"
                        aria-label="Nombre de la publicación"
                      />
                      <select
                        value={pub.type}
                        onChange={(e) => updatePublication(index, { type: e.target.value as PublicationType })}
                        className={`${input} min-w-0 shrink-0 grow basis-32 py-1 text-sm sm:grow-0`}
                        aria-label="Tipo de publicación"
                      >
                        {publicationTypes.map(type => (
                          <option key={type} value={type}>{publicationTypeLabels[type]}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => removePublication(index)} className={`${iconBtn} h-6 w-6`} aria-label="Eliminar publicación">
                        <X size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={pub.url ?? ''}
                      onChange={(e) => updatePublication(index, { url: e.target.value })}
                      className={`${input} py-1 text-xs`}
                      placeholder="URL (opcional)"
                      aria-label="URL de la publicación"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        <Section number="04" title="Enlaces">
          <Field label="Link de Instagram">
            <input
              type="text"
              name="instagramUrl"
              value={project.instagramUrl || ''}
              onChange={handleChange}
              className={input}
              placeholder="https://instagram.com/p/..."
            />
          </Field>
          <div className="flex flex-col gap-3">
            <span className={label}>Webs de socios colaboradores</span>
            {partnerLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link}
                  onChange={(e) => updatePartnerLink(index, e.target.value)}
                  className={input}
                  placeholder="https://..."
                  aria-label={`Link ${index + 1}`}
                />
                <button type="button" onClick={() => removePartnerLink(index)} className={iconBtn} aria-label="Eliminar link">
                  <X size={16} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addPartnerLink} className={`${ghostBtn} self-start`}>
              <Plus size={14} /> Agregar link
            </button>
          </div>
        </Section>
      </div>

      <div className="mt-6">
        <Section number="05" title="Imágenes">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addImages(e.dataTransfer.files);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-neutral-500 sm:p-10 transition-colors hover:border-blueprint hover:text-blueprint"
          >
            <Upload size={24} />
            <span className="text-sm">
              <span className="hidden sm:inline">Arrastrá imágenes acá o hacé clic para subir</span>
              <span className="sm:hidden">Tocá para subir imágenes</span>
            </span>
            <input
              type="file"
              accept={Object.keys(IMAGE_TYPES).join(',')}
              multiple
              disabled={isUploading}
              className="sr-only"
              onChange={(e) => {
                addImages(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
          {isUploading && (
            <p className="text-sm text-neutral-500">
              {stage === 'processing' ? 'Comprimiendo imágenes…' : 'Subiendo imágenes…'}
            </p>
          )}
          {uploadError && <p className="whitespace-pre-line text-sm text-[#a64b4b]" role="alert">{uploadError}</p>}

          {project.images.length > 0 && (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {project.images.map((img, index) => (
                <div key={img.id} className="border border-neutral-200 bg-white">
                  <Image
                    src={img.url}
                    alt=""
                    width={320}
                    height={200}
                    className="aspect-[8/5] w-full object-cover"
                  />
                  <div className="flex items-center justify-between border-t border-neutral-200 px-2 py-1">
                    <span className="font-mono text-xs tracking-widest text-neutral-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex items-center">
                      <button type="button" className={imgBtn} onClick={() => moveImage(index, 'up')} disabled={index === 0} aria-label="Subir imagen">
                        <ChevronUp size={18} />
                      </button>
                      <button type="button" className={imgBtn} onClick={() => moveImage(index, 'down')} disabled={index === project.images.length - 1} aria-label="Bajar imagen">
                        <ChevronDown size={18} />
                      </button>
                      <button type="button" className={`${imgBtn} hover:text-[#b45454]`} onClick={() => removeImage(img.id)} aria-label="Eliminar imagen">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
