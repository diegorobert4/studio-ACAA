import styles from './ContactSection.module.css';

export default function ContactSection() {
  return (
    <section className={styles.contactSection}>
      <div className={styles.contactBox}>
        <h2 className={styles.contactTitle}>Trabajemos<br/>juntos.</h2>
        <form className={styles.contactForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nombre</label>
            <input type="text" className={styles.input} placeholder="Tu nombre" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Correo</label>
            <input type="email" className={styles.input} placeholder="tu@correo.com" />
          </div>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.label}>Mensaje</label>
            <textarea className={styles.textarea} placeholder="Cuéntanos sobre tu proyecto..."></textarea>
          </div>
          <button type="button" className={styles.submitBtn}>Enviar</button>
          
          <div className={styles.contactFooter}>
            <span>contacto@studioacaa.com</span>
            <span>© 2026 Studio ACAA</span>
          </div>
        </form>
      </div>
    </section>
  );
}
