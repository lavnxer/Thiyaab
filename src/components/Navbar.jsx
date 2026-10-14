import React from 'react';
import { Heart, User, ShoppingBag, ShieldCheck, LogIn, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

export default function Navbar() {
    const location = useLocation();
    const { user, profile, isAdmin, signOut } = useAuth();
    const { cartCount, wishlistCount } = useShop();

    const navLinks = [
        { label: 'الرجال', to: '/men' },
        { label: 'النساء', to: '/women' },
        { label: 'الإكسسوارات', to: '/accessories' },
    ];

    return (
        <header className="w-full px-4 sm:px-8 lg:px-12 py-4 sm:py-6 flex items-center justify-between relative z-50 bg-[#F0DFCD]">
            <nav className="flex items-center gap-3 sm:gap-6 lg:gap-8">
                {navLinks.map(l => (
                    <Link
                        key={l.to}
                        to={l.to}
                        className={`text-sm sm:text-base lg:text-lg font-bold transition hover:text-[#800020] ${location.pathname === l.to ? 'text-[#800020]' : 'text-[#800020]/70'}`}
                    >
                        {l.label}
                    </Link>
                ))}
            </nav>

            <Link to="/" className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#800020] tracking-tighter absolute left-1/2 -translate-x-1/2">
                ثــيــاب
            </Link>

            <div className="flex items-center gap-3 sm:gap-5 lg:gap-6">
                {isAdmin && (
                    <Link 
                        to="/admin" 
                        className={`flex items-center gap-1.5 sm:gap-2 transition font-bold text-sm sm:text-base lg:text-lg ${
                            location.pathname.startsWith('/admin') ? 'text-[#800020]' : 'text-[#800020]/70 hover:text-[#800020]'
                        }`}
                        title="لوحة الإدارة التنفيذية"
                    >
                        <span className="hidden md:inline">الإدارة</span>
                        <ShieldCheck className="w-5 h-5" />
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" title="مشرف مسجل" />
                    </Link>
                )}

                <Link 
                    to="/wishlist" 
                    className={`flex items-center gap-1.5 sm:gap-2 relative transition font-bold text-sm sm:text-base lg:text-lg ${
                        location.pathname === '/wishlist' ? 'text-[#800020]' : 'text-[#800020]/70 hover:text-[#800020]'
                    }`}
                >
                    <span className="hidden sm:inline">المفضلة</span>
                    <div className="relative">
                        <Heart className="w-5 h-5" />
                        {wishlistCount > 0 && (
                            <motion.span 
                                key={`wish-${wishlistCount}`}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#800020] text-[#F0DFCD] text-[10px] font-bold flex items-center justify-center leading-none pointer-events-none"
                            >
                                {wishlistCount}
                            </motion.span>
                        )}
                    </div>
                </Link>

                <Link 
                    to="/cart" 
                    className={`flex items-center gap-1.5 sm:gap-2 relative transition font-bold text-sm sm:text-base lg:text-lg ${
                        location.pathname === '/cart' ? 'text-[#800020]' : 'text-[#800020]/70 hover:text-[#800020]'
                    }`}
                >
                    <span className="hidden sm:inline">السلة</span>
                    <div className="relative">
                        <ShoppingBag className="w-5 h-5" />
                        {cartCount > 0 && (
                            <motion.span 
                                key={`cart-${cartCount}`}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#800020] text-[#F0DFCD] text-[10px] font-bold flex items-center justify-center leading-none pointer-events-none"
                            >
                                {cartCount}
                            </motion.span>
                        )}
                    </div>
                </Link>

                {user ? (
                    <Link 
                        to="/account" 
                        className={`flex items-center gap-1.5 sm:gap-2 transition font-bold text-sm sm:text-base lg:text-lg ${
                            location.pathname === '/account' ? 'text-[#800020]' : 'text-[#800020]/70 hover:text-[#800020]'
                        }`}
                        title={profile?.full_name || user.email}
                    >
                        <span className="hidden sm:inline max-w-[120px] truncate">
                            {profile?.full_name || 'حسابي'}
                        </span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#800020]/15 flex items-center justify-center border border-[#800020]/30 text-[#800020] font-bold text-xs">
                            {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                        </div>
                    </Link>
                ) : (
                    <Link 
                        to="/login" 
                        className="flex items-center gap-1.5 sm:gap-2 text-[#800020] bg-[#800020]/10 hover:bg-[#800020]/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full transition font-bold text-sm sm:text-base"
                    >
                        <span className="hidden sm:inline">دخول</span>
                        <LogIn className="w-4 h-4" />
                    </Link>
                )}
            </div>
        </header>
    );
}
