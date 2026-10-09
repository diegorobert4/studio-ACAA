'use client';

import { useRef, useState } from 'react';
import type { Project } from '@/data';
import styles from '@/app/page.module.css';
import Navbar from './Navbar';
import ProjectSection from './ProjectSection';
import ContactSection from './ContactSection';
import ProjectModal from './ProjectModal';

export default function Portfolio({ projects }: { projects: Project[] }) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [visibleProjectIndex, setVisibleProjectIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleScrollToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    // Baja a la sección hermana siguiente: el próximo proyecto, o Contacto tras el último.
    e.currentTarget.closest('section')?.nextElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const handleScroll = () => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
    setVisibleProjectIndex(Math.min(index, Math.max(projects.length - 1, 0)));
  };
  const selectProject = (index: number) => {
    setVisibleProjectIndex(index);
    containerRef.current?.scrollTo({
      top: index * containerRef.current.clientHeight,
      behavior: 'smooth',
    });
  };
  return <main className={styles.container} ref={containerRef} onScroll={handleScroll}>
    <Navbar projects={projects} activeIndex={visibleProjectIndex} onSelectProject={selectProject} />
    <button className={styles.infoButton} onClick={() => setActiveProject(projects[visibleProjectIndex] ?? null)} disabled={!projects.length}>Ver información</button>
    {projects.map((project, index) => <ProjectSection key={project.id} project={project} index={index} onOpenInfo={setActiveProject} onScrollToNext={handleScrollToNext} />)}
    <ContactSection />
    <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
  </main>;
}
