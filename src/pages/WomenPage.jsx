import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../lib/api';

const stagger = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' }
    })
};

const categoryFilters = ['الكل', 'فساتين', 'عبايات', 'قمصان', 'بناطيل', 'أحذية', 'حقائب'];
const PRICE_MAX = 2000;

export default function WomenPage() {
    const [activeCategory, setActiveCategory] = useState('الكل');
    const [sideFilters, setSideFilters] = useState({ colors: [], sizes: [], priceMin: 0, priceMax: PRICE_MAX });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    img: p.image_url || '/images/winter_outfit_transparent.png',
                    badge: p.is_new ? 'جديد' : (p.is_featured ? 'مميز' : null),
                    category: p.category?.name || 'فساتين',
                    cover: false,
                    inStock: p.in_stock !== false
                }));
                setProducts(mapped);
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
        <div className="min-h-screen bg-[#F0DFCD]" dir="rtl">
            {/* Hero Banner */}
            <div className="relative w-full h-[50vh] overflow-hidden flex items-center px-16">
                <div className="absolute inset-0 bg-[#4a0015]" />

                <motion.video 
                    autoPlay muted playsInline 
                    onPlaying={() => setIsVideoPlaying(true)}
                    initial={{ opacity: 0.8, x: "-30vw" }}
                    animate={{ opacity: 0.8, x: isVideoPlaying ? "-10vw" : "-30vw" }}
                    transition={{ duration: 2.5, ease: "linear" }}
                    style={{ willChange: "transform", WebkitTransform: "translateZ(0)" }}
                    className="absolute left-[10%] bottom-[-20%] h-[120%] w-auto object-contain z-10 opacity-80"
                >
                    <source src="/Vids/Women_Move_2.webm" type="video/webm" />
                </motion.video>
                <div className="absolute left-0 bottom-0 right-0 h-1/2"
                    style={{ background: 'linear-gradient(to top, #4a0015, transparent)' }} />

                <div className="relative z-10 flex flex-col gap-3">
                    <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                        className="text-[#F0DFCD]/60 font-bold tracking-widest text-sm">الرئيسية / النساء</motion.span>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-7xl font-black text-[#F0DFCD] leading-none tracking-tight">النساء</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[#F0DFCD]/70 text-xl font-medium">أزياء نسائية راقية تجمع الأصالة والأناقة في كل تفصيلة</motion.p>
                </div>
            </div>

            {/* Category Filters row */}
            <div className="bg-[#F0DFCD] relative">
                <div className="container mx-auto px-8 py-10 flex justify-center items-center">
                    
                    <button onClick={() => setIsFilterOpen(true)} className="absolute right-8 flex items-center gap-2 px-6 py-2.5 rounded-sm bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 shadow-lg font-bold text-sm transition-all duration-300 z-10">
                        <SlidersHorizontal className="w-4 h-4" />
                        الفلاتر
                    </button>

                    <div className="flex gap-4 flex-wrap justify-center">
                        {categoryFilters.map(f => (
                            <button key={f} onClick={() => setActiveCategory(f)}
                                className={`px-6 py-2.5 rounded-sm font-bold text-sm transition-all duration-300 ${
                                    activeCategory === f
                                        ? 'bg-[#800020] text-[#F0DFCD] shadow-lg'
                                        : 'bg-transparent text-[#800020] hover:bg-[#800020]/5'
                                }`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content: Sidebar + Grid */}
            <div className="container mx-auto px-8 py-10 flex gap-10 items-start">

                {/* Sidebar on the RIGHT (naturally in RTL = visual right) */}
                <FilterSidebar
                    filters={sideFilters}
                    setFilters={setSideFilters}
                    totalProducts={filtered.length}
                    isMen={false}
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                />

                {/* Products Grid */}
                <div className="flex-1">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-[#800020]/40 gap-4">
                            <p className="text-2xl font-black">لا توجد منتجات</p>
                            <p className="font-medium">جرّب تغيير الفلاتر المحددة</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {filtered.map((p, i) => (
                                <motion.div key={p.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                                    <ProductCard p={p} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
