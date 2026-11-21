import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard';
import { productsApi } from '../lib/api';

const CACHE_KEY = 'thyiaab_cache_products_women';

const stagger = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' }
    })
};

const categoryFilters = ['الكل', 'إطلالات', 'فساتين', 'عبايات', 'قمصان', 'بناطيل', 'أحذية', 'حقائب'];
const PRICE_MAX = 2000;

export default function WomenPage() {
    const [activeCategory, setActiveCategory] = useState('الكل');
    const [sideFilters, setSideFilters] = useState({ colors: [], sizes: [], priceMin: 0, priceMax: PRICE_MAX });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    // Instant SWR state: Load from localStorage immediately so products appear in 0 ms!
    const [products, setProducts] = useState(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch {}
        return [];
    });
    const [loading, setLoading] = useState(() => products.length === 0);

    useEffect(() => {
        let isMounted = true;
        async function fetchProducts() {
            try {
                const { data } = await productsApi.getAll({ gender: 'women' });
                if (!isMounted || !data) return;
                const mapped = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: Number(p.price),
                    img: p.image_url || (Array.isArray(p.images) && p.images[0]) || '/images/winter_outfit_transparent.png',
                    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : []),
                    badge: p.is_new ? 'جديد' : (p.is_featured ? 'مميز' : null),
                    category: p.category?.name || 'فساتين',
                    cover: false,
                    inStock: p.in_stock !== false && (p.stock_qty === null || p.stock_qty === undefined || p.stock_qty > 0)
                }));
                setProducts(mapped);
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
                } catch {}
            } catch (err) {
                console.error('Error fetching women products from Supabase:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchProducts();
        return () => { isMounted = false; };
    }, []);

    const filtered = useMemo(() => {
        return products.filter(p => {
            if (activeCategory !== 'الكل') {
                const catMatches = p.category === activeCategory || p.category.includes(activeCategory);
                if (!catMatches) return false;
            }
            if (p.price < sideFilters.priceMin || p.price > sideFilters.priceMax) return false;
            return true;
        });
    }, [products, activeCategory, sideFilters]);

    return (
        <div className="min-h-[100dvh] bg-[#F0DFCD] w-full overflow-x-clip" dir="rtl">
            {/* Hero Banner */}
            <div className="relative w-full h-[36dvh] sm:h-[45dvh] lg:h-[50dvh] overflow-hidden flex items-center px-3 sm:px-8 md:px-16">
                <div className="absolute inset-0 bg-[#4a0015]" />

                <motion.video 
                    autoPlay muted playsInline 
                    onPlaying={() => setIsVideoPlaying(true)}
                    initial={{ opacity: 0.8, x: "-20vw" }}
                    animate={{ opacity: 0.8, x: isVideoPlaying ? 0 : "-20vw" }}
                    transition={{ duration: 2.5, ease: "linear" }}
                    style={{ willChange: "transform", WebkitTransform: "translateZ(0)" }}
                    className="absolute -left-28 min-[410px]:-left-28 sm:-left-[160px] md:-left-[203px] lg:-left-[6%] bottom-0 sm:bottom-[-20%] h-[78%] sm:h-[120%] w-auto object-contain z-10 opacity-80 pointer-events-none"
                >
                    <source src="/Vids/Women_Move_2.webm" type="video/webm" />
                </motion.video>
                <div className="absolute left-0 bottom-0 right-0 h-1/2"
                    style={{ background: 'linear-gradient(to top, #4a0015, transparent)' }} />

                <div className="relative z-20 flex flex-col gap-1.5 sm:gap-3 max-w-[65%] sm:max-w-2xl">
                    <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                        className="text-[#F0DFCD]/60 font-bold tracking-widest text-[11px] sm:text-sm">الرئيسية / النساء</motion.span>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-[clamp(1.75rem,5vw,4.5rem)] font-black text-[#F0DFCD] leading-tight tracking-tight">النساء</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[#F0DFCD]/80 text-[11px] sm:text-base lg:text-xl font-medium leading-snug sm:leading-relaxed">أزياء نسائية راقية تجمع الأصالة والأناقة في كل تفصيلة</motion.p>
                </div>
            </div>

            {/* Category Filters row - Original Luxury Style & Responsive Flow */}
            <div className="bg-[#F0DFCD] relative">
                <div className="container mx-auto px-2.5 sm:px-8 py-2.5 sm:py-6 flex items-center justify-between lg:justify-center relative gap-2 sm:gap-4">
                    
                    {/* Filter Button (Desktop: absolute right; Mobile: docked at start of bar) */}
                    <button 
                        onClick={() => setIsFilterOpen(true)} 
                        className="lg:absolute lg:right-8 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-sm bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 shadow-md sm:shadow-lg font-bold text-xs sm:text-sm transition-all duration-300 z-10 shrink-0 cursor-pointer"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>الفلاتر</span>
                    </button>

                    <div className="h-5 w-[1px] bg-[#800020]/20 shrink-0 lg:hidden" />

                    {/* Scrollable Categories List */}
                    <div className="flex gap-1.5 sm:gap-4 overflow-x-auto no-scrollbar sm:flex-wrap justify-start sm:justify-center py-1 items-center flex-1">
                        {categoryFilters.map(f => (
                            <button 
                                key={f} 
                                onClick={() => setActiveCategory(f)}
                                className={`px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-sm font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0 ${
                                    activeCategory === f
                                        ? 'bg-[#800020] text-[#F0DFCD] shadow-md sm:shadow-lg'
                                        : 'bg-transparent text-[#800020] hover:bg-[#800020]/5'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content: Sidebar + Grid */}
            <div className="container mx-auto px-2.5 sm:px-8 py-4 sm:py-10 flex gap-4 sm:gap-10 items-start">

                {/* Sidebar on the RIGHT (naturally in RTL = visual right) */}
                <FilterSidebar
                    filters={sideFilters}
                    setFilters={setSideFilters}
                    totalProducts={filtered.length}
                    isMen={false}
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    products={products}
                />

                {/* Products Grid */}
                <div className="flex-1">
                    {loading && products.length === 0 ? (
                        <ProductGridSkeleton count={10} />
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-[#800020]/40 gap-4">
                            <p className="text-xl sm:text-2xl font-black">لا توجد منتجات</p>
                            <p className="text-xs sm:text-sm font-medium">جرّب تغيير الفلاتر المحددة</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-6">
                            {filtered.map((p, i) => (
                                <motion.div key={p.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                                    <ProductCard p={p} index={i} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
