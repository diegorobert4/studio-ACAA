import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>STUDIO ACAA</div>
      <div className={styles.navLinks}>
        <Link href="/">Inicio</Link>
        <Link href="/admin">Admin</Link>
      </div>
    </nav>
  );
}
