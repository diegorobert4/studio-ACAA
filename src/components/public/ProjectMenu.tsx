import type { Project } from '@/data';
import { localizeProject, useLanguage } from '@/lib/i18n';
import SidePanel from './SidePanel';
import styles from './ProjectMenu.module.css';

interface ProjectMenuProps {
  open: boolean;
  projects: Project[];
  activeIndex: number;
  onSelectProject: (index: number) => void;
  onClose: () => void;
}

export default function ProjectMenu({ open, projects, activeIndex, onSelectProject, onClose }: ProjectMenuProps) {
  const { language, t } = useLanguage();
  return (
    <SidePanel open={open} onClose={onClose}>
      <h2 className={styles.heading}>{t.projects}</h2>
      <ul className={styles.list}>
        {projects.map((project, index) => (
          <li key={project.id}>
            <button
              type="button"
              className={`${styles.item} ${index === activeIndex ? styles.itemActive : ''}`}
              onClick={() => onSelectProject(index)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {localizeProject(project, language).title}
            </button>
          </li>
        ))}
      </ul>
    </SidePanel>
  );
}
