'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Project, Publication, PublicationType } from '@/data';
import { saveProject } from '@/app/actions/projects';
import { Upload, ChevronUp, ChevronDown, Plus, X } from 'lucide-react';

interface ProjectEditorProps {
  id: string;
  initialProject: Project | null;
  nextOrder: number;
}

const publicationTypes: PublicationType[] = [
  'Revista digital',
  'Libro físico',
  'Página web',
  'Instagram',
  'Otro',
];

const label = 'font-mono text-xs uppercase tracking-widest text-neutral-500';
const input =
  'w-full rounded-none border-0 border-b border-neutral-300 bg-transparent py-2 text-base text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blueprint';
const ghostBtn =
  'inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-blueprint';
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
    <section className={`border border-neutral-200 bg-white p-6 ${className}`}>
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
    setProject({ ...project, publications: [...publications, { name: '', type: 'Revista digital', url: '' }] });
  };
  const removePublication = (index: number) => {
    setProject({ ...project, publications: publications.filter((_, i) => i !== index) });
  };

  const addImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const stamp = Date.now();
    const added = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map((file, i) => ({
        id: `img${stamp}-${i}`,
        url: URL.createObjectURL(file),
        order: project.images.length + i + 1,
      }));
    setProject({ ...project, images: [...project.images, ...added] });
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
    setProject({ ...project, images: project.images.filter(img => img.id !== imageId) });
  };

  const handleSave = async () => {
    try {
      await saveProject({
        ...project,
        partnerLinks: partnerLinks.filter(l => l.trim() !== ''),
        publications: publications.filter(p => p.name.trim() !== ''),
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo guardar el proyecto.');
    }
  };

  return (
    <div>
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-4 font-mono text-xs uppercase tracking-widest text-neutral-400">
            <Link href="/admin" className="hover:text-blueprint">Proyectos</Link> / {isNew ? 'Nuevo proyecto' : project.title}
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-neutral-900">
            {isNew ? 'Nuevo proyecto' : project.title}
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin"
            className="border border-neutral-300 px-6 py-3 text-xs uppercase tracking-widest text-neutral-900 transition-colors hover:border-blueprint hover:text-blueprint"
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
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pub.name}
                        onChange={(e) => updatePublication(index, { name: e.target.value })}
                        className={`${input} min-w-0 flex-1 py-1 text-sm`}
                        placeholder="ArchDaily"
                        aria-label="Nombre de la publicación"
                      />
                      <select
                        value={pub.type}
                        onChange={(e) => updatePublication(index, { type: e.target.value as PublicationType })}
                        className={`${input} min-w-0 shrink-0 grow-0 basis-32 py-1 text-sm`}
                        aria-label="Tipo de publicación"
                      >
                        {publicationTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
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
            className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-neutral-300 bg-neutral-50 p-10 text-neutral-500 transition-colors hover:border-blueprint hover:text-blueprint"
          >
            <Upload size={24} />
            <span className="text-sm">Arrastrá imágenes acá o hacé clic para subir</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                addImages(e.target.files);
                e.target.value = '';
              }}
            />
          </label>

          {project.images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {project.images.map((img, index) => (
                <div key={img.id} className="border border-neutral-200 bg-white">
                  <Image
                    src={img.url}
                    alt=""
                    width={320}
                    height={200}
                    unoptimized={img.url.startsWith('blob:')}
                    className="aspect-[8/5] w-full object-cover"
                  />
                  <div className="flex items-center justify-between border-t border-neutral-200 px-2 py-1">
                    <span className="font-mono text-xs tracking-widest text-neutral-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex items-center">
                      <button type="button" className={iconBtn} onClick={() => moveImage(index, 'up')} disabled={index === 0} aria-label="Subir imagen">
                        <ChevronUp size={18} />
                      </button>
                      <button type="button" className={iconBtn} onClick={() => moveImage(index, 'down')} disabled={index === project.images.length - 1} aria-label="Bajar imagen">
                        <ChevronDown size={18} />
                      </button>
                      <button type="button" className={`${iconBtn} hover:text-[#b45454]`} onClick={() => removeImage(img.id)} aria-label="Eliminar imagen">
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