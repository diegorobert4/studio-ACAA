'use client';

import { useState } from 'react';
import styles from './ContactSection.module.css';

// TODO: reemplazar por el número definitivo de Alberto (formato: código de país + número, sin "+" ni espacios, ej: "5493511234567")
const WHATSAPP_NUMBER = '56988158934';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    const parts = [`Hola, soy ${name || 'un visitante del sitio'}.`];
    if (email) parts.push(`Mi correo es ${email}.`);
    if (message) parts.push(message);

    const text = parts.join(' ');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className={styles.contactSection}>
      <div className={styles.contactBox}>
        <h2 className={styles.contactTitle}>Trabajemos<br/>juntos.</h2>
        <form className={styles.contactForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nombre</label>
            <input type="text" className={styles.input} placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Correo</label>
            <input type="email" className={styles.input} placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.label}>Mensaje</label>
            <textarea className={styles.textarea} placeholder="Cuéntanos sobre tu proyecto..." value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
          </div>
          <button type="button" className={styles.submitBtn} onClick={handleSubmit}>Enviar</button>

          <div className={styles.contactFooter}>
            <span>studioacaa@gmail.com</span>
            <span>© 2026 Studio ACAA</span>
          </div>
        </form>
      </div>
    </section>
  );
}
