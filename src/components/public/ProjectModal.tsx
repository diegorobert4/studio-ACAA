import { X } from 'lucide-react';
import { Project } from '@/data';
import styles from './ProjectModal.module.css';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <div className={`${styles.infoModal} ${project ? styles.infoModalOpen : ''}`}>
      {project && (
        <>
          <button 
            className={styles.closeBtn}
            onClick={onClose}
          >
            <X size={24} />
          </button>
          <div className={styles.modalContent}>
            <h2>{project.title}</h2>
            <span className={styles.status}>{project.status}</span>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <h3>Arquitectos</h3>
                <p>{project.architects}</p>
              </div>
              {project.associatedArchitects && (
                <div className={styles.infoItem}>
                  <h3>Arquitectos Asociados</h3>
                  <p>{project.associatedArchitects}</p>
                </div>
              )}
              {project.collaborators && (
                <div className={styles.infoItem}>
                  <h3>Colaboradores</h3>
                  <p>{project.collaborators}</p>
                </div>
              )}
              <div className={styles.infoItem}>
                <h3>Ubicación</h3>
                <p>{project.location}</p>
              </div>
              <div className={styles.infoItem}>
                <h3>Año</h3>
                <p>{project.year}</p>
              </div>
              <div className={styles.infoItem}>
                <h3>Superficie</h3>
                <p>{project.area}</p>
              </div>
              {project.instagramUrl && (
                <div className={styles.infoItem}>
                  <h3>Instagram</h3>
                  <a href={project.instagramUrl} target="_blank" rel="noopener noreferrer">Ver publicación</a>
                </div>
              )}
              {project.publications && project.publications.length > 0 && (
                <div className={styles.infoItem}>
                  <h3>Publicaciones</h3>
                  {project.publications.map((pub, i) => (
                    <p key={i}>{pub}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
