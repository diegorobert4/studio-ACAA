import type { ProjectStatus } from '@/data';

export type EstadoDb = 'proyecto' | 'en_construccion' | 'completado';

export function statusToEstado(status: ProjectStatus): EstadoDb {
  if (status === 'En obra') return 'en_construccion';
  if (status === 'Completado') return 'completado';
  return 'proyecto';
}

export function estadoToStatus(estado: string): ProjectStatus {
  if (estado === 'en_construccion') return 'En obra';
  if (estado === 'completado') return 'Completado';
  return 'Anteproyecto';
}
