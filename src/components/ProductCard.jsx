import React, { useMemo } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import RiyalIcon from './RiyalIcon';
import { useToast } from '../context/ToastContext';
import { useShop } from '../context/ShopContext';

export function ToggleIcon({ Icon, isActive, onClick, className = "", fillOnActive = false, activeFillColor = "currentColor", baseClass = "absolute z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-brand-cream shadow-xs sm:shadow-sm" }) {
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
            {/* Smooth Background */}
            <div className={`absolute inset-y-0 -left-[50%] w-[200%] bg-[#800020] skew-x-[15deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] z-0
                ${isActive ? 'translate-x-0' : '-translate-x-full group-hover/icon:translate-x-0'}`}
            />

            {/* Icon Container */}
            <div className={`relative z-10 w-full h-full flex items-center justify-center transition-colors duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)]
                ${isActive ? 'text-[#F0DFCD]' : 'text-[#800020] group-hover/icon:text-[#F0DFCD]'}`}
            >
                <motion.div animate={controls} style={{ originX: 0.5, originY: 0.5 }}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" fill={isActive && fillOnActive ? activeFillColor : "none"} strokeWidth={1.5} />
                </motion.div>
            </div>
        </button>
    );
}

export default function ProductCard({ p }) {
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

    const handleToggleLike = (val) => {
        const added = toggleWishlist(p.id, p);
        showToast(added ? `تمت إضافة "${p.name}" إلى قائمة المفضلة` : `تمت إزالة "${p.name}" من المفضلة`);
    };

    const handleToggleCart = (val) => {
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
        <Link to={`/product/${p.id || 1}`} className="group cursor-pointer block">
            <div
                style={{ backgroundColor: p.inStock === false ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)' }}
                className={`relative ${p.inStock === false ? 'bg-black/10' : 'bg-white/20'} rounded-sm overflow-hidden aspect-[3/4] flex items-center justify-center p-2 sm:p-3.5 transition-colors duration-300`}
            >

                {/* Badge (Top Right) */}
                {p.badge && (
                    <span className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-[#800020] text-[#F0DFCD] text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-sm pointer-events-none">
                        {p.badge}
                    </span>
                )}

                {/* Heart Icon (Top Left) */}
                <ToggleIcon
                    Icon={Heart}
                    isActive={isLiked}
                    onClick={handleToggleLike}
                    className="top-2 left-2 sm:top-3 sm:left-3"
                    fillOnActive={true}
                    activeFillColor="#800020"
                />

                {/* Cart Icon (Bottom Right) */}
                <ToggleIcon
                    Icon={ShoppingBag}
                    isActive={inCart}
                    onClick={handleToggleCart}
                    className="bottom-2 right-2 sm:bottom-3 sm:right-3"
                />

                {/* Background Overlay */}
                <div className="absolute inset-0 bg-transparent group-hover:bg-[#d8c3ae]/40 transition-all duration-500 z-0 pointer-events-none" />

                {/* Product Image */}
                <img
                    src={p.img}
                    alt={p.name}
                    className={`relative z-10 ${
                        p.cover
                            ? 'w-full h-full object-cover'
                            : (isRing
                                ? 'max-h-[56%] max-w-[56%] object-contain'
                                : (isWatch
                                    ? 'max-h-[70%] max-w-[70%] object-contain'
                                    : 'w-full h-full object-contain'))
                    } transition-all duration-500 ${
                        p.images && p.images.length > 1 && p.images[1] !== p.img ? 'group-hover:opacity-0' : 'group-hover:scale-110'
                    } drop-shadow-lg pointer-events-none`}
                />
                {p.images && p.images.length > 1 && p.images[1] !== p.img && (
                    <img
                        src={p.images[1]}
                        alt={p.name}
                        className={`absolute inset-0 z-10 m-auto ${
                            p.cover
                                ? 'w-full h-full object-cover'
                                : (isRing
                                    ? 'max-h-[56%] max-w-[56%] object-contain'
                                    : (isWatch
                                        ? 'max-h-[70%] max-w-[70%] object-contain'
                                        : 'p-2 sm:p-3.5 w-full h-full object-contain'))
                        } transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110 drop-shadow-lg pointer-events-none`}
                    />
                )}

            </div>

            {/* Product Details */}
            <div className="mt-2 sm:mt-3 px-1 flex flex-col pointer-events-none">
                <h4 className="font-bold text-xs sm:text-base text-[#800020] line-clamp-1">{p.name}</h4>
                <p className="text-[#800020] font-black mt-0.5 sm:mt-1 text-xs sm:text-base flex items-center gap-1">
                    {typeof p.price === 'number' ? p.price.toFixed(2) : p.price} <RiyalIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </p>
            </div>
        </Link>
    );
}
