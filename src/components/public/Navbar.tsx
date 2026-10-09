import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Project } from '@/data';
import { useLanguage, type Language } from '@/lib/i18n';
import styles from './Navbar.module.css';

const languages: Language[] = ['es', 'it'];

export default function Navbar({ projects, activeIndex, onSelectProject }: {
  projects: Project[];
  activeIndex: number;
  onSelectProject: (index: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  return <div className={styles.navigation}>
    <nav className={styles.navbar}>
      <div className={styles.logo}>STUDIO ACAA</div>
    </nav>
    <div className={styles.projectMenu}>
      <div className={styles.languageToggle} role="group" aria-label="Idioma / Lingua">
        {languages.map((code) => <button key={code} type="button" className={`${styles.languageOption} ${code === language ? styles.languageOptionActive : ''}`} onClick={() => setLanguage(code)} aria-pressed={code === language}>{code.toUpperCase()}</button>)}
      </div>
      <button type="button" className={styles.projectToggle} onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}>
        Proyectos <ChevronDown size={16} className={isOpen ? styles.chevronOpen : undefined} />
      </button>
      {isOpen && <div className={styles.projectList} role="menu">
        {projects.map((project, index) => <button key={project.id} type="button" role="menuitem" className={`${styles.projectItem} ${index === activeIndex ? styles.projectItemActive : ''}`} onClick={() => { onSelectProject(index); setIsOpen(false); }}>
          <span>{String(index + 1).padStart(2, '0')}</span>{project.title}
        </button>)}
      </div>}
    </div>
  </div>;
}
