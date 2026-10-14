import { describe, expect, it } from 'vitest';
import { sniffBannerMime, validateBannerFileHeader } from './banner';
import { MAX_LIVE_BANNER_INPUT_BYTES } from '../domain/banner';

describe('live display image validation', () => {
  it('accepts matching JPEG, PNG, and WebP signatures', () => {
    expect(sniffBannerMime(Uint8Array.from([0xff, 0xd8, 0xff, 0x00]))).toBe('image/jpeg');
    expect(sniffBannerMime(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png');
    expect(sniffBannerMime(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]))).toBe('image/webp');
  });

  it('rejects a mislabeled, unsupported, or oversized image before decoding', () => {
    expect(() => validateBannerFileHeader({ size: 10, type: 'image/png' }, Uint8Array.from([0xff, 0xd8, 0xff]))).toThrow(/valid JPEG, PNG, or WebP/);
    expect(() => validateBannerFileHeader({ size: 10, type: 'image/svg+xml' }, new TextEncoder().encode('<svg>'))).toThrow(/SVG and animated GIF/);
    expect(() => validateBannerFileHeader({ size: MAX_LIVE_BANNER_INPUT_BYTES + 1, type: 'image/jpeg' }, Uint8Array.from([0xff, 0xd8, 0xff]))).toThrow(/5 MB or smaller/);
  });
});
