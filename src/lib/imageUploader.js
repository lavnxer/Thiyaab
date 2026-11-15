import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

/**
 * Compression options specified for Thiyaab fashion product images:
 * - maxSizeMB: 0.5 (max 500KB)
 * - maxWidthOrHeight: 1920 (crisp high-res details for fabric textures)
 * - useWebWorker: true (non-blocking UI)
 * - fileType: 'image/webp' (enforces WebP format with alpha transparency support)
 */
export const COMPRESSION_OPTIONS = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp'
};

/**
 * Compresses an image file client-side using browser-image-compression.
 * 
 * @param {File|Blob} file - The raw input image file
 * @param {Object} customOptions - Optional overrides for compression
 * @returns {Promise<File>} Compressed WebP file
 */
export async function compressProductImage(file, customOptions = {}) {
    const options = {
        ...COMPRESSION_OPTIONS,
        ...customOptions
    };

    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error('Client-side compression failed:', error);
        throw new Error(`فشل ضغط الصورة محلياً: ${error.message || error}`);
    }
}

/**
 * Directly uploads a product image from the browser to Supabase Storage Bucket,
 * completely bypassing Vercel API routes and serverless functions.
 * 
 * @param {File|Blob} file - The raw image file to compress and upload
 * @param {Object} callbacks - Status callbacks
 * @param {Function} callbacks.onStatus - Status update callback: 'compressing' | 'uploading' | 'done' | 'error'
 * @param {Function} callbacks.onProgress - Upload/compression progress percentage
 * @returns {Promise<{ url: string, originalSize: number, compressedSize: number }>}
 */
export async function uploadProductImageDirect(file, { onStatus, onProgress } = {}) {
    if (!file) {
        throw new Error('يرجى تحديد ملف صورة صالح');
    }

    const originalSize = file.size;

    // 1. Client-Side Compression to WebP
    if (onStatus) onStatus('compressing');
    let compressedFile;
    try {
        compressedFile = await compressProductImage(file, {
            onProgress: (p) => {
                if (onProgress) onProgress(Math.round(p * 0.5)); // 0% - 50% for compression
            }
        });
    } catch (compressionErr) {
        if (onStatus) onStatus('error');
        throw compressionErr;
    }

    const compressedSize = compressedFile.size;

    // 2. Direct Upload to Supabase Storage Bucket
    if (onStatus) onStatus('uploading');
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const fileName = `prod_${Date.now()}_${randomSuffix}.webp`;

    try {
        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, compressedFile, {
                cacheControl: '31536000',
                upsert: false,
                contentType: 'image/webp'
            });

        if (error) {
            throw error;
        }

        // 3. Retrieve Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

        if (!publicUrl) {
            throw new Error('تعذر استخراج رابط الصورة العام من Supabase');
        }

        if (onProgress) onProgress(100);
        if (onStatus) onStatus('done');

        return {
            url: publicUrl,
            fileName,
            originalSize,
            compressedSize
        };
    } catch (uploadError) {
        if (onStatus) onStatus('error');
        console.error('Direct Supabase upload error:', uploadError);
        throw new Error(`فشل رفع الصورة إلى Supabase: ${uploadError.message || uploadError}`);
    }
}
