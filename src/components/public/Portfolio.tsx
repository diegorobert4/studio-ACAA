'use client';

import { useRef, useState } from 'react';
import type { Project } from '@/data';
import styles from '@/app/page.module.css';
import Navbar from './Navbar';
import ProjectSection from './ProjectSection';
import ProjectModal from './ProjectModal';
import ProjectMenu from './ProjectMenu';
import { LanguageProvider } from '@/lib/i18n';

export default function Portfolio({ projects }: { projects: Project[] }) {
  // Un solo panel lateral a la vez: abrir uno cierra el otro.
  const [panel, setPanel] = useState<'info' | 'menu' | null>(null);
  const [infoProject, setInfoProject] = useState<Project | null>(null);
  const [visibleProjectIndex, setVisibleProjectIndex] = useState(0);
  const openInfo = (project: Project | null) => {
    setInfoProject(project);
    setPanel(project ? 'info' : null);
  };
  const closePanel = () => setPanel(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleScrollToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    // Baja a la sección hermana siguiente (solo si es otro proyecto).
    const next = e.currentTarget.closest('section')?.nextElementSibling;
    if (next?.tagName === 'SECTION') next.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const handleScrollToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    // Sube a la sección hermana anterior (solo si es otro proyecto).
    const previous = e.currentTarget.closest('section')?.previousElementSibling;
    if (previous?.tagName === 'SECTION') previous.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const handleScroll = () => {
    if (!containerRef.current) return;
    // La sección visible es la que cruza el centro del contenedor (en mobile las secciones tienen alturas distintas).
    const container = containerRef.current.getBoundingClientRect();
    const center = container.top + container.height / 2;
    const sections = Array.from(containerRef.current.querySelectorAll('section')).slice(0, projects.length);
    const index = sections.findIndex((section) => section.getBoundingClientRect().bottom > center);
    setVisibleProjectIndex(index === -1 ? Math.max(sections.length - 1, 0) : index);
  };
  const selectProject = (index: number) => {
    setVisibleProjectIndex(index);
    setPanel(null);
    containerRef.current?.querySelectorAll('section')[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return <LanguageProvider><main className={styles.container} ref={containerRef} onScroll={handleScroll}>
    <Navbar onOpenMenu={() => setPanel('menu')} />
    {projects.map((project, index) => <ProjectSection key={project.id} project={project} index={index} isLast={index === projects.length - 1} onOpenInfo={openInfo} onScrollToNext={handleScrollToNext} onScrollToPrevious={handleScrollToPrevious} />)}
    <ProjectModal project={panel === 'info' ? infoProject : null} onClose={closePanel} />
    <ProjectMenu open={panel === 'menu'} projects={projects} activeIndex={visibleProjectIndex} onSelectProject={selectProject} onClose={closePanel} />
  </main></LanguageProvider>;
}
