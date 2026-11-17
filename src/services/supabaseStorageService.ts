/**
 * Service Penyimpanan File & Dokumen Lokal
 * File disimpan langsung ke folder komputer: public/uploads/
 */

import { uploadFileLocal } from './localDataService';

export interface StorageUploadResult {
  url: string | null;
  path: string | null;
  fileName: string | null;
  error: string | null;
  success?: boolean;
}

/**
 * Kompresi gambar client-side menggunakan HTML5 Canvas
 */
export const compressImage = async (
  file: File, 
  maxWidth = 1200, 
  quality = 0.8
): Promise<{ blob: Blob; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, width, height });
            } else {
              reject(new Error('Kompresi gambar gagal'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Gagal memuat file gambar'));
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
  });
};

/**
 * Unggah file gambar atau dokumen langsung ke penyimpanan lokal komputer.
 */
export const uploadFileToSupabase = async (
  file: File | Blob,
  _bucketName: 'assets' | 'documents' | 'avatars' = 'assets',
  prefix = 'doc'
): Promise<StorageUploadResult> => {
  try {
    let uploadPayload: Blob = file;

    // Jika gambar, kompresi terlebih dahulu
    if (file instanceof File && file.type.startsWith('image/')) {
      try {
        const { blob } = await compressImage(file, 1200, 0.85);
        uploadPayload = blob;
      } catch (e) {
        console.warn('Kompresi dilewati:', e);
      }
    }

    const res = await uploadFileLocal(uploadPayload, prefix);

    return {
      url: res.url,
      path: res.url,
      fileName: res.fileName,
      error: res.error,
      success: !res.error && !!res.url
    };
  } catch (err: any) {
    return {
      url: null,
      path: null,
      fileName: null,
      error: err.message || 'Gagal menyimpan file lokal',
      success: false
    };
  }
};
