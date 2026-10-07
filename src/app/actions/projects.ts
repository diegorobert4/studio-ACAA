'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Project } from '@/data';
import { statusToEstado } from '@/lib/project-status';
import { IMAGES_BUCKET, imagePathFromUrl } from '@/lib/storage';
import { createClient } from '@/lib/supabase/server';

// En producción Next.js oculta el mensaje de las excepciones lanzadas por una Server Action,
// así que los fallos se devuelven como { error } con un texto pensado para el usuario.
// El detalle real (códigos y mensajes de Postgres/Supabase) solo va a los logs del servidor.
export type ActionResult = { error?: string };

type DbError = { code?: string; message: string };

const SESSION_EXPIRED = 'Tu sesión expiró. Volvé a iniciar sesión.';

function fail(context: string, error: unknown, fallback: string, byCode: Record<string, string> = {}): ActionResult {
  console.error(`[${context}]`, error);
  const code = (error as DbError | null)?.code;
  const message = (code && byCode[code]) || (code === '42501' ? 'No tenés permisos para realizar esta acción.' : fallback);
  return { error: message };
}

async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? supabase : null;
}

async function persistProject(project: Project): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return { error: SESSION_EXPIRED };
  if (!project.title.trim()) return { error: 'El nombre del proyecto es obligatorio.' };
  const surface = Number.parseFloat(project.area.replace(',', '.').replace(/[^0-9.]/g, ''));
  const year = Number.parseInt(project.year, 10);
  const { data, error } = await supabase.from('proyectos').upsert({
    id: project.id, nombre: project.title.trim(), estado: statusToEstado(project.status), publicado: project.published, orden: project.order, actualizado_en: new Date().toISOString(),
    ubicacion: project.location.trim() || null, anio: Number.isNaN(year) ? null : year, superficie: Number.isNaN(surface) ? null : surface,
    arquitectos: project.architects.trim() || null, arquitectos_asociados: project.associatedArchitects?.trim() || null,
    colaboradores: project.collaborators?.trim() || null, instagram_url: project.instagramUrl?.trim() || null,
  }).select('id').single();
  if (error) return fail('saveProject:proyectos', error, 'No se pudo guardar el proyecto. Intentá de nuevo.', {
    '23514': 'Hay datos no válidos en el proyecto. Revisá el estado de avance, el año y la superficie.',
    '22003': 'La superficie o el año tienen un valor demasiado grande.',
  });
  const { data: previousImages } = await supabase.from('imagenes_proyecto').select('url').eq('proyecto_id', data.id);
  const [removeImages, removeLinks, removePublications] = await Promise.all([
    supabase.from('imagenes_proyecto').delete().eq('proyecto_id', data.id),
    supabase.from('links_socio').delete().eq('proyecto_id', data.id),
    supabase.from('publicaciones').delete().eq('proyecto_id', data.id),
  ]);
  const removeFailure = removeImages.error || removeLinks.error || removePublications.error;
  if (removeFailure) return fail('saveProject:limpiar-relaciones', removeFailure, 'No se pudieron actualizar las imágenes, enlaces y publicaciones del proyecto. Intentá de nuevo.');
  if (project.images.length) {
    const { error: imageError } = await supabase.from('imagenes_proyecto').insert(project.images.map((image, index) =>
      ({ id: image.id, proyecto_id: data.id, url: image.url, orden: index + 1 })));
    if (imageError) return fail('saveProject:imagenes', imageError, 'No se pudieron guardar las imágenes del proyecto. Intentá de nuevo.');
  }
  if (project.partnerLinks?.length) {
    const { error: linksError } = await supabase.from('links_socio').insert(project.partnerLinks.map((url, index) => ({ proyecto_id: data.id, url, orden: index + 1 })));
    if (linksError) return fail('saveProject:links', linksError, 'No se pudieron guardar los enlaces de socios. Intentá de nuevo.');
  }
  if (project.publications?.length) {
    const { error: publicationsError } = await supabase.from('publicaciones').insert(project.publications.map((publication, index) => ({ proyecto_id: data.id, nombre: publication.name, tipo: publication.type, url: publication.url || null, orden: index + 1 })));
    if (publicationsError) return fail('saveProject:publicaciones', publicationsError, 'No se pudieron guardar las publicaciones. Intentá de nuevo.', {
      '23514': 'Alguna publicación tiene un tipo no válido.',
    });
  }
  // Archivos de imágenes que ya no están en el proyecto: se borran recién ahora que el guardado salió bien.
  const keptUrls = new Set(project.images.map((image) => image.url));
  const orphanPaths = (previousImages ?? []).filter((image) => !keptUrls.has(image.url))
    .map((image) => imagePathFromUrl(image.url)).filter((path): path is string => path !== null);
  if (orphanPaths.length) {
    const { error: storageError } = await supabase.storage.from(IMAGES_BUCKET).remove(orphanPaths);
    if (storageError) console.error('No se pudieron borrar archivos huérfanos:', storageError.message);
  }
  return {};
}

export async function saveProject(project: Project): Promise<ActionResult> {
  let result: ActionResult;
  try {
    result = await persistProject(project);
  } catch (error) {
    return fail('saveProject', error, 'No se pudo guardar el proyecto. Intentá de nuevo.');
  }
  if (result.error) return result;
  revalidatePath('/'); revalidatePath('/admin'); revalidatePath('/admin/dashboard');
  redirect('/admin');
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const supabase = await getAdminClient();
    if (!supabase) return { error: SESSION_EXPIRED };
    const { error } = await supabase.from('proyectos').delete().eq('id', id);
    if (error) return fail('deleteProject', error, 'No se pudo eliminar el proyecto. Intentá de nuevo.', {
      '23503': 'No se pudo eliminar: el proyecto tiene datos asociados.',
    });
    // La fila ya se borró; limpiar la carpeta del proyecto en el bucket (un fallo acá no debe revertir el borrado).
    const folder = `projects/${id}`;
    const { data: files } = await supabase.storage.from(IMAGES_BUCKET).list(folder, { limit: 1000 });
    if (files?.length) {
      const { error: storageError } = await supabase.storage.from(IMAGES_BUCKET).remove(files.map((file) => `${folder}/${file.name}`));
      if (storageError) console.error('No se pudieron borrar los archivos del proyecto:', storageError.message);
    }
    revalidatePath('/'); revalidatePath('/admin'); revalidatePath('/admin/dashboard');
    return {};
  } catch (error) {
    return fail('deleteProject', error, 'No se pudo eliminar el proyecto. Intentá de nuevo.');
  }
}

export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  try {
    const supabase = await getAdminClient();
    if (!supabase) return { error: SESSION_EXPIRED };
    const results = await Promise.all(ids.map((id, index) => supabase.from('proyectos').update({ orden: index + 1 }).eq('id', id)));
    const failure = results.find((result) => result.error)?.error;
    if (failure) return fail('reorderProjects', failure, 'No se pudo guardar el nuevo orden. Intentá de nuevo.');
    revalidatePath('/'); revalidatePath('/admin'); revalidatePath('/admin/dashboard');
    return {};
  } catch (error) {
    return fail('reorderProjects', error, 'No se pudo guardar el nuevo orden. Intentá de nuevo.');
  }
}
