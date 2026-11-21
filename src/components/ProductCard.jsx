import React, { useMemo } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import RiyalIcon from './RiyalIcon';
import { useToast } from '../context/ToastContext';
import { useShop } from '../context/ShopContext';

export function ProductGridSkeleton({ count = 10 }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-6 animate-pulse" dir="rtl">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col">
                    <div className="aspect-[3/4] rounded-sm bg-white/40 overflow-hidden relative flex items-center justify-center p-4">
                        <div className="w-2/3 h-2/3 rounded-xl bg-[#800020]/10" />
                    </div>
                    <div className="mt-2.5 space-y-1.5 px-1">
                        <div className="h-4 bg-[#800020]/15 rounded-sm w-3/4" />
                        <div className="h-3.5 bg-[#800020]/20 rounded-sm w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ToggleIcon({ Icon, isActive, onClick, className = "", fillOnActive = false, activeFillColor = "currentColor", baseClass = "absolute z-30 w-7 h-7 @[180px]:w-8 @[180px]:h-8 @[240px]:w-10 @[240px]:h-10 rounded-lg @[240px]:rounded-xl bg-brand-cream shadow-xs @[240px]:shadow-sm" }) {
    const controls = useAnimation();

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const nextState = !isActive;
        onClick(nextState);

        if (nextState) {
            // Add: Swing / fall right then left
            await controls.start({
                rotate: [0, 45, -45, 20, -10, 0],
                transition: { duration: 0.6, ease: "easeInOut" }
            });
        } else {
            // Remove: Shake up and down
            await controls.start({
                y: [0, -6, 6, -6, 6, -3, 3, 0],
                transition: { duration: 0.5, ease: "easeInOut" }
            });
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`group/icon overflow-hidden transition-colors duration-500 ${baseClass} ${className}`}
        >
            {/* Smooth 45-degree angle Background Sweep (تغيّر لون بزاوية 45) */}
            <div className={`absolute inset-y-0 -left-[50%] w-[200%] bg-[#800020] skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] z-0
                ${isActive ? 'translate-x-0' : '-translate-x-full group-hover/icon:translate-x-0'}`}
            />

            {/* Icon Container */}
            <div className={`relative z-10 w-full h-full flex items-center justify-center transition-colors duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)]
                ${isActive ? 'text-[#F0DFCD]' : 'text-[#800020] group-hover/icon:text-[#F0DFCD]'}`}
            >
                <motion.div animate={controls} style={{ originX: 0.5, originY: 0.5 }}>
                    <Icon className="w-3.5 h-3.5 @[180px]:w-4 @[180px]:h-4 @[240px]:w-5 @[240px]:h-5" fill={isActive && fillOnActive ? activeFillColor : "none"} strokeWidth={1.5} />
                </motion.div>
            </div>
        </button>
    );
}

