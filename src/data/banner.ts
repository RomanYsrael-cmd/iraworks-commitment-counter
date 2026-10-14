import {
  LIVE_BANNER_DATA_URL_PREFIX,
  MAX_LIVE_BANNER_HEIGHT,
  MAX_LIVE_BANNER_INPUT_BYTES,
  MAX_LIVE_BANNER_STORED_BYTES,
  MAX_LIVE_BANNER_WIDTH,
} from '../domain/banner';

export type SupportedBannerMime = 'image/jpeg' | 'image/png' | 'image/webp';

function matches(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((value, index) => bytes[offset + index] === value);
}

export function sniffBannerMime(bytes: Uint8Array): SupportedBannerMime | undefined {
  if (matches(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (matches(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (matches(bytes, [0x52, 0x49, 0x46, 0x46]) && matches(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp';
  return undefined;
}

export function validateBannerFileHeader(file: Pick<File, 'size' | 'type'>, header: Uint8Array): SupportedBannerMime {
  if (file.size <= 0) throw new Error('Choose an image file that is not empty.');
  if (file.size > MAX_LIVE_BANNER_INPUT_BYTES) throw new Error('Choose an image that is 5 MB or smaller.');
  const detected = sniffBannerMime(header);
  if (!detected || (file.type && file.type !== detected)) {
    throw new Error('Choose a valid JPEG, PNG, or WebP image. SVG and animated GIF files are not supported.');
  }
  return detected;
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('The browser could not prepare this image. Try a different file.'));
    }, 'image/jpeg', quality);
  });
}

async function toDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, Math.min(offset + 0x8000, bytes.length)));
  }
  return `${LIVE_BANNER_DATA_URL_PREFIX}${btoa(binary)}`;
}

export async function prepareLiveBanner(file: File): Promise<string> {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  validateBannerFileHeader(file, header);

  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); }
  catch { throw new Error('This image could not be decoded. Choose another JPEG, PNG, or WebP file.'); }

  try {
    const { width, height } = bitmap;
    if (!width || !height || width * height > 40_000_000) {
      throw new Error('This image is too large to prepare safely. Choose an image with fewer than 40 megapixels.');
    }
    let scale = Math.min(1, MAX_LIVE_BANNER_WIDTH / width, MAX_LIVE_BANNER_HEIGHT / height);
    let quality = 0.86;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('The browser could not prepare this image. Try another browser or image.');

    for (let attempt = 0; attempt < 12; attempt += 1) {
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await canvasBlob(canvas, quality);
      if (blob.size <= MAX_LIVE_BANNER_STORED_BYTES) return await toDataUrl(blob);
      if (quality > 0.58) quality -= 0.1;
      else {
        scale *= 0.82;
        quality = 0.82;
      }
    }
    throw new Error('This image could not be reduced below 1 MB. Choose a simpler or smaller image.');
  } finally {
    bitmap.close();
  }
}
