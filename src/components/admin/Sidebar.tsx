import Link from 'next/link';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>STUDIO ACAA</div>
      <nav className={styles.nav}>
        <Link href="/admin" className={`${styles.navItem} ${styles.navItemActive}`}>Proyectos</Link>
        <Link href="#" className={styles.navItem}>Información del estudio</Link>
        <Link href="#" className={styles.navItem}>Acceso y seguridad</Link>
      </nav>
    </aside>
  );
}
