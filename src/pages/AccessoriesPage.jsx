import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../lib/api';

const stagger = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' }
    })
};

const categoryFilters = ['الكل', 'ساعات', 'عطور', 'خواتم', 'نظارات', 'محافظ', 'أحزمة'];
const PRICE_MAX = 2000;

export default function AccessoriesPage() {
    const [searchParams] = useSearchParams();
    const catQuery = searchParams.get('category');
    const [activeCategory, setActiveCategory] = useState(
        catQuery && categoryFilters.includes(catQuery) ? catQuery : 'الكل'
    );
    const [sideFilters, setSideFilters] = useState({ colors: [], sizes: [], priceMin: 0, priceMax: PRICE_MAX });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchProducts() {
            try {
                const { data } = await productsApi.getAll({ gender: 'unisex' });
                if (!isMounted || !data) return;
                const mapped = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: Number(p.price),
                    img: p.image_url || (Array.isArray(p.images) && p.images[0]) || '/images/leather_shoes_transparent.png',
                    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : []),
                    badge: p.is_new ? 'جديد' : (p.is_featured ? 'مميز' : null),
                    category: p.category?.name || 'إكسسوارات',
                    inStock: p.in_stock !== false
                }));
                setProducts(mapped);
            } catch (err) {
                console.error('Error fetching accessory products from Supabase:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchProducts();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat && categoryFilters.includes(cat)) {
            setActiveCategory(cat);
        } else if (!cat) {
            setActiveCategory('الكل');
        }
    }, [searchParams]);

    const filtered = useMemo(() => {
        return products.filter(p => {
            if (activeCategory !== 'الكل' && p.category !== activeCategory && activeCategory !== 'إكسسوارات') {
                const catMatches = p.category === activeCategory || p.category.includes(activeCategory);
                if (!catMatches) return false;
            }
            if (p.price < sideFilters.priceMin || p.price > sideFilters.priceMax) return false;
            return true;
        });
    }, [products, activeCategory, sideFilters]);

    return (
        <div className="min-h-screen bg-[#F0DFCD]" dir="rtl">
            {/* Hero Banner */}
            <div className="relative w-full h-[36vh] sm:h-[45vh] lg:h-[50vh] overflow-hidden flex items-center px-3 sm:px-8 md:px-16">
                <div className="absolute inset-0 bg-[#490015]" />

                <motion.video 
                    autoPlay muted playsInline 
                    onPlaying={() => setIsVideoPlaying(true)}
                    initial={{ opacity: 0.8, y: "-20vh" }}
                    animate={{ opacity: 0.8, y: isVideoPlaying ? 0 : "-20vh" }}
                    transition={{ duration: 1.5, ease: "linear" }}
                    style={{ willChange: "transform", WebkitTransform: "translateZ(0)" }}
                    className="absolute -left-16 min-[410px]:-left-16 sm:-left-[80px] md:-left-[100px] lg:-left-[2%] bottom-3 sm:bottom-[5%] h-[72%] sm:h-[85%] w-auto object-contain z-10 opacity-80 pointer-events-none"
                >
                    <source src="/Vids/Accsesories Hero Windows.webm" type="video/webm" />
                </motion.video>

                <div className="absolute left-0 bottom-0 right-0 h-1/2" style={{ background: 'linear-gradient(to top, #490015, transparent)' }} />

                <div className="relative z-20 flex flex-col gap-1.5 sm:gap-4 max-w-[68%] sm:max-w-2xl">
                    <motion.span initial={{opacity:0, x:-20}} animate={{opacity:1,x:0}} transition={{duration:0.5}}
                        className="text-[#F0DFCD]/60 font-bold tracking-widest text-[11px] sm:text-sm">الرئيسية / الإكسسوارات</motion.span>
                    <motion.h1 initial={{opacity:0, y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6, delay:0.1}}
                        className="text-3xl sm:text-6xl lg:text-7xl font-black text-[#F0DFCD] leading-tight tracking-tight">الإكسسوارات</motion.h1>
                    <motion.p initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5, delay:0.2}}
                        className="text-[#F0DFCD]/80 text-[11px] sm:text-base lg:text-xl font-medium leading-snug sm:leading-relaxed">قطع إكسسوارات استثنائية تُكمل أناقتك وتُعبّر عن شخصيتك</motion.p>
                </div>
            </div>

            {/* Category Filters row - Original Luxury Style & Responsive Flow */}
            <div className="bg-[#F0DFCD] relative">
                <div className="container mx-auto px-2.5 sm:px-8 py-2.5 sm:py-10 flex items-center justify-center relative">
                    
                    {/* Category Buttons & Filter Button */}
                    <div className="flex gap-1.5 sm:gap-4 overflow-x-auto no-scrollbar sm:flex-wrap justify-start sm:justify-center py-1 items-center w-full">
                        
                        {/* Filter Button (Original design: rounded-sm, burgundy, shadow) */}
                        <button 
                            onClick={() => setIsFilterOpen(true)} 
                            className="lg:absolute lg:right-8 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-sm bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 shadow-md sm:shadow-lg font-bold text-xs sm:text-sm transition-all duration-300 z-10 shrink-0 cursor-pointer sticky right-0 sm:static"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>الفلاتر</span>
                        </button>

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

            {/* Sidebar & Grid */}
            <FilterSidebar
                filters={sideFilters}
                setFilters={setSideFilters}
                totalProducts={filtered.length}
                isMen={true}
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
            />

            {/* Products Grid */}
            <div className="container mx-auto px-2.5 sm:px-8 py-4 sm:py-10 pb-24">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-[#800020]/40 gap-4">
                        <p className="text-xl sm:text-2xl font-black">لا توجد منتجات</p>
                        <p className="text-xs sm:text-sm font-medium">جرّب تغيير الفلاتر المحددة</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-6">
                        {filtered.map((p, i) => (
                            <motion.div key={p.id} custom={i} initial="hidden" whileInView="visible" viewport={{once:true}} variants={stagger}>
                                <ProductCard p={p} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
