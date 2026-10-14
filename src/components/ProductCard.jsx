import React, { useMemo } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import RiyalIcon from './RiyalIcon';
import { useToast } from '../context/ToastContext';
import { useShop } from '../context/ShopContext';

export function ToggleIcon({ Icon, isActive, onClick, className = "", fillOnActive = false, activeFillColor = "currentColor", baseClass = "absolute z-30 w-10 h-10 rounded-xl bg-brand-cream shadow-sm" }) {
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
                    <Icon className="w-5 h-5" fill={isActive && fillOnActive ? activeFillColor : "none"} strokeWidth={1.5} />
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
                className={`relative ${p.inStock === false ? 'bg-black/10' : 'bg-white/20'} rounded-sm overflow-hidden aspect-[3/4] flex items-center justify-center p-6 transition-colors duration-300`}
            >

                {/* Badge (Top Right) */}
                {p.badge && (
                    <span className="absolute top-3 right-3 z-10 bg-[#800020] text-[#F0DFCD] text-xs font-bold px-3 py-1 rounded-sm pointer-events-none">
                        {p.badge}
                    </span>
                )}

                {/* Heart Icon (Top Left) */}
                <ToggleIcon
                    Icon={Heart}
                    isActive={isLiked}
                    onClick={handleToggleLike}
                    className="top-3 left-3"
                    fillOnActive={true}
                    activeFillColor="#800020"
                />

                {/* Cart Icon (Bottom Right) */}
                <ToggleIcon
                    Icon={ShoppingBag}
                    isActive={inCart}
                    onClick={handleToggleCart}
                    className="bottom-3 right-3"
                />

                {/* Background Overlay */}
                <div className="absolute inset-0 bg-transparent group-hover:bg-[#d8c3ae]/40 transition-all duration-500 z-0 pointer-events-none" />

                {/* Product Image */}
                <img src={p.img} alt={p.name} className={`relative z-10 ${p.cover ? 'w-full h-full object-cover' : 'w-full h-full object-contain'} transition-transform duration-500 group-hover:scale-110 drop-shadow-lg pointer-events-none`} />


            </div>

            {/* Product Details */}
            <div className="mt-3 px-1 flex flex-col pointer-events-none">
                <h4 className="font-bold text-[#800020]">{p.name}</h4>
                <p className="text-[#800020] font-black mt-1 flex items-center gap-1">
                    {typeof p.price === 'number' ? p.price.toFixed(2) : p.price} <RiyalIcon />
                </p>
            </div>
        </Link>
    );
}
