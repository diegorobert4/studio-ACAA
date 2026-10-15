'use client';

import { useId, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import styles from './ContactForm.module.css';

// TODO: reemplazar por el número definitivo de Alberto (formato: código de país + número, sin "+" ni espacios, ej: "5493511234567")
const WHATSAPP_NUMBER = '56988158934';

export default function ContactForm() {
  const { t } = useLanguage();
  const id = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // El mensaje se arma en español: lo recibe el estudio, sin importar el idioma de la interfaz.
  const handleSubmit = () => {
    const parts = [`Hola, soy ${name || 'un visitante del sitio'}.`];
    if (email) parts.push(`Mi correo es ${email}.`);
    if (message) parts.push(message);

    const text = parts.join(' ');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.contact}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor={`${id}-name`}>{t.contactName}</label>
          <input id={`${id}-name`} type="text" className={styles.input} placeholder={t.contactNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor={`${id}-email`}>{t.contactEmail}</label>
          <input id={`${id}-email`} type="email" className={styles.input} placeholder={t.contactEmailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor={`${id}-message`}>{t.contactMessage}</label>
          <textarea id={`${id}-message`} className={styles.textarea} placeholder={t.contactMessagePlaceholder} value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
        </div>
        <button type="button" className={styles.submitBtn} onClick={handleSubmit}>{t.contactSend}</button>

        <div className={styles.footer}>
          <span>studioacaa@gmail.com</span>
          <span>© 2026 Studio ACAA</span>
        </div>
      </form>
    </div>
  );
}
