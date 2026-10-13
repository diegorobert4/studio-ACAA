import { X } from 'lucide-react';
import styles from './SidePanel.module.css';

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SidePanel({ open, onClose, children }: SidePanelProps) {
  return (
    <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`}>
      {open && (
        <>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={24} />
          </button>
          {children}
        </>
      )}
    </div>
  );
}
