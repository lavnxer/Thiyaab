/**
 * Removes the background of an image using client-side AI (@imgly/background-removal)
 * Dynamically imports the model so initial app bundle size remains minimal.
 * 
 * @param {File|Blob|string} imageSource - The input image (File, Blob, or URL/dataURL)
 * @param {Function} [onProgress] - Optional callback (percent, statusKey)
 * @returns {Promise<{file: File|null, blob: Blob|null, dataUrl: string|null, error: Error|null}>}
 */
/**
 * Helper to auto-crop excess transparent margins around transparent cutouts.
 * Ensures vertical items like abayas and pants don't shrink inside widescreen canvases.
 */
async function autoCropTransparentBlob(blob, padPercent = 0.035) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return blob;
    try {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            URL.revokeObjectURL(url);
            return blob;
        }

        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
        let found = false;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const alpha = data[(y * canvas.width + x) * 4 + 3];
                if (alpha > 35) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    found = true;
                }
            }
        }

        if (!found) return blob;

        const contentW = maxX - minX;
        const contentH = maxY - minY;
        const padX = Math.round(contentW * padPercent);
        const padY = Math.round(contentH * padPercent);

        const cropX = Math.max(0, minX - padX);
        const cropY = Math.max(0, minY - padY);
        const cropW = Math.min(canvas.width - cropX, contentW + padX * 2);
        const cropH = Math.min(canvas.height - cropY, contentH + padY * 2);

        // If the content already occupies > 75% of both dimensions, keep original
        if (contentW / canvas.width > 0.75 && contentH / canvas.height > 0.75) {
            return blob;
        }

        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropW;
        croppedCanvas.height = cropH;
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        const croppedBlob = await new Promise(resolve => {
            croppedCanvas.toBlob(resolve, 'image/png');
        });

        return croppedBlob || blob;
    } catch (e) {
        console.warn('Auto-crop transparent blob skipped:', e);
        return blob;
    }
}

/**
 * Removes the background of an image using client-side AI (@imgly/background-removal)
 * Dynamically imports the model so initial app bundle size remains minimal.
 * 
 * @param {File|Blob|string} imageSource - The input image (File, Blob, or URL/dataURL)
 * @param {Function} [onProgress] - Optional callback (percent, statusKey)
 * @returns {Promise<{file: File|null, blob: Blob|null, dataUrl: string|null, error: Error|null}>}
 */
export async function removeImageBackground(imageSource, onProgress) {
    try {
        const { default: imglyRemoveBackground } = await import('@imgly/background-removal');

        const rawBlob = await imglyRemoveBackground(imageSource, {
            model: 'small', // Fast, lightweight model tailored for web/e-commerce
            output: {
                format: 'image/png',
                quality: 0.95
            },
            progress: (key, current, total) => {
                if (onProgress && total > 0) {
                    const percent = Math.round((current / total) * 100);
                    onProgress(percent, key);
                } else if (onProgress) {
                    onProgress(null, key);
                }
            }
        });

        // Automatically crop excess transparent boundaries to prevent garments from shrinking
        const blob = await autoCropTransparentBlob(rawBlob);

        // Create a File object from the resulting transparent PNG blob
        const fileName = `product_${Date.now()}_nobg.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        // Generate data URL for instant local preview
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        return { file, blob, dataUrl, error: null };
    } catch (error) {
        console.error('Error in removeImageBackground:', error);
        return { file: null, blob: null, dataUrl: null, error };
    }
}
