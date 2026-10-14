import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ArrowLeft, ChevronRight, ChevronLeft, Star, Truck, RotateCcw, ShieldCheck, Droplet, Maximize, Scissors, Users, Sparkles, CheckCircle2, Edit3, Check, AlertCircle } from 'lucide-react';
import RiyalIcon from '../components/RiyalIcon';
import { ToggleIcon } from '../components/ProductCard';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { productsApi } from '../lib/api';

function StarRating({ rating }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-brand-burgundy fill-brand-burgundy' : 'text-brand-burgundy/20 fill-brand-burgundy/20'}`} />
            ))}
        </div>
    );
}

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user, isAdmin } = useAuth();
    const { isWishlisted, toggleWishlist, addToCart, homeOffer } = useShop();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [activeImg, setActiveImg] = useState(0);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectionError, setSelectionError] = useState(null); // 'color' | 'size' | 'both'
    const [activeTab, setActiveTab] = useState('details');
    const [likedRelated, setLikedRelated] = useState({});
    const [relatedList, setRelatedList] = useState([]);
    const VISIBLE_COUNT = 4;
    const maxRelatedIndex = Math.max(0, relatedList.length - VISIBLE_COUNT);
    const [relatedIndex, setRelatedIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState('left');

    const isLiked = product?.id ? isWishlisted(product.id) : false;

    useEffect(() => {
        let isMounted = true;
        async function fetchProduct() {
            setLoading(true);
            try {
                let targetId = id;
                // If id is '3' (legacy offer link), resolve to current offer product or fallback shoes
                if (targetId === '3') {
                    targetId = homeOffer?.productId || '1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7';
                }

                let data = null;
                // UUID regex check
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
                if (isUuid) {
                    const res = await productsApi.getById(targetId);
                    data = res.data;
                }

                // If not found by ID, attempt fallback to first product
                if (!data) {
                    const { data: allProds } = await productsApi.getAll({ limit: 1 });
                    if (allProds && allProds.length > 0) {
                        data = allProds[0];
                    }
                }

                if (!isMounted) return;
                if (data) {
                    const colors = data.colors && data.colors.length > 0
                        ? data.colors.map(c => c.hex)
                        : ['#1a1a1a', '#800020'];
                    const colorNames = data.colors && data.colors.length > 0
                        ? data.colors.map(c => c.name)
                        : ['أسود', 'عنابي'];
                    const sizeDetails = data.sizes && data.sizes.length > 0
                        ? data.sizes.map(s => ({
                            size: s.size,
                            inStock: s.in_stock !== false && (s.stock_qty === null || s.stock_qty === undefined || s.stock_qty > 0),
                            stockQty: s.stock_qty !== undefined && s.stock_qty !== null ? s.stock_qty : 10
                        }))
                        : [
                            { size: 'S', inStock: true, stockQty: 10 },
                            { size: 'M', inStock: true, stockQty: 15 },
                            { size: 'L', inStock: true, stockQty: 20 },
                            { size: 'XL', inStock: true, stockQty: 10 }
                        ];
                    const sizes = sizeDetails.map(s => s.size);

                    const images = data.images && data.images.length > 0
                        ? data.images
                        : (data.image_url ? [data.image_url] : ['/images/coat_transparent.png']);

                    setProduct({
                        id: data.id,
                        name: data.name,
                        price: Number(data.price),
                        oldPrice: data.original_price ? Number(data.original_price) : null,
                        category: data.category?.name || 'أزياء',
                        badge: data.is_new ? 'جديد' : (data.is_featured ? 'مميز' : null),
                        description: data.description || 'منتج فاخر مصمم بأعلى معايير الجودة والأناقة.',
                        imgs: images,
                        colors,
                        colorNames,
                        sizes,
                        sizeDetails,
                        rating: data.rating || 4.9,
                        reviews: data.reviews_count || 120,
                        inStock: data.in_stock !== false
                    });
                    // Reset selections so user must choose size & color manually
                    setSelectedColor(null);
                    setSelectedSize(null);
                    setSelectionError(null);
                } else {
                    setProduct(null);
                }
            } catch (err) {
                console.error('Error fetching product from Supabase:', err);
                setProduct(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchProduct();
        const handleStockSync = () => {
            fetchProduct();
        };
        window.addEventListener('thyiaab_stock_updated', handleStockSync);
        return () => { 
            isMounted = false; 
            window.removeEventListener('thyiaab_stock_updated', handleStockSync);
        };
    }, [id, homeOffer?.productId]);

    useEffect(() => {
        let isMounted = true;
        async function fetchRelated() {
            try {
                const { data } = await productsApi.getAll({ limit: 8 });
                if (!isMounted || !data) return;
                const mapped = data
                    .filter(p => String(p.id) !== String(id))
                    .map(p => ({
                        id: p.id,
                        name: p.name,
                        price: Number(p.price),
                        oldPrice: p.original_price ? Number(p.original_price) : null,
                        category: p.category?.name || 'أزياء',
                        img: p.image_url || '/images/coat_transparent.png',
                        imgs: p.images || [p.image_url || '/images/coat_transparent.png'],
                        rating: p.rating || 5,
                        reviews: p.reviews_count || 120
                    }));
                setRelatedList(mapped);
            } catch (e) {
                console.error('Error fetching related products:', e);
            }
        }
        fetchRelated();
        return () => { isMounted = false; };
    }, [id]);

    useEffect(() => {
        setRelatedIndex(0);
    }, [product?.id]);

    const handleAddToCart = () => {
        if (!product) return;

        const hasColors = product.colors && product.colors.length > 0;
        const hasSizes = product.sizes && product.sizes.length > 0;

        const isColorMissing = hasColors && selectedColor === null;
        const isSizeMissing = hasSizes && !selectedSize;

        if (isColorMissing && isSizeMissing) {
            setSelectionError('both');
            showToast('يرجى اختيار المقاس واللون أولاً لإتمام الشراء', 'error');
            return;
        }

        if (isColorMissing) {
            setSelectionError('color');
            showToast('يرجى اختيار اللون المناسب أولاً للمتابعة', 'error');
            return;
        }

        if (isSizeMissing) {
            setSelectionError('size');
            showToast('يرجى اختيار المقاس المناسب أولاً للمتابعة', 'error');
            return;
        }

        // Check if chosen size is in stock
        const chosenSizeDetail = product.sizeDetails?.find(s => s.size === selectedSize);
        if (chosenSizeDetail && chosenSizeDetail.inStock === false) {
            showToast('عذراً، هذا المقاس غير متوفر في المخزون حالياً', 'error');
            return;
        }

        setSelectionError(null);
        const chosenColor = selectedColor !== null && product.colorNames?.[selectedColor] 
            ? product.colorNames[selectedColor] 
            : 'أساسي';
        const chosenSize = selectedSize || 'قياسي';

        addToCart({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            category: product.category,
            qty: 1,
            size: chosenSize,
            color: chosenColor,
            img: product.imgs?.[0] || '/images/coat_transparent.png',
            availableSizes: product.sizes || [chosenSize],
            availableColors: product.colorNames || [chosenColor],
            colorObjects: product.colors && product.colorNames
                ? product.colors.map((hex, i) => ({ hex, name: product.colorNames[i] }))
                : []
        });
        showToast(`تمت إضافة "${product.name}" (${chosenSize} - ${chosenColor}) إلى السلة بنجاح`);
    };

    const handleToggleWishlist = () => {
        if (!product) return;
        const nowLiked = toggleWishlist(product.id, {
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            category: product.category,
            img: product.imgs?.[0] || '/images/coat_transparent.png',
            inStock: product.inStock
        });
        showToast(nowLiked ? `تمت إضافة "${product.name}" إلى قائمة المفضلة` : `تمت إزالة "${product.name}" من المفضلة`);
    };

    const safeIndex = Math.min(Math.max(0, relatedIndex), maxRelatedIndex);
    const isAtStart = safeIndex <= 0;
    const isAtEnd = safeIndex >= maxRelatedIndex;

    const handleNextRelated = () => {
        if (safeIndex < maxRelatedIndex) {
            setSlideDirection('left');
            setRelatedIndex(safeIndex + 1);
        }
    };

    const handlePrevRelated = () => {
        if (safeIndex > 0) {
            setSlideDirection('right');
            setRelatedIndex(safeIndex - 1);
        }
    };

    const visibleRelatedItems = relatedList.slice(
        safeIndex,
        safeIndex + VISIBLE_COUNT
    );

    const bsItemVariants = {
        initial: (dir) => ({
            x: dir === 'left' ? 100 : -100,
            opacity: 0
        }),
        animate: {
            x: 0,
            opacity: 1
        },
        exit: (dir) => ({
            x: dir === 'left' ? -100 : 100,
            opacity: 0
        })
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-cream/20 text-brand-burgundy flex items-center justify-center font-arabic pt-28" dir="rtl">
                <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-brand-burgundy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg font-bold">جاري تحميل تفاصيل المنتج...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-brand-cream/20 text-brand-burgundy flex items-center justify-center font-arabic pt-28" dir="rtl">
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
                    <button
                        onClick={() => navigate('/men')}
                        className="bg-brand-burgundy text-[#F0DFCD] px-6 py-2.5 rounded-xl font-bold hover:bg-[#600018] transition cursor-pointer"
                    >
                        العودة للمتجر
                    </button>
                </div>
            </div>
        );
    }

    const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

    return (
        <div className="min-h-screen bg-brand-cream/20 text-brand-burgundy pt-28 pb-20 font-arabic" dir="rtl">

            {/* ─── Top Section: Gallery & Info ─── */}
            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                {/* Left: Gallery */}
                <div className="flex gap-4 h-[600px]">
                    {/* Thumbnails */}
                    <div className="flex flex-col gap-4 overflow-y-auto scrollbar-hide py-1">
                        {product.imgs.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImg(i)}
                                className={`w-20 h-24 rounded-xl overflow-hidden shrink-0 transition-all bg-brand-cream/40 ${activeImg === i ? 'opacity-100 border-2 border-brand-cream drop-shadow-sm' : 'opacity-50 hover:opacity-100 border-2 border-transparent'
                                    }`}
                            >
                                <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply bg-brand-cream/20" />
                            </button>
                        ))}
                    </div>
                    {/* Main Image */}
                    <div className="flex-1 bg-brand-cream/30 rounded-3xl relative flex items-center justify-center p-8 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={activeImg}
                                src={product.imgs[activeImg]}
                                alt={product.name}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="flex flex-col py-4">
                    {isAdmin && (
                        <div className="mb-4 p-3 rounded-2xl bg-[#800020]/10 border border-[#800020]/25 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#800020]">
                                <Sparkles className="w-4 h-4 shrink-0" />
                                <span>صلاحية المسؤول: يمكنك تعديل كافة بيانات هذا المنتج مباشرة</span>
                            </div>
                            <button
                                onClick={() => navigate(`/admin?edit=${product.id}`)}
                                className="bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>تعديل المنتج</span>
                            </button>
                        </div>
                    )}

                    {product.badge && (
                        <span className="bg-brand-burgundy text-brand-cream text-xs font-bold px-2.5 py-1 rounded w-fit mb-4">
                            {product.badge}
                        </span>
                    )}

                    <h1 className="text-4xl font-black mb-4">{product.name}</h1>

                    <div className="flex items-center gap-3 mb-6">
                        <StarRating rating={product.rating} />
                        <span className="text-sm font-medium opacity-70">{product.rating} ({product.reviews} تقييم)</span>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-3xl font-black">{product.price} <RiyalIcon /></span>
                        {product.oldPrice && (
                            <>
                                <span className="text-lg line-through opacity-40 font-medium">{product.oldPrice}</span>
                                <span className="bg-brand-burgundy text-brand-cream text-xs font-bold px-2 py-1 rounded">خصم {discount}%</span>
                            </>
                        )}
                    </div>

                    <p className="text-brand-burgundy/80 font-medium leading-relaxed mb-8 max-w-md">
                        {product.description}
                    </p>

                    {/* Colors */}
                    <div className={`mb-8 p-3 -mx-3 rounded-2xl transition-all duration-300 ${
                        (selectionError === 'color' || selectionError === 'both') && selectedColor === null
                            ? 'bg-red-500/10 border border-red-500/30 ring-2 ring-red-400/20'
                            : 'bg-transparent'
                    }`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">اللون:</span>
                                {selectedColor !== null ? (
                                    <span className="text-brand-burgundy font-bold text-sm bg-brand-burgundy/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: product.colors[selectedColor] }} />
                                        {product.colorNames[selectedColor]}
                                    </span>
                                ) : (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                        (selectionError === 'color' || selectionError === 'both')
                                            ? 'text-red-600 bg-red-100/90 animate-pulse'
                                            : 'text-brand-burgundy/50 bg-brand-burgundy/5'
                                    }`}>
                                        (يرجى اختيار اللون *)
                                    </span>
                                )}
                            </div>
                            {(selectionError === 'color' || selectionError === 'both') && selectedColor === null && (
                                <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    مطلوب لاكتمال الشراء
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {product.colors.map((hex, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        setSelectedColor(i);
                                        if (selectionError === 'color') setSelectionError(null);
                                        if (selectionError === 'both') setSelectionError('size');
                                    }}
                                    title={product.colorNames[i] || ''}
                                    className={`w-10 h-10 rounded-full relative flex items-center justify-center transition-all cursor-pointer ${
                                        selectedColor === i 
                                            ? 'ring-2 ring-brand-burgundy ring-offset-2 ring-offset-brand-cream/30 scale-110 shadow-md' 
                                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                                    }`}
                                >
                                    <span className="w-8 h-8 rounded-full border border-brand-burgundy/20 shadow-inner" style={{ backgroundColor: hex }} />
                                    {selectedColor === i && (
                                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" strokeWidth={3} />
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className={`mb-10 p-3 -mx-3 rounded-2xl transition-all duration-300 ${
                        (selectionError === 'size' || selectionError === 'both') && !selectedSize
                            ? 'bg-red-500/10 border border-red-500/30 ring-2 ring-red-400/20'
                            : 'bg-transparent'
                    }`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">المقاس:</span>
                                {selectedSize ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-brand-burgundy font-bold text-sm bg-brand-burgundy/10 px-2.5 py-0.5 rounded-full">
                                            {selectedSize}
                                        </span>
                                        {(() => {
                                            const sDetail = product.sizeDetails?.find(s => s.size === selectedSize);
                                            if (sDetail && (!sDetail.inStock || sDetail.stockQty <= 0)) {
                                                return <span className="text-xs text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded-full">نفد من المخزون</span>;
                                            }
                                            return null;
                                        })()}
                                    </div>
                                ) : (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                        (selectionError === 'size' || selectionError === 'both')
                                            ? 'text-red-600 bg-red-100/90 animate-pulse'
                                            : 'text-brand-burgundy/50 bg-brand-burgundy/5'
                                    }`}>
                                        (يرجى اختيار المقاس *)
                                    </span>
                                )}
                            </div>
                            {(selectionError === 'size' || selectionError === 'both') && !selectedSize && (
                                <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    مطلوب لاكتمال الشراء
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {(product.sizeDetails || product.sizes.map(s => ({ size: s, inStock: true, stockQty: 10 }))).map(item => {
                                const sName = typeof item === 'string' ? item : item.size;
                                const isAvailable = typeof item === 'string' ? true : (item.inStock !== false && item.stockQty > 0);
                                const stockLeft = typeof item === 'object' ? item.stockQty : null;

                                return (
                                    <button
                                        key={sName}
                                        type="button"
                                        disabled={!isAvailable}
                                        onClick={() => {
                                            if (!isAvailable) return;
                                            setSelectedSize(sName);
                                            if (selectionError === 'size') setSelectionError(null);
                                            if (selectionError === 'both') setSelectionError('color');
                                        }}
                                        className={`relative min-w-[3.5rem] h-12 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                                            !isAvailable
                                                ? 'opacity-40 bg-gray-200/50 border-gray-300 text-gray-500 cursor-not-allowed line-through'
                                                : selectedSize === sName
                                                    ? 'border-brand-burgundy bg-brand-burgundy text-[#F0DFCD] shadow-md scale-105'
                                                    : 'border-brand-burgundy/25 text-brand-burgundy hover:border-brand-burgundy hover:bg-brand-burgundy/5'
                                        }`}
                                    >
                                        <span>{sName}</span>
                                        {stockLeft !== null && stockLeft > 0 && stockLeft <= 5 && (
                                            <span className="text-[9px] -mt-0.5 opacity-80">({stockLeft})</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 mb-10">
                        <button
                            onClick={handleAddToCart}
                            className="shine-button flex-1 bg-brand-burgundy text-[#F0DFCD] rounded-xl h-14 flex items-center justify-center gap-3 font-bold cursor-pointer active:scale-98 transition-all shadow-sm hover:shadow-lg"
                        >
                            <ShoppingBag className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">أضف للسلة</span>
                        </button>
                        <ToggleIcon
                            Icon={Heart}
                            isActive={isLiked}
                            onClick={handleToggleWishlist}
                            baseClass="relative flex items-center justify-center w-14 h-14 rounded-xl bg-transparent"
                            fillOnActive={true}
                        />
                    </div>

                    {/* USPs */}
                    <div className="grid grid-cols-3 gap-4 border-t border-brand-burgundy/10 pt-6">
                        <div className="flex flex-col items-center text-center gap-1">
                            <Truck className="w-5 h-5 mb-1" />
                            <span className="text-xs font-bold">شحن مجاني</span>
                            <span className="text-[10px] text-brand-burgundy/60 flex items-center justify-center gap-0.5">للطلبات فوق 99 <RiyalIcon size="0.85em" /></span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-1">
                            <RotateCcw className="w-5 h-5 mb-1" />
                            <span className="text-xs font-bold">إرجاع سهل</span>
                            <span className="text-[10px] text-brand-burgundy/60">سياسة 30 يوم</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-1">
                            <ShieldCheck className="w-5 h-5 mb-1" />
                            <span className="text-xs font-bold">دفع آمن</span>
                            <span className="text-[10px] text-brand-burgundy/60">دفع آمن 100%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Middle Section: Tabs ─── */}
            <div className="container mx-auto px-6 mt-32">
                <div className="w-full">
                    {/* Tab Headers */}
                    <div className="flex gap-8 border-b border-brand-burgundy/10 mb-8 overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'details', label: 'التفاصيل' },
                            { id: 'reviews', label: 'آراء العملاء' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 text-sm font-bold whitespace-nowrap relative ${activeTab === tab.id ? 'text-brand-burgundy' : 'text-brand-burgundy/50 hover:text-brand-burgundy'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-burgundy" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'reviews' ? (
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-bold text-lg">التقييمات ({product.rating})</h4>
                                        <span className="text-xs font-bold opacity-60">({product.reviews || 128} تقييم)</span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/product/${product.id}/reviews`)}
                                        className="shine-button relative overflow-hidden group text-sm font-bold flex items-center gap-2 text-[#F0DFCD] bg-[#800020] hover:bg-[#600018] px-4 py-2 rounded-xl shadow-md transition-all duration-300 cursor-pointer active:scale-95"
                                    >
                                        <span className="shine-effect" />
                                        <span className="relative z-10">جميع المراجعات</span>
                                        <ArrowLeft className="w-4 h-4 text-[#F0DFCD] relative z-10 group-hover:-translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                <div className="border-b border-brand-burgundy/10 pb-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold">سعود فهد</span>
                                        <StarRating rating={5} />
                                    </div>
                                    <p className="text-brand-burgundy/80 text-sm leading-relaxed">منتج رائع جداً والخامة ممتازة، أنصح به بشدة! الجودة تفوق السعر بصراحة.</p>
                                    <div className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-500/15 border border-emerald-600/30 px-3 py-1 rounded-lg">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>مشتري موثق</span>
                                    </div>
                                </div>

                                <div className="border-b border-brand-burgundy/10 pb-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold">خالد عبد الله</span>
                                        <StarRating rating={4} />
                                    </div>
                                    <p className="text-brand-burgundy/80 text-sm leading-relaxed">مقاس ممتاز ومريح في اللبس ولكن التوصيل تأخر يومين.</p>
                                    <div className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-500/15 border border-emerald-600/30 px-3 py-1 rounded-lg">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>مشتري موثق</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                <p className="text-brand-burgundy/80 font-medium leading-relaxed max-w-4xl">
                                    صُمم هذا المنتج من خامات عالية الجودة ليوفر راحة استثنائية ومتانة تدوم طويلاً.
                                    التصميم البسيط يجعله قطعة أساسية متعددة الاستخدامات تناسب أي خزانة ملابس.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 pt-2 max-w-4xl">
                                    {/* العمود الأول: المواصفات والتصميم */}
                                    <div className="flex flex-col gap-4">
                                        <h4 className="text-base font-black text-brand-burgundy mb-1">
                                            المواصفات والتصميم
                                        </h4>
                                        <ul className="flex flex-col gap-4">
                                            <li className="flex items-center gap-3 text-sm font-bold text-brand-burgundy">
                                                <Maximize className="w-5 h-5 opacity-70 shrink-0" />
                                                <span>قصة واسعة وعصرية</span>
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold text-brand-burgundy">
                                                <Droplet className="w-5 h-5 opacity-70 shrink-0" />
                                                <span>خامة ناعمة وعالية الجودة</span>
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold text-brand-burgundy">
                                                <Scissors className="w-5 h-5 opacity-70 shrink-0" />
                                                <span>تصميم عصري متقن</span>
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold text-brand-burgundy">
                                                <Users className="w-5 h-5 opacity-70 shrink-0" />
                                                <span>مناسب لمختلف الأذواق</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* العمود الثاني: المواد */}
                                    <div className="flex flex-col gap-4">
                                        <h4 className="text-base font-black text-brand-burgundy mb-1">
                                            المواد
                                        </h4>
                                        <ul className="flex flex-col gap-4">
                                            <li className="flex items-center gap-3 text-sm font-bold text-brand-burgundy">
                                                <Droplet className="w-5 h-5 opacity-70 shrink-0" />
                                                <span>تركيبة القماش: 70% صوف، 30% كشمير</span>
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold text-brand-burgundy">
                                                <RotateCcw className="w-5 h-5 opacity-70 shrink-0" />
                                                <span>معالجة النسيج: مقاوم للتجعد والانكماش</span>
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold text-brand-burgundy">
                                                <Sparkles className="w-5 h-5 opacity-70 shrink-0" />
                                                <span>بطانة داخلية ناعمة وعازلة للحرارة</span>
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold text-brand-burgundy">
                                                <Scissors className="w-5 h-5 opacity-70 shrink-0" />
                                                <span>معايير الجودة: حياكة يدوية متقنة وفاخرة</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Bottom Section: Related Products ─── */}
            <div className="container mx-auto px-6 mt-32">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-brand-burgundy">قد يعجبك أيضاً</h2>
                </div>

                <div className="relative w-full text-[#800020] py-6 px-4 sm:px-8 lg:px-10">
                    {/* Right Arrow (السابق - يمين) */}
                    <motion.button
                        onClick={handlePrevRelated}
                        disabled={isAtStart}
                        aria-label="المنتجات السابقة"
                        initial="rest"
                        whileHover={!isAtStart ? "hover" : "rest"}
                        className={`group flex absolute -right-2 sm:-right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 p-2 items-center justify-center focus:outline-none bg-transparent border-0 shadow-none transition-all duration-200 ${isAtStart ? 'opacity-20 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer hover:scale-110 active:scale-95'
                            }`}
                    >
                        <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 overflow-visible">
                            <defs>
                                <mask id="arrowMaskRightRel">
                                    <path d="M9 18l6-6-6-6" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </mask>
                                <linearGradient id="shineGradRightRel" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                                    <stop offset="50%" stopColor="white" stopOpacity="1" />
                                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Base Burgundy Arrow */}
                            <path d="M9 18l6-6-6-6" fill="none" stroke="#800020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Shine Flash strictly restricted to Arrow Path */}
                            {!isAtStart && (
                                <g mask="url(#arrowMaskRightRel)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                                    <motion.rect
                                        y={0}
                                        width={16}
                                        height={24}
                                        fill="url(#shineGradRightRel)"
                                        variants={{
                                            rest: { x: -24, opacity: 0 },
                                            hover: {
                                                x: [-24, 28],
                                                opacity: [0, 1, 1, 0],
                                                transition: {
                                                    duration: 0.75,
                                                    ease: "easeInOut",
                                                    repeat: Infinity,
                                                    repeatDelay: 0.75
                                                }
                                            }
                                        }}
                                    />
                                </g>
                            )}
                        </svg>
                    </motion.button>

                    {/* Products Display (4 items in row) */}
                    <div className="w-full flex flex-row items-center justify-between gap-3 sm:gap-4 lg:gap-8 relative z-10 shrink-0 overflow-hidden">
                        <AnimatePresence mode="popLayout" initial={false} custom={slideDirection}>
                            {visibleRelatedItems.map((item) => (
                                <motion.div
                                    layout
                                    key={item.id}
                                    custom={slideDirection}
                                    variants={bsItemVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{
                                        duration: 0.6,
                                        ease: [0.25, 1, 0.5, 1]
                                    }}
                                    className="flex-1 flex flex-col items-center text-center cursor-pointer group min-w-0"
                                    onClick={() => {
                                        navigate(`/product/${item.id}`);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    <div className="relative w-full h-[160px] sm:h-[190px] lg:h-[240px] flex items-center justify-center mb-4">
                                        <img
                                            src={item.imgs?.[0] || item.image || '/images/coat_transparent.png'}
                                            alt={item.name}
                                            className={`object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md ${item.category === 'أحذية' || item.name.includes('حذاء')
                                                    ? 'h-[75%] max-w-[80%]'
                                                    : 'w-full h-full'
                                                }`}
                                        />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-sm lg:text-base mb-1.5 line-clamp-1 text-[#800020] group-hover:opacity-80 transition-opacity">
                                        {item.name}
                                    </h4>
                                    <p className="font-black text-sm sm:text-base lg:text-xl flex items-center justify-center gap-1 text-[#800020]">
                                        {Number(item.price).toFixed(2)} <RiyalIcon />
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Left Arrow (التالي - يسار) */}
                    <motion.button
                        onClick={handleNextRelated}
                        disabled={isAtEnd}
                        aria-label="المنتجات التالية"
                        initial="rest"
                        whileHover={!isAtEnd ? "hover" : "rest"}
                        className={`group flex absolute -left-2 sm:-left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 p-2 items-center justify-center focus:outline-none bg-transparent border-0 shadow-none transition-all duration-200 ${isAtEnd ? 'opacity-20 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer hover:scale-110 active:scale-95'
                            }`}
                    >
                        <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 overflow-visible">
                            <defs>
                                <mask id="arrowMaskLeftRel">
                                    <path d="M15 18l-6-6 6-6" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </mask>
                                <linearGradient id="shineGradLeftRel" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                                    <stop offset="50%" stopColor="white" stopOpacity="1" />
                                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Base Burgundy Arrow */}
                            <path d="M15 18l-6-6 6-6" fill="none" stroke="#800020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Shine Flash strictly restricted to Arrow Path */}
                            {!isAtEnd && (
                                <g mask="url(#arrowMaskLeftRel)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                                    <motion.rect
                                        y={0}
                                        width={16}
                                        height={24}
                                        fill="url(#shineGradLeftRel)"
                                        variants={{
                                            rest: { x: -24, opacity: 0 },
                                            hover: {
                                                x: [-24, 28],
                                                opacity: [0, 1, 1, 0],
                                                transition: {
                                                    duration: 0.75,
                                                    ease: "easeInOut",
                                                    repeat: Infinity,
                                                    repeatDelay: 0.75
                                                }
                                            }
                                        }}
                                    />
                                </g>
                            )}
                        </svg>
                    </motion.button>
                </div>
            </div>

        </div>
    );
}
