import { X } from 'lucide-react';
import { Project } from '@/data';
import { localizeProject, useLanguage } from '@/lib/i18n';
import styles from './ProjectModal.module.css';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project: baseProject, onClose }: ProjectModalProps) {
  const { language, t, statusLabel } = useLanguage();
  const project = baseProject && localizeProject(baseProject, language);
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
            <span className={styles.status}>{statusLabel(project.status)}</span>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <h3>{t.architects}</h3>
                <p>{project.architects}</p>
              </div>
              {project.associatedArchitects && (
                <div className={styles.infoItem}>
                  <h3>{t.associatedArchitects}</h3>
                  <p>{project.associatedArchitects}</p>
                </div>
              )}
              {project.collaborators && (
                <div className={styles.infoItem}>
                  <h3>{t.collaborators}</h3>
                  <p>{project.collaborators}</p>
                </div>
              )}
              <div className={styles.infoItem}>
                <h3>{t.location}</h3>
                <p>{project.location}</p>
              </div>
              <div className={styles.infoItem}>
                <h3>{t.year}</h3>
                <p>{project.year}</p>
              </div>
              <div className={styles.infoItem}>
                <h3>{t.area}</h3>
                <p>{project.area}</p>
              </div>
              {project.instagramUrl && (
                <div className={styles.infoItem}>
                  <h3>{t.instagram}</h3>
                  <a href={project.instagramUrl} target="_blank" rel="noopener noreferrer">{t.viewPost}</a>
                </div>
              )}
              {project.publications && project.publications.length > 0 && (
                <div className={styles.infoItem}>
                  <h3>{t.publications}</h3>
                  {project.publications.map((pub, i) => (
                    <p key={i}>{pub.name}</p>
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
