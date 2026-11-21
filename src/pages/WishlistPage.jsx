import React from 'react';
import { Trash2, Heart, ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import RiyalIcon from '../components/RiyalIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { useShop } from '../context/ShopContext';

const getCategoryPath = (cat) => {
    switch (cat) {
        case 'إكسسوارات':
        case 'اكسسوارات':
            return '/accessories';
        case 'أحذية':
        case 'احذية':
            return '/men?category=أحذية';
        case 'أزياء':
        case 'ازياء':
            return '/men';
        case 'كنزات':
            return '/men?category=قمصان';
        default:
            return '/men';
    }
};

export default function WishlistPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { wishlistItems, removeFromWishlist, clearWishlist, addToCart } = useShop();

    const handleAddToCart = (item) => {
        showToast(`يرجى تحديد المقاس واللون لـ "${item.name}" لإتمام الإضافة للسلة`, 'info');
        navigate(`/product/${item.productId || item.id}`);
    };

    const handleRemove = (id) => {
        const item = wishlistItems.find(i => String(i.id || i.productId) === String(id));
        removeFromWishlist(id);
        showToast(item ? `تمت إزالة "${item.name}" من المفضلة` : 'تمت إزالة المنتج من المفضلة');
    };

    const handleClearAll = () => {
        clearWishlist();
        showToast('تم تفريغ قائمة المفضلة بنجاح');
    };

    return (
        <div dir="rtl" className="min-h-[100dvh] bg-brand-cream/20 text-[#800020] font-arabic pt-20 sm:pt-28 pb-16 sm:pb-20 w-full overflow-x-clip">
            <div className="container mx-auto px-2.5 sm:px-6 max-w-7xl">
                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-20 opacity-60">
                        <Heart className="w-24 h-24" />
                        <p className="text-2xl font-bold">مفضلتك فارغة</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between gap-4 mb-5 sm:mb-8 pb-3 sm:pb-5 border-b border-[#800020]/10">
                            <div>
                                <h1 className="text-2xl sm:text-4xl font-black text-[#800020]">قائمة المفضلة</h1>
                                <p className="text-xs sm:text-base text-[#800020]/70 font-medium mt-0.5 sm:mt-1">
                                    لديك {wishlistItems.length} منتجات في قائمتك
                                </p>
                            </div>

                            <button
                                onClick={handleClearAll}
                                className="shine-text-btn group relative flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#800020] bg-transparent border-0 cursor-pointer p-1 active:scale-95 transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shine-icon" />
                                <span className="shine-text-label">حذف الكل</span>
                            </button>
                        </div>

                        {/* Products Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
                        <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        <AnimatePresence mode="popLayout">
                            {wishlistItems.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                                    key={item.id}
                                    style={{
                                        backgroundColor: item.inStock ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                                    }}
                                    className={`${
                                        item.inStock
                                            ? 'bg-white/20 border-[#800020]/15 hover:border-[#800020]/30'
                                            : 'bg-black/10 border-black/10 hover:border-black/20'
                                    } backdrop-blur-xs rounded-xl sm:rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col border group`}
                                >
                                    {/* Image Container with Badges */}
                                    <div className="relative w-full aspect-square bg-transparent flex items-center justify-center p-2.5 sm:p-5 overflow-hidden">
                                        {/* Discount Badge (Top Right in RTL) */}
                                        {item.discountText && (
                                            <span className="absolute top-1.5 right-1.5 sm:top-3.5 sm:right-3.5 z-20 bg-[#800020] text-[#F0DFCD] text-[9.5px] sm:text-[11px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs pointer-events-none">
                                                {item.discountText}
                                            </span>
                                        )}

                                        {/* Trash / Delete Button (Top Left in RTL) */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(item.id);
                                            }}
                                            className="shine-text-btn group !absolute top-1 left-1 sm:top-3.5 sm:left-3.5 z-20 p-1 sm:p-1.5 bg-transparent border-0 cursor-pointer active:scale-90"
                                            title="إزالة من المفضلة"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2] shine-icon" />
                                        </button>

                                        {/* Out of Stock Overlay Badge in Center */}
                                        {!item.inStock && (
                                            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                                <span className="bg-[#800020] text-[#F0DFCD] text-[9px] sm:text-xs font-black px-2 py-0.5 sm:px-3.5 sm:py-1 rounded-full shadow-md border border-[#F0DFCD]/20">
                                                    نفدت الكمية
                                                </span>
                                            </div>
                                        )}

                                        {/* Product Image Link */}
                                        <Link to={`/product/${item.id}`} className="w-full h-full flex items-center justify-center cursor-pointer">
                                            <img
                                                src={item.img}
                                                alt={item.name}
                                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 drop-shadow-xs"
                                            />
                                        </Link>
                                    </div>

                                    {/* Card Details */}
                                    <div className="p-2.5 sm:p-5 flex flex-col flex-1 justify-between text-right">
                                        <div>
                                            {/* Title */}
                                            <Link to={`/product/${item.id}`} className="block group/title no-underline hover:no-underline">
                                                <h3 className="font-bold sm:font-black text-xs sm:text-base text-[#800020] group-hover/title:text-[#600018] transition-colors truncate no-underline hover:no-underline">
                                                    {item.name}
                                                </h3>
                                            </Link>

                                            {/* Stars & Review count (Navigates to Customer Reviews) */}
                                            <Link
                                                to={`/product/${item.id}/reviews`}
                                                state={{ product: item }}
                                                className="inline-flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 mb-1.5 sm:mb-2.5 cursor-pointer group/rating hover:opacity-85 transition-all w-fit no-underline hover:no-underline"
                                            >
                                                <div className="flex items-center text-amber-500 group-hover/rating:scale-105 transition-transform duration-200">
                                                    {[...Array(5)].map((_, idx) => (
                                                        <Star
                                                            key={idx}
                                                            className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${
                                                                idx < item.rating
                                                                    ? 'fill-amber-500 text-amber-500'
                                                                    : 'text-[#800020]/20 fill-transparent'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] sm:text-xs text-[#800020]/70 group-hover/rating:text-[#800020] font-bold transition-colors no-underline hover:no-underline">
                                                    ({item.reviewsCount})
                                                </span>
                                            </Link>

                                            {/* Price & Category Row */}
                                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pt-0.5 sm:pt-1 gap-0.5 sm:gap-0">
                                                <div className="flex items-baseline gap-1 sm:gap-2">
                                                    <span className="text-xs sm:text-lg font-black text-[#800020] flex items-center gap-0.5 sm:gap-1">
                                                        {item.price.toFixed(2)} <RiyalIcon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#800020]" />
                                                    </span>
                                                    {item.oldPrice && (
                                                        <span className="text-[10px] sm:text-xs text-[#800020]/45 line-through font-semibold flex items-center gap-0.5">
                                                            {item.oldPrice.toFixed(2)} <RiyalIcon className="w-2 h-2 sm:w-3 sm:h-3 text-[#800020]/45" />
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Category Link Button (Left under product in RTL) */}
                                                <Link
                                                    to={getCategoryPath(item.category)}
                                                    className="text-[10px] sm:text-xs text-[#800020]/75 hover:text-[#800020] font-bold transition-colors cursor-pointer no-underline hover:no-underline truncate"
                                                >
                                                    {item.category}
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-2 sm:pt-3.5">
                                            {item.inStock ? (
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleAddToCart(item)}
                                                    className="shine-button w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm bg-[#800020] hover:bg-[#66001a] text-[#F0DFCD] flex items-center justify-center gap-1 sm:gap-2 shadow-xs transition-all duration-200 cursor-pointer"
                                                >
                                                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 shrink-0" />
                                                    <span className="relative z-10 whitespace-nowrap">أضف للسلة</span>
                                                </motion.button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm bg-[#800020]/10 text-[#800020]/50 cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2"
                                                >
                                                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50 shrink-0" />
                                                    <span className="whitespace-nowrap">نفدت الكمية</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
