import { Fragment, useState } from 'react';
import type { Project } from '@/data';
import { localizeProject, useLanguage } from '@/lib/i18n';
import ContactForm from './ContactForm';
import SidePanel from './SidePanel';
import styles from './ProjectMenu.module.css';

interface ProjectMenuProps {
  open: boolean;
  projects: Project[];
  activeIndex: number;
  onSelectProject: (index: number) => void;
  onClose: () => void;
}

type Tab = 'projects' | 'contact';

export default function ProjectMenu({ open, projects, activeIndex, onSelectProject, onClose }: ProjectMenuProps) {
  const { language, t } = useLanguage();
  const [tab, setTab] = useState<Tab>('projects');
  // Al cerrarse el panel vuelve a la pestaña de proyectos, para que siempre se abra por el listado.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setTab('projects');
  }
  const tabs: { key: Tab; label: string }[] = [
    { key: 'projects', label: t.projects },
    { key: 'contact', label: t.contact },
  ];
  return (
    <SidePanel open={open} onClose={onClose}>
      <div className={styles.tabs} role="tablist">
        {tabs.map(({ key, label }, i) => (
          <Fragment key={key}>
            {i > 0 && <span className={styles.tabSep} aria-hidden="true">/</span>}
            <button
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          </Fragment>
        ))}
      </div>
      {/* Ambas vistas quedan montadas y solo se oculta la inactiva, así lo escrito en el formulario no se pierde al cambiar de pestaña. */}
      <ul className={styles.list} hidden={tab !== 'projects'}>
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
      <div hidden={tab !== 'contact'}>
        <ContactForm />
      </div>
    </SidePanel>
  );
}
