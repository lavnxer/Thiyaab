import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tag,
    Sparkles,
    Clock,
    Search,
    Check,
    RotateCcw,
    Sliders,
    Eye,
    Percent,
    ArrowUpRight,
    ExternalLink,
    Image as ImageIcon,
    CheckCircle2,
    Calendar,
    Flame,
    ShoppingBag,
    Link as LinkIcon,
    AlertCircle,
    Layers,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RiyalIcon from './RiyalIcon';
import { QUICK_OFFER_PRESETS, OFFER_IMAGES_GALLERY, DEFAULT_HOME_OFFER } from '../data/homeOfferData';

export default function OfferManagementSection({
    productsList = [],
    homeOffer = DEFAULT_HOME_OFFER,
    updateHomeOffer,
    resetHomeOffer,
    showToast
}) {
    // Local editable form state
    const [offerForm, setOfferForm] = useState(() => ({
        isActive: homeOffer?.isActive ?? true,
        productId: homeOffer?.productId || '1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7',
        productName: homeOffer?.productName || 'حذاء جلدي فاخر كلاسيكي',
        category: homeOffer?.category || 'أحذية',
        title: homeOffer?.title || 'عرض محدود وحصري',
        badgeText: homeOffer?.badgeText || 'خصم',
        discount: homeOffer?.discount || '70%',
        originalPrice: homeOffer?.originalPrice ?? 400,
        salePrice: homeOffer?.salePrice ?? 150,
        imageUrl: homeOffer?.imageUrl || '/new_offer_shoes_transparent.png',
        imageScale: homeOffer?.imageScale ?? 1.1,
        imageOffsetX: homeOffer?.imageOffsetX ?? 45,
        targetUrl: homeOffer?.targetUrl || '/product/1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7',
        durationDays: homeOffer?.durationDays ?? 3,
        durationHours: homeOffer?.durationHours ?? 23,
        durationMinutes: homeOffer?.durationMinutes ?? 15,
        durationSeconds: homeOffer?.durationSeconds ?? 33,
        endTimestamp: homeOffer?.endTimestamp || null
    }));

    // Synchronize form when external homeOffer changes
    useEffect(() => {
        if (homeOffer) {
            setOfferForm(prev => ({
                ...prev,
                ...homeOffer
            }));
        }
    }, [homeOffer]);

    // Active sub-navigation inside offer editor
    const [activeSection, setActiveSection] = useState('picker'); // 'picker', 'details', 'images', 'timer'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('الكل');
    const [isSaving, setIsSaving] = useState(false);
    const [customImageUrl, setCustomImageUrl] = useState('');

    // Countdown preview timer
    const [previewTimer, setPreviewTimer] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
    useEffect(() => {
        let endTime;
        if (offerForm.endTimestamp && Number(offerForm.endTimestamp) > Date.now()) {
            endTime = Number(offerForm.endTimestamp);
        } else {
            const daysMs = (Number(offerForm.durationDays) || 3) * 24 * 60 * 60 * 1000;
            const hoursMs = (Number(offerForm.durationHours) || 23) * 60 * 60 * 1000;
            const minsMs = (Number(offerForm.durationMinutes) || 15) * 60 * 1000;
            const secsMs = (Number(offerForm.durationSeconds) || 33) * 1000;
            endTime = Date.now() + daysMs + hoursMs + minsMs + secsMs;
        }

        const tick = () => {
            const distance = endTime - Date.now();
            if (distance <= 0) {
                setPreviewTimer({ days: '00', hours: '00', minutes: '00', seconds: '00' });
                return;
            }
            setPreviewTimer({
                days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0'),
                hours: String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
                minutes: String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
                seconds: String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0')
            });
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [offerForm.endTimestamp, offerForm.durationDays, offerForm.durationHours, offerForm.durationMinutes, offerForm.durationSeconds]);

    // Categories list for product filter
    const categoriesList = useMemo(() => {
        const cats = new Set(['الكل']);
        productsList.forEach(p => {
            if (p.category) cats.add(p.category);
        });
        return Array.from(cats);
    }, [productsList]);

    // Filtered products for selection
    const filteredProducts = useMemo(() => {
        return productsList.filter(prod => {
            const matchSearch = !searchQuery.trim() ||
                prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (prod.category && prod.category.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchCat = selectedCategory === 'الكل' || prod.category === selectedCategory;
            return matchSearch && matchCat;
        });
    }, [productsList, searchQuery, selectedCategory]);

    // Check if form has unsaved modifications
    const hasUnsavedChanges = useMemo(() => {
        if (!homeOffer) return false;
        return (
            offerForm.productId !== homeOffer.productId ||
            offerForm.productName !== homeOffer.productName ||
            offerForm.discount !== homeOffer.discount ||
            offerForm.originalPrice !== homeOffer.originalPrice ||
            offerForm.salePrice !== homeOffer.salePrice ||
            offerForm.imageUrl !== homeOffer.imageUrl ||
            offerForm.imageScale !== homeOffer.imageScale ||
            offerForm.imageOffsetX !== homeOffer.imageOffsetX ||
            offerForm.isActive !== homeOffer.isActive ||
            offerForm.badgeText !== homeOffer.badgeText ||
            offerForm.durationDays !== homeOffer.durationDays ||
            offerForm.durationHours !== homeOffer.durationHours ||
            offerForm.durationMinutes !== homeOffer.durationMinutes ||
            offerForm.durationSeconds !== homeOffer.durationSeconds ||
            offerForm.endTimestamp !== homeOffer.endTimestamp
        );
    }, [offerForm, homeOffer]);

    // Handler: select product from store catalog
    const handleSelectProduct = (prod) => {
        const orig = prod.originalPrice || Math.round(prod.price * 1.5);
        const calcDiscount = Math.round((1 - prod.price / orig) * 100) + '%';
        const img = prod.image || prod.images?.[0] || '/images/coat_transparent.png';

        setOfferForm(prev => ({
            ...prev,
            productId: prod.id,
            productName: prod.name,
            category: prod.category || 'أزياء',
            originalPrice: orig,
            salePrice: prod.price,
            discount: calcDiscount,
            imageUrl: img,
            targetUrl: `/product/${prod.id}`
        }));

        if (showToast) {
            showToast(`تم اختيار "${prod.name}" كعنصر للعرض الرئيسي`, 'sparkle');
        }
    };

    // Handler: apply ready preset
    const handleApplyPreset = (preset) => {
        setOfferForm(prev => ({
            ...prev,
            ...preset
        }));
        if (showToast) {
            showToast(`تم تطبيق نموذج: ${preset.name}`, 'sparkle');
        }
    };

    // Handler: auto compute discount percentage
    const handleAutoComputeDiscount = () => {
        const orig = Number(offerForm.originalPrice);
        const sale = Number(offerForm.salePrice);
        if (orig > 0 && sale > 0 && sale < orig) {
            const pct = Math.round((1 - sale / orig) * 100);
            setOfferForm(prev => ({ ...prev, discount: `${pct}%` }));
            if (showToast) showToast(`تم حساب نسبة الخصم: ${pct}%`, 'success');
        } else {
            if (showToast) showToast('يرجى التأكد من أن السعر الأصلي أكبر من سعر الخصم', 'error');
        }
    };

    // Helper to format ISO datetime-local string in user's local time
    const formatToLocalDateTimeInput = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(Number(timestamp));
        if (isNaN(date.getTime())) return '';
        const pad = (n) => String(n).padStart(2, '0');
        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const min = pad(date.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };

    // Helper to ensure English numerals
    const toEnglishDigits = (str) => {
        if (!str && str !== 0) return '';
        return String(str).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    };

    // Helper to format Arabic date string for display
    const formatEndDateArabic = (timestamp) => {
        if (!timestamp) return 'غير محدد';
        const date = new Date(Number(timestamp));
        if (isNaN(date.getTime())) return 'غير محدد';
        try {
            return toEnglishDigits(date.toLocaleDateString('ar-SA-u-nu-latn', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }));
        } catch {
            return toEnglishDigits(date.toLocaleString('en-US'));
        }
    };

    // Handler: reset countdown timer to preset from now
    const handleSetDurationPreset = (days, hours = 0, mins = 0) => {
        const newEndTime = Date.now() + (days * 86400000) + (hours * 3600000) + (mins * 60000);
        setOfferForm(prev => ({
            ...prev,
            durationDays: days,
            durationHours: hours,
            durationMinutes: mins,
            durationSeconds: 0,
            endTimestamp: newEndTime
        }));
        if (showToast) {
            showToast(`تم ضبط العداد ليبدأ من الآن لمدة (${days > 0 ? `${days} أيام ` : ''}${hours > 0 ? `${hours} ساعات` : ''})`, 'info');
        }
    };

    // Handler: update single duration numeric field and recompute endTimestamp
    const handleUpdateDurationField = (field, val) => {
        const num = Math.max(0, parseInt(val) || 0);
        setOfferForm(prev => {
            const updated = { ...prev, [field]: num };
            const d = Number(updated.durationDays) || 0;
            const h = Number(updated.durationHours) || 0;
            const m = Number(updated.durationMinutes) || 0;
            const s = Number(updated.durationSeconds) || 0;
            const newEnd = Date.now() + (d * 86400000) + (h * 3600000) + (m * 60000) + (s * 1000);
            return {
                ...updated,
                endTimestamp: newEnd
            };
        });
    };

    // Handler: set exact end date & time timestamp directly from custom calendar
    const handleSetExactTimestamp = (target) => {
        if (!target || isNaN(target)) return;
        const diff = Math.max(0, target - Date.now());
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setOfferForm(prev => ({
            ...prev,
            endTimestamp: target,
            durationDays: d,
            durationHours: h,
            durationMinutes: m,
            durationSeconds: s
        }));
    };

    // Handler: set exact end date & time from datetime-local input
    const handleSetExactEndDateTime = (e) => {
        const val = e.target.value;
        if (!val) return;
        const target = new Date(val).getTime();
        if (isNaN(target)) return;
        const diff = Math.max(0, target - Date.now());
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setOfferForm(prev => ({
            ...prev,
            endTimestamp: target,
            durationDays: d,
            durationHours: h,
            durationMinutes: m,
            durationSeconds: s
        }));
        if (showToast) {
            showToast('تم تحديد موعد انتهاء العرض وحساب الوقت المتبقي بنجاح', 'success');
        }
    };

    // Handler: Restart / Refresh countdown from now with currently selected duration
    const handleRestartCountdownFromNow = () => {
        const d = Number(offerForm.durationDays) || 0;
        const h = Number(offerForm.durationHours) || 0;
        const m = Number(offerForm.durationMinutes) || 0;
        const s = Number(offerForm.durationSeconds) || 0;
        const newEnd = Date.now() + (d * 86400000) + (h * 3600000) + (m * 60000) + (s * 1000);
        setOfferForm(prev => ({
            ...prev,
            endTimestamp: newEnd
        }));
        if (showToast) {
            showToast('تم بدء العد التنازلي مجدداً من هذه اللحظة', 'sparkle');
        }
    };

    // Handler: Save changes
    const handleSaveOffer = () => {
        setIsSaving(true);
        try {
            let finalEnd = offerForm.endTimestamp ? Number(offerForm.endTimestamp) : null;
            if (!finalEnd || isNaN(finalEnd) || finalEnd <= Date.now()) {
                const daysMs = (Number(offerForm.durationDays) || 0) * 86400000;
                const hoursMs = (Number(offerForm.durationHours) || 0) * 3600000;
                const minsMs = (Number(offerForm.durationMinutes) || 0) * 60000;
                const secsMs = (Number(offerForm.durationSeconds) || 0) * 1000;
                finalEnd = Date.now() + daysMs + hoursMs + minsMs + secsMs;
            }
            const toSave = {
                ...offerForm,
                endTimestamp: finalEnd,
                durationDays: Number(offerForm.durationDays) || 0,
                durationHours: Number(offerForm.durationHours) || 0,
                durationMinutes: Number(offerForm.durationMinutes) || 0,
                durationSeconds: Number(offerForm.durationSeconds) || 0
            };
            setOfferForm(toSave);
            updateHomeOffer(toSave);
            if (showToast) {
                showToast('تم حفظ توقيت وتفاصيل العرض بنجاح وربطه بالصفحة الرئيسية!', 'sparkle');
            }
        } catch (err) {
            console.error('Error saving home offer:', err);
            if (showToast) showToast('حدث خطأ أثناء حفظ العرض', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Handler: Reset to default
    const handleReset = () => {
        if (window.confirm('هل أنت متأكد من استعادة العرض الافتراضي للصفحة الرئيسية؟')) {
            resetHomeOffer();
            setOfferForm(DEFAULT_HOME_OFFER);
            if (showToast) {
                showToast('تمت استعادة العرض الافتراضي بنجاح', 'info');
            }
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-16">

            {/* 2. LIVE INTERACTIVE BANNER PREVIEW (معاينة حية دقيقة) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-sm font-black text-[#800020]">
                        <Eye className="w-4 h-4" />
                        <span>معاينة حية ومباشرة للبانر كما يظهر على الصفحة الرئيسية</span>
                    </div>
                    <span className="text-xs font-bold text-[#800020]/60">
                        المنتج النشط: <strong className="text-[#800020]">{offerForm.productName}</strong>
                    </span>
                </div>

                {/* Banner Replica */}
                <div className="@container w-full bg-[#800020] text-white rounded-3xl overflow-hidden relative shadow-2xl flex items-stretch border-2 border-[#800020]">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col @[740px]:flex-row items-center justify-between relative w-full py-6 @[740px]:py-0">

                        {/* Right: Timer blocks */}
                        <div className="flex gap-2 @[400px]:gap-4 text-center items-center py-4 @[740px]:py-9" dir="ltr">
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-[38px] h-[38px] @[400px]:w-[44px] @[400px]:h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-lg @[400px]:text-xl lg:text-2xl font-bold rounded shadow-inner">
                                    {previewTimer.days}
                                </div>
                                <span className="text-[10px] lg:text-xs font-bold opacity-90">أيام</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-[38px] h-[38px] @[400px]:w-[44px] @[400px]:h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-lg @[400px]:text-xl lg:text-2xl font-bold rounded shadow-inner">
                                    {previewTimer.hours}
                                </div>
                                <span className="text-[10px] lg:text-xs font-bold opacity-90">ساعات</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-[38px] h-[38px] @[400px]:w-[44px] @[400px]:h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-lg @[400px]:text-xl lg:text-2xl font-bold rounded shadow-inner">
                                    {previewTimer.minutes}
                                </div>
                                <span className="text-[10px] lg:text-xs font-bold opacity-90">دقائق</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-[38px] h-[38px] @[400px]:w-[44px] @[400px]:h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-lg @[400px]:text-xl lg:text-2xl font-bold rounded shadow-inner">
                                    {previewTimer.seconds}
                                </div>
                                <span className="text-[10px] lg:text-xs font-bold opacity-90">ثواني</span>
                            </div>
                        </div>

                        {/* Center: Text & Pricing */}
                        <div className="flex-1 flex justify-center items-center my-4 @[740px]:my-0 @[740px]:translate-x-12">
                            <div className="flex items-center gap-4 @[400px]:gap-8 text-[#E2D3C0]">
                                <div className="text-center">
                                    <span className="text-xl @[400px]:text-2xl lg:text-3xl font-black block">{offerForm.badgeText || 'خصم'}</span>
                                    <span className="text-2xl @[400px]:text-3xl lg:text-4xl font-black block text-[#E2D3C0]">{offerForm.discount || '70%'}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center border-r-2 border-[#E2D3C0]/30 pr-4 @[400px]:pr-8">
                                    {offerForm.originalPrice && (
                                        <span className="line-through opacity-70 text-base @[400px]:text-lg block mb-1">
                                            {offerForm.originalPrice} <RiyalIcon />
                                        </span>
                                    )}
                                    <span className="font-bold text-xl @[400px]:text-2xl lg:text-3xl block text-[#E2D3C0]">
                                        {offerForm.salePrice} <RiyalIcon />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Left: Product Card Block with image */}
                        <div className="w-full max-w-[280px] @[400px]:max-w-[310px] min-h-[220px] @[400px]:min-h-[260px] @[740px]:min-h-[280px] shrink-0 bg-[#f0dfcd] text-[#800020] flex flex-row items-stretch rounded-2xl @[740px]:rounded-none relative z-10 @[740px]:-ml-20 @[740px]:mr-20 shadow-lg @[740px]:shadow-none overflow-visible">
                            <div className="flex-1 relative z-20 flex items-center justify-center p-2 group hover:scale-105 transition-transform duration-500">
                                <img
                                    src={offerForm.imageUrl || '/new_offer_shoes_transparent.png'}
                                    alt={offerForm.productName}
                                    className="w-full max-w-[340px] @[400px]:max-w-[400px] h-auto object-contain origin-center absolute translate-x-4 @[400px]:translate-x-8 @[740px]:translate-x-12 transition-transform duration-500 drop-shadow-2xl"
                                    style={{ transform: `scale(${offerForm.imageScale || 1.1}) translateX(${offerForm.imageOffsetX !== undefined ? `${offerForm.imageOffsetX}px` : '45px'})` }}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 3. Section Navigation Tabs (اختيار المنتج، الأسعار، الصور، العداد) */}
            <div className="flex items-center gap-2 border-b border-[#800020]/15 pb-2 overflow-x-auto no-scrollbar scroll-smooth">
                {[
                    { id: 'picker', label: 'اختيار المنتج من المتجر', icon: ShoppingBag },
                    { id: 'details', label: 'الأسعار ونسبة الخصم والشارة', icon: Percent },
                    { id: 'images', label: 'صورة العرض ومكتبة الصور', icon: ImageIcon },
                    { id: 'timer', label: 'العداد التنازلي وتاريخ الانتهاء', icon: Clock }
                ].map(tab => {
                    const isSelected = activeSection === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveSection(tab.id)}
                            className={`shrink-0 whitespace-nowrap relative overflow-hidden group px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition-all duration-300 cursor-pointer ${
                                isSelected
                                    ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-sm'
                                    : 'bg-white/50 text-[#800020] border-[#800020]/15'
                            }`}
                        >
                            {!isSelected && (
                                <span className="absolute -inset-x-24 -inset-y-16 bg-[#800020] -translate-x-[160%] skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0 pointer-events-none z-0" />
                            )}

                            {/* Base Layer */}
                            <span className={`relative z-10 flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                                isSelected ? 'text-[#F0DFCD]' : 'text-[#800020] group-hover:-translate-y-[150%] group-hover:opacity-0'
                            }`}>
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </span>

                            {/* Hover Roll-in Layer (زاوية 45) */}
                            {!isSelected && (
                                <span className="absolute inset-0 z-20 flex items-center justify-center gap-2 px-4 py-2.5 w-full h-full pointer-events-none text-[#F0DFCD] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </span>
                            )}

                            <span className="shine-effect z-30" />
                        </button>
                    );
                })}
            </div>

            {/* ================================================================= */}
            {/* SUBSECTION 1: PRODUCT PICKER & CATALOG                            */}
            {/* ================================================================= */}
            {activeSection === 'picker' && (
                <div className="space-y-6">

                    {/* Catalog Search & Category Filters */}
                    <div className="bg-white/60 border border-[#800020]/15 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-black text-[#800020]">
                                    اختر من منتجات المتجر ({productsList.length} منتج متوفر)
                                </h3>
                                <p className="text-xs font-semibold text-[#800020]/70">
                                    انقر على أي منتج لتعيينه فوراً كعنصر العرض الترويجي على الصفحة الرئيسية
                                </p>
                            </div>

                            {/* Search bar */}
                            <div className="relative w-full sm:w-72">
                                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#800020]/50" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="بحث بالاسم أو القسم..."
                                    className="w-full bg-white pr-10 pl-4 py-2 rounded-xl text-xs font-bold border border-[#800020]/20 focus:outline-none focus:border-[#800020] text-[#800020]"
                                />
                            </div>
                        </div>

                        {/* Category filter pills (تأثير تغيير لون ونصف بزاوية 45) */}
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                            {categoriesList.map((cat, idx) => {
                                const isSelected = selectedCategory === cat;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`relative overflow-hidden group px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer text-xs border transition-all duration-300 shrink-0 ${
                                            isSelected
                                                ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-xs'
                                                : 'bg-white/70 text-[#800020] border-[#800020]/15'
                                        }`}
                                    >
                                        {!isSelected && (
                                            <span className="absolute -inset-x-24 -inset-y-16 bg-[#800020] -translate-x-[160%] skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0 pointer-events-none z-0" />
                                        )}

                                        {/* Base Layer */}
                                        <span className={`relative z-10 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                                            isSelected ? 'text-[#F0DFCD]' : 'text-[#800020] group-hover:-translate-y-[150%] group-hover:opacity-0'
                                        }`}>
                                            {cat}
                                        </span>

                                        {/* Hover Roll-in Layer (زاوية 45) */}
                                        {!isSelected && (
                                            <span className="absolute inset-0 z-20 flex items-center justify-center px-3 py-1.5 w-full h-full pointer-events-none text-[#F0DFCD] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                                                {cat}
                                            </span>
                                        )}

                                        <span className="shine-effect z-30" />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Products Grid */}
                        <div className="@container">
                            <div className="grid grid-cols-1 @[420px]:grid-cols-2 @[680px]:grid-cols-3 @[900px]:grid-cols-4 gap-3 @[420px]:gap-4 max-h-[500px] overflow-y-auto p-1">
                                {filteredProducts.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-[#800020]/70">
                                        <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm font-bold">لم يتم العثور على منتجات مطابقة للبحث</p>
                                    </div>
                                ) : (
                                    filteredProducts.map((prod) => {
                                        const isSelected = offerForm.productId === prod.id;
                                        return (
                                            <div
                                                key={prod.id}
                                                onClick={() => handleSelectProduct(prod)}
                                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
                                                    isSelected
                                                        ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-lg ring-2 ring-[#800020]/30'
                                                        : 'bg-white border-[#800020]/15 hover:border-[#800020] hover:shadow-md text-[#800020]'
                                                }`}
                                            >
                                            {isSelected && (
                                                <span className="absolute top-2 left-2 bg-emerald-400 text-emerald-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs z-10">
                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                    <span>العنصر المختار</span>
                                                </span>
                                            )}

                                            <div>
                                                <div className="w-full h-36 rounded-xl bg-[#f0dfcd] flex items-center justify-center p-2 overflow-hidden mb-3 group-hover:scale-102 transition-transform">
                                                    <img
                                                        src={prod.image || prod.images?.[0] || '/images/coat_transparent.png'}
                                                        alt={prod.name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-bold block ${isSelected ? 'text-[#F0DFCD]/80' : 'text-[#800020]/70'}`}>
                                                    {prod.category}
                                                </span>
                                                <h4 className="text-xs sm:text-sm font-black line-clamp-1 mt-0.5" title={prod.name}>
                                                    {prod.name}
                                                </h4>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-current/15 flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-black block">
                                                        {prod.price} <RiyalIcon />
                                                    </span>
                                                    {prod.originalPrice && (
                                                        <span className="line-through text-[10px] opacity-60 block">
                                                            {prod.originalPrice} <RiyalIcon />
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                                        isSelected
                                                            ? 'bg-amber-400 text-amber-950 shadow-xs'
                                                            : 'bg-[#800020]/10 text-[#800020] group-hover:bg-[#800020] group-hover:text-[#F0DFCD]'
                                                    }`}
                                                >
                                                    <span>{isSelected ? 'محدد' : 'اختيار'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        </div>
                    </div>

                </div>
            )}

            {/* ================================================================= */}
            {/* SUBSECTION 2: PRICING, DISCOUNT & LABELS                           */}
            {/* ================================================================= */}
            {activeSection === 'details' && (
                <div className="bg-white/60 border border-[#800020]/15 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="border-b border-[#800020]/15 pb-4">
                        <h3 className="text-lg font-black text-[#800020]">
                            تخصيص الأسعار والشارات ونسب الخصم
                        </h3>
                        <p className="text-xs font-semibold text-[#800020]/70">
                            تحكم بالأسعار التي تظهر في الدائرة الترويجية على البانر
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Product Title / Display Name */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-[#800020] block">
                                اسم المنتج أو وصف العرض
                            </label>
                            <input
                                type="text"
                                value={offerForm.productName}
                                onChange={(e) => setOfferForm(prev => ({ ...prev, productName: e.target.value }))}
                                placeholder="مثال: حذاء جلدي فاخر كلاسيكي"
                                className="w-full bg-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-[#800020]/20 focus:outline-none focus:border-[#800020] text-[#800020]"
                            />
                        </div>

                        {/* Offer Badge Text */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#800020] block">
                                شارة العرض (النص العلوي)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={offerForm.badgeText}
                                    onChange={(e) => setOfferForm(prev => ({ ...prev, badgeText: e.target.value }))}
                                    placeholder="مثال: خصم، عرض خاص..."
                                    className="w-full bg-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-[#800020]/20 focus:outline-none focus:border-[#800020] text-[#800020]"
                                />
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {['خصم', 'عرض خاص', 'تخفيض حصري', 'وفر الآن', 'تصفية'].map((badge) => (
                                    <button
                                        key={badge}
                                        type="button"
                                        onClick={() => setOfferForm(prev => ({ ...prev, badgeText: badge }))}
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#800020]/10 text-[#800020] hover:bg-[#800020] hover:text-[#F0DFCD] transition cursor-pointer"
                                    >
                                        {badge}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Original Price */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#800020] flex items-center gap-1">
                                <span>السعر الأصلي قبل الخصم</span>
                                <span>(</span>
                                <RiyalIcon size="0.85em" />
                                <span>)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={offerForm.originalPrice}
                                    onChange={(e) => {
                                        const newOrig = Number(e.target.value);
                                        const newDiscount = (newOrig > 0 && offerForm.salePrice > 0 && newOrig > offerForm.salePrice)
                                            ? `${Math.round(((newOrig - offerForm.salePrice) / newOrig) * 100)}%`
                                            : offerForm.discount;
                                        setOfferForm(prev => ({ ...prev, originalPrice: newOrig, discount: newDiscount }));
                                    }}
                                    placeholder="400"
                                    className="w-full bg-white pr-4 pl-12 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-[#800020]/20 focus:outline-none focus:border-[#800020] text-[#800020]"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#800020]/60 flex items-center gap-1">
                                    <RiyalIcon />
                                </span>
                            </div>
                        </div>

                        {/* Sale Price */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#800020] flex items-center gap-1">
                                <span>سعر العرض المخفض</span>
                                <span>(</span>
                                <RiyalIcon size="0.85em" />
                                <span>)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={offerForm.salePrice}
                                    onChange={(e) => {
                                        const newSale = Number(e.target.value);
                                        const newDiscount = (offerForm.originalPrice > 0 && newSale > 0 && offerForm.originalPrice > newSale)
                                            ? `${Math.round(((offerForm.originalPrice - newSale) / offerForm.originalPrice) * 100)}%`
                                            : offerForm.discount;
                                        setOfferForm(prev => ({ ...prev, salePrice: newSale, discount: newDiscount }));
                                    }}
                                    placeholder="150"
                                    className="w-full bg-white pr-4 pl-12 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-[#800020]/20 focus:outline-none focus:border-[#800020] text-[#800020]"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#800020]/60 flex items-center gap-1">
                                    <RiyalIcon />
                                </span>
                            </div>
                        </div>

                        {/* Discount Percentage (محسوبة تلقائياً وغير قابلة للتعديل) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#800020] block">
                                نسبة الخصم المعروضة (حساب تلقائي)
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={offerForm.discount}
                                placeholder="تحسب تلقائياً من السعرين"
                                className="w-full bg-gray-100/80 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-[#800020]/20 text-[#800020] cursor-not-allowed select-none"
                            />
                        </div>

                        {/* Target URL - ربط تلقائي باختيار منتج من المتجر */}
                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-xs font-bold text-[#800020] block">
                                رابط التوجيه: اختيار منتج من المتجر (ربط الرابط تلقائياً)
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <select
                                        value={offerForm.productId || ''}
                                        onChange={(e) => {
                                            const prodId = e.target.value;
                                            const selectedProd = productsList.find(p => String(p.id) === String(prodId));
                                            if (selectedProd) {
                                                handleSelectProduct(selectedProd);
                                            }
                                        }}
                                        className="w-full bg-white pr-4 pl-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-[#800020]/20 focus:outline-none focus:border-[#800020] text-[#800020] cursor-pointer"
                                    >
                                        <option value="">-- اختر منتجاً من المتجر لربط رابطه تلقائياً ({productsList.length} منتج) --</option>
                                        {productsList.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} - ({p.price} ر.س)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {offerForm.targetUrl && (
                                    <Link
                                        to={offerForm.targetUrl}
                                        target="_blank"
                                        className="px-4 py-2.5 rounded-2xl bg-white border border-[#800020]/20 text-[#800020] hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>معاينة الرابط</span>
                                    </Link>
                                )}
                            </div>
                            {offerForm.targetUrl && (
                                <span className="text-[11px] text-[#800020]/60 font-mono block">
                                    الرابط المربوط تلقائياً: {offerForm.targetUrl}
                                </span>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* SUBSECTION 3: IMAGE GALLERY & CUSTOM PHOTO                        */}
            {/* ================================================================= */}
            {activeSection === 'images' && (
                <div className="bg-white/60 border border-[#800020]/15 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="border-b border-[#800020]/15 pb-4">
                        <h3 className="text-lg font-black text-[#800020]">
                            صورة العرض الترويجي والمؤثرات البصرية
                        </h3>
                        <p className="text-xs font-semibold text-[#800020]/70">
                            اختر من مكتبة الصور المفرغة الشفافة عالية الدقة، أو أدخل رابط صورة مخصص
                        </p>
                    </div>

                    {/* Scale and alignment slider */}
                    <div className="bg-white/70 p-4 rounded-2xl border border-[#800020]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Sliders className="w-5 h-5 text-[#800020]" />
                            <div>
                                <span className="text-xs font-bold text-[#800020] block">حجم وتكبير الصورة (Image Scale): {offerForm.imageScale}x</span>
                                <span className="text-[11px] text-[#800020]/60">يساعد في ضبط تموضع المنتج الشفاف بدقة داخل الإطار</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-60">
                            <input
                                type="range"
                                min="0.8"
                                max="1.4"
                                step="0.05"
                                value={offerForm.imageScale}
                                onChange={(e) => setOfferForm(prev => ({ ...prev, imageScale: parseFloat(e.target.value) }))}
                                className="w-full accent-[#800020] cursor-pointer"
                            />
                            <button
                                type="button"
                                onClick={() => setOfferForm(prev => ({ ...prev, imageScale: 1.1 }))}
                                className="text-[10px] font-bold px-2 py-1 rounded bg-[#800020]/10 text-[#800020] hover:bg-[#800020] hover:text-[#F0DFCD] shrink-0"
                            >
                                افتراضي
                            </button>
                        </div>
                    </div>

                    {/* Horizontal position slider */}
                    <div className="bg-white/70 p-4 rounded-2xl border border-[#800020]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Sliders className="w-5 h-5 text-[#800020]" />
                            <div>
                                <span className="text-xs font-bold text-[#800020] block">إزاحة الصورة أفقياً (Image X-Offset): {offerForm.imageOffsetX ?? 45}px</span>
                                <span className="text-[11px] text-[#800020]/60">تحريك الصورة لليمين واليسار لضبط موضع طرف الحذاء بالنسبة للمستطيل البيج</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-60">
                            <input
                                type="range"
                                min="20"
                                max="140"
                                step="2"
                                value={offerForm.imageOffsetX ?? 45}
                                onChange={(e) => setOfferForm(prev => ({ ...prev, imageOffsetX: parseInt(e.target.value, 10) }))}
                                className="w-full accent-[#800020] cursor-pointer"
                            />
                            <button
                                type="button"
                                onClick={() => setOfferForm(prev => ({ ...prev, imageOffsetX: 45 }))}
                                className="text-[10px] font-bold px-2 py-1 rounded bg-[#800020]/10 text-[#800020] hover:bg-[#800020] hover:text-[#F0DFCD] shrink-0"
                            >
                                افتراضي
                            </button>
                        </div>
                    </div>

                </div>
            )}

            {/* ================================================================= */}
            {/* SUBSECTION 4: COUNTDOWN TIMER & SCHEDULING                        */}
            {/* ================================================================= */}
            {activeSection === 'timer' && (
                <div className="bg-white/60 border border-[#800020]/15 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
                    
                    {/* Header */}
                    <div className="border-b border-[#800020]/15 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#800020]" />
                                <h3 className="text-lg sm:text-xl font-black text-[#800020]">
                                    إعدادات العداد التنازلي وتوقيت العرض
                                </h3>
                            </div>
                            <p className="text-xs font-semibold text-[#800020]/70 mt-1">
                                هذا التوقيت مرتبط مباشرة بالبانر في الصفحة الرئيسية للمتجر ويتم تحديثه لحظياً.
                            </p>
                        </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="bg-[#800020] text-white p-6 rounded-3xl shadow-lg border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-right space-y-1">
                            <span className="text-xs font-bold text-[#F0DFCD]/80 block">المعاينة الحية للعداد كما يظهر للزوار في الصفحة الرئيسية:</span>
                            <h4 className="text-lg font-black text-white">العد التنازلي المباشر</h4>
                            <span className="text-[11px] text-[#F0DFCD]/70 block">
                                ينتهي العرض في: <strong className="text-[#F0DFCD]">{formatEndDateArabic(offerForm.endTimestamp)}</strong>
                            </span>
                        </div>

                        {/* Timer Blocks */}
                        <div className="flex gap-3 sm:gap-4 text-center items-center" dir="ltr">
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-[50px] h-[50px] sm:w-[58px] sm:h-[58px] flex items-center justify-center bg-black/35 text-xl sm:text-2xl font-black rounded-2xl shadow-inner border border-white/15">
                                    {previewTimer.days}
                                </div>
                                <span className="text-[11px] font-bold text-[#F0DFCD]">أيام</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-[50px] h-[50px] sm:w-[58px] sm:h-[58px] flex items-center justify-center bg-black/35 text-xl sm:text-2xl font-black rounded-2xl shadow-inner border border-white/15">
                                    {previewTimer.hours}
                                </div>
                                <span className="text-[11px] font-bold text-[#F0DFCD]">ساعات</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-[50px] h-[50px] sm:w-[58px] sm:h-[58px] flex items-center justify-center bg-black/35 text-xl sm:text-2xl font-black rounded-2xl shadow-inner border border-white/15">
                                    {previewTimer.minutes}
                                </div>
                                <span className="text-[11px] font-bold text-[#F0DFCD]">دقائق</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-[50px] h-[50px] sm:w-[58px] sm:h-[58px] flex items-center justify-center bg-black/35 text-xl sm:text-2xl font-black rounded-2xl shadow-inner border border-white/15 text-[#F0DFCD]">
                                    {previewTimer.seconds}
                                </div>
                                <span className="text-[11px] font-bold text-[#F0DFCD]">ثواني</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleRestartCountdownFromNow}
                            className="px-4 py-2.5 rounded-2xl bg-[#F0DFCD] text-[#800020] hover:bg-white text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>تجديد العد من الآن</span>
                        </button>
                    </div>

                    {/* Method 1: Exact Date and Time Picker (Luxury Store-Themed Calendar) */}
                    <div className="bg-white/80 border border-[#800020]/20 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#800020]" />
                            <h4 className="text-sm font-black text-[#800020]">
                                تحديد تاريخ ووقت انتهاء العرض من التقويم
                            </h4>
                        </div>
                        <p className="text-xs text-[#800020]/70">
                            اختر يوم وتوقيت انتهاء العرض مباشرة من التقويم المصمم بهوية وتصميم المتجر. يتم احتساب الأيام والساعات المتبقية تلقائياً وربطها فورياً بالعداد.
                        </p>

                        <LuxuryArabicDatePicker
                            endTimestamp={offerForm.endTimestamp}
                            onSelectTimestamp={handleSetExactTimestamp}
                            formatEndDateArabic={formatEndDateArabic}
                        />
                    </div>

                    {/* Method 2: Manual Duration Inputs */}
                    <div className="bg-white/80 border border-[#800020]/20 rounded-2xl p-5 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-[#800020]" />
                            <h4 className="text-sm font-black text-[#800020]">
                                الخيار الثاني: تحديد مدة العرض يدوياً (أيام، ساعات، دقائق، ثواني)
                            </h4>
                        </div>
                        <p className="text-xs text-[#800020]/70">
                            أو يمكنك تحديد مدة العرض بالأيام والساعات ليتم حسابه بدءاً من اللحظة الحالية:
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#800020] block">الأيام (Days)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="365"
                                    value={offerForm.durationDays}
                                    onChange={(e) => handleUpdateDurationField('durationDays', e.target.value)}
                                    className="w-full bg-white px-3.5 py-2.5 rounded-xl text-sm font-black border border-[#800020]/25 text-[#800020] text-center focus:outline-none focus:border-[#800020]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#800020] block">الساعات (Hours)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={offerForm.durationHours}
                                    onChange={(e) => handleUpdateDurationField('durationHours', e.target.value)}
                                    className="w-full bg-white px-3.5 py-2.5 rounded-xl text-sm font-black border border-[#800020]/25 text-[#800020] text-center focus:outline-none focus:border-[#800020]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#800020] block">الدقائق (Minutes)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={offerForm.durationMinutes}
                                    onChange={(e) => handleUpdateDurationField('durationMinutes', e.target.value)}
                                    className="w-full bg-white px-3.5 py-2.5 rounded-xl text-sm font-black border border-[#800020]/25 text-[#800020] text-center focus:outline-none focus:border-[#800020]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#800020] block">الثواني (Seconds)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={offerForm.durationSeconds}
                                    onChange={(e) => handleUpdateDurationField('durationSeconds', e.target.value)}
                                    className="w-full bg-white px-3.5 py-2.5 rounded-xl text-sm font-black border border-[#800020]/25 text-[#800020] text-center focus:outline-none focus:border-[#800020]"
                                />
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="space-y-2 pt-2">
                            <span className="text-xs font-bold text-[#800020] block">
                                نماذج سريعة جاهزة (يبدأ العد التنازلي من الآن):
                            </span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleSetDurationPreset(1, 0)}
                                    className="px-4 py-2 rounded-xl bg-white border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold text-[#800020] transition shadow-xs cursor-pointer"
                                >
                                    يوم
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetDurationPreset(2, 0)}
                                    className="px-4 py-2 rounded-xl bg-white border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold text-[#800020] transition shadow-xs cursor-pointer"
                                >
                                    يومين
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetDurationPreset(3, 0)}
                                    className="px-4 py-2 rounded-xl bg-white border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold text-[#800020] transition shadow-xs cursor-pointer"
                                >
                                    ثلاث أيام
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetDurationPreset(4, 0)}
                                    className="px-4 py-2 rounded-xl bg-white border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold text-[#800020] transition shadow-xs cursor-pointer"
                                >
                                    أربع أيام
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetDurationPreset(7, 0)}
                                    className="px-4 py-2 rounded-xl bg-white border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold text-[#800020] transition shadow-xs cursor-pointer"
                                >
                                    أسبوع
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetDurationPreset(14, 0)}
                                    className="px-4 py-2 rounded-xl bg-white border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold text-[#800020] transition shadow-xs cursor-pointer"
                                >
                                    أسبوعين
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetDurationPreset(30, 0)}
                                    className="px-4 py-2 rounded-xl bg-white border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold text-[#800020] transition shadow-xs cursor-pointer"
                                >
                                    شهر
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* 5. Bottom Action Bar (ثابت في نهاية الصفحة وليس متحركاً - تم إنزاله للأسفل) */}
            <div className="mt-20 sm:mt-28 lg:mt-36 bg-[#800020] text-[#F0DFCD] rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#F0DFCD]/20 backdrop-blur-lg">
                <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-[#F0DFCD] text-[#800020] flex items-center justify-center font-black">
                        <Tag className="w-5 h-5" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">العرض المحدد: {offerForm.productName}</span>
                            <span className="text-xs font-bold text-[#F0DFCD]">
                                {offerForm.discount}
                            </span>
                        </div>
                        <span className="text-xs text-[#F0DFCD]/80 inline-flex items-center gap-1 flex-wrap">
                            <span>السعر:</span>
                            <span className="font-bold">{offerForm.salePrice}</span>
                            <RiyalIcon size="0.85em" />
                            {offerForm.originalPrice && (
                                <span className="inline-flex items-center gap-1 opacity-80">
                                    <span>(بدلاً من {offerForm.originalPrice}</span>
                                    <RiyalIcon size="0.85em" />
                                    <span>)</span>
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                        type="button"
                        onClick={handleSaveOffer}
                        disabled={isSaving}
                        className="relative overflow-hidden group px-6 py-2.5 rounded-2xl bg-[#F0DFCD] text-[#800020] text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 border border-[#F0DFCD]/40"
                    >
                        {/* 45-degree angle sliding background */}
                        <span className="absolute -inset-x-24 -inset-y-16 bg-white -translate-x-[160%] skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0 pointer-events-none z-0" />

                        {/* Base Layer text that slides up on hover */}
                        <span className="relative z-10 flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] text-[#800020] group-hover:-translate-y-[150%] group-hover:opacity-0">
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ وتطبيق العرض على المتجر'}</span>
                        </span>

                        {/* Hover Roll-in Layer (Burgundy text on White bg) */}
                        <span className="absolute inset-0 z-20 flex items-center justify-center gap-2 p-2.5 w-full h-full pointer-events-none text-[#800020] font-black transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ وتطبيق العرض على المتجر'}</span>
                        </span>
                    </button>
                </div>
            </div>

        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Luxury Store-Themed Arabic Date & Time Calendar Component
// ─────────────────────────────────────────────────────────────────────────────
function LuxuryArabicDatePicker({ endTimestamp, onSelectTimestamp, formatEndDateArabic }) {
    const activeDate = useMemo(() => {
        return endTimestamp ? new Date(Number(endTimestamp)) : new Date(Date.now() + 3 * 86400000);
    }, [endTimestamp]);

    const [viewYear, setViewYear] = useState(() => activeDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(() => activeDate.getMonth()); // 0-11

    // Sync view with activeDate when endTimestamp changes from outside
    useEffect(() => {
        if (endTimestamp) {
            const d = new Date(Number(endTimestamp));
            if (!isNaN(d.getTime())) {
                setViewYear(d.getFullYear());
                setViewMonth(d.getMonth());
            }
        }
    }, [endTimestamp]);

    const ARABIC_MONTHS = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const ARABIC_WEEKDAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Arab Sat-first: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
    const firstDayJs = new Date(viewYear, viewMonth, 1).getDay();
    const firstDayOffset = (firstDayJs + 1) % 7;

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(v => v - 1);
        } else {
            setViewMonth(v => v - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(v => v + 1);
        } else {
            setViewMonth(v => v + 1);
        }
    };

    const handleSelectDay = (day) => {
        const currentHours = activeDate.getHours();
        const currentMins = activeDate.getMinutes();
        const newD = new Date(viewYear, viewMonth, day, currentHours, currentMins, 0);
        onSelectTimestamp(newD.getTime());
    };

    const handleTimeChange = (hour12, minute, period) => {
        let h24 = Number(hour12) % 12;
        if (period === 'PM') h24 += 12;
        const newD = new Date(activeDate);
        newD.setHours(h24, Number(minute), 0, 0);
        onSelectTimestamp(newD.getTime());
    };

    const currentHour12 = activeDate.getHours() % 12 || 12;
    const currentPeriod = activeDate.getHours() >= 12 ? 'PM' : 'AM';
    const currentMinutes = activeDate.getMinutes();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
    const todayDate = today.getDate();

    return (
        <div className="bg-white/95 rounded-3xl p-4 sm:p-6 border border-[#800020]/15 shadow-sm space-y-4 max-w-xl">
            {/* Header: Month & Year + Navigation */}
            <div className="flex items-center justify-between border-b border-[#800020]/15 pb-3">
                <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center font-bold shadow-xs">
                        <Calendar className="w-4 h-4" />
                    </span>
                    <div>
                        <h4 className="font-black text-sm sm:text-base text-[#800020]">
                            {ARABIC_MONTHS[viewMonth]} {viewYear}
                        </h4>
                        <span className="text-[10px] text-[#800020]/60 block font-bold">
                            جدول تقويم المتجر لاختيار موعد العرض
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5" dir="ltr">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="w-8 h-8 rounded-xl border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-[#800020] flex items-center justify-center transition cursor-pointer"
                        title="الشهر السابق"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="w-8 h-8 rounded-xl border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-[#800020] flex items-center justify-center transition cursor-pointer"
                        title="الشهر القادم"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {ARABIC_WEEKDAYS.map((dayName, idx) => (
                    <span
                        key={idx}
                        className={`text-[11px] font-black py-1 ${
                            dayName === 'الجمعة' ? 'text-[#800020]' : 'text-[#800020]/70'
                        }`}
                    >
                        {dayName}
                    </span>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
                {/* Empty leading cells */}
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-9 sm:h-10" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isSelected =
                        activeDate.getFullYear() === viewYear &&
                        activeDate.getMonth() === viewMonth &&
                        activeDate.getDate() === day;
                    const isToday = isCurrentMonth && todayDate === day;

                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => handleSelectDay(day)}
                            className={`h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center relative cursor-pointer ${
                                isSelected
                                    ? 'bg-[#800020] text-[#F0DFCD] font-black shadow-md scale-105 z-10'
                                    : isToday
                                    ? 'border-2 border-[#800020] text-[#800020] hover:bg-[#800020]/10 font-black'
                                    : 'text-[#800020] hover:bg-[#800020]/10'
                            }`}
                        >
                            <span>{day}</span>
                            {isToday && !isSelected && (
                                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#800020]" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Time Picker Bar */}
            <div className="p-3.5 rounded-2xl bg-[#F0DFCD]/40 border border-[#800020]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#800020]" />
                    <span className="font-bold text-[#800020]">وقت الانتهاء بالساعة والدقيقة:</span>
                </div>

                <div className="flex items-center gap-2" dir="ltr">
                    {/* Hours */}
                    <select
                        value={currentHour12}
                        onChange={(e) => handleTimeChange(e.target.value, currentMinutes, currentPeriod)}
                        className="bg-white px-2.5 py-1.5 rounded-xl border border-[#800020]/25 font-bold text-xs text-[#800020] cursor-pointer focus:outline-none focus:border-[#800020]"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                            <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                        ))}
                    </select>

                    <span className="font-black text-[#800020]">:</span>

                    {/* Minutes */}
                    <select
                        value={Math.floor(currentMinutes / 5) * 5}
                        onChange={(e) => handleTimeChange(currentHour12, e.target.value, currentPeriod)}
                        className="bg-white px-2.5 py-1.5 rounded-xl border border-[#800020]/25 font-bold text-xs text-[#800020] cursor-pointer focus:outline-none focus:border-[#800020]"
                    >
                        {Array.from({ length: 12 }, (_, i) => i * 5).map(m => (
                            <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                        ))}
                    </select>

                    {/* Period: AM / PM */}
                    <div className="flex rounded-xl border border-[#800020]/25 overflow-hidden bg-white">
                        <button
                            type="button"
                            onClick={() => handleTimeChange(currentHour12, currentMinutes, 'AM')}
                            className={`px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                                currentPeriod === 'AM'
                                    ? 'bg-[#800020] text-[#F0DFCD]'
                                    : 'text-[#800020] hover:bg-[#800020]/10'
                            }`}
                        >
                            ص
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTimeChange(currentHour12, currentMinutes, 'PM')}
                            className={`px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                                currentPeriod === 'PM'
                                    ? 'bg-[#800020] text-[#F0DFCD]'
                                    : 'text-[#800020] hover:bg-[#800020]/10'
                            }`}
                        >
                            م
                        </button>
                    </div>
                </div>
            </div>

            {/* Currently Selected Summary */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#800020]/10">
                <span className="text-[#800020]/70 font-semibold">الموعد المحدد في العداد حالياً:</span>
                <span className="font-black text-sm text-[#800020]">
                    {formatEndDateArabic ? formatEndDateArabic(endTimestamp) : new Date(Number(endTimestamp)).toLocaleString('ar-SA')}
                </span>
            </div>
        </div>
    );
}
