import type { ProjectStatus } from '@/data';

// estado es texto libre. Los códigos del esquema anterior se siguen leyendo como los estados históricos; cualquier otro texto se muestra tal cual.
const legacyEstados: Record<string, ProjectStatus> = {
  proyecto: 'Anteproyecto',
  en_construccion: 'En obra',
  completado: 'Completado',
};

export function estadoToStatus(estado: string): ProjectStatus {
  return legacyEstados[estado] ?? estado;
}
