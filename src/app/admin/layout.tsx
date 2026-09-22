import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './layout.module.css';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <main className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Administrador</h1>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} /> Ver sitio
          </Link>
        </header>
        {children}
      </main>
    </div>
  );
}
