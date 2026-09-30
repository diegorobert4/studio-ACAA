'use client';

import { useState, useRef } from 'react';
import { initialProjects, Project } from '@/data';
import styles from './page.module.css';

import Navbar from '@/components/public/Navbar';
import ProjectSection from '@/components/public/ProjectSection';
import ContactSection from '@/components/public/ContactSection';
import ProjectModal from '@/components/public/ProjectModal';

export default function Home() {
  const publishedProjects = initialProjects.filter((p) => p.published);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScrollToNext = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    // Convert children to array and find the next valid element
    const children = Array.from(containerRef.current.children);
    // Elements that are sections start from index 1 (Navbar is 0)
    // Project sections are indices 1 to length
    // Contact section is at the end
    
    // Project index is 0-based, so section child index is index + 1
    const nextChild = children[index + 2]; // +1 for navbar, +1 to go to the NEXT section
    
    if (nextChild) {
      nextChild.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className={styles.container} ref={containerRef}>
      <Navbar />

      {publishedProjects.map((project, index) => (
        <ProjectSection 
          key={project.id}
          project={project}
          index={index}
          onOpenInfo={setActiveProject}
          onScrollToNext={handleScrollToNext}
        />
      ))}

      <ContactSection />

      <ProjectModal 
        project={activeProject} 
        onClose={() => setActiveProject(null)} 
      />
    </main>
  );
}
