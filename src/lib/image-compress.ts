export const IMAGE_MAX_WIDTH = 3200;
export const IMAGE_WEBP_QUALITY = 0.82;

// Reduce a IMAGE_MAX_WIDTH (sin agrandar) y reencodea a WebP en el navegador.
export async function compressToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const scale = Math.min(1, IMAGE_MAX_WIDTH / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('el navegador no pudo procesar la imagen.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', IMAGE_WEBP_QUALITY));
    // Si el navegador no soporta WebP, toBlob devuelve PNG: mejor fallar que subir otro formato.
    if (!blob || blob.type !== 'image/webp') throw new Error('el navegador no pudo convertir la imagen a WebP.');
    return blob;
  } finally {
    bitmap.close();
  }
}
