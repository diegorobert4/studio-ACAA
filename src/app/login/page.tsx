'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

const passwordIsValid = (password: string) =>
  password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function signIn(formData: FormData) {
    setError('');
    setPasswordError('');
    const password = String(formData.get('password'));
    if (!passwordIsValid(password)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.');
      return;
    }
    const { error: signInError } = await createClient().auth.signInWithPassword({
      email: String(formData.get('email')),
      password,
    });
    if (signInError) return setError('Correo o contraseña incorrectos.');
    router.replace('/admin');
    router.refresh();
  }

  return <main className={styles.page}>
    <form action={signIn} className={styles.card}>
      <div className={styles.logo}>STUDIO ACAA</div>
      <div className={styles.heading}>
        <h1>Acceso administrador</h1>
        <p>Ingresá con tus credenciales para administrar el sitio.</p>
      </div>
      <label className={styles.field}><span>Correo</span><input name="email" type="email" required placeholder="tu@correo.com" autoComplete="email" /></label>
      <label className={styles.field}><span>Contraseña</span><span className={styles.passwordWrap}>
        <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="Tu contraseña" autoComplete="current-password" />
        <button type="button" className={styles.eyeButton} onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </span></label>
      {passwordError && <p className={styles.fieldError} role="alert">{passwordError}</p>}
      {error && <p className={styles.authError} role="alert">{error}</p>}
      <button type="submit" className={styles.submit}>Iniciar sesión</button>
    </form>
  </main>;
}
