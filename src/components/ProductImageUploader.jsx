import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import { uploadProductImageDirect, COMPRESSION_OPTIONS } from '../lib/imageUploader';

/**
 * ProductImageUploader
 * 
 * Component for direct, client-side compressed product image uploads to Supabase Storage.
 * Completely bypasses Vercel serverless functions / API routes.
 * 
 * Compresses images to WebP (max 500KB, max 1920px) before upload.
 */
export default function ProductImageUploader({
    onUploadSuccess,
    onUploadError,
    multiple = false,
    label = 'اختر أو اسحب صورة المنتج هنا',
    subLabel = 'يتم تحويلها لـ WebP وضغطها تلقائياً لأعلى سرعة وجودة',
    className = '',
    disabled = false
}) {
    const [status, setStatus] = useState('idle'); // 'idle' | 'compressing' | 'uploading' | 'success' | 'error'
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState(null);
    const [stats, setStats] = useState(null); // { originalSize, compressedSize, savings }
    const fileInputRef = useRef(null);

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFiles = async (files) => {
        const fileList = Array.from(files || []);
        if (fileList.length === 0) return;

        setErrorMessage(null);
        setStats(null);
        setProgress(0);

        const validImages = fileList.filter(f => f.type.startsWith('image/'));
        if (validImages.length === 0) {
            setErrorMessage('يرجى اختيار ملف صورة صالح (PNG, JPEG, WebP)');
            setStatus('error');
            return;
        }

        try {
            const results = [];
            for (let i = 0; i < validImages.length; i++) {
                const file = validImages[i];

                const result = await uploadProductImageDirect(file, {
                    onStatus: (st) => setStatus(st),
                    onProgress: (p) => {
                        const overall = Math.round(((i / validImages.length) * 100) + (p / validImages.length));
                        setProgress(overall);
                    }
                });

                results.push(result);
            }

            // Calculate savings stats
            const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
            const totalCompressed = results.reduce((sum, r) => sum + r.compressedSize, 0);
            const savingsPercent = totalOriginal > 0 
                ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)
                : 0;

            setStats({
                original: formatBytes(totalOriginal),
                compressed: formatBytes(totalCompressed),
                savings: savingsPercent,
                urls: results.map(r => r.url)
            });

            setStatus('success');

            if (onUploadSuccess) {
                if (multiple) {
                    onUploadSuccess(results.map(r => r.url), results);
                } else {
                    onUploadSuccess(results[0]?.url, results[0]);
                }
            }
        } catch (err) {
            console.error('Upload component error:', err);
            const msg = err.message || 'حدث خطأ غير متوقع أثناء معالجة الصورة أو رفعها';
            setErrorMessage(msg);
            setStatus('error');
            if (onUploadError) onUploadError(err);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled || status === 'compressing' || status === 'uploading') return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const resetState = () => {
        setStatus('idle');
        setErrorMessage(null);
        setStats(null);
        setProgress(0);
    };

    const isBusy = status === 'compressing' || status === 'uploading';

    return (
        <div className={`w-full ${className}`} dir="rtl">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                className="hidden"
                disabled={disabled || isBusy}
                onChange={(e) => handleFiles(e.target.files)}
            />

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => !isBusy && !disabled && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                    disabled
                        ? 'opacity-50 cursor-not-allowed bg-gray-100/30 border-gray-300'
                        : isBusy
                            ? 'border-[#800020]/40 bg-[#800020]/5 cursor-wait'
                            : status === 'success'
                                ? 'border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500 cursor-pointer'
                                : status === 'error'
                                    ? 'border-red-500/50 bg-red-500/5 hover:border-red-500 cursor-pointer'
                                    : 'border-[#800020]/25 bg-white/40 hover:bg-[#800020]/5 hover:border-[#800020] cursor-pointer'
                }`}
            >
                {/* 1. Loading & Progress State */}
                {isBusy && (
                    <div className="flex flex-col items-center justify-center space-y-3 py-2">
                        <div className="relative">
                            <Loader2 className="w-10 h-10 text-[#800020] animate-spin" />
                            <Sparkles className="w-4 h-4 text-amber-600 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-[#800020] text-sm">
                                {status === 'compressing'
                                    ? 'جاري ضغط الصورة محلياً وتحويلها إلى WebP...'
                                    : 'جاري الرفع المباشر إلى Supabase Storage...'}
                            </p>
                            <p className="text-xs text-[#800020]/70">
                                {progress > 0 ? `${progress}% مكتمل` : 'يرجى الانتظار لحظات...'}
                            </p>
                        </div>
                        <div className="w-full max-w-xs bg-[#800020]/15 h-1.5 rounded-full overflow-hidden mt-2">
                            <div
                                className="bg-[#800020] h-full transition-all duration-300 rounded-full"
                                style={{ width: `${Math.max(progress, 15)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* 2. Success State */}
                {!isBusy && status === 'success' && stats && (
                    <div className="flex flex-col items-center justify-center space-y-2 py-1">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h4 className="font-bold text-emerald-800 text-sm">تم الرفع بنجاح وبسرعة فائقة!</h4>
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full border border-emerald-200">
                            <span>الحجم قبل: <strong>{stats.original}</strong></span>
                            <span>←</span>
                            <span>بعد الضغط: <strong>{stats.compressed}</strong></span>
                            {stats.savings > 0 && (
                                <span className="bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-xs">
                                    توفير {stats.savings}%
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                resetState();
                            }}
                            className="mt-2 text-xs text-[#800020] hover:underline font-semibold"
                        >
                            رفع صورة أخرى
                        </button>
                    </div>
                )}

                {/* 3. Error State */}
                {!isBusy && status === 'error' && (
                    <div className="flex flex-col items-center justify-center space-y-2 py-1">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-1">
                            <AlertCircle className="w-7 h-7" />
                        </div>
                        <h4 className="font-bold text-red-700 text-sm">فشلت عملية معالجة أو رفع الصورة</h4>
                        <p className="text-xs text-red-600 max-w-md">{errorMessage}</p>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                resetState();
                            }}
                            className="mt-2 text-xs bg-[#800020] text-white px-3 py-1 rounded-sm shadow-xs font-semibold hover:bg-[#600018]"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                )}

                {/* 4. Idle State */}
                {!isBusy && status === 'idle' && (
                    <div className="flex flex-col items-center justify-center space-y-2 py-1">
                        <div className="w-12 h-12 rounded-xl bg-[#800020]/10 flex items-center justify-center text-[#800020] group-hover:scale-105 transition-transform">
                            <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-[#800020] text-sm sm:text-base">
                                {label}
                            </p>
                            <p className="text-xs text-[#800020]/65 mt-1">
                                {subLabel}
                            </p>
                        </div>
                        <span className="inline-block mt-2 text-[11px] bg-[#800020]/10 text-[#800020] font-semibold px-2.5 py-1 rounded-full">
                            WebP مضغوط • أقصى حجم 500KB • دقة 1920px
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
