import React, { useState } from 'react';
import { ChevronDown, X, SlidersHorizontal, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RiyalIcon from './RiyalIcon';

const Section = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-[#800020]/10 py-5">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center justify-between text-[#800020] font-black text-base mb-1 group"
            >
                <span className="group-hover:translate-x-1 transition-transform">{title}</span>
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <ChevronDown className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, filter: "blur(4px)" }}
                        animate={{ height: 'auto', opacity: 1, filter: "blur(0px)" }}
                        exit={{ height: 0, opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const COLORS = [
    { label: 'أسود', hex: '#1a1a1a' },
    { label: 'أبيض', hex: '#ffffff' },
    { label: 'أوف وايت', hex: '#f5f5f0' },
    { label: 'رمادي', hex: '#7a7a7a' },
    { label: 'كحلي', hex: '#1c2d50' },
    { label: 'أزرق', hex: '#4b6b8f' },
    { label: 'بيج', hex: '#c8a882' },
    { label: 'كاكي', hex: '#b0a38b' },
    { label: 'جملي', hex: '#a87e59' },
    { label: 'بني', hex: '#5c3e2e' },
    { label: 'زيتي', hex: '#4a5240' },
    { label: 'عنابي', hex: '#800020' },
];

const SIZES_CLOTHES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const SIZES_SHOES = ['38', '39', '40', '41', '42', '43', '44', '45'];
const PRICE_MAX = 2000;

const toEnglishDigits = (val) => {
    return String(val ?? '')
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
        .replace(/[^0-9]/g, '');
};

export default function FilterSidebar({ filters, setFilters, totalProducts, isMen = true, isOpen, onClose }) {
    const { colors, sizes, priceMax, priceMin } = filters;

    const toggleArr = (arr, val) =>
        arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

    const hasActive = colors.length > 0 || sizes.length > 0 || priceMin > 0 || priceMax < PRICE_MAX;

    const drawerVariants = {
        hidden: {
            x: '100%',
            scale: 0.95,
            borderTopLeftRadius: '100px',
            borderBottomLeftRadius: '100px',
            opacity: 0,
        },
        visible: {
            x: 0,
            scale: 1,
            borderTopLeftRadius: '0px',
            borderBottomLeftRadius: '0px',
            opacity: 1,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 200,
                mass: 0.8,
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        },
        exit: {
            x: '100%',
            scale: 0.95,
            borderTopLeftRadius: '100px',
            borderBottomLeftRadius: '100px',
            opacity: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 200
            }
        },
    };

    const overlayVariants = {
        hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
        visible: { opacity: 1, backdropFilter: 'blur(8px)', transition: { duration: 0.5 } },
        exit: { opacity: 0, backdropFilter: 'blur(0px)', transition: { duration: 0.4 } },
    };

    const childVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95, filter: "blur(4px)" },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: { type: "spring", damping: 20, stiffness: 300 }
        }
    };

    const badgeVariants = {
        hidden: { opacity: 0, scale: 0.5, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.5 } },
        exit: { opacity: 0, scale: 0.5, y: -10, transition: { duration: 0.2 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        key="overlay"
                        variants={overlayVariants}
                        initial="hidden" animate="visible" exit="exit"
                        onClick={onClose}
                        className="fixed inset-0 bg-[#2b1810]/30 z-[60]"
                    />

                    {/* Drawer */}
                    <motion.aside
                        key="filter"
                        variants={drawerVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="fixed top-0 right-0 h-full w-[350px] bg-[#F0DFCD] z-[70] flex flex-col overflow-hidden shadow-[-20px_0_40px_rgba(128,0,32,0.15)]"
                        dir="rtl"
                    >
                        {/* Header */}
                        <motion.div variants={childVariants} className="flex items-center justify-between p-6 border-b border-[#800020]/10 shrink-0">
                            <div className="flex items-center gap-3 text-[#800020]">
                                <motion.div
                                    animate={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                >
                                    <SlidersHorizontal className="w-5 h-5" />
                                </motion.div>
                                <span className="font-black text-xl">الفلاتر</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="text-[#800020]/60 hover:text-[#800020] transition p-1 bg-[#800020]/5 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>
                        </motion.div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2">
                            <motion.div variants={childVariants} className="flex items-center justify-between mb-2">
                                <p className="text-[#800020]/50 text-sm font-bold">{totalProducts} منتج مطابق</p>
                                <AnimatePresence>
                                    {hasActive && (
                                        <motion.button
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setFilters({ colors: [], sizes: [], priceMin: 0, priceMax: PRICE_MAX })}
                                            className="text-xs text-[#800020] hover:bg-[#800020]/10 transition-colors flex items-center gap-1 font-black bg-[#800020]/5 px-3 py-1.5 rounded-full"
                                        >
                                            <X className="w-3 h-3" />
                                            مسح الكل
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Price Range */}
                            <motion.div variants={childVariants}>
                                <Section title="السعر">
                                    <div className="flex flex-col gap-5">
                                        <div className="flex items-center justify-between text-sm font-black text-[#800020]">
                                            <span className="flex items-center gap-1 font-sans font-bold">{filters.priceMin} <RiyalIcon /></span>
                                            <span className="flex items-center gap-1 font-sans font-bold">{filters.priceMax} <RiyalIcon /></span>
                                        </div>

                                        {/* Custom Range Slider (One-Sided) */}
                                        <div className="relative pt-2 pb-2" dir="ltr">
                                            <div className="h-1.5 bg-[#800020]/15 rounded-full relative">
                                                <div
                                                    className="absolute h-full bg-[#800020] rounded-full shadow-[0_0_10px_rgba(128,0,32,0.3)] transition-all duration-75"
                                                    style={{
                                                        right: `${(filters.priceMin / PRICE_MAX) * 100}%`,
                                                        left: `${100 - (filters.priceMax / PRICE_MAX) * 100}%`,
                                                    }}
                                                >
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-[#800020] border-2 border-[#F0DFCD] rounded-full shadow-md pointer-events-none" />
                                                </div>
                                            </div>
                                            <input
                                                type="range" min={0} max={PRICE_MAX} step={50}
                                                value={PRICE_MAX - filters.priceMax}
                                                onChange={e => {
                                                    const mappedValue = PRICE_MAX - Number(e.target.value);
                                                    setFilters(f => ({ ...f, priceMax: Math.max(f.priceMin, mappedValue) }));
                                                }}
                                                className="absolute inset-0 w-full opacity-0 cursor-pointer h-8 -top-3 z-30"
                                            />
                                        </div>

                                        {/* Manual Inputs */}
                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            <div>
                                                <label className="text-[#800020]/60 text-[10px] font-bold mb-1 flex items-center gap-0.5">من (<RiyalIcon size="0.85em" />)</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        dir="ltr"
                                                        lang="en"
                                                        value={toEnglishDigits(filters.priceMin)}
                                                        onChange={e => {
                                                            const cleaned = toEnglishDigits(e.target.value);
                                                            const val = cleaned === '' ? 0 : Number(cleaned);
                                                            setFilters(f => ({ ...f, priceMin: Math.max(0, Math.min(f.priceMax, val)) }));
                                                        }}
                                                        className="w-full bg-[#800020]/5 border border-[#800020]/20 rounded-md px-3 py-2 text-[#800020] text-sm font-bold font-sans text-right focus:outline-none focus:border-[#800020] transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[#800020]/60 text-[10px] font-bold mb-1 flex items-center gap-0.5">إلى (<RiyalIcon size="0.85em" />)</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        dir="ltr"
                                                        lang="en"
                                                        value={toEnglishDigits(filters.priceMax)}
                                                        onChange={e => {
                                                            const cleaned = toEnglishDigits(e.target.value);
                                                            const val = cleaned === '' ? 0 : Number(cleaned);
                                                            setFilters(f => ({ ...f, priceMax: Math.max(f.priceMin, Math.min(PRICE_MAX, val)) }));
                                                        }}
                                                        className="w-full bg-[#800020]/5 border border-[#800020]/20 rounded-md px-3 py-2 text-[#800020] text-sm font-bold font-sans text-right focus:outline-none focus:border-[#800020] transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Section>
                            </motion.div>

                            {/* Colors */}
                            <motion.div variants={childVariants}>
                                <Section title="اللون">
                                    <div className="grid grid-cols-4 gap-4">
                                        {COLORS.map(c => {
                                            const active = colors.includes(c.label);
                                            return (
                                                <motion.button
                                                    whileHover={{ scale: 1.1, y: -2 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    key={c.label}
                                                    aria-label={c.label}
                                                    onClick={() => setFilters(f => ({ ...f, colors: toggleArr(f.colors, c.label) }))}
                                                    className={`flex flex-col items-center gap-2 group`}
                                                >
                                                    <div
                                                        className={`relative w-10 h-10 rounded-full transition-shadow duration-300 flex items-center justify-center shadow-[0_0_0_1px_rgba(128,0,32,0.2)] group-hover:shadow-[0_0_0_1px_rgba(128,0,32,0.5)]`}
                                                        style={{ background: c.hex }}
                                                    >
                                                        <AnimatePresence>
                                                            {active && (
                                                                <motion.div
                                                                    initial={{ scale: 0, rotate: -45, opacity: 0 }}
                                                                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                                                    exit={{ scale: 0, rotate: 45, opacity: 0 }}
                                                                    transition={{ type: "spring", bounce: 0.6 }}
                                                                    className={`absolute inset-0 flex items-center justify-center`}
                                                                >
                                                                    <Check className={`w-5 h-5 ${c.hex === '#ffffff' || c.hex === '#f5f5f0' ? 'text-[#800020]' : 'text-white'}`} strokeWidth={4} />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                    <span className="text-[11px] font-black text-[#800020]/70 leading-none">{c.label}</span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </Section>
                            </motion.div>

                            {/* Size — Clothes */}
                            <motion.div variants={childVariants}>
                                <Section title="المقاس">
                                    <div className="flex flex-wrap gap-2 relative">
                                        {SIZES_CLOTHES.map(s => {
                                            const active = sizes.includes(s);
                                            return (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    key={s}
                                                    onClick={() => setFilters(f => ({ ...f, sizes: toggleArr(f.sizes, s) }))}
                                                    className={`relative w-12 h-10 text-sm font-black rounded-lg flex items-center justify-center transition-colors z-10 border ${active ? 'text-[#F0DFCD] border-transparent' : 'text-[#800020] border-[#800020]/20 hover:border-[#800020]/50 hover:bg-[#800020]/5'
                                                        }`}
                                                >
                                                    <AnimatePresence>
                                                        {active && (
                                                            <motion.div
                                                                layoutId={`size-bg-${s}`}
                                                                className="absolute inset-0 bg-[#800020] rounded-lg -z-10 shadow-md"
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                transition={{ type: "spring", bounce: 0.3 }}
                                                            />
                                                        )}
                                                    </AnimatePresence>
                                                    {s}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {isMen && (
                                        <>
                                            <p className="text-[#800020]/50 text-xs font-bold mt-5 mb-3">مقاس الحذاء</p>
                                            <div className="flex flex-wrap gap-2">
                                                {SIZES_SHOES.map(s => {
                                                    const shoeSize = `shoe-${s}`;
                                                    const active = sizes.includes(shoeSize);
                                                    return (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            key={shoeSize}
                                                            onClick={() => setFilters(f => ({ ...f, sizes: toggleArr(f.sizes, shoeSize) }))}
                                                            className={`relative w-12 h-10 text-xs font-black rounded-lg flex items-center justify-center transition-colors z-10 border ${active ? 'text-[#F0DFCD] border-transparent' : 'text-[#800020] border-[#800020]/20 hover:border-[#800020]/50 hover:bg-[#800020]/5'
                                                                }`}
                                                        >
                                                            <AnimatePresence>
                                                                {active && (
                                                                    <motion.div
                                                                        layoutId={`shoe-bg-${s}`}
                                                                        className="absolute inset-0 bg-[#800020] rounded-lg -z-10 shadow-md"
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                                        transition={{ type: "spring", bounce: 0.3 }}
                                                                    />
                                                                )}
                                                            </AnimatePresence>
                                                            {s}
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </Section>
                            </motion.div>

                            {/* Active Filters Display */}
                            <AnimatePresence>
                                {hasActive && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 pb-6 flex flex-wrap gap-2"
                                    >
                                        <AnimatePresence>
                                            {colors.map(c => (
                                                <motion.span
                                                    layout
                                                    variants={badgeVariants}
                                                    initial="hidden" animate="visible" exit="exit"
                                                    key={c}
                                                    className="flex items-center gap-1.5 bg-[#800020]/10 text-[#800020] border border-[#800020]/20 text-xs font-bold px-3 py-1.5 rounded-full"
                                                >
                                                    {c}
                                                    <button
                                                        onClick={() => setFilters(f => ({ ...f, colors: f.colors.filter(x => x !== c) }))}
                                                        className="hover:bg-[#800020]/20 rounded-full p-0.5 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </motion.span>
                                            ))}
                                            {sizes.map(s => (
                                                <motion.span
                                                    layout
                                                    variants={badgeVariants}
                                                    initial="hidden" animate="visible" exit="exit"
                                                    key={s}
                                                    className="flex items-center gap-1.5 bg-[#800020]/10 text-[#800020] border border-[#800020]/20 text-xs font-bold px-3 py-1.5 rounded-full"
                                                >
                                                    {s.replace('shoe-', '')}
                                                    <button
                                                        onClick={() => setFilters(f => ({ ...f, sizes: f.sizes.filter(x => x !== s) }))}
                                                        className="hover:bg-[#800020]/20 rounded-full p-0.5 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </motion.span>
                                            ))}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer (Apply Button) */}
                        <div className="shrink-0 p-6 bg-[#F0DFCD] border-t border-[#800020]/10 z-10 relative">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="w-full py-4 bg-[#800020] text-[#F0DFCD] font-black rounded-xl shadow-lg relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    عرض {totalProducts} منتجات
                                </span>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%]"
                                    animate={{ translateX: ['-150%', '150%'] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1 }}
                                />
                            </motion.button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