export default function ProductCard({ p, index = 0 }) {
    const navigate = useNavigate();
    const { isWishlisted, toggleWishlist, addToCart, removeFromCart, cartItems } = useShop();
    const isLiked = isWishlisted(p.id);
    const inCart = useMemo(() => cartItems.some(i => String(i.productId || i.id) === String(p.id)), [cartItems, p.id]);
    const { showToast } = useToast();

    const isRing = useMemo(() => {
        const cat = String(p.category?.name || p.category || '').toLowerCase();
        const subCat = String(p.subCategory || '').toLowerCase();
        const name = String(p.name || '').toLowerCase();
        return cat.includes('خواتم') || cat.includes('خاتم') ||
               subCat.includes('خواتم') || subCat.includes('خاتم') ||
               name.includes('خاتم') || name.includes('خواتم') || name.includes('دبلة') ||
               name.includes('أقراط') || name.includes('حلق');
    }, [p.category, p.subCategory, p.name]);

    const isWatch = useMemo(() => {
        const cat = String(p.category?.name || p.category || '').toLowerCase();
        const subCat = String(p.subCategory || '').toLowerCase();
        const name = String(p.name || '').toLowerCase();
        return cat.includes('ساعات') || cat.includes('ساعة') ||
               subCat.includes('ساعات') || subCat.includes('ساعة') ||
               name.includes('ساعة') || name.includes('ساعات');
    }, [p.category, p.subCategory, p.name]);

    const isOutOfStock = p.inStock === false || (p.stock_qty !== undefined && p.stock_qty !== null && Number(p.stock_qty) <= 0) || (p.stock !== undefined && p.stock !== null && Number(p.stock) <= 0);

    const handleToggleLike = (val) => {
        const added = toggleWishlist(p.id, p);
        showToast(added ? `تمت إضافة "${p.name}" إلى قائمة المفضلة` : `تمت إزالة "${p.name}" من المفضلة`);
    };

    const handleToggleCart = (val) => {
        if (isOutOfStock) {
            showToast(`عذراً، منتج "${p.name}" نفذت كميته حالياً`, 'error');
            return;
        }
        if (val) {
            // Must choose size & color before adding to cart
            showToast(`يرجى اختيار المقاس واللون المناسب لـ "${p.name}" أولاً`, 'info');
            navigate(`/product/${p.id || 1}`);
        } else {
            const cartEntry = cartItems.find(i => String(i.productId || i.id) === String(p.id));
            if (cartEntry) {
                removeFromCart(cartEntry.id);
            }
            showToast(`تمت إزالة "${p.name}" من السلة`);
        }
    };

    return (
        <Link to={`/product/${p.id || 1}`} className="@container group cursor-pointer block w-full">
            <div
                style={{ backgroundColor: isOutOfStock ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.2)' }}
                className={`relative ${isOutOfStock ? 'bg-black/10' : 'bg-white/20'} rounded-sm overflow-hidden aspect-[3/4] flex items-center justify-center p-2 @[180px]:p-2.5 @[240px]:p-3.5 transition-colors duration-300`}
            >

                {/* Badge (Top Right) */}
                {isOutOfStock ? (
                    <span className="absolute top-1.5 right-1.5 @[180px]:top-2 @[180px]:right-2 @[240px]:top-3 @[240px]:right-3 z-30 bg-[#490015] text-[#F0DFCD] text-[9px] @[180px]:text-[10px] @[240px]:text-xs font-black px-1.5 @[180px]:px-2 @[240px]:px-2.5 py-0.5 @[240px]:py-1 rounded-sm shadow-md pointer-events-none border border-[#F0DFCD]/20">
                        نفذت الكمية
                    </span>
                ) : p.badge ? (
                    <span className="absolute top-1.5 right-1.5 @[180px]:top-2 @[180px]:right-2 @[240px]:top-3 @[240px]:right-3 z-10 bg-[#800020] text-[#F0DFCD] text-[9px] @[180px]:text-[10px] @[240px]:text-xs font-bold px-1.5 @[180px]:px-2 @[240px]:px-3 py-0.5 @[240px]:py-1 rounded-sm pointer-events-none">
                        {p.badge}
                    </span>
                ) : null}

                {/* Heart Icon (Top Left) */}
                <ToggleIcon
                    Icon={Heart}
                    isActive={isLiked}
                    onClick={handleToggleLike}
                    className="top-1.5 left-1.5 @[180px]:top-2 @[180px]:left-2 @[240px]:top-3 @[240px]:left-3"
                    fillOnActive={true}
                    activeFillColor="#800020"
                />

                {/* Cart Icon (Bottom Right) */}
                <ToggleIcon
                    Icon={ShoppingBag}
                    isActive={inCart}
                    onClick={handleToggleCart}
                    className="bottom-1.5 right-1.5 @[180px]:bottom-2 @[180px]:right-2 @[240px]:bottom-3 @[240px]:right-3"
                />

                {/* Out of Stock Center Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[0.5px]">
                        <span className="bg-[#490015]/95 text-[#F0DFCD] text-[11px] @[180px]:text-xs @[240px]:text-sm font-black px-2.5 @[180px]:px-3.5 @[240px]:px-4 py-0.5 @[180px]:py-1 @[240px]:py-1.5 rounded-full shadow-lg border border-[#F0DFCD]/30 tracking-wide">
                            نفذت الكمية
                        </span>
                    </div>
                )}

                {/* Background Overlay */}
                <div className="absolute inset-0 bg-transparent group-hover:bg-[#d8c3ae]/40 transition-all duration-500 z-0 pointer-events-none" />

                {/* Product Image */}
                <img
                    src={p.img}
                    alt={p.name}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                    className={`relative z-10 ${
                        p.cover
                            ? 'w-full h-full object-cover'
                            : (isRing
                                ? 'max-h-[56%] max-w-[56%] object-contain'
                                : (isWatch
                                    ? 'max-h-[70%] max-w-[70%] object-contain'
                                    : 'w-full h-full object-contain'))
                    } ${isOutOfStock ? 'opacity-70 grayscale-[20%]' : ''} transition-all duration-500 ${
                        p.images && p.images.length > 1 && p.images[1] !== p.img ? 'group-hover:opacity-0' : 'group-hover:scale-110'
                    } drop-shadow-lg pointer-events-none`}
                />
                {p.images && p.images.length > 1 && p.images[1] !== p.img && (
                    <img
                        src={p.images[1]}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className={`absolute inset-0 z-10 m-auto ${
                            p.cover
                                ? 'w-full h-full object-cover'
                                : (isRing
                                    ? 'max-h-[56%] max-w-[56%] object-contain'
                                    : (isWatch
                                        ? 'max-h-[70%] max-w-[70%] object-contain'
                                        : 'p-2 @[240px]:p-3.5 w-full h-full object-contain'))
                        } transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110 drop-shadow-lg pointer-events-none`}
                    />
                )}

            </div>

            {/* Product Details */}
            <div className="mt-2 @[200px]:mt-2.5 @[260px]:mt-3 px-1 flex flex-col pointer-events-none">
                <h4 className="font-bold text-xs @[200px]:text-sm @[260px]:text-base text-[#800020] line-clamp-1">{p.name}</h4>
                <p className="text-[#800020] font-black mt-0.5 @[200px]:mt-1 text-xs @[200px]:text-sm @[260px]:text-base flex items-center gap-1">
                    {typeof p.price === 'number' ? p.price.toFixed(2) : p.price} <RiyalIcon className="w-3 h-3 @[200px]:w-3.5 @[200px]:h-3.5 @[260px]:w-4 @[260px]:h-4" />
                </p>
            </div>
        </Link>
    );
}
