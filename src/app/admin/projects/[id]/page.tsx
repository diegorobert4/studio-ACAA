import ProjectEditor from '@/components/admin/ProjectEditor';
import { getAdminProject, getAdminProjects } from '@/lib/projects';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { id } = await params;
  const [project, projects] = await Promise.all([id === 'new' ? null : getAdminProject(id), getAdminProjects()]);
  return <ProjectEditor id={id} initialProject={project} nextOrder={projects.length + 1} />;
}
