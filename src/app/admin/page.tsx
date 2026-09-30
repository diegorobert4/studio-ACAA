import ProjectList from '@/components/admin/ProjectList';
import { getAdminProjects } from '@/lib/projects';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminProjects() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return <ProjectList projects={await getAdminProjects()} />;
}
