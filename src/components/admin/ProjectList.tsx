'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/data';
import { deleteProject, reorderProjects } from '@/app/actions/projects';
import styles from './ProjectList.module.css';
import { toast } from 'sonner';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function ProjectList({ projects: initialProjects }: { projects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  useEffect(() => {
    if (!pendingDelete) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setPendingDelete(null);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pendingDelete]);

  // Una sola operación a la vez: mientras hay una en curso se deshabilitan borrar y reordenar,
  // así ningún snapshot de reversión puede ser pisado por una segunda operación.
  const [isBusy, setIsBusy] = useState(false);

  // Actualización optimista: se actualiza la lista y, si el servidor falla, se restaura el estado previo.
  const runOptimistic = async (next: Project[], action: () => Promise<{ error?: string }>, success?: string) => {
    if (isBusy) return;
    const previous = projects;
    setIsBusy(true);
    setProjects(next);
    try {
      const { error } = await action();
      if (error) {
        setProjects(previous);
        toast.error(error);
      } else if (success) {
        toast.success(success);
      }
    } catch {
      setProjects(previous);
      toast.error('No se pudo completar la acción. Revisá tu conexión e intentá de nuevo.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setPendingDelete(null);
    await runOptimistic(projects.filter(p => p.id !== id), () => deleteProject(id), 'Proyecto eliminado.');
  };

  const moveProject = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === projects.length - 1) return;

    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;

    await runOptimistic(newProjects, () => reorderProjects(newProjects.map((project) => project.id)));
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

      <div className={styles.table}>
      <div className={styles.tableHeader}>
        <div>#</div>
        <div>Proyecto</div>
        <div>Ubicación</div>
        <div>Año</div>
        <div>Estado</div>
        <div>Acciones</div>
      </div>

      <div className={isBusy ? styles.busy : undefined} aria-busy={isBusy}>
        {projects.map((project, index) => (
          <div key={project.id} className={styles.projectRow}>
            <div className={styles.dragHandle}>
              <button onClick={() => moveProject(index, 'up')} disabled={index === 0 || isBusy}>
                <ChevronUp size={20} />
              </button>
              <button onClick={() => moveProject(index, 'down')} disabled={index === projects.length - 1 || isBusy}>
                <ChevronDown size={20} />
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
              <div className={styles.projectText}>
                <div className={styles.projectTitle}>{project.title}</div>
                <div className={styles.imageCount}>{project.images.length} imágenes</div>
              </div>
            </div>

            <div className={`${styles.textCell} ${styles.locationCell}`}>{project.location}</div>
            <div className={`${styles.textCell} ${styles.yearCell}`}>{project.year}</div>

            <div className={styles.statusCell}>
              <span className={`${styles.status} ${project.published ? '' : styles.statusDraft}`}>
                {project.published ? 'Publicado' : 'Borrador'}
              </span>
            </div>

            <div className={styles.actions}>
              <Link href={`/admin/projects/${project.id}`} className={styles.actionBtn}>Editar</Link>
              <button 
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                disabled={isBusy}
                onClick={() => setPendingDelete(project)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/40 p-4 sm:items-center"
          onClick={() => setPendingDelete(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md border border-neutral-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-title" className="font-heading text-xl font-bold tracking-tight text-neutral-900">
              Eliminar proyecto
            </h3>
            <p className="mt-3 break-words text-sm text-neutral-600">
              ¿Seguro que querés eliminar <strong className="text-neutral-900">{pendingDelete.title || 'este proyecto'}</strong>?
              Se borrarán también sus imágenes y esta acción no se puede deshacer.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
              <button
                type="button"
                autoFocus
                onClick={() => setPendingDelete(null)}
                className="min-h-11 border border-neutral-300 px-5 text-xs uppercase tracking-widest text-neutral-900 transition-colors hover:border-blueprint hover:text-blueprint"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handleDelete(pendingDelete.id)}
                className="min-h-11 bg-[#b45454] px-5 text-xs uppercase tracking-widest text-white transition-colors hover:bg-[#9a4343]"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
