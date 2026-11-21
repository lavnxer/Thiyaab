import React from 'react';
import { Heart, ShoppingBag, ShieldCheck, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { productsApi } from '../lib/api';

export default function Navbar() {
    const location = useLocation();
    const { user, profile, isAdmin } = useAuth();
    const { cartCount, wishlistCount } = useShop();

    const navLinks = [
        { label: 'الرجال', to: '/men' },
        { label: 'النساء', to: '/women' },
        { label: 'الإكسسوارات', to: '/accessories' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full px-2.5 min-[390px]:px-3.5 sm:px-8 lg:px-12 py-2.5 sm:py-5 flex items-center justify-between relative bg-[#F0DFCD] border-b border-[#800020]/10">
            {/* Navigation Links (Visible on Mobile, Tablet, and Desktop) */}
            <nav className="flex items-center gap-1.5 min-[390px]:gap-2 sm:gap-4 md:gap-6 lg:gap-8 z-10 shrink-0">
                {navLinks.map(l => (
                    <Link
                        key={l.to}
                        to={l.to}
                        onMouseEnter={() => {
                            if (l.to === '/men') productsApi.getAll({ gender: 'men' });
                            if (l.to === '/women') productsApi.getAll({ gender: 'women' });
                            if (l.to === '/accessories') productsApi.getAll({ gender: 'unisex' });
                        }}
                        onTouchStart={() => {
                            if (l.to === '/men') productsApi.getAll({ gender: 'men' });
                            if (l.to === '/women') productsApi.getAll({ gender: 'women' });
                            if (l.to === '/accessories') productsApi.getAll({ gender: 'unisex' });
                        }}
                        className={`text-[9.5px] min-[390px]:text-[10.5px] sm:text-sm lg:text-base font-bold transition hover:text-[#800020] whitespace-nowrap ${
                            location.pathname === l.to ? 'text-[#800020]' : 'text-[#800020]/70'
                        }`}
                    >
                        {l.label}
                    </Link>
                ))}
            </nav>

            {/* Centered Brand Logo */}
            <Link to="/" className="text-lg min-[390px]:text-xl sm:text-4xl lg:text-5xl font-black text-[#800020] tracking-tighter absolute left-1/2 -translate-x-1/2 whitespace-nowrap z-0 hover:opacity-90 transition-opacity">
                ثــيــاب
            </Link>

            {/* Quick Action Icons (Wishlist, Cart, Profile) */}
            <div className="flex items-center gap-2.5 sm:gap-5 lg:gap-6 shrink-0 z-10">
                {isAdmin && (
                    <Link 
                        to="/admin" 
                        className={`flex items-center gap-1 sm:gap-2 transition font-bold text-xs sm:text-base lg:text-lg ${
                            location.pathname.startsWith('/admin') ? 'text-[#800020]' : 'text-[#800020]/70 hover:text-[#800020]'
                        }`}
                        title="لوحة الإدارة التنفيذية"
                    >
                        <span className="hidden lg:inline text-xs">الإدارة</span>
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                )}

                <Link 
                    to="/wishlist" 
                    className={`flex items-center gap-1 sm:gap-2 relative transition font-bold text-xs sm:text-base lg:text-lg ${
                        location.pathname === '/wishlist' ? 'text-[#800020]' : 'text-[#800020]/70 hover:text-[#800020]'
                    }`}
                    title="المفضلة"
                >
                    <span className="hidden lg:inline text-xs">المفضلة</span>
                    <div className="relative flex items-center justify-center">
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                        {wishlistCount > 0 && (
                            <motion.span 
                                key={`wish-${wishlistCount}`}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 min-w-3.5 h-3.5 sm:min-w-4 sm:h-4 px-1 rounded-full bg-[#800020] text-[#F0DFCD] text-[9px] sm:text-[10px] font-bold flex items-center justify-center leading-none pointer-events-none"
                            >
                                {wishlistCount}
                            </motion.span>
                        )}
                    </div>
                </Link>

                <Link 
                    to="/cart" 
                    className={`flex items-center gap-1 sm:gap-2 relative transition font-bold text-xs sm:text-base lg:text-lg ${
                        location.pathname === '/cart' ? 'text-[#800020]' : 'text-[#800020]/70 hover:text-[#800020]'
                    }`}
                    title="سلة التسوق"
                >
                    <span className="hidden lg:inline text-xs">السلة</span>
                    <div className="relative flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                        {cartCount > 0 && (
                            <motion.span 
                                key={`cart-${cartCount}`}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 min-w-3.5 h-3.5 sm:min-w-4 sm:h-4 px-1 rounded-full bg-[#800020] text-[#F0DFCD] text-[9px] sm:text-[10px] font-bold flex items-center justify-center leading-none pointer-events-none"
                            >
                                {cartCount}
                            </motion.span>
                        )}
                    </div>
                </Link>

                {user ? (
                    <Link 
                        to="/account" 
                        className={`flex items-center gap-1 sm:gap-2 transition font-bold text-xs sm:text-base lg:text-lg ${
                            location.pathname === '/account' ? 'text-[#800020]' : 'text-[#800020]/70 hover:text-[#800020]'
                        }`}
                        title={profile?.full_name || user.email}
                    >
                        <span className="hidden lg:inline max-w-[100px] truncate text-xs">
                            {profile?.full_name || 'حسابي'}
                        </span>
                        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#800020]/15 flex items-center justify-center border border-[#800020]/30 text-[#800020] font-bold text-[9px] sm:text-xs">
                            {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                        </div>
                    </Link>
                ) : (
                    <Link 
                        to="/login" 
                        className={`flex items-center gap-1 sm:gap-2 transition font-bold text-xs sm:text-base lg:text-lg ${
                            location.pathname === '/login' ? 'text-[#800020]' : 'text-[#800020]/70 hover:text-[#800020]'
                        }`}
                        title="تسجيل الدخول"
                    >
                        <span className="hidden sm:inline text-xs">دخول</span>
                        <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                )}
            </div>
        </header>
    );
}
