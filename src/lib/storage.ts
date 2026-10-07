export const IMAGES_BUCKET = 'imagenes-proyectos';
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// URL pública -> path dentro del bucket (null si la URL no pertenece al bucket).
export function imagePathFromUrl(url: string) {
  const marker = `/object/public/${IMAGES_BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
}

// Traduce errores de Supabase Storage a un mensaje seguro para el usuario; el detalle va a la consola.
export function storageErrorMessage(error: { message: string }) {
  console.error('[storage]', error);
  const message = error.message.toLowerCase();
  if (message.includes('bucket not found')) return 'el almacenamiento de imágenes no está configurado.';
  if (message.includes('maximum allowed size') || message.includes('too large')) return 'el archivo supera el límite de tamaño.';
  if (message.includes('mime type')) return 'el formato del archivo no está permitido.';
  if (message.includes('row-level security') || message.includes('unauthorized') || message.includes('jwt')) return 'no tenés permisos o tu sesión expiró.';
  return 'no se pudo completar la operación con el almacenamiento.';
}
