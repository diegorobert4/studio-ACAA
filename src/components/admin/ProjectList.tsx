'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { initialProjects, Project } from '@/data';
import styles from './ProjectList.module.css';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === projects.length - 1) return;

    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;
    
    setProjects(newProjects);
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Proyectos</h2>
          <p className={styles.subtitle}>El orden de esta lista define el orden de aparición en el sitio. Usá las flechas para reordenar.</p>
        </div>
        <Link href="/admin/projects/new" className={styles.addBtn}>
          + Nuevo Proyecto
        </Link>
      </div>

      <div className={styles.tableHeader}>
        <div>#</div>
        <div>Proyecto</div>
        <div>Ubicación</div>
        <div>Año</div>
        <div>Estado</div>
        <div>Acciones</div>
      </div>

      <div className={styles.projectList}>
        {projects.map((project, index) => (
          <div key={project.id} className={styles.projectRow}>
            <div className={styles.dragHandle}>
              <button onClick={() => moveProject(index, 'up')} disabled={index === 0}>
                <ChevronUp size={16} />
              </button>
              <button onClick={() => moveProject(index, 'down')} disabled={index === projects.length - 1}>
                <ChevronDown size={16} />
              </button>
            </div>
            
            <div className={styles.projectInfo}>
              {project.images.length > 0 ? (
                <Image 
                  src={project.images[0].url} 
                  alt={project.title}
                  width={60}
                  height={40}
                  className={styles.thumbnail}
                />
              ) : (
                <div className={styles.thumbnail} />
              )}
              <div>
                <div className={styles.projectTitle}>{project.title}</div>
                <div className={styles.imageCount}>{project.images.length} imágenes</div>
              </div>
            </div>

            <div className={styles.textCell}>{project.location}</div>
            <div className={styles.textCell}>{project.year}</div>
            
            <div>
              <span className={`${styles.status} ${project.status === 'Borrador' ? styles.statusDraft : ''}`}>
                {project.status === 'Completado' || project.status === 'En obra' || project.status === 'Anteproyecto' ? 'Publicado' : 'Borrador'}
              </span>
            </div>

            <div className={styles.actions}>
              <Link href={`/admin/projects/${project.id}`} className={styles.actionBtn}>Editar</Link>
              <button 
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={() => deleteProject(project.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
