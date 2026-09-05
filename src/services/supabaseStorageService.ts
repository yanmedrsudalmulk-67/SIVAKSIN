import { supabase, isSupabaseConfigured, formatSupabaseErrorMessage } from '../lib/supabase';

export interface StorageUploadResult {
  url: string | null;
  path: string | null;
  fileName: string | null;
  error: string | null;
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
 * Unggah file gambar atau dokumen langsung ke Supabase Storage (bucket assets, documents, atau avatars).
 * Dilengkapi kompresi otomatis, multi-bucket fallback, timeout proteksi, dan graceful fallback.
 */
export const uploadFileToSupabase = async (
  file: File | Blob,
  bucketName: 'assets' | 'documents' | 'avatars' = 'assets',
  prefix = 'doc'
): Promise<StorageUploadResult> => {
  // Jika Supabase tidak dikonfigurasi, sediakan fallback data URL lokal
  if (!isSupabaseConfigured) {
    if (file instanceof File || file instanceof Blob) {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.readAsDataURL(file);
      });
      return {
        url: dataUrl,
        path: null,
        fileName: file instanceof File ? file.name : `${prefix}.jpg`,
        error: null
      };
    }
    return {
      url: null,
      path: null,
      fileName: null,
      error: 'Supabase belum dikonfigurasi. Hubungkan kredensial Supabase terlebih dahulu.'
    };
  }

  try {
    let uploadPayload: Blob = file;
    let fileExt = 'bin';

    if (file instanceof File) {
      const parts = file.name.split('.');
      if (parts.length > 1) {
        fileExt = parts.pop()?.toLowerCase() || 'bin';
      }

      // Jika gambar (jpg, png, webp, dsb), kompresi terlebih dahulu agar hemat memori & kilat diunggah
      if (file.type.startsWith('image/')) {
        try {
          const { blob } = await compressImage(file, 1200, 0.85);
          uploadPayload = blob;
          fileExt = 'jpg';
        } catch (compErr) {
          console.warn('Kompresi gambar dilewati, menggunakan file asli:', compErr);
        }
      }
    } else {
      fileExt = 'jpg';
    }

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const cleanFileName = `${prefix}_${uniqueId}.${fileExt}`;
    const filePath = `${cleanFileName}`;

    // Race timeout 12 detik agar tidak menggantung jika koneksi lemot
    const timeoutPromise = new Promise<{ data: null; error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout ke Supabase Storage (12s)')), 12000)
    );

    // Coba upload ke target bucket
    const targetBuckets: Array<'assets' | 'documents' | 'avatars'> = [
      bucketName,
      bucketName === 'assets' ? 'documents' : 'assets',
      'avatars'
    ];

    let lastError: any = null;
    let successfulBucket: string | null = null;
    let uploadSuccessData: any = null;

    for (const b of targetBuckets) {
      try {
        const uploadPromise = supabase.storage.from(b).upload(filePath, uploadPayload, {
          cacheControl: '3600',
          upsert: true,
          contentType: file instanceof File ? file.type : 'image/jpeg'
        });

        const res = (await Promise.race([uploadPromise, timeoutPromise])) as any;
        if (!res.error && res.data) {
          uploadSuccessData = res.data;
          successfulBucket = b;
          lastError = null;
          break;
        } else {
          lastError = res.error;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (successfulBucket && uploadSuccessData) {
      // Dapatkan URL publik file dari Supabase Storage
      const { data: urlData } = supabase.storage.from(successfulBucket).getPublicUrl(filePath);
      return {
        url: urlData.publicUrl,
        path: filePath,
        fileName: cleanFileName,
        error: null
      };
    }

    // Jika bucket di Supabase belum ada atau storage bermasalah, fallback ke base64 data URL agar data foto tidak hilang
    console.warn('Supabase storage upload error, fallback to optimized data URL:', lastError);
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve) => {
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.readAsDataURL(uploadPayload);
    });

    return {
      url: dataUrl,
      path: null,
      fileName: cleanFileName,
      error: lastError ? formatSupabaseErrorMessage(lastError) : null
    };
  } catch (err: any) {
    return {
      url: null,
      path: null,
      fileName: null,
      error: formatSupabaseErrorMessage(err)
    };
  }
};
