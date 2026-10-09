'use client';

import { createContext, useContext, useState } from 'react';
import type { Project, ProjectStatus, TranslatableField } from '@/data';
import { translatableFields } from '@/data';

export type Language = 'es' | 'it';

// Etiquetas fijas de la vista Inicio (no vienen de la base de datos).
const dictionary = {
  es: {
    architects: 'Arquitectos', associatedArchitects: 'Arquitectos Asociados', collaborators: 'Colaboradores', location: 'Ubicación',
    year: 'Año', area: 'Superficie', instagram: 'Instagram', publications: 'Publicaciones', viewPost: 'Ver publicación',
  },
  it: {
    architects: 'Architetti', associatedArchitects: 'Architetti associati', collaborators: 'Collaboratori', location: 'Ubicazione',
    year: 'Anno', area: 'Superficie', instagram: 'Instagram', publications: 'Pubblicazioni', viewPost: 'Vedi pubblicazione',
  },
} as const;

const statusLabels: Record<Language, Record<ProjectStatus, string>> = {
  es: { Completado: 'Completado', 'En obra': 'En obra', Anteproyecto: 'Anteproyecto' },
  it: { Completado: 'Completato', 'En obra': 'In costruzione', Anteproyecto: 'In progetto' },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({ language: 'es', setLanguage: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const { language, setLanguage } = useContext(LanguageContext);
  return { language, setLanguage, t: dictionary[language], statusLabel: (status: ProjectStatus) => statusLabels[language][status] };
}

// En italiano, cada campo traducido que esté vacío o sin fila cae al español, sin mostrar nada raro.
export function localizeProject(project: Project, language: Language): Project {
  if (language !== 'it' || !project.translationIt) return project;
  const localized: Project = { ...project };
  for (const field of translatableFields as readonly TranslatableField[]) {
    const value = project.translationIt[field]?.trim();
    if (value) (localized[field] as string) = value;
  }
  return localized;
}
