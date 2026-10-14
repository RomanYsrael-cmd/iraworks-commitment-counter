export const LIVE_BANNER_DATA_URL_PREFIX = 'data:image/jpeg;base64,';
export const MAX_LIVE_BANNER_INPUT_BYTES = 5 * 1024 * 1024;
export const MAX_LIVE_BANNER_STORED_BYTES = 1024 * 1024;
export const MAX_TOTAL_LIVE_BANNER_BYTES = 12 * 1024 * 1024;
export const MAX_LIVE_BANNER_WIDTH = 1920;
export const MAX_LIVE_BANNER_HEIGHT = 1080;

export function liveBannerByteLength(dataUrl: string): number {
  const base64 = dataUrl.slice(LIVE_BANNER_DATA_URL_PREFIX.length);
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor(base64.length * 3 / 4) - padding;
}
