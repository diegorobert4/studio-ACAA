import { cache } from 'react';
import { initialProjects, type Project, type ProjectImage, type PublicationType } from '@/data';
import { estadoToStatus } from '@/lib/project-status';
import { createClient } from '@/lib/supabase/server';

type ProjectRow = {
  id: string; nombre: string; estado: string; publicado: boolean; actualizado_en: string | null; orden: number; ubicacion: string | null; anio: number | null; superficie: number | null;
  arquitectos: string | null; arquitectos_asociados: string | null; colaboradores: string | null; instagram_url: string | null;
  imagenes_proyecto: Array<{ id: string; url: string; orden: number }> | null;
  links_socio: Array<{ url: string; orden: number }> | null;
  publicaciones: Array<{ nombre: string; tipo: string; url: string | null; orden: number }> | null;
};

function toProject(row: ProjectRow): Project {
  return { id: row.id, title: row.nombre, status: estadoToStatus(row.estado), published: row.publicado, updatedAt: row.actualizado_en || undefined, order: row.orden, location: row.ubicacion || '',
    year: row.anio?.toString() || '', area: row.superficie?.toString() || '', architects: row.arquitectos || '',
    associatedArchitects: row.arquitectos_asociados || undefined, collaborators: row.colaboradores || undefined,
    instagramUrl: row.instagram_url || undefined, partnerLinks: row.links_socio?.sort((a, b) => a.orden - b.orden).map((link) => link.url),
    publications: row.publicaciones?.sort((a, b) => a.orden - b.orden).map((publication) => ({ name: publication.nombre, type: publication.tipo as PublicationType, url: publication.url || undefined })),
    images: (row.imagenes_proyecto || []).sort((a, b) => a.orden - b.orden)
      .map((image): ProjectImage => ({ id: image.id, url: image.url, order: image.orden })) };
}

const select = '*, imagenes_proyecto(id, url, orden), links_socio(url, orden), publicaciones(nombre, tipo, url, orden)';
export const getPublicProjects = cache(async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('proyectos').select(select).eq('publicado', true).order('orden');
    if (error) throw error;
    return (data as unknown as ProjectRow[]).map(toProject);
  } catch {
    return initialProjects;
  }
});
export async function getAdminProjects() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('proyectos').select(select).order('orden');
    if (error) throw error;
    return (data as unknown as ProjectRow[]).map(toProject);
  } catch {
    return [];
  }
}
export async function getAdminProject(id: string) {
  const supabase = await createClient(); const { data, error } = await supabase.from('proyectos').select(select).eq('id', id).single();
  return error ? null : toProject(data as unknown as ProjectRow);
}
