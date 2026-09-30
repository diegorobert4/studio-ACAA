import Portfolio from '@/components/public/Portfolio';
import { getPublicProjects } from '@/lib/projects';

export default async function Home() {
  return <Portfolio projects={await getPublicProjects()} />;
}
