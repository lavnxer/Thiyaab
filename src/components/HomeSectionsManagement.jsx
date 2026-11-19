import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layers,
    Sparkles,
    TrendingUp,
    Tag,
    Eye,
    Check,
    RotateCcw,
    Plus,
    Trash2,
    ExternalLink,
    ShoppingBag,
    Boxes,
    Search,
    ChevronDown,
    ArrowUpRight,
    SlidersHorizontal,
    CheckCircle2,
    AlertCircle,
    Info,
    Flame
} from 'lucide-react';
import RiyalIcon from './RiyalIcon';
import OfferManagementSection from './OfferManagementSection';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { storeQuickImages } from '../data/mockAdminData';

export default function HomeSectionsManagement({ productsList = [], initialSectionTab }) {
    const {
        homeSections,
        updateHomeSection,
        resetHomeSection,
        resetAllHomeSections,
        autoBestSellers,
        homeOffer,
        updateHomeOffer,
        resetHomeOffer
    } = useShop();

    const { showToast } = useToast();

    // Active sub-tab: 'menOutfit' | 'bestSellers' | 'womenOutfit' | 'offer'
    const [activeSectionTab, setActiveSectionTab] = useState(initialSectionTab || 'menOutfit');

    useEffect(() => {
        if (initialSectionTab) {
            setActiveSectionTab(initialSectionTab);
        }
    }, [initialSectionTab]);

    // Men outfit selected index
    const [selectedMenOutfitIdx, setSelectedMenOutfitIdx] = useState(0);

    // Women outfit selected index
    const [selectedWomenOutfitIdx, setSelectedWomenOutfitIdx] = useState(0);

    // Best sellers custom search
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [showMenMainQuickImgs, setShowMenMainQuickImgs] = useState(false);
    const [showWomenMainQuickImgs, setShowWomenMainQuickImgs] = useState(false);
    const [isChoosingMenMainProduct, setIsChoosingMenMainProduct] = useState(false);
    const [isChoosingWomenMainProduct, setIsChoosingWomenMainProduct] = useState(false);

    // Safe getters
    const menOutfitSection = homeSections?.menOutfit || {};
    const womenOutfitSection = homeSections?.womenOutfit || {};
    const bestSellersSection = homeSections?.bestSellers || {};

    const menOutfits = menOutfitSection.outfits || [];
    const womenOutfits = womenOutfitSection.outfits || [];

    const currentMenOutfit = menOutfits[selectedMenOutfitIdx] || menOutfits[0] || {};
    const currentWomenOutfit = womenOutfits[selectedWomenOutfitIdx] || womenOutfits[0] || {};

    const linkedMenMainProduct = useMemo(() => {
        if (!currentMenOutfit?.mainProductId && !currentMenOutfit?.title) return null;
        return (productsList || []).find(p => p.id === currentMenOutfit.mainProductId) ||
               (productsList || []).find(p => p.name === currentMenOutfit.title) || null;
    }, [productsList, currentMenOutfit?.mainProductId, currentMenOutfit?.title]);

    const linkedWomenMainProduct = useMemo(() => {
        if (!currentWomenOutfit?.mainProductId && !currentWomenOutfit?.title) return null;
        return (productsList || []).find(p => p.id === currentWomenOutfit.mainProductId) ||
               (productsList || []).find(p => p.name === currentWomenOutfit.title) || null;
    }, [productsList, currentWomenOutfit?.mainProductId, currentWomenOutfit?.title]);

    // ─────────────────────────────────────────────────────────────────────────
    // Handlers for Men & Women Outfits
    // ─────────────────────────────────────────────────────────────────────────

    const handleUpdateOutfitField = (sectionKey, outfitIndex, field, value) => {
        updateHomeSection(sectionKey, prev => {
            const currentOutfits = [...(prev.outfits || [])];
            if (!currentOutfits[outfitIndex]) return prev;
            currentOutfits[outfitIndex] = {
                ...currentOutfits[outfitIndex],
                [field]: value
            };
            return {
                ...prev,
                outfits: currentOutfits
            };
        });
        showToast('تم تحديث بيانات الطقم بنجاح', 'sparkle');
    };

    const handleUpdateCornerItem = (sectionKey, outfitIndex, cornerKey, itemData) => {
        updateHomeSection(sectionKey, prev => {
            const currentOutfits = [...(prev.outfits || [])];
            if (!currentOutfits[outfitIndex]) return prev;
            currentOutfits[outfitIndex] = {
                ...currentOutfits[outfitIndex],
                [cornerKey]: {
                    ...(currentOutfits[outfitIndex][cornerKey] || {}),
                    ...itemData
                }
            };
            return {
                ...prev,
                outfits: currentOutfits
            };
        });
        showToast('تم تحديث عنصر الطقم بنجاح');
    };

    const handleSelectProductForCorner = (sectionKey, outfitIndex, cornerKey, product) => {
        handleUpdateCornerItem(sectionKey, outfitIndex, cornerKey, {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image_url || product.image || '/images/coat_transparent.png'
        });
    };

    const handleSelectProductForMainModel = (sectionKey, outfitIndex, product) => {
        updateHomeSection(sectionKey, prev => {
            const currentOutfits = [...(prev.outfits || [])];
            if (!currentOutfits[outfitIndex]) return prev;
            currentOutfits[outfitIndex] = {
                ...currentOutfits[outfitIndex],
                title: product.name,
                price: Number(product.price),
                mainImage: product.image_url || product.image || currentOutfits[outfitIndex].mainImage,
                mainProductId: product.id
            };
            return {
                ...prev,
                outfits: currentOutfits
            };
        });
        showToast(`تم ربط المودل بمنتج "${product.name}" بنجاح`, 'sparkle');
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Handlers for Best Sellers
    // ─────────────────────────────────────────────────────────────────────────

    const handleToggleBestSellersMode = (isAuto) => {
        updateHomeSection('bestSellers', prev => ({
            ...prev,
            autoMode: isAuto
        }));
        showToast(isAuto ? 'تم تفعيل الربط التلقائي بالأعلى مبيعاً' : 'تم تحويل القسم للاختيار اليدوي المخصص');
    };

    const handleToggleCustomProduct = (productId) => {
        updateHomeSection('bestSellers', prev => {
            const currentIds = prev.customProductIds || [];
            const exists = currentIds.includes(productId);
            const nextIds = exists
                ? currentIds.filter(id => id !== productId)
                : [...currentIds, productId];
            return {
                ...prev,
                customProductIds: nextIds
            };
        });
    };

    // Filter products for search
    const filteredProductsForSelect = useMemo(() => {
        if (!productSearchQuery.trim()) return productsList.slice(0, 12);
        const q = productSearchQuery.toLowerCase();
        return productsList.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.category && (typeof p.category === 'string' ? p.category : p.category.name)?.toLowerCase().includes(q))
        );
    }, [productsList, productSearchQuery]);

    return (
        <div className="space-y-8 select-none" dir="rtl">

            {/* Header Hero Banner */}
            <div className="bg-[#800020] text-[#F0DFCD] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-[#F0DFCD]/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0DFCD]/15 border border-[#F0DFCD]/25 text-xs font-bold text-[#F0DFCD] mb-3 backdrop-blur-xs">
                            <Layers className="w-3.5 h-3.5 text-amber-300" />
                            <span>التحكم الموحد بأقسام المتجر</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F0DFCD]">
                            إدارة أقسام الصفحة الرئيسية
                        </h2>
                        <p className="text-xs sm:text-sm text-[#F0DFCD]/80 mt-1 max-w-2xl leading-relaxed">
                            تخصيص كامل للأقسام الرئيسية: طقم رجالي متكامل، الأكثر مبيعاً (بربط تلقائي ذكي بالمبيعات)، طقم نسائي متكامل، وبانر العرض الترويجي.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => {
                                if (window.confirm('هل أنت متأكد من استعادة كافة الأقسام للإعدادات الافتراضية؟')) {
                                    resetAllHomeSections();
                                    showToast('تمت استعادة كافة أقسام الصفحة الرئيسية للافتراضي', 'sparkle');
                                }
                            }}
                            className="bg-[#F0DFCD]/10 hover:bg-[#F0DFCD]/20 text-[#F0DFCD] px-4 py-2.5 rounded-2xl font-bold text-xs transition border border-[#F0DFCD]/20 flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>استعادة الافتراضي</span>
                        </button>

                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#F0DFCD] text-[#800020] hover:bg-[#F0DFCD]/90 px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 shadow-lg cursor-pointer"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>معاينة المتجر المباشر</span>
                        </a>
                    </div>
                </div>

                {/* Sub-tabs Navigation */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-8 pt-6 border-t border-[#F0DFCD]/20">
                    <button
                        onClick={() => setActiveSectionTab('menOutfit')}
                        className={`p-3.5 rounded-2xl text-right transition-all flex flex-col gap-1 border cursor-pointer ${
                            activeSectionTab === 'menOutfit'
                                ? 'bg-[#F0DFCD] text-[#800020] shadow-lg border-transparent scale-[1.02]'
                                : 'bg-white/5 hover:bg-white/10 text-[#F0DFCD] border-[#F0DFCD]/15'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-black text-xs sm:text-sm">طقم رجالي متكامل</span>
                            <span className={`w-2 h-2 rounded-full ${menOutfitSection.isActive !== false ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                        </div>
                        <span className="text-[11px] opacity-70 truncate">{menOutfitSection.title || 'أطقم رجالية كاملة'}</span>
                    </button>

                    <button
                        onClick={() => setActiveSectionTab('bestSellers')}
                        className={`p-3.5 rounded-2xl text-right transition-all flex flex-col gap-1 border cursor-pointer ${
                            activeSectionTab === 'bestSellers'
                                ? 'bg-[#F0DFCD] text-[#800020] shadow-lg border-transparent scale-[1.02]'
                                : 'bg-white/5 hover:bg-white/10 text-[#F0DFCD] border-[#F0DFCD]/15'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-black text-xs sm:text-sm flex items-center gap-1.5">
                                <span>الأكثر مبيعاً</span>
                                <span className="bg-amber-400/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded font-mono">تلقائي</span>
                            </span>
                            <span className={`w-2 h-2 rounded-full ${bestSellersSection.isActive !== false ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                        </div>
                        <span className="text-[11px] opacity-70 truncate">{bestSellersSection.title || 'الأكثر مبيعاً'}</span>
                    </button>

                    <button
                        onClick={() => setActiveSectionTab('womenOutfit')}
                        className={`p-3.5 rounded-2xl text-right transition-all flex flex-col gap-1 border cursor-pointer ${
                            activeSectionTab === 'womenOutfit'
                                ? 'bg-[#F0DFCD] text-[#800020] shadow-lg border-transparent scale-[1.02]'
                                : 'bg-white/5 hover:bg-white/10 text-[#F0DFCD] border-[#F0DFCD]/15'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-black text-xs sm:text-sm">طقم نسائي متكامل</span>
                            <span className={`w-2 h-2 rounded-full ${womenOutfitSection.isActive !== false ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                        </div>
                        <span className="text-[11px] opacity-70 truncate">{womenOutfitSection.title || 'أطقم نسائية كاملة'}</span>
                    </button>

                    <button
                        onClick={() => setActiveSectionTab('offer')}
                        className={`p-3.5 rounded-2xl text-right transition-all flex flex-col gap-1 border cursor-pointer ${
                            activeSectionTab === 'offer'
                                ? 'bg-[#F0DFCD] text-[#800020] shadow-lg border-transparent scale-[1.02]'
                                : 'bg-white/5 hover:bg-white/10 text-[#F0DFCD] border-[#F0DFCD]/15'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-black text-xs sm:text-sm">عرض وتوقيت الصفحة الرئيسية</span>
                            <span className={`w-2 h-2 rounded-full ${homeOffer?.isActive !== false ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                        </div>
                        <span className="text-[11px] opacity-70 truncate">{homeOffer?.productName || 'حذاء جلدي فاخر'}</span>
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* SUB-TAB 1: MEN OUTFIT SHOWCASE MANAGEMENT */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {activeSectionTab === 'menOutfit' && (
                <div className="space-y-6">
                    {/* Section Visibility & Title Bar */}
                    <div className="bg-white/60 p-5 rounded-3xl border border-[#800020]/15 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={menOutfitSection.isActive !== false}
                                    onChange={(e) => updateHomeSection('menOutfit', { isActive: e.target.checked })}
                                    className="w-5 h-5 rounded-md accent-[#800020] cursor-pointer"
                                />
                                <span className="font-black text-sm text-[#800020]">تفعيل ظهور قسم الأطقم الرجالية</span>
                            </label>

                            <button
                                onClick={() => resetHomeSection('menOutfit')}
                                className="text-xs text-[#800020]/70 hover:text-[#800020] flex items-center gap-1 font-bold underline cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>استعادة الطقم الافتراضي</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-[#800020]">عنوان القسم:</label>
                            <input
                                type="text"
                                value={menOutfitSection.title || ''}
                                onChange={(e) => updateHomeSection('menOutfit', { title: e.target.value })}
                                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#800020]/25 text-xs font-bold text-[#800020] focus:outline-none focus:border-[#800020] w-56"
                                placeholder="مثال: أطقم رجالية كاملة"
                            />
                        </div>
                    </div>

                    {/* Outfit Switcher Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {menOutfits.map((outfit, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setSelectedMenOutfitIdx(idx);
                                    setIsChoosingMenMainProduct(false);
                                }}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                                    selectedMenOutfitIdx === idx
                                        ? 'bg-[#800020] text-[#F0DFCD] shadow-md scale-102'
                                        : 'bg-white/60 text-[#800020] hover:bg-white border border-[#800020]/15'
                                }`}
                            >
                                <span>طقم {idx + 1}: {outfit.title}</span>
                                <span className="text-[10px] opacity-70">({Number(outfit.price).toFixed(0)} ر.س)</span>
                            </button>
                        ))}
                    </div>

                    {/* Grid Layout: Live Interactive Preview + Controls */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Left/Middle: Live Visual Representation (5 Cols) */}
                        <div className="lg:col-span-5 bg-white/70 p-6 rounded-3xl border border-[#800020]/20 shadow-md space-y-4">
                            <div className="flex items-center justify-between border-b border-[#800020]/10 pb-3">
                                <span className="font-black text-sm text-[#800020] flex items-center gap-1.5">
                                    <Eye className="w-4 h-4 text-[#800020]" />
                                    <span>معاينة حية لشكل الطقم</span>
                                </span>
                                <span className="text-xs font-mono font-bold text-[#800020]/70 bg-[#800020]/10 px-2 py-0.5 rounded-md">
                                    {Number(currentMenOutfit.price || 0).toFixed(2)} ر.س
                                </span>
                            </div>

                            {/* Miniature of the outfit grid */}
                            <div className="grid grid-cols-3 gap-2.5 bg-[#f0dfcd]/40 p-4 rounded-2xl border border-[#800020]/15 relative">
                                
                                {/* Right Column (Top & Bottom) */}
                                <div className="flex flex-col gap-2">
                                    <div className="bg-white/80 p-2 rounded-xl text-center border border-[#800020]/10">
                                        <img src={currentMenOutfit.rightTop?.image} alt="" className="w-12 h-12 object-contain mx-auto" />
                                        <span className="text-[10px] font-bold text-[#800020] block truncate mt-1">{currentMenOutfit.rightTop?.name}</span>
                                        <span className="text-[9px] font-mono text-[#800020]/70">{Number(currentMenOutfit.rightTop?.price || 0).toFixed(0)} ر.س</span>
                                    </div>
                                    <div className="bg-white/80 p-2 rounded-xl text-center border border-[#800020]/10">
                                        <img src={currentMenOutfit.rightBottom?.image} alt="" className="w-12 h-12 object-contain mx-auto" />
                                        <span className="text-[10px] font-bold text-[#800020] block truncate mt-1">{currentMenOutfit.rightBottom?.name}</span>
                                        <span className="text-[9px] font-mono text-[#800020]/70">{Number(currentMenOutfit.rightBottom?.price || 0).toFixed(0)} ر.س</span>
                                    </div>
                                </div>

                                {/* Center: Main Outfit Model */}
                                <div className="bg-white/90 p-2 rounded-2xl text-center flex flex-col items-center justify-center border-2 border-[#800020]/30 shadow-sm relative overflow-hidden">
                                    <span className="absolute top-1.5 right-1.5 bg-[#800020] text-[#F0DFCD] text-[8px] font-bold px-1.5 py-0.2 rounded">
                                        شراء الطقم
                                    </span>
                                    <img src={currentMenOutfit.mainImage} alt="" className="w-full h-32 object-contain drop-shadow-md" />
                                    <span className="text-[11px] font-black text-[#800020] block mt-1 truncate">{currentMenOutfit.title}</span>
                                </div>

                                {/* Left Column (Top & Bottom) */}
                                <div className="flex flex-col gap-2">
                                    <div className="bg-white/80 p-2 rounded-xl text-center border border-[#800020]/10">
                                        <img src={currentMenOutfit.leftTop?.image} alt="" className="w-12 h-12 object-contain mx-auto" />
                                        <span className="text-[10px] font-bold text-[#800020] block truncate mt-1">{currentMenOutfit.leftTop?.name}</span>
                                        <span className="text-[9px] font-mono text-[#800020]/70">{Number(currentMenOutfit.leftTop?.price || 0).toFixed(0)} ر.س</span>
                                    </div>
                                    <div className="bg-white/80 p-2 rounded-xl text-center border border-[#800020]/10">
                                        <img src={currentMenOutfit.leftBottom?.image} alt="" className="w-12 h-12 object-contain mx-auto" />
                                        <span className="text-[10px] font-bold text-[#800020] block truncate mt-1">{currentMenOutfit.leftBottom?.name}</span>
                                        <span className="text-[9px] font-mono text-[#800020]/70">{Number(currentMenOutfit.leftBottom?.price || 0).toFixed(0)} ر.س</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[11px] text-[#800020]/70 text-center leading-relaxed">
                                يتم تحديث هذا القسم فورياً في الصفحة الرئيسية للمتجر بمجرد التعديل.
                            </p>
                        </div>

                        {/* Right: Controls & Item Configs (7 Cols) */}
                        <div className="lg:col-span-7 bg-white/60 p-6 rounded-3xl border border-[#800020]/15 shadow-sm space-y-6">
                            
                            {/* Main Outfit Settings */}
                            <div className="p-4 rounded-2xl bg-white border border-[#800020]/15 space-y-4">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <h3 className="text-xs font-black text-[#800020] flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        <span>بيانات المودل الأساسي للطقم (الوسط)</span>
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsChoosingMenMainProduct(!isChoosingMenMainProduct);
                                            if (!isChoosingMenMainProduct) setShowMenMainQuickImgs(false);
                                        }}
                                        className={`text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                                            isChoosingMenMainProduct
                                                ? 'bg-[#800020] text-[#F0DFCD] shadow-xs'
                                                : 'text-[#800020] bg-[#800020]/10 hover:bg-[#800020] hover:text-[#F0DFCD]'
                                        }`}
                                    >
                                        <Search className="w-3.5 h-3.5" />
                                        <span>{isChoosingMenMainProduct ? 'إغلاق القائمة' : 'اختر من المنتجات لتحديث الإطلالة'}</span>
                                    </button>
                                </div>

                                {isChoosingMenMainProduct && (
                                    <ProductChooserPanel
                                        productsList={productsList}
                                        defaultGender="looks"
                                        selectedProductId={currentMenOutfit.mainProductId}
                                        onSelectProduct={(p) => handleSelectProductForMainModel('menOutfit', selectedMenOutfitIdx, p)}
                                        onClose={() => setIsChoosingMenMainProduct(false)}
                                    />
                                )}

                                {currentMenOutfit.mainProductId && (
                                    <div className="text-[10px] text-[#800020]/80 bg-[#800020]/5 px-3 py-1.5 rounded-xl flex items-center justify-between border border-[#800020]/10">
                                        <span className="flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>المنتج المرتبط بالمتجر: <strong className="font-bold text-[#800020]">{currentMenOutfit.title}</strong></span>
                                        </span>
                                        <span className="font-mono text-[9px] opacity-60">ID: {currentMenOutfit.mainProductId.slice(0, 8)}...</span>
                                    </div>
                                )}

                                {linkedMenMainProduct?.colors && linkedMenMainProduct.colors.length > 0 && (
                                    <div className="p-2.5 rounded-xl bg-[#800020]/5 border border-[#800020]/15 space-y-1.5 animate-fadeIn">
                                        <div className="flex items-center justify-between text-xs font-bold text-[#800020]">
                                            <span className="flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                                <span>لون عرض المودل في الطقم (من ألوان المنتج):</span>
                                            </span>
                                            <span className="text-[11px] font-bold text-[#800020]/80 bg-white px-2 py-0.5 rounded-md border border-[#800020]/10">
                                                {currentMenOutfit.selectedColor || linkedMenMainProduct.colors.find(c => c.image === currentMenOutfit.mainImage || c.image_url === currentMenOutfit.mainImage)?.name || linkedMenMainProduct.colors[0]?.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                            {linkedMenMainProduct.colors.map((c, cIdx) => {
                                                const isSelected = (currentMenOutfit.mainImage && (currentMenOutfit.mainImage === c.image || currentMenOutfit.mainImage === c.image_url)) || (currentMenOutfit.selectedColor === c.name);
                                                return (
                                                    <button
                                                        key={cIdx}
                                                        type="button"
                                                        onClick={() => {
                                                            if (c.image || c.image_url) {
                                                                handleUpdateOutfitField('menOutfit', selectedMenOutfitIdx, 'mainImage', c.image || c.image_url);
                                                            }
                                                            handleUpdateOutfitField('menOutfit', selectedMenOutfitIdx, 'selectedColor', c.name);
                                                            showToast(`تم اختيار لون "${c.name}" لعرض المودل في الطقم`, 'sparkle');
                                                        }}
                                                        className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition cursor-pointer border ${
                                                            isSelected
                                                                ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-xs'
                                                                : 'bg-white hover:bg-[#800020]/10 text-[#800020] border-[#800020]/15'
                                                        }`}
                                                        title={`${c.name} ${c.image ? '(يحتوي على صورة مخصصة)' : ''}`}
                                                    >
                                                        <span
                                                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-inner"
                                                            style={{ backgroundColor: c.hex }}
                                                        />
                                                        <span className="text-[11px] font-bold">{c.name}</span>
                                                        {isSelected && <Check className="w-3 h-3 text-[#F0DFCD]" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <label className="block font-bold text-[#800020] mb-1">اسم الطقم:</label>
                                        <input
                                            type="text"
                                            value={currentMenOutfit.title || ''}
                                            onChange={(e) => handleUpdateOutfitField('menOutfit', selectedMenOutfitIdx, 'title', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-[#800020]/20 font-bold text-[#800020]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-[#800020] mb-1">سعر الطقم الكامل (ر.س):</label>
                                        <input
                                            type="number"
                                            value={currentMenOutfit.price || ''}
                                            onChange={(e) => handleUpdateOutfitField('menOutfit', selectedMenOutfitIdx, 'price', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 rounded-xl border border-[#800020]/20 font-bold text-[#800020]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block font-bold text-[#800020] text-xs">رابط صورة المودل الأساسي:</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowMenMainQuickImgs(!showMenMainQuickImgs)}
                                            className="text-[10px] text-[#800020] hover:underline font-bold cursor-pointer"
                                        >
                                            {showMenMainQuickImgs ? 'إغلاق الكتالوج' : 'اختر من صور الكتالوج'}
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={currentMenOutfit.mainImage || ''}
                                        onChange={(e) => handleUpdateOutfitField('menOutfit', selectedMenOutfitIdx, 'mainImage', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#800020]/20 font-mono text-xs text-[#800020]"
                                        placeholder="/images/winter_outfit_transparent.png أو رابط صورة"
                                    />
                                    {showMenMainQuickImgs && (
                                        <div className="mt-2 p-2.5 bg-[#f0dfcd]/30 rounded-xl border border-[#800020]/15 space-y-1.5 animate-fadeIn">
                                            <span className="text-[10px] font-bold text-[#800020]">انقر لاختيار صورة المودل:</span>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 custom-scrollbar">
                                                {storeQuickImages.map((qi, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            handleUpdateOutfitField('menOutfit', selectedMenOutfitIdx, 'mainImage', qi.url);
                                                            setShowMenMainQuickImgs(false);
                                                        }}
                                                        className="p-1.5 rounded-xl bg-white hover:bg-[#800020]/15 border border-[#800020]/10 flex flex-col items-center gap-1 transition cursor-pointer"
                                                    >
                                                        <img src={qi.url} alt="" className="w-9 h-9 object-contain" />
                                                        <span className="text-[9px] text-[#800020] truncate w-full text-center font-bold">{qi.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 4 Corner Items Editor */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-[#800020]">القطع الأربع المحيطة بالمودل</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    
                                    {/* Right Top */}
                                    <CornerItemEditorCard
                                        label="أعلى اليمين"
                                        item={currentMenOutfit.rightTop}
                                        productsList={productsList}
                                        defaultGender="men"
                                        onSelectProduct={(p) => handleSelectProductForCorner('menOutfit', selectedMenOutfitIdx, 'rightTop', p)}
                                        onUpdateField={(f, v) => handleUpdateCornerItem('menOutfit', selectedMenOutfitIdx, 'rightTop', { [f]: v })}
                                    />

                                    {/* Right Bottom */}
                                    <CornerItemEditorCard
                                        label="أسفل اليمين"
                                        item={currentMenOutfit.rightBottom}
                                        productsList={productsList}
                                        defaultGender="men"
                                        onSelectProduct={(p) => handleSelectProductForCorner('menOutfit', selectedMenOutfitIdx, 'rightBottom', p)}
                                        onUpdateField={(f, v) => handleUpdateCornerItem('menOutfit', selectedMenOutfitIdx, 'rightBottom', { [f]: v })}
                                    />

                                    {/* Left Top */}
                                    <CornerItemEditorCard
                                        label="أعلى اليسار"
                                        item={currentMenOutfit.leftTop}
                                        productsList={productsList}
                                        defaultGender="men"
                                        onSelectProduct={(p) => handleSelectProductForCorner('menOutfit', selectedMenOutfitIdx, 'leftTop', p)}
                                        onUpdateField={(f, v) => handleUpdateCornerItem('menOutfit', selectedMenOutfitIdx, 'leftTop', { [f]: v })}
                                    />

                                    {/* Left Bottom */}
                                    <CornerItemEditorCard
                                        label="أسفل اليسار"
                                        item={currentMenOutfit.leftBottom}
                                        productsList={productsList}
                                        defaultGender="men"
                                        onSelectProduct={(p) => handleSelectProductForCorner('menOutfit', selectedMenOutfitIdx, 'leftBottom', p)}
                                        onUpdateField={(f, v) => handleUpdateCornerItem('menOutfit', selectedMenOutfitIdx, 'leftBottom', { [f]: v })}
                                    />

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* SUB-TAB 2: BEST SELLERS AUTO SYNC & MANAGEMENT */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {activeSectionTab === 'bestSellers' && (
                <div className="space-y-6">
                    {/* Settings Header Bar */}
                    <div className="bg-white/60 p-5 rounded-3xl border border-[#800020]/15 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={bestSellersSection.isActive !== false}
                                    onChange={(e) => updateHomeSection('bestSellers', { isActive: e.target.checked })}
                                    className="w-5 h-5 rounded-md accent-[#800020] cursor-pointer"
                                />
                                <span className="font-black text-sm text-[#800020]">تفعيل ظهور قسم الأكثر مبيعاً</span>
                            </label>

                            <button
                                onClick={() => resetHomeSection('bestSellers')}
                                className="text-xs text-[#800020]/70 hover:text-[#800020] flex items-center gap-1 font-bold underline cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>استعادة الافتراضي</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-[#800020]">عدد المنتجات المعروضة:</label>
                            <select
                                value={bestSellersSection.limit || 8}
                                onChange={(e) => updateHomeSection('bestSellers', { limit: Number(e.target.value) })}
                                className="px-3 py-1.5 rounded-xl bg-white border border-[#800020]/25 text-xs font-bold text-[#800020] focus:outline-none"
                            >
                                <option value={4}>4 منتجات</option>
                                <option value={6}>6 منتجات</option>
                                <option value={8}>8 منتجات (موصى به)</option>
                                <option value={12}>12 منتج</option>
                            </select>
                        </div>
                    </div>

                    {/* Auto Mode Switch Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            onClick={() => handleToggleBestSellersMode(true)}
                            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${
                                bestSellersSection.autoMode !== false
                                    ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-xl'
                                    : 'bg-white/60 text-[#800020] border-[#800020]/20 hover:bg-white'
                            }`}
                        >
                            {bestSellersSection.autoMode !== false && (
                                <span className="absolute top-4 left-4 bg-emerald-400 text-emerald-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    مفعل حالياً
                                </span>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-5 h-5 text-amber-400" />
                                <h3 className="font-black text-base">الربط التلقائي بالأعلى مبيعاً (موصى به)</h3>
                            </div>
                            <p className="text-xs leading-relaxed opacity-85">
                                يقوم النظام بحساب وإدراج المنتجات التي حققت أعلى مبيعات وطلبات تلقائياً في واجهة المتجر، وتحديث الترتيب فورياً مع كل طلب شراء جديد.
                            </p>
                        </div>

                        <div
                            onClick={() => handleToggleBestSellersMode(false)}
                            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${
                                bestSellersSection.autoMode === false
                                    ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-xl'
                                    : 'bg-white/60 text-[#800020] border-[#800020]/20 hover:bg-white'
                            }`}
                        >
                            {bestSellersSection.autoMode === false && (
                                <span className="absolute top-4 left-4 bg-emerald-400 text-emerald-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    مفعل حالياً
                                </span>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                                <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
                                <h3 className="font-black text-base">تحديد يدوي مخصص للمنتجات</h3>
                            </div>
                            <p className="text-xs leading-relaxed opacity-85">
                                يمكنك اختيار منتجات معينة بنفسك لعرضها في قسم الأكثر مبيعاً بغض النظر عن بيانات المبيعات الفعلية.
                            </p>
                        </div>
                    </div>

                    {/* Products List Display */}
                    <div className="bg-white/70 p-6 rounded-3xl border border-[#800020]/15 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#800020]/10 pb-3">
                            <div>
                                <h4 className="font-black text-sm text-[#800020]">
                                    {bestSellersSection.autoMode !== false
                                        ? 'قائمة المنتجات الأكثر مبيعاً المحسوبة تلقائياً'
                                        : 'اختر المنتجات المراد تثبيتها في القسم'}
                                </h4>
                                <span className="text-[11px] text-[#800020]/70">
                                    {bestSellersSection.autoMode !== false
                                        ? `يتم عرض أول ${bestSellersSection.limit || 8} منتجات تلقائياً في السلايدر`
                                        : `تم اختيار ${(bestSellersSection.customProductIds || []).length} منتج`}
                                </span>
                            </div>

                            {bestSellersSection.autoMode === false && (
                                <div className="relative w-64">
                                    <Search className="w-4 h-4 text-[#800020]/40 absolute right-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={productSearchQuery}
                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                        placeholder="بحث في المنتجات..."
                                        className="w-full pl-3 pr-9 py-1.5 rounded-xl bg-white border border-[#800020]/20 text-xs text-[#800020] focus:outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Automatic Mode Table */}
                        {bestSellersSection.autoMode !== false ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                {(autoBestSellers.length > 0 ? autoBestSellers : productsList).slice(0, bestSellersSection.limit || 8).map((p, idx) => (
                                    <div
                                        key={p.id}
                                        className="bg-white p-3.5 rounded-2xl border border-[#800020]/15 shadow-xs flex items-center gap-3 relative overflow-hidden"
                                    >
                                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#800020] text-[#F0DFCD] text-xs font-black flex items-center justify-center shadow-sm">
                                            #{idx + 1}
                                        </div>

                                        <div className="w-14 h-14 rounded-xl bg-[#f0dfcd]/40 p-1 shrink-0 flex items-center justify-center">
                                            <img src={p.image || p.image_url || '/images/coat_transparent.png'} alt="" className="w-full h-full object-contain" />
                                        </div>

                                        <div className="min-w-0 flex-1 pl-6">
                                            <span className="font-bold text-xs text-[#800020] block truncate">{p.name}</span>
                                            <span className="text-[11px] font-mono text-[#800020]/70 block mt-0.5">
                                                {Number(p.price).toFixed(2)} ر.س
                                            </span>
                                            <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                                                {p.salesCount ? `${p.salesCount} مبيعة` : 'طلب متكرر'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Manual Selection Grid */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredProductsForSelect.map(p => {
                                    const isSelected = (bestSellersSection.customProductIds || []).includes(p.id);
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => handleToggleCustomProduct(p.id)}
                                            className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                                                isSelected
                                                    ? 'bg-[#800020]/10 border-[#800020] shadow-xs'
                                                    : 'bg-white border-transparent hover:border-[#800020]/30'
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-[#f0dfcd]/40 p-1 shrink-0 flex items-center justify-center">
                                                <img src={p.image_url || p.image || '/images/coat_transparent.png'} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="font-bold text-xs text-[#800020] block truncate">{p.name}</span>
                                                <span className="text-[10px] font-mono text-[#800020]/70">{Number(p.price).toFixed(2)} ر.س</span>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                isSelected ? 'bg-[#800020] text-white border-[#800020]' : 'border-[#800020]/30'
                                            }`}>
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* SUB-TAB 3: WOMEN OUTFIT SHOWCASE MANAGEMENT */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {activeSectionTab === 'womenOutfit' && (
                <div className="space-y-6">
                    {/* Section Visibility & Title Bar */}
                    <div className="bg-white/60 p-5 rounded-3xl border border-[#800020]/15 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={womenOutfitSection.isActive !== false}
                                    onChange={(e) => updateHomeSection('womenOutfit', { isActive: e.target.checked })}
                                    className="w-5 h-5 rounded-md accent-[#800020] cursor-pointer"
                                />
                                <span className="font-black text-sm text-[#800020]">تفعيل ظهور قسم الأطقم النسائية</span>
                            </label>

                            <button
                                onClick={() => resetHomeSection('womenOutfit')}
                                className="text-xs text-[#800020]/70 hover:text-[#800020] flex items-center gap-1 font-bold underline cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>استعادة الطقم الافتراضي</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-[#800020]">عنوان القسم:</label>
                            <input
                                type="text"
                                value={womenOutfitSection.title || ''}
                                onChange={(e) => updateHomeSection('womenOutfit', { title: e.target.value })}
                                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#800020]/25 text-xs font-bold text-[#800020] focus:outline-none focus:border-[#800020] w-56"
                                placeholder="مثال: أطقم نسائية كاملة"
                            />
                        </div>
                    </div>

                    {/* Outfit Switcher Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {womenOutfits.map((outfit, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setSelectedWomenOutfitIdx(idx);
                                    setIsChoosingWomenMainProduct(false);
                                }}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                                    selectedWomenOutfitIdx === idx
                                        ? 'bg-[#800020] text-[#F0DFCD] shadow-md scale-102'
                                        : 'bg-white/60 text-[#800020] hover:bg-white border border-[#800020]/15'
                                }`}
                            >
                                <span>طقم {idx + 1}: {outfit.title}</span>
                                <span className="text-[10px] opacity-70">({Number(outfit.price).toFixed(0)} ر.س)</span>
                            </button>
                        ))}
                    </div>

                    {/* Grid Layout: Live Interactive Preview + Controls */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Left: Live Visual Preview (5 Cols) */}
                        <div className="lg:col-span-5 bg-white/70 p-6 rounded-3xl border border-[#800020]/20 shadow-md space-y-4">
                            <div className="flex items-center justify-between border-b border-[#800020]/10 pb-3">
                                <span className="font-black text-sm text-[#800020] flex items-center gap-1.5">
                                    <Eye className="w-4 h-4 text-[#800020]" />
                                    <span>معاينة حية لشكل الطقم النسائي</span>
                                </span>
                                <span className="text-xs font-mono font-bold text-[#800020]/70 bg-[#800020]/10 px-2 py-0.5 rounded-md">
                                    {Number(currentWomenOutfit.price || 0).toFixed(2)} ر.س
                                </span>
                            </div>

                            {/* Miniature of the outfit grid */}
                            <div className="grid grid-cols-3 gap-2.5 bg-[#f0dfcd]/40 p-4 rounded-2xl border border-[#800020]/15 relative">
                                
                                {/* Right Column */}
                                <div className="flex flex-col gap-2">
                                    <div className="bg-white/80 p-2 rounded-xl text-center border border-[#800020]/10">
                                        <img src={currentWomenOutfit.rightTop?.image} alt="" className="w-12 h-12 object-contain mx-auto" />
                                        <span className="text-[10px] font-bold text-[#800020] block truncate mt-1">{currentWomenOutfit.rightTop?.name}</span>
                                        <span className="text-[9px] font-mono text-[#800020]/70">{Number(currentWomenOutfit.rightTop?.price || 0).toFixed(0)} ر.س</span>
                                    </div>
                                    <div className="bg-white/80 p-2 rounded-xl text-center border border-[#800020]/10">
                                        <img src={currentWomenOutfit.rightBottom?.image} alt="" className="w-12 h-12 object-contain mx-auto" />
                                        <span className="text-[10px] font-bold text-[#800020] block truncate mt-1">{currentWomenOutfit.rightBottom?.name}</span>
                                        <span className="text-[9px] font-mono text-[#800020]/70">{Number(currentWomenOutfit.rightBottom?.price || 0).toFixed(0)} ر.س</span>
                                    </div>
                                </div>

                                {/* Center: Main Outfit Model */}
                                <div className="bg-white/90 p-2 rounded-2xl text-center flex flex-col items-center justify-center border-2 border-[#800020]/30 shadow-sm relative overflow-hidden">
                                    <span className="absolute top-1.5 right-1.5 bg-[#800020] text-[#F0DFCD] text-[8px] font-bold px-1.5 py-0.2 rounded">
                                        شراء الطقم
                                    </span>
                                    <img src={currentWomenOutfit.mainImage} alt="" className="w-full h-32 object-contain drop-shadow-md" />
                                    <span className="text-[11px] font-black text-[#800020] block mt-1 truncate">{currentWomenOutfit.title}</span>
                                </div>

                                {/* Left Column */}
                                <div className="flex flex-col gap-2">
                                    <div className="bg-white/80 p-2 rounded-xl text-center border border-[#800020]/10">
                                        <img src={currentWomenOutfit.leftTop?.image} alt="" className="w-12 h-12 object-contain mx-auto" />
                                        <span className="text-[10px] font-bold text-[#800020] block truncate mt-1">{currentWomenOutfit.leftTop?.name}</span>
                                        <span className="text-[9px] font-mono text-[#800020]/70">{Number(currentWomenOutfit.leftTop?.price || 0).toFixed(0)} ر.س</span>
                                    </div>
                                    <div className="bg-white/80 p-2 rounded-xl text-center border border-[#800020]/10">
                                        <img src={currentWomenOutfit.leftBottom?.image} alt="" className="w-12 h-12 object-contain mx-auto" />
                                        <span className="text-[10px] font-bold text-[#800020] block truncate mt-1">{currentWomenOutfit.leftBottom?.name}</span>
                                        <span className="text-[9px] font-mono text-[#800020]/70">{Number(currentWomenOutfit.leftBottom?.price || 0).toFixed(0)} ر.س</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Controls & Item Configs (7 Cols) */}
                        <div className="lg:col-span-7 bg-white/60 p-6 rounded-3xl border border-[#800020]/15 shadow-sm space-y-6">
                            
                            {/* Main Outfit Settings */}
                            <div className="p-4 rounded-2xl bg-white border border-[#800020]/15 space-y-4">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <h3 className="text-xs font-black text-[#800020] flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-pink-600" />
                                        <span>بيانات المودل الأساسي للطقم النسائي (الوسط)</span>
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsChoosingWomenMainProduct(!isChoosingWomenMainProduct);
                                            if (!isChoosingWomenMainProduct) setShowWomenMainQuickImgs(false);
                                        }}
                                        className={`text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                                            isChoosingWomenMainProduct
                                                ? 'bg-[#800020] text-[#F0DFCD] shadow-xs'
                                                : 'text-[#800020] bg-[#800020]/10 hover:bg-[#800020] hover:text-[#F0DFCD]'
                                        }`}
                                    >
                                        <Search className="w-3.5 h-3.5" />
                                        <span>{isChoosingWomenMainProduct ? 'إغلاق القائمة' : 'اختر من المنتجات لتحديث الإطلالة'}</span>
                                    </button>
                                </div>

                                {isChoosingWomenMainProduct && (
                                    <ProductChooserPanel
                                        productsList={productsList}
                                        defaultGender="looks"
                                        selectedProductId={currentWomenOutfit.mainProductId}
                                        onSelectProduct={(p) => handleSelectProductForMainModel('womenOutfit', selectedWomenOutfitIdx, p)}
                                        onClose={() => setIsChoosingWomenMainProduct(false)}
                                    />
                                )}

                                {currentWomenOutfit.mainProductId && (
                                    <div className="text-[10px] text-[#800020]/80 bg-[#800020]/5 px-3 py-1.5 rounded-xl flex items-center justify-between border border-[#800020]/10">
                                        <span className="flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>المنتج المرتبط بالمتجر: <strong className="font-bold text-[#800020]">{currentWomenOutfit.title}</strong></span>
                                        </span>
                                        <span className="font-mono text-[9px] opacity-60">ID: {currentWomenOutfit.mainProductId.slice(0, 8)}...</span>
                                    </div>
                                )}

                                {linkedWomenMainProduct?.colors && linkedWomenMainProduct.colors.length > 0 && (
                                    <div className="p-2.5 rounded-xl bg-[#800020]/5 border border-[#800020]/15 space-y-1.5 animate-fadeIn">
                                        <div className="flex items-center justify-between text-xs font-bold text-[#800020]">
                                            <span className="flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                                                <span>لون عرض المودل في الطقم (من ألوان المنتج):</span>
                                            </span>
                                            <span className="text-[11px] font-bold text-[#800020]/80 bg-white px-2 py-0.5 rounded-md border border-[#800020]/10">
                                                {currentWomenOutfit.selectedColor || linkedWomenMainProduct.colors.find(c => c.image === currentWomenOutfit.mainImage || c.image_url === currentWomenOutfit.mainImage)?.name || linkedWomenMainProduct.colors[0]?.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                            {linkedWomenMainProduct.colors.map((c, cIdx) => {
                                                const isSelected = (currentWomenOutfit.mainImage && (currentWomenOutfit.mainImage === c.image || currentWomenOutfit.mainImage === c.image_url)) || (currentWomenOutfit.selectedColor === c.name);
                                                return (
                                                    <button
                                                        key={cIdx}
                                                        type="button"
                                                        onClick={() => {
                                                            if (c.image || c.image_url) {
                                                                handleUpdateOutfitField('womenOutfit', selectedWomenOutfitIdx, 'mainImage', c.image || c.image_url);
                                                            }
                                                            handleUpdateOutfitField('womenOutfit', selectedWomenOutfitIdx, 'selectedColor', c.name);
                                                            showToast(`تم اختيار لون "${c.name}" لعرض المودل في الطقم`, 'sparkle');
                                                        }}
                                                        className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition cursor-pointer border ${
                                                            isSelected
                                                                ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-xs'
                                                                : 'bg-white hover:bg-[#800020]/10 text-[#800020] border-[#800020]/15'
                                                        }`}
                                                        title={`${c.name} ${c.image ? '(يحتوي على صورة مخصصة)' : ''}`}
                                                    >
                                                        <span
                                                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-inner"
                                                            style={{ backgroundColor: c.hex }}
                                                        />
                                                        <span className="text-[11px] font-bold">{c.name}</span>
                                                        {isSelected && <Check className="w-3 h-3 text-[#F0DFCD]" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <label className="block font-bold text-[#800020] mb-1">اسم الطقم:</label>
                                        <input
                                            type="text"
                                            value={currentWomenOutfit.title || ''}
                                            onChange={(e) => handleUpdateOutfitField('womenOutfit', selectedWomenOutfitIdx, 'title', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-[#800020]/20 font-bold text-[#800020]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-[#800020] mb-1">سعر الطقم الكامل (ر.س):</label>
                                        <input
                                            type="number"
                                            value={currentWomenOutfit.price || ''}
                                            onChange={(e) => handleUpdateOutfitField('womenOutfit', selectedWomenOutfitIdx, 'price', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 rounded-xl border border-[#800020]/20 font-bold text-[#800020]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block font-bold text-[#800020] text-xs">رابط صورة المودل الأساسي:</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowWomenMainQuickImgs(!showWomenMainQuickImgs)}
                                            className="text-[10px] text-[#800020] hover:underline font-bold cursor-pointer"
                                        >
                                            {showWomenMainQuickImgs ? 'إغلاق الكتالوج' : 'اختر من صور الكتالوج'}
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={currentWomenOutfit.mainImage || ''}
                                        onChange={(e) => handleUpdateOutfitField('womenOutfit', selectedWomenOutfitIdx, 'mainImage', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#800020]/20 font-mono text-xs text-[#800020]"
                                        placeholder="/images/women_new_bg_removed.png أو رابط صورة"
                                    />
                                    {showWomenMainQuickImgs && (
                                        <div className="mt-2 p-2.5 bg-[#f0dfcd]/30 rounded-xl border border-[#800020]/15 space-y-1.5 animate-fadeIn">
                                            <span className="text-[10px] font-bold text-[#800020]">انقر لاختيار صورة المودل النسائي:</span>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 custom-scrollbar">
                                                {storeQuickImages.map((qi, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            handleUpdateOutfitField('womenOutfit', selectedWomenOutfitIdx, 'mainImage', qi.url);
                                                            setShowWomenMainQuickImgs(false);
                                                        }}
                                                        className="p-1.5 rounded-xl bg-white hover:bg-[#800020]/15 border border-[#800020]/10 flex flex-col items-center gap-1 transition cursor-pointer"
                                                    >
                                                        <img src={qi.url} alt="" className="w-9 h-9 object-contain" />
                                                        <span className="text-[9px] text-[#800020] truncate w-full text-center font-bold">{qi.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 4 Corner Items Editor */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-[#800020]">القطع الأربع المحيطة بالمودل النسائي</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    
                                    <CornerItemEditorCard
                                        label="أعلى اليمين"
                                        item={currentWomenOutfit.rightTop}
                                        productsList={productsList}
                                        defaultGender="women"
                                        onSelectProduct={(p) => handleSelectProductForCorner('womenOutfit', selectedWomenOutfitIdx, 'rightTop', p)}
                                        onUpdateField={(f, v) => handleUpdateCornerItem('womenOutfit', selectedWomenOutfitIdx, 'rightTop', { [f]: v })}
                                    />

                                    <CornerItemEditorCard
                                        label="أسفل اليمين"
                                        item={currentWomenOutfit.rightBottom}
                                        productsList={productsList}
                                        defaultGender="women"
                                        onSelectProduct={(p) => handleSelectProductForCorner('womenOutfit', selectedWomenOutfitIdx, 'rightBottom', p)}
                                        onUpdateField={(f, v) => handleUpdateCornerItem('womenOutfit', selectedWomenOutfitIdx, 'rightBottom', { [f]: v })}
                                    />

                                    <CornerItemEditorCard
                                        label="أعلى اليسار"
                                        item={currentWomenOutfit.leftTop}
                                        productsList={productsList}
                                        defaultGender="women"
                                        onSelectProduct={(p) => handleSelectProductForCorner('womenOutfit', selectedWomenOutfitIdx, 'leftTop', p)}
                                        onUpdateField={(f, v) => handleUpdateCornerItem('womenOutfit', selectedWomenOutfitIdx, 'leftTop', { [f]: v })}
                                    />

                                    <CornerItemEditorCard
                                        label="أسفل اليسار"
                                        item={currentWomenOutfit.leftBottom}
                                        productsList={productsList}
                                        defaultGender="women"
                                        onSelectProduct={(p) => handleSelectProductForCorner('womenOutfit', selectedWomenOutfitIdx, 'leftBottom', p)}
                                        onUpdateField={(f, v) => handleUpdateCornerItem('womenOutfit', selectedWomenOutfitIdx, 'leftBottom', { [f]: v })}
                                    />

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* SUB-TAB 4: OFFER BANNER MANAGEMENT */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {activeSectionTab === 'offer' && (
                <OfferManagementSection
                    productsList={productsList}
                    homeOffer={homeOffer}
                    updateHomeOffer={updateHomeOffer}
                    resetHomeOffer={resetHomeOffer}
                    showToast={showToast}
                />
            )}

        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Product Chooser Panel with live search, department tabs & counts
// ─────────────────────────────────────────────────────────────────────────────
function ProductChooserPanel({
    productsList = [],
    defaultGender = 'all',
    onSelectProduct,
    onClose,
    selectedProductId = null
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGender, setSelectedGender] = useState(defaultGender);

    useEffect(() => {
        if (defaultGender) setSelectedGender(defaultGender);
    }, [defaultGender]);

    const filteredProducts = useMemo(() => {
        let list = productsList || [];

        // 1. Department / Category filter
        if (selectedGender === 'looks') {
            list = list.filter(p => {
                const cat = typeof p.category === 'string' ? p.category : p.category?.name || '';
                return cat === 'إطلالات' || cat.includes('إطلالة') || p.name?.includes('إطلالة') || p.name?.includes('طقم');
            });
        } else if (selectedGender !== 'all') {
            list = list.filter(p => {
                const cat = typeof p.category === 'string' ? p.category : p.category?.name || '';
                const pGender = p.gender || (
                    ['فساتين', 'عبايات', 'حقائب', 'أزياء نسائية'].includes(cat) ? 'women'
                    : ['ساعات', 'عطور', 'خواتم', 'نظارات', 'محافظ', 'أحزمة', 'إكسسوارات'].includes(cat) ? 'unisex'
                    : 'men'
                );
                return pGender === selectedGender;
            });
        }

        // 2. Search query filter
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            list = list.filter(p => {
                const nameMatch = p.name?.toLowerCase().includes(q);
                const cat = typeof p.category === 'string' ? p.category : p.category?.name || '';
                const catMatch = cat.toLowerCase().includes(q);
                const priceMatch = String(p.price).includes(q);
                return nameMatch || catMatch || priceMatch;
            });
        }

        return list;
    }, [productsList, selectedGender, searchQuery]);

    return (
        <div className="p-3 bg-[#f0dfcd]/40 rounded-2xl border border-[#800020]/20 space-y-2.5 animate-fadeIn">
            {/* Search & Counter */}
            <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#800020]/50 pointer-events-none" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم المنتج أو تصنيفه أو سعره..."
                    className="w-full pr-9 pl-8 py-2 bg-white rounded-xl border border-[#800020]/20 text-xs font-bold text-[#800020] placeholder:text-[#800020]/40 focus:outline-none focus:border-[#800020]"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs p-0.5 cursor-pointer"
                        title="مسح البحث"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Department Filter Tabs */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold flex-wrap">
                <span className="text-[#800020]/60 shrink-0 text-[10px]">القسم:</span>
                {[
                    { id: 'all', label: 'الكل' },
                    { id: 'looks', label: 'إطلالات' },
                    { id: 'men', label: 'رجالي' },
                    { id: 'women', label: 'نسائي' },
                    { id: 'unisex', label: 'إكسسوارات' }
                ].map(dept => (
                    <button
                        key={dept.id}
                        type="button"
                        onClick={() => setSelectedGender(dept.id)}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[10px] ${
                            selectedGender === dept.id
                                ? 'bg-[#800020] text-[#F0DFCD] shadow-2xs font-black'
                                : 'bg-white/80 text-[#800020] hover:bg-white border border-[#800020]/10'
                        }`}
                    >
                        {dept.label}
                    </button>
                ))}
                <span className="mr-auto text-[10px] text-[#800020]/60 font-mono">
                    ({filteredProducts.length} منتج)
                </span>
            </div>

            {/* Scrollable Products List */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 p-0.5 custom-scrollbar">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-5 text-[#800020]/70 text-xs bg-white/70 rounded-xl p-3 border border-[#800020]/10">
                        <p className="font-bold">لا توجد منتجات مطابقة لهذا البحث أو الفلتر.</p>
                        <p className="text-[10px] mt-1 opacity-80">يمكنك تجربة كتابة كلمة أخرى أو اختيار قسم "الكل".</p>
                    </div>
                ) : (
                    filteredProducts.map(p => {
                        const isSelected = selectedProductId && (selectedProductId === p.id);
                        return (
                            <div
                                key={p.id}
                                onClick={() => {
                                    onSelectProduct(p);
                                    if (onClose) onClose();
                                }}
                                className={`p-2 rounded-xl border flex items-center gap-2.5 cursor-pointer transition text-xs group shadow-2xs ${
                                    isSelected
                                        ? 'bg-[#800020]/10 border-[#800020] ring-1 ring-[#800020]'
                                        : 'bg-white hover:bg-[#800020]/10 border-[#800020]/10'
                                }`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#f0dfcd]/40 p-1 shrink-0 flex items-center justify-center border border-[#800020]/10 overflow-hidden">
                                    <img
                                        src={p.image_url || p.image || '/images/coat_transparent.png'}
                                        alt=""
                                        className="w-full h-full object-contain"
                                        onError={(e) => { e.target.src = '/images/coat_transparent.png'; }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-[#800020] truncate group-hover:text-[#600018]">{p.name}</div>
                                    <div className="text-[10px] text-[#800020]/60 truncate flex items-center gap-1.5">
                                        <span>{typeof p.category === 'string' ? p.category : p.category?.name || ''}</span>
                                        {p.gender && (
                                            <span className="text-[9px] bg-[#800020]/5 px-1 rounded">
                                                {p.gender === 'women' ? 'نسائي' : p.gender === 'men' ? 'رجالي' : 'إكسسوار'}
                                            </span>
                                        )}
                                    </div>
                                    {p.colors && p.colors.length > 0 && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="text-[9px] text-[#800020]/60 font-bold shrink-0">ألوان العرض:</span>
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {p.colors.map((c, cIdx) => (
                                                    <button
                                                        key={cIdx}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSelectProduct({
                                                                ...p,
                                                                image: c.image || c.image_url || p.image || p.image_url,
                                                                image_url: c.image || c.image_url || p.image || p.image_url,
                                                                selectedColor: c.name
                                                            });
                                                            if (onClose) onClose();
                                                        }}
                                                        className="p-0.5 rounded-full hover:scale-125 transition cursor-pointer border border-black/20 bg-white"
                                                        title={`اختيار لون "${c.name}" كـ لون عرض القطعة`}
                                                    >
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full block border border-black/10"
                                                            style={{ backgroundColor: c.hex }}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="font-black text-[#800020] text-xs shrink-0 font-mono flex items-center gap-1">
                                    {Number(p.price).toFixed(0)} <span className="text-[10px] font-sans">ر.س</span>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1" />}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Corner Item Editor Card with full product catalog & custom input
// ─────────────────────────────────────────────────────────────────────────────
function CornerItemEditorCard({
    label,
    item = {},
    productsList = [],
    defaultGender = 'all',
    onSelectProduct,
    onUpdateField
}) {
    const { showToast } = useToast();
    const [isChoosingProduct, setIsChoosingProduct] = useState(false);
    const [showQuickImages, setShowQuickImages] = useState(false);

    const linkedProduct = useMemo(() => {
        if (!item?.id && !item?.name) return null;
        return (productsList || []).find(p => p.id === item.id) ||
               (productsList || []).find(p => p.name === item.name) || null;
    }, [productsList, item?.id, item?.name]);

    const availableColors = linkedProduct?.colors || [];

    return (
        <div className="bg-white p-3.5 rounded-2xl border border-[#800020]/15 space-y-2.5 text-xs shadow-2xs">
            {/* Header: Label + Choose Button */}
            <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#800020] text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#800020]" />
                    {label}
                </span>
                <button
                    type="button"
                    onClick={() => {
                        setIsChoosingProduct(!isChoosingProduct);
                        if (!isChoosingProduct) setShowQuickImages(false);
                    }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        isChoosingProduct
                            ? 'bg-[#800020] text-[#F0DFCD] shadow-xs'
                            : 'text-[#800020] bg-[#800020]/10 hover:bg-[#800020] hover:text-[#F0DFCD]'
                    }`}
                >
                    <Search className="w-3 h-3" />
                    <span>{isChoosingProduct ? 'إغلاق القائمة' : 'اختر من المنتجات'}</span>
                </button>
            </div>

            {/* Product Chooser Panel */}
            {isChoosingProduct && (
                <ProductChooserPanel
                    productsList={productsList}
                    defaultGender={defaultGender}
                    selectedProductId={item?.id}
                    onSelectProduct={(p) => {
                        onSelectProduct(p);
                        setIsChoosingProduct(false);
                    }}
                    onClose={() => setIsChoosingProduct(false)}
                />
            )}

            {/* Current Item Preview & Direct Inputs (Always available for custom products) */}
            <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                    <div className="w-11 h-11 rounded-xl bg-[#f0dfcd]/40 p-1 shrink-0 flex items-center justify-center border border-[#800020]/15 relative">
                        <img
                            src={item.image || '/images/coat_transparent.png'}
                            alt=""
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.src = '/images/coat_transparent.png'; }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <input
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => onUpdateField('name', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-[#800020]/20 font-bold text-[#800020] text-xs focus:outline-none focus:border-[#800020]"
                            placeholder="اسم المنتج أو القطعة"
                            title="يمكنك كتابة اسم أي منتج مخصص تريده هنا"
                        />
                    </div>
                </div>

                {/* Available Product Colors Selector */}
                {availableColors.length > 0 && (
                    <div className="p-2 rounded-xl bg-[#800020]/5 border border-[#800020]/15 space-y-1 animate-fadeIn">
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#800020]">
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#800020]" />
                                <span>لون عرض القطعة في الطقم:</span>
                            </span>
                            <span className="text-[9px] font-bold text-[#800020]/80 bg-white px-1.5 py-0.2 rounded border border-[#800020]/10">
                                {item.selectedColor || availableColors.find(c => c.image === item.image || c.image_url === item.image)?.name || availableColors[0]?.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {availableColors.map((c, cIdx) => {
                                const isSelected = (item.image && (item.image === c.image || item.image === c.image_url)) || (item.selectedColor === c.name);
                                return (
                                    <button
                                        key={cIdx}
                                        type="button"
                                        onClick={() => {
                                            if (c.image || c.image_url) {
                                                onUpdateField('image', c.image || c.image_url);
                                            }
                                            onUpdateField('selectedColor', c.name);
                                            showToast(`تم اختيار لون "${c.name}" كـ لون عرض للقطعة`);
                                        }}
                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                                            isSelected
                                                ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-2xs'
                                                : 'bg-white hover:bg-[#800020]/10 text-[#800020] border-[#800020]/15'
                                        }`}
                                        title={`${c.name} ${c.image ? '(يحتوي على صورة مخصصة)' : ''}`}
                                    >
                                        <span
                                            className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                            style={{ backgroundColor: c.hex }}
                                        />
                                        <span>{c.name}</span>
                                        {isSelected && <Check className="w-2.5 h-2.5 text-[#F0DFCD]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-[9px] font-bold text-[#800020]/70 mb-0.5">السعر (ر.س)</label>
                        <input
                            type="number"
                            value={item.price || ''}
                            onChange={(e) => onUpdateField('price', parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-[#800020]/20 font-bold text-[#800020] text-xs focus:outline-none focus:border-[#800020]"
                            placeholder="السعر"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[9px] font-bold text-[#800020]/70">الصورة</label>
                            <button
                                type="button"
                                onClick={() => setShowQuickImages(!showQuickImages)}
                                className="text-[9px] text-[#800020] hover:underline font-bold cursor-pointer"
                            >
                                {showQuickImages ? 'إغلاق الكتالوج' : 'صور الكتالوج'}
                            </button>
                        </div>
                        <input
                            type="text"
                            value={item.image || ''}
                            onChange={(e) => onUpdateField('image', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-xl border border-[#800020]/20 font-mono text-[10px] text-[#800020] focus:outline-none focus:border-[#800020]"
                            placeholder="رابط الصورة /images/..."
                        />
                    </div>
                </div>

                {/* Quick Catalog Images Strip */}
                {showQuickImages && (
                    <div className="p-2 bg-[#f0dfcd]/20 rounded-xl border border-[#800020]/10 space-y-1 animate-fadeIn">
                        <span className="text-[9px] font-bold text-[#800020]/70">اختر صورة سريعة من الكتالوج:</span>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-28 overflow-y-auto p-1 custom-scrollbar">
                            {storeQuickImages.map((qi, qIdx) => (
                                <button
                                    key={qIdx}
                                    type="button"
                                    onClick={() => {
                                        onUpdateField('image', qi.url);
                                        if (!item.name) onUpdateField('name', qi.name);
                                        setShowQuickImages(false);
                                    }}
                                    className="p-1 rounded-lg bg-white hover:bg-[#800020]/15 border border-[#800020]/10 flex flex-col items-center gap-0.5 transition cursor-pointer"
                                    title={qi.name}
                                >
                                    <img src={qi.url} alt="" className="w-7 h-7 object-contain" />
                                    <span className="text-[8px] text-[#800020] truncate w-full text-center">{qi.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
