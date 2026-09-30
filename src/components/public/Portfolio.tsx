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
  const handleScrollToNext = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    const nextChild = containerRef.current && Array.from(containerRef.current.children)[index + 2];
    nextChild?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleScroll = () => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
    setVisibleProjectIndex(Math.min(index, Math.max(projects.length - 1, 0)));
  };
  return <main className={styles.container} ref={containerRef} onScroll={handleScroll}>
    <Navbar />
    <button className={styles.infoButton} onClick={() => setActiveProject(projects[visibleProjectIndex] ?? null)} disabled={!projects.length}>Ver información</button>
    {projects.map((project, index) => <ProjectSection key={project.id} project={project} index={index} onOpenInfo={setActiveProject} onScrollToNext={handleScrollToNext} />)}
    <ContactSection />
    <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
  </main>;
}
