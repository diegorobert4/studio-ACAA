import { Menu } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import styles from './Navbar.module.css';

export default function Navbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { t } = useLanguage();
  return <div className={styles.navigation}>
    <div className={styles.projectMenu}>
      <button type="button" className={styles.projectToggle} onClick={onOpenMenu} aria-label={t.openMenu}>
        <Menu size={22} />
      </button>
    </div>
  </div>;
}
