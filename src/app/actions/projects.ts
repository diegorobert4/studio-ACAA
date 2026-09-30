'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Project, ProjectStatus } from '@/data';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
  return supabase;
}

export async function saveProject(project: Project) {
  const supabase = await requireAdmin();
  if (!project.title.trim()) throw new Error('El nombre del proyecto es obligatorio.');
  const surface = Number.parseFloat(project.area.replace(',', '.').replace(/[^0-9.]/g, ''));
  const year = Number.parseInt(project.year, 10);
  const { data, error } = await supabase.from('proyectos').upsert({
    id: project.id, nombre: project.title.trim(), estado: project.status as ProjectStatus, orden: project.order,
    ubicacion: project.location.trim() || null, anio: Number.isNaN(year) ? null : year, superficie: Number.isNaN(surface) ? null : surface,
    arquitectos: project.architects.trim() || null, arquitectos_asociados: project.associatedArchitects?.trim() || null,
    colaboradores: project.collaborators?.trim() || null, instagram_url: project.instagramUrl?.trim() || null,
  }).select('id').single();
  if (error) throw new Error(error.message);
  const { error: removeImagesError } = await supabase.from('imagenes_proyecto').delete().eq('proyecto_id', data.id);
  const { error: removeLinksError } = await supabase.from('links_socio').delete().eq('proyecto_id', data.id);
  const { error: removePublicationsError } = await supabase.from('publicaciones').delete().eq('proyecto_id', data.id);
  if (removeImagesError || removeLinksError || removePublicationsError) throw new Error((removeImagesError || removeLinksError || removePublicationsError)!.message);
  if (project.images.length) {
    const { error: imageError } = await supabase.from('imagenes_proyecto').insert(project.images.map((image, index) =>
      ({ id: image.id, proyecto_id: data.id, url: image.url, orden: index + 1 })));
    if (imageError) throw new Error(imageError.message);
  }
  if (project.partnerLinks?.length) {
    const { error: linksError } = await supabase.from('links_socio').insert(project.partnerLinks.map((url, index) => ({ proyecto_id: data.id, url, orden: index + 1 })));
    if (linksError) throw new Error(linksError.message);
  }
  if (project.publications?.length) {
    const { error: publicationsError } = await supabase.from('publicaciones').insert(project.publications.map((nombre, index) => ({ proyecto_id: data.id, nombre, orden: index + 1 })));
    if (publicationsError) throw new Error(publicationsError.message);
  }
  revalidatePath('/'); revalidatePath('/admin'); redirect('/admin');
}

export async function deleteProject(id: string) {
  const supabase = await requireAdmin(); const { error } = await supabase.from('proyectos').delete().eq('id', id);
  if (error) throw new Error(error.message); revalidatePath('/'); revalidatePath('/admin');
}

export async function reorderProjects(ids: string[]) {
  const supabase = await requireAdmin();
  const results = await Promise.all(ids.map((id, index) => supabase.from('proyectos').update({ orden: index + 1 }).eq('id', id)));
  const failure = results.find((result) => result.error)?.error;
  if (failure) throw new Error(failure.message); revalidatePath('/'); revalidatePath('/admin');
}
