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
            offerForm.isActive !== homeOffer.isActive ||
            offerForm.badgeText !== homeOffer.badgeText ||
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

    // Handler: reset countdown timer to X days from now
    const handleSetDurationPreset = (days, hours = 0) => {
        const newEndTime = Date.now() + (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000);
        setOfferForm(prev => ({
            ...prev,
            durationDays: days,
            durationHours: hours,
            durationMinutes: 0,
            durationSeconds: 0,
            endTimestamp: newEndTime
        }));
        if (showToast) {
            showToast(`تم ضبط العداد التنازلي لمدة ${days} أيام من الآن`, 'info');
        }
    };

    // Handler: Save changes
    const handleSaveOffer = () => {
        setIsSaving(true);
        try {
            updateHomeOffer(offerForm);
            if (showToast) {
                showToast('تم حفظ وتطبيق التعديلات على عرض الصفحة الرئيسية بنجاح!', 'sparkle');
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

            {/* 1. Header Banner & Status Bar */}
            <div className="bg-white/60 border border-[#800020]/15 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-md">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                            <span className="w-10 h-10 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center shadow-md">
                                <Tag className="w-5 h-5" />
                            </span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl sm:text-3xl font-black text-[#800020]">
                                        إدارة عرض الصفحة الرئيسية (Offer Section)
                                    </h2>
                                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                        offerForm.isActive
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                            : 'bg-rose-100 text-rose-800 border-rose-300'
                                    }`}>
                                        {offerForm.isActive ? 'مفعل على المتجر' : 'معطل'}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-[#800020]/70 mt-1">
                                    تغيير المنتج المعروض في البانر الترويجي الكبير على الصفحة الرئيسية، مع التحكم بنسب الخصم والأسعار والعداد التنازلي.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Toggle Active status */}
                        <button
                            type="button"
                            onClick={() => {
                                const nextState = !offerForm.isActive;
                                setOfferForm(prev => ({ ...prev, isActive: nextState }));
                                if (showToast) showToast(nextState ? 'تم تفعيل العرض' : 'تم تعطيل العرض', 'info');
                            }}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
                                offerForm.isActive
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${offerForm.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            <span>{offerForm.isActive ? 'العرض مفعل' : 'العرض متوقف'}</span>
                        </button>

                        {/* Reset to default */}
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2.5 rounded-2xl border border-[#800020]/20 text-[#800020] hover:bg-[#800020]/10 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>استعادة الافتراضي</span>
                        </button>

                        {/* View in Store */}
                        <Link
                            to="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-2xl border border-[#800020]/20 text-[#800020] hover:bg-[#800020]/10 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>معاينة في المتجر</span>
                        </Link>

                        {/* Save Button */}
                        <button
                            type="button"
                            onClick={handleSaveOffer}
                            disabled={isSaving}
                            className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95 ${
                                hasUnsavedChanges
                                    ? 'bg-[#800020] text-[#F0DFCD] hover:bg-[#600018] ring-2 ring-[#800020]/30 animate-pulse'
                                    : 'bg-[#800020] text-[#F0DFCD] hover:bg-[#600018]'
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'جاري الحفظ...' : hasUnsavedChanges ? 'حفظ التعديلات الآن *' : 'حفظ التعديلات'}</span>
                        </button>
                    </div>
                </div>
            </div>

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
                <div className="w-full bg-[#800020] text-white rounded-3xl overflow-hidden relative shadow-2xl flex items-stretch border-2 border-[#800020]">
                    <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between relative w-full py-8 md:py-0">

                        {/* Right: Timer blocks */}
                        <div className="flex gap-4 text-center items-center py-6 md:py-9" dir="ltr">
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-[44px] h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-xl lg:text-2xl font-bold rounded shadow-inner">
                                    {previewTimer.days}
                                </div>
                                <span className="text-[10px] lg:text-xs font-bold opacity-90">أيام</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-[44px] h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-xl lg:text-2xl font-bold rounded shadow-inner">
                                    {previewTimer.hours}
                                </div>
                                <span className="text-[10px] lg:text-xs font-bold opacity-90">ساعات</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-[44px] h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-xl lg:text-2xl font-bold rounded shadow-inner">
                                    {previewTimer.minutes}
                                </div>
                                <span className="text-[10px] lg:text-xs font-bold opacity-90">دقائق</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-[44px] h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-xl lg:text-2xl font-bold rounded shadow-inner">
                                    {previewTimer.seconds}
                                </div>
                                <span className="text-[10px] lg:text-xs font-bold opacity-90">ثواني</span>
                            </div>
                        </div>

                        {/* Center: Text & Pricing */}
                        <div className="flex-1 flex justify-center items-center my-4 md:my-0 md:translate-x-12">
                            <div className="flex items-center gap-8 text-[#E2D3C0]">
                                <div className="text-center">
                                    <span className="text-2xl lg:text-3xl font-black block">{offerForm.badgeText || 'خصم'}</span>
                                    <span className="text-3xl lg:text-4xl font-black block text-amber-300">{offerForm.discount || '70%'}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center border-r-2 border-[#E2D3C0]/30 pr-8">
                                    {offerForm.originalPrice && (
                                        <span className="line-through opacity-70 text-lg block mb-1">
                                            {offerForm.originalPrice} <RiyalIcon />
                                        </span>
                                    )}
                                    <span className="font-bold text-2xl lg:text-3xl block text-[#E2D3C0]">
                                        {offerForm.salePrice} <RiyalIcon />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Left: Product Card Block with image */}
                        <div className="w-[280px] sm:w-[310px] min-h-[240px] sm:min-h-[280px] shrink-0 bg-[#f0dfcd] text-[#800020] flex flex-row items-stretch rounded-2xl md:rounded-none relative z-10 md:-ml-20 md:mr-20 shadow-lg md:shadow-none overflow-visible">
                            <div className="flex-1 relative z-20 flex items-center justify-center p-2 group hover:scale-105 transition-transform duration-500">
                                <img
                                    src={offerForm.imageUrl || '/new_offer_shoes_transparent.png'}
                                    alt={offerForm.productName}
                                    className="w-[360px] sm:w-[415px] max-w-none h-auto object-contain origin-center absolute translate-x-8 sm:translate-x-12 transition-transform duration-500 drop-shadow-2xl"
                                    style={{ transform: `scale(${offerForm.imageScale || 1.1}) translateX(2.5rem)` }}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 3. Section Navigation Tabs (اختيار المنتج، الأسعار، الصور، العداد) */}
            <div className="flex items-center gap-2 border-b border-[#800020]/15 pb-2 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveSection('picker')}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeSection === 'picker'
                            ? 'bg-[#800020] text-[#F0DFCD] shadow-sm'
                            : 'bg-white/50 text-[#800020] hover:bg-white/80'
                    }`}
                >
                    <ShoppingBag className="w-4 h-4" />
                    <span>1. اختيار المنتج من المتجر</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection('details')}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeSection === 'details'
                            ? 'bg-[#800020] text-[#F0DFCD] shadow-sm'
                            : 'bg-white/50 text-[#800020] hover:bg-white/80'
                    }`}
                >
                    <Percent className="w-4 h-4" />
                    <span>2. الأسعار ونسبة الخصم والشارة</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection('images')}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeSection === 'images'
                            ? 'bg-[#800020] text-[#F0DFCD] shadow-sm'
                            : 'bg-white/50 text-[#800020] hover:bg-white/80'
                    }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    <span>3. صورة العرض ومكتبة الصور</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection('timer')}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeSection === 'timer'
                            ? 'bg-[#800020] text-[#F0DFCD] shadow-sm'
                            : 'bg-white/50 text-[#800020] hover:bg-white/80'
                    }`}
                >
                    <Clock className="w-4 h-4" />
                    <span>4. العداد التنازلي وتاريخ الانتهاء</span>
                </button>
            </div>

            {/* ================================================================= */}
            {/* SUBSECTION 1: PRODUCT PICKER & QUICK PRESETS                      */}
            {/* ================================================================= */}
            {activeSection === 'picker' && (
                <div className="space-y-6">

                    {/* Quick deal presets */}
                    <div className="bg-white/60 border border-[#800020]/15 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <h3 className="text-base font-black text-[#800020]">
                                نماذج عروض سريعة جاهزة (تطبيق بنقرة واحدة)
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {QUICK_OFFER_PRESETS.map((preset, idx) => {
                                const isCurrent = offerForm.productId === preset.productId && offerForm.salePrice === preset.salePrice;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleApplyPreset(preset)}
                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative ${
                                            isCurrent
                                                ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-md'
                                                : 'bg-white/80 border-[#800020]/15 hover:border-[#800020] hover:shadow-md text-[#800020]'
                                        }`}
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-[#f0dfcd] flex items-center justify-center p-1 overflow-hidden shrink-0">
                                            <img src={preset.imageUrl} alt={preset.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                                    isCurrent ? 'bg-amber-400 text-amber-950' : 'bg-[#800020]/10 text-[#800020]'
                                                }`}>
                                                    {preset.discount}
                                                </span>
                                                <span className="text-[11px] font-bold opacity-70 truncate">{preset.category}</span>
                                            </div>
                                            <h4 className="text-xs font-black truncate mt-0.5">{preset.productName}</h4>
                                            <div className="flex items-center gap-2 mt-1 text-xs">
                                                <span className="font-bold">{preset.salePrice} <RiyalIcon /></span>
                                                <span className="line-through opacity-60 text-[11px]">{preset.originalPrice} <RiyalIcon /></span>
                                            </div>
                                        </div>
                                        {isCurrent && (
                                            <span className="w-6 h-6 rounded-full bg-emerald-400 text-[#800020] flex items-center justify-center shrink-0 shadow-xs">
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

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

                        {/* Category filter pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                            {categoriesList.map((cat, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                                        selectedCategory === cat
                                            ? 'bg-[#800020] text-[#F0DFCD]'
                                            : 'bg-white/70 text-[#800020] hover:bg-white border border-[#800020]/10'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-1">
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
                            <label className="text-xs font-bold text-[#800020] block">
                                السعر الأصلي قبل الخصم (ر.س)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={offerForm.originalPrice}
                                    onChange={(e) => setOfferForm(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
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
                            <label className="text-xs font-bold text-[#800020] block">
                                سعر العرض المخفض (ر.س)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={offerForm.salePrice}
                                    onChange={(e) => setOfferForm(prev => ({ ...prev, salePrice: Number(e.target.value) }))}
                                    placeholder="150"
                                    className="w-full bg-white pr-4 pl-12 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-[#800020]/20 focus:outline-none focus:border-[#800020] text-[#800020]"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#800020]/60 flex items-center gap-1">
                                    <RiyalIcon />
                                </span>
                            </div>
                        </div>

                        {/* Discount Percentage */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#800020] flex items-center justify-between">
                                <span>نسبة الخصم المعروضة</span>
                                <button
                                    type="button"
                                    onClick={handleAutoComputeDiscount}
                                    className="text-[10px] text-[#800020] underline hover:opacity-80 cursor-pointer"
                                >
                                    حساب تلقائي
                                </button>
                            </label>
                            <input
                                type="text"
                                value={offerForm.discount}
                                onChange={(e) => setOfferForm(prev => ({ ...prev, discount: e.target.value }))}
                                placeholder="مثال: 70%"
                                className="w-full bg-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-[#800020]/20 focus:outline-none focus:border-[#800020] text-[#800020]"
                            />
                        </div>

                        {/* Target URL */}
                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-xs font-bold text-[#800020] block">
                                رابط التوجيه عند النقر على البانر
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <LinkIcon className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#800020]/50" />
                                    <input
                                        type="text"
                                        value={offerForm.targetUrl}
                                        onChange={(e) => setOfferForm(prev => ({ ...prev, targetUrl: e.target.value }))}
                                        placeholder="/product/1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7"
                                        className="w-full bg-white pr-10 pl-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-[#800020]/20 focus:outline-none focus:border-[#800020] text-[#800020]"
                                    />
                                </div>
                                {offerForm.targetUrl && (
                                    <Link
                                        to={offerForm.targetUrl}
                                        target="_blank"
                                        className="px-4 py-2.5 rounded-2xl bg-white border border-[#800020]/20 text-[#800020] hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>اختبار الرابط</span>
                                    </Link>
                                )}
                            </div>
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

                    {/* Custom Image URL input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#800020] block">
                            أو أدخل رابط صورة مباشر (PNG شفاف موصى به)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customImageUrl}
                                onChange={(e) => setCustomImageUrl(e.target.value)}
                                placeholder="مثال: /images/coat_transparent.png أو رابط ويب خارجي https://..."
                                className="w-full bg-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-[#800020]/20 focus:outline-none focus:border-[#800020] text-[#800020]"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (customImageUrl.trim()) {
                                        setOfferForm(prev => ({ ...prev, imageUrl: customImageUrl.trim() }));
                                        if (showToast) showToast('تم تحديث مسار صورة العرض', 'success');
                                    }
                                }}
                                className="px-5 py-2.5 rounded-2xl bg-[#800020] text-[#F0DFCD] hover:bg-[#600018] text-xs font-bold transition shrink-0 cursor-pointer"
                            >
                                تطبيق الرابط
                            </button>
                        </div>
                    </div>

                    {/* Transparent images gallery */}
                    <div className="space-y-3">
                        <span className="text-xs font-black text-[#800020] block">
                            مكتبة صور المتجر الشفافة المتاحة:
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {OFFER_IMAGES_GALLERY.map((imgItem, idx) => {
                                const isCurrentImg = offerForm.imageUrl === imgItem.url;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setOfferForm(prev => ({ ...prev, imageUrl: imgItem.url }));
                                            if (showToast) showToast(`تم اختيار صورة: ${imgItem.label}`, 'info');
                                        }}
                                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center relative group ${
                                            isCurrentImg
                                                ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-md ring-2 ring-[#800020]/30'
                                                : 'bg-white border-[#800020]/15 hover:border-[#800020] hover:shadow-sm text-[#800020]'
                                        }`}
                                    >
                                        <div className="w-full h-24 rounded-xl bg-[#f0dfcd] flex items-center justify-center p-2 mb-2 overflow-hidden group-hover:scale-105 transition-transform">
                                            <img src={imgItem.url} alt={imgItem.label} className="w-full h-full object-contain" />
                                        </div>
                                        <span className="text-[11px] font-bold line-clamp-1">{imgItem.label}</span>
                                        {isCurrentImg && (
                                            <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center shadow-xs">
                                                <Check className="w-3 h-3 stroke-[3]" />
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            )}

            {/* ================================================================= */}
            {/* SUBSECTION 4: COUNTDOWN TIMER & SCHEDULING                        */}
            {/* ================================================================= */}
            {activeSection === 'timer' && (
                <div className="bg-white/60 border border-[#800020]/15 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="border-b border-[#800020]/15 pb-4">
                        <h3 className="text-lg font-black text-[#800020]">
                            إعدادات العداد التنازلي وتاريخ الانتهاء
                        </h3>
                        <p className="text-xs font-semibold text-[#800020]/70">
                            تحكم بمدة العرض التنازلي المباشر، أو أعد ضبط العداد لمدة محددة
                        </p>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="space-y-3">
                        <span className="text-xs font-bold text-[#800020] block">
                            إعادة تعيين سريعة للعداد التنازلي (يبدأ من الآن):
                        </span>

                        <div className="flex flex-wrap gap-2.5">
                            <button
                                type="button"
                                onClick={() => handleSetDurationPreset(1, 0)}
                                className="px-4 py-2.5 rounded-2xl bg-white border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold text-[#800020] transition shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                <span>24 ساعة (يوم واحد)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSetDurationPreset(2, 0)}
                                className="px-4 py-2.5 rounded-2xl bg-white border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold text-[#800020] transition shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                <span>48 ساعة (يومان)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSetDurationPreset(3, 23)}
                                className="px-4 py-2.5 rounded-2xl bg-white border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold text-[#800020] transition shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                <span>4 أيام (العرض القياسي)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSetDurationPreset(7, 0)}
                                className="px-4 py-2.5 rounded-2xl bg-white border border-[#800020]/20 hover:bg-[#800020] hover:text-[#F0DFCD] text-xs font-bold text-[#800020] transition shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                <span>أسبوع كامل (7 أيام)</span>
                            </button>
                        </div>
                    </div>

                    {/* Manual duration inputs */}
                    <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-[#800020] block">
                            تحديد المدة يدوياً:
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-[#800020]/70">الأيام</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="365"
                                    value={offerForm.durationDays}
                                    onChange={(e) => {
                                        const d = parseInt(e.target.value) || 0;
                                        setOfferForm(prev => ({
                                            ...prev,
                                            durationDays: d,
                                            endTimestamp: Date.now() + (d * 86400000) + (prev.durationHours * 3600000)
                                        }));
                                    }}
                                    className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold border border-[#800020]/20 text-[#800020]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-[#800020]/70">الساعات</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={offerForm.durationHours}
                                    onChange={(e) => {
                                        const h = parseInt(e.target.value) || 0;
                                        setOfferForm(prev => ({
                                            ...prev,
                                            durationHours: h,
                                            endTimestamp: Date.now() + (prev.durationDays * 86400000) + (h * 3600000)
                                        }));
                                    }}
                                    className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold border border-[#800020]/20 text-[#800020]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-[#800020]/70">الدقائق</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={offerForm.durationMinutes}
                                    onChange={(e) => {
                                        const m = parseInt(e.target.value) || 0;
                                        setOfferForm(prev => ({ ...prev, durationMinutes: m }));
                                    }}
                                    className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold border border-[#800020]/20 text-[#800020]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-[#800020]/70">الثواني</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={offerForm.durationSeconds}
                                    onChange={(e) => {
                                        const s = parseInt(e.target.value) || 0;
                                        setOfferForm(prev => ({ ...prev, durationSeconds: s }));
                                    }}
                                    className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold border border-[#800020]/20 text-[#800020]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Alert */}
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-700 shrink-0" />
                        <div>
                            <span className="font-black block">الوقت المتبقي حالياً:</span>
                            <span>{previewTimer.days} يوم و {previewTimer.hours} ساعة و {previewTimer.minutes} دقيقة و {previewTimer.seconds} ثانية.</span>
                        </div>
                    </div>

                </div>
            )}

            {/* 5. Sticky Bottom Action Bar */}
            <div className="sticky bottom-4 z-30 bg-[#800020] text-[#F0DFCD] rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#F0DFCD]/20 backdrop-blur-lg">
                <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-[#F0DFCD] text-[#800020] flex items-center justify-center font-black">
                        <Tag className="w-5 h-5" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">العرض المحدد: {offerForm.productName}</span>
                            <span className="text-xs font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                                {offerForm.discount}
                            </span>
                        </div>
                        <span className="text-xs text-[#F0DFCD]/80">
                            السعر: {offerForm.salePrice} ر.س {offerForm.originalPrice && `(بدلاً من ${offerForm.originalPrice} ر.س)`}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2.5 rounded-2xl border border-[#F0DFCD]/30 text-[#F0DFCD] hover:bg-white/10 text-xs font-bold transition cursor-pointer"
                    >
                        استعادة الافتراضي
                    </button>

                    <button
                        type="button"
                        onClick={handleSaveOffer}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-2xl bg-[#F0DFCD] text-[#800020] hover:bg-white text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'جاري الحفظ...' : 'حفظ وتطبيق العرض على المتجر'}</span>
                    </button>
                </div>
            </div>

        </div>
    );
}
