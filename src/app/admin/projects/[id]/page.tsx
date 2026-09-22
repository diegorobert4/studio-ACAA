import { use } from 'react';
import ProjectEditor from '@/components/admin/ProjectEditor';

export default function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  
  return <ProjectEditor id={unwrappedParams.id} />;
}
