import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { ArrowUpRight, Search, Heart, User, ShoppingBag, ChevronRight, ChevronLeft, Edit3, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import InteractiveButton from './components/InteractiveButton';
import { productsApi } from './lib/api';
import OutfitShowcaseSection, { SECOND_OUTFITS, WOMEN_OUTFITS } from './components/OutfitShowcaseSection';
import RiyalIcon from './components/RiyalIcon';
import { useShop } from './context/ShopContext';
import { useAuth } from './context/AuthContext';

function App() {
    const navigate = useNavigate();
    const { homeOffer, homeSections, autoBestSellers } = useShop();
    const { isAdmin } = useAuth();

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    const [timer, setTimer] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

    useEffect(() => {
        let endTime;
        if (homeOffer?.endTimestamp && Number(homeOffer.endTimestamp) > Date.now()) {
            endTime = Number(homeOffer.endTimestamp);
        } else {
            const daysMs = (Number(homeOffer?.durationDays) || 3) * 24 * 60 * 60 * 1000;
            const hoursMs = (Number(homeOffer?.durationHours) || 23) * 60 * 60 * 1000;
            const minsMs = (Number(homeOffer?.durationMinutes) || 15) * 60 * 1000;
            const secsMs = (Number(homeOffer?.durationSeconds) || 33) * 1000;
            endTime = Date.now() + daysMs + hoursMs + minsMs + secsMs;
        }

        const tick = () => {
            const now = Date.now();
            const distance = endTime - now;

            if (distance <= 0) {
                setTimer({ days: '00', hours: '00', minutes: '00', seconds: '00' });
                return;
            }

            setTimer({
                days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0'),
                hours: String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
                minutes: String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
                seconds: String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0')
            });
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [
        homeOffer?.endTimestamp,
        homeOffer?.durationDays,
        homeOffer?.durationHours,
        homeOffer?.durationMinutes,
        homeOffer?.durationSeconds
    ]);

    // Initial products from verified Supabase database entries
    const [bestSellers, setBestSellers] = useState([
        { id: "1fe2999b-3b5f-4e89-a994-f6b5fb9ea961", name: "معطف جوخ مزدوج الصدر بحزام", price: 850.00, category: "معاطف وجاكيتات", image: "/images/coat_transparent.png" },
        { id: "f203ea74-16d8-4527-9f95-f27665996f5f", name: "بلوفر ياقة عالية كلاسيكي", price: 299.00, category: "كنزات وبلوفرات", image: "/images/blover_transparent.png" },
        { id: "1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7", name: "حذاء جلدي فاخر", price: 450.00, category: "أحذية", image: "/images/leather_shoes_transparent.png" },
        { id: "a24387e1-aca8-46e0-9480-129e1784674f", name: "بنطال قماشي فاخر", price: 190.00, category: "بناطيل", image: "/images/pants_transparent.png" },
        { id: "82255044-7297-4680-adc7-f7b76d59cf67", name: "فستان سهرة أنيق", price: 580.00, category: "فساتين", image: "/images/winter_outfit_transparent.png" },
        { id: "af4bc8e6-2fc1-46b2-93f3-109d1286dd04", name: "عباءة مطرزة فاخرة", price: 390.00, category: "عبايات", image: "/images/coat_transparent.png" },
        { id: "c0d3ae2a-8fa5-48e0-b028-fa04468dc1f5", name: "ساعة فاخرة كلاسيكية", price: 1200.00, category: "ساعات", image: "/images/lux_accessories_bg_removed.png" },
        { id: "5a52688b-3251-4fae-a683-4b22a874f00e", name: "طقم إكسسوارات ملكي", price: 2100.00, category: "إكسسوارات", image: "/images/lux_accessories_bg_removed.png" }
    ]);

    useEffect(() => {
        let isMounted = true;

        // 1. If auto mode is enabled (default) and autoBestSellers calculated from real orders is available
        if (homeSections?.bestSellers?.autoMode !== false && autoBestSellers && autoBestSellers.length > 0) {
            const limit = homeSections?.bestSellers?.limit || 8;
            setBestSellers(autoBestSellers.slice(0, limit));
            return;
        }

        // 2. If manual mode with custom products chosen
        if (homeSections?.bestSellers?.autoMode === false && homeSections?.bestSellers?.customProductIds?.length > 0) {
            productsApi.getAll().then(({ data }) => {
                if (!isMounted || !data || data.length === 0) return;
                const idSet = new Set(homeSections.bestSellers.customProductIds);
                const selected = data
                    .filter(p => idSet.has(p.id))
                    .map(p => ({
                        id: p.id,
                        name: p.name,
                        price: Number(p.price),
                        category: p.category?.name || 'أزياء',
                        image: p.image_url || (p.images && p.images[0]) || '/images/coat_transparent.png'
                    }));
                if (selected.length > 0) {
                    setBestSellers(selected);
                }
            });
            return;
        }

        // 3. Fallback: load featured products
        productsApi.getAll({ is_featured: true }).then(({ data, error }) => {
            if (!isMounted || !data || data.length === 0) return;
            const mapped = data.map(p => ({
                id: p.id,
                name: p.name,
                price: Number(p.price),
                category: p.category?.name || 'أزياء',
                image: p.image_url || (p.images && p.images[0]) || '/images/coat_transparent.png'
            }));
            setBestSellers(mapped);
        });

        return () => { isMounted = false; };
    }, [homeSections?.bestSellers, autoBestSellers]);

    const [bestSellerTick, setBestSellerTick] = useState(0);
    const [isBestSellerHovered, setIsBestSellerHovered] = useState(false);
    const [slideDirection, setSlideDirection] = useState('left');

    const handleNextBestSeller = () => {
        setSlideDirection('left');
        setBestSellerTick((prev) => prev + 1);
    };

    const handlePrevBestSeller = () => {
        setSlideDirection('right');
        setBestSellerTick((prev) => prev - 1);
    };

    useEffect(() => {
        if (isBestSellerHovered) return;
        const interval = setInterval(() => {
            setSlideDirection('left');
            setBestSellerTick((prev) => prev + 1);
        }, 5000);
        return () => clearInterval(interval);
    }, [isBestSellerHovered]);

    const bsItemVariants = {
        initial: (dir) => ({
            x: dir === 'left' ? 120 : -120,
            opacity: 0
        }),
        animate: {
            x: 0,
            opacity: 1
        },
        exit: (dir) => ({
            x: dir === 'left' ? -120 : 120,
            opacity: 0
        })
    };

    const N_BS = bestSellers.length;
    const visibleBestSellers = [
        bestSellers[((-bestSellerTick) % N_BS + N_BS) % N_BS],
        bestSellers[((-bestSellerTick + 1) % N_BS + N_BS) % N_BS],
        bestSellers[((-bestSellerTick + 2) % N_BS + N_BS) % N_BS]
    ];

    const staggerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.15,
                duration: 0.6,
                ease: "easeOut"
            }
        })
    };

    return (
        <>


            {/* Hero Section */}
            <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
                <div className="absolute z-0 text-[#800020] font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl select-none top-[55%] -translate-y-1/2 whitespace-nowrap w-full text-center flex justify-center tracking-tighter pointer-events-none">
                    ثـــــــــــــــــــــــــيـــــــــــــــــــــــــاب
                </div>

                <motion.img
                    initial="hidden" animate="visible" custom={1} variants={staggerVariants}
                    src="/images/hero_model_transparent_v2.png"
                    alt="غازو مودل"
                    className="relative z-10 h-[95%] object-contain mt-12 pointer-events-none"
                />

                <motion.div
                    initial="hidden" animate="visible" custom={2} variants={staggerVariants}
                    className="absolute right-4 sm:right-8 lg:right-12 top-24 sm:top-32 z-20 flex flex-col items-start gap-4 sm:gap-6"
                >
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#800020] leading-tight">مزيج بين الأصالة والحداثة</h2>
                </motion.div>

                <motion.div
                    initial="hidden" animate="visible" custom={3} variants={staggerVariants}
                    className="absolute left-8 sm:left-16 lg:left-32 bottom-8 sm:bottom-12 z-20"
                >
                    <InteractiveButton
                        href="#categories"
                        onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById('categories');
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="w-40 sm:w-48 shadow-xl text-base sm:text-lg"
                    >
                        تسوق الآن
                    </InteractiveButton>
                </motion.div>


            </section>

            {/* Promo/Timer Banner */}
            {homeOffer?.isActive !== false && (
                <motion.section
                    initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4} variants={staggerVariants}
                    className="w-full bg-[#800020] text-white mt-16 md:mt-24 relative overflow-hidden flex items-stretch group/banner"
                >
                    {/* Admin Quick Edit Shortcut */}
                    {isAdmin && (
                        <Link
                            to="/admin/offer"
                            className="absolute top-3 left-4 z-30 bg-black/45 hover:bg-black/80 text-[#F0DFCD] text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-[#F0DFCD]/30 flex items-center gap-1.5 transition shadow-lg opacity-80 hover:opacity-100"
                            title="تعديل هذا العرض من لوحة الإدارة"
                        >
                            <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                            <span>تعديل العرض (لوحة الإدارة)</span>
                        </Link>
                    )}

                    <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between relative w-full gap-6 md:gap-0">

                        {/* Right: Timer blocks */}
                        <div className="flex gap-4 text-center items-center py-6 md:py-9" dir="ltr">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-[44px] h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-xl lg:text-2xl font-bold rounded shadow-inner">{timer.days}</div>
                                <span className="text-[10px] lg:text-xs font-bold opacity-90">أيام</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-[44px] h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-xl lg:text-2xl font-bold rounded shadow-inner">{timer.hours}</div>
                                <span className="text-[10px] lg:text-xs font-bold opacity-90">ساعات</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-[44px] h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-xl lg:text-2xl font-bold rounded shadow-inner">{timer.minutes}</div>
                                <span className="text-[10px] lg:text-xs font-bold opacity-90">دقائق</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-[44px] h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-xl lg:text-2xl font-bold rounded shadow-inner">{timer.seconds}</div>
                                <span className="text-[10px] lg:text-xs font-bold opacity-90">ثواني</span>
                            </div>
                        </div>

                        {/* Center: Text */}
                        <div className="flex-1 flex justify-center items-center md:translate-x-12">
                            <div className="flex items-center gap-6 sm:gap-8 text-[#E2D3C0]">
                                <div className="text-center">
                                    <span className="text-2xl lg:text-3xl font-black block">{homeOffer?.badgeText || 'خصم'}</span>
                                    <span className="text-3xl lg:text-4xl font-black block">{homeOffer?.discount || '70%'}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center border-r-2 border-[#E2D3C0]/30 pr-6 sm:pr-8">
                                    {homeOffer?.originalPrice && (
                                        <span className="line-through opacity-70 text-lg block mb-1">{homeOffer.originalPrice} <RiyalIcon /></span>
                                    )}
                                    <span className="font-bold text-2xl block">{homeOffer?.salePrice ?? 150} <RiyalIcon /></span>
                                </div>
                            </div>
                        </div>

                        {/* Left: Product Card Background block integrated seamlessly */}
                        <div
                            className="w-full md:w-[310px] min-h-[220px] md:min-h-[280px] shrink-0 bg-[#f0dfcd] text-[#800020] flex flex-row items-stretch cursor-pointer group relative z-10 md:-ml-20 md:mr-20 overflow-hidden md:overflow-visible rounded-xl md:rounded-none"
                            onClick={() => navigate(homeOffer?.targetUrl || (homeOffer?.productId ? `/product/${homeOffer.productId}` : '/product/1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7'))}
                        >
                            <div className="flex-1 relative z-20 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-500">
                                <img
                                    src={homeOffer?.imageUrl || "/new_offer_shoes_transparent.png"}
                                    alt={homeOffer?.productName || "حذاء عرض"}
                                    className="w-[280px] sm:w-[320px] md:w-[415px] max-w-none h-auto object-contain origin-center relative md:absolute md:translate-x-12 transition-transform duration-500"
                                    style={{ transform: `scale(${homeOffer?.imageScale || 1.1})` }}
                                />
                            </div>
                        </div>

                    </div>
                </motion.section>
            )}

            {/* Product Showcase Grid with Smooth Framer Motion */}
            <OutfitShowcaseSection title="أطقم رجالية كاملة" sectionType="men" />

            {/* Best Sellers Section (Promo Style) */}
            {homeSections?.bestSellers?.isActive !== false && (
            <motion.section
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5.5} variants={staggerVariants}
                className="w-full bg-[#800020] text-white mt-16 md:mt-24 mb-12 relative overflow-hidden flex items-stretch py-16 md:py-20"
            >
                <div className="container mx-auto px-6 lg:px-12 flex flex-col items-center justify-center relative w-full">

                    {/* Top: Text */}
                    <div className="flex flex-col justify-center items-center text-center pb-8 text-[#E2D3C0] w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl font-bold opacity-80 tracking-widest uppercase">حصرياً</span>
                            {homeSections?.bestSellers?.autoMode !== false && (
                                <span className="bg-[#E2D3C0]/15 text-[#E2D3C0] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#E2D3C0]/30 backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    مربوط تلقائياً بالأعلى مبيعاً
                                </span>
                            )}
                        </div>
                        <h3 className="text-4xl lg:text-5xl font-black mb-8">{homeSections?.bestSellers?.title || 'الأكثر مبيعاً'}</h3>
                        <p className="text-lg opacity-90 leading-relaxed lg:whitespace-nowrap max-w-[95%]">
                            {homeSections?.bestSellers?.subtitle || 'القطع الأكثر طلباً وتميزاً. تصفح تشكيلتنا من المنتجات التي نالت إعجاب عملائنا بفضل جودتها وتصميمها الاستثنائي.'}
                        </p>
                    </div>

                    {/* Bottom: Products Block with smooth slide shift and side navigation arrows */}
                    <div
                        className="relative w-full"
                        onMouseEnter={() => setIsBestSellerHovered(true)}
                        onMouseLeave={() => setIsBestSellerHovered(false)}
                    >
                        {/* Right Arrow (السابق) */}
                        <motion.button
                            onClick={handlePrevBestSeller}
                            aria-label="السابق"
                            initial="rest"
                            whileHover="hover"
                            className="group flex absolute right-1 md:right-3 top-0 bottom-0 my-auto h-fit z-30 p-2 items-center justify-center cursor-pointer focus:outline-none bg-transparent border-0 shadow-none"
                        >
                            <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 overflow-visible">
                                <defs>
                                    <mask id="arrowMaskRight">
                                        <path d="M9 18l6-6-6-6" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </mask>
                                    <linearGradient id="shineGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                                        <stop offset="50%" stopColor="white" stopOpacity="1" />
                                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* 1. Base Burgundy Arrow (Always Solid #800020) */}
                                <path d="M9 18l6-6-6-6" fill="none" stroke="#800020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                                {/* 2. Shine Flash strictly restricted to the Arrow Path via Mask (Hidden on rest) */}
                                <g mask="url(#arrowMaskRight)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                                    <motion.rect
                                        y={0}
                                        width={16}
                                        height={24}
                                        fill="url(#shineGradRight)"
                                        variants={{
                                            rest: { x: -24, opacity: 0 },
                                            hover: {
                                                x: [-24, 28],
                                                opacity: [0, 1, 1, 0],
                                                transition: {
                                                    duration: 0.75,
                                                    ease: "easeInOut",
                                                    repeat: Infinity,
                                                    repeatDelay: 0.75
                                                }
                                            }
                                        }}
                                    />
                                </g>
                            </svg>
                        </motion.button>

                        {/* Products Box */}
                        <div
                            className="w-full bg-[#f0dfcd] text-[#800020] flex flex-row items-center justify-between gap-4 lg:gap-12 p-8 lg:p-12 relative z-10 shrink-0 overflow-hidden rounded-sm"
                        >
                            <AnimatePresence mode="popLayout" initial={false} custom={slideDirection}>
                                {visibleBestSellers.map((product) => (
                                    <motion.div
                                        layout
                                        key={product.id}
                                        custom={slideDirection}
                                        variants={bsItemVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        transition={{
                                            duration: 1.6,
                                            ease: [0.25, 1, 0.5, 1]
                                        }}
                                        className="flex-1 flex flex-col items-center text-center cursor-pointer group"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        <div className="relative w-full h-[180px] lg:h-[250px] flex items-center justify-center mb-6">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className={`object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md ${product.category === 'أحذية' || product.name.includes('حذاء')
                                                        ? 'h-[75%] max-w-[80%]'
                                                        : 'w-full h-full'
                                                    }`}
                                            />
                                        </div>
                                        <h4 className="font-bold text-sm lg:text-xl mb-2 line-clamp-1">{product.name}</h4>
                                        <p className="font-black text-lg lg:text-2xl flex items-center justify-center gap-1">{product.price.toFixed(2)} <RiyalIcon /></p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Left Arrow (التالي) */}
                        <motion.button
                            onClick={handleNextBestSeller}
                            aria-label="التالي"
                            initial="rest"
                            whileHover="hover"
                            className="group flex absolute left-1 md:left-3 top-0 bottom-0 my-auto h-fit z-30 p-2 items-center justify-center cursor-pointer focus:outline-none bg-transparent border-0 shadow-none"
                        >
                            <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 overflow-visible">
                                <defs>
                                    <mask id="arrowMaskLeft">
                                        <path d="M15 18l-6-6 6-6" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </mask>
                                    <linearGradient id="shineGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                                        <stop offset="50%" stopColor="white" stopOpacity="1" />
                                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* 1. Base Burgundy Arrow (Always Solid #800020) */}
                                <path d="M15 18l-6-6 6-6" fill="none" stroke="#800020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                                {/* 2. Shine Flash strictly restricted to the Arrow Path via Mask (Hidden on rest) */}
                                <g mask="url(#arrowMaskLeft)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                                    <motion.rect
                                        y={0}
                                        width={16}
                                        height={24}
                                        fill="url(#shineGradLeft)"
                                        variants={{
                                            rest: { x: 28, opacity: 0 },
                                            hover: {
                                                x: [28, -24],
                                                opacity: [0, 1, 1, 0],
                                                transition: {
                                                    duration: 0.75,
                                                    ease: "easeInOut",
                                                    repeat: Infinity,
                                                    repeatDelay: 0.75
                                                }
                                            }
                                        }}
                                    />
                                </g>
                            </svg>
                        </motion.button>
                    </div>

                    {/* Action Button */}
                    <div className="mt-12 flex justify-center">
                        <InteractiveButton
                            onClick={() => navigate('/men')}
                            inverse={true}
                            glow={true}
                            className="w-56 text-lg transition-all duration-300"
                        >
                            تصفح الكل
                        </InteractiveButton>
                    </div>

                </div>
            </motion.section>
            )}

            {/* Second Product Showcase Section (أسفل الأكثر مبيعاً) */}
            <OutfitShowcaseSection title="أطقم نسائية كاملة" sectionType="women" />

            {/* Categories */}
            <motion.section
                id="categories"
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={6} variants={staggerVariants}
                className="container mx-auto px-6 py-20"
            >
                <h3 className="text-3xl font-bold text-[#800020] text-center mb-12">الأقسام</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); navigate('/men'); }} className="group flex flex-col items-center gap-6 w-[90%] mx-auto transition-transform hover:-translate-y-2 h-full">
                        <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gray-500/5 flex items-center justify-center py-10 px-4">
                            <img src="/images/men_category_new.png" alt="رجال" className="h-[550px] w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <h4 className="text-[#800020] font-bold text-3xl tracking-wide transition drop-shadow-sm">رجال</h4>
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); navigate('/women'); }} className="group flex flex-col items-center gap-6 w-[90%] mx-auto transition-transform hover:-translate-y-2 h-full">
                        <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gray-500/5 flex items-center justify-center py-10 px-4">
                            <img src="/images/women_new_bg_removed.png" alt="نسائي" className="h-[550px] w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-xl" />
                        </div>
                        <h4 className="text-[#800020] font-bold text-3xl tracking-wide transition drop-shadow-sm">نسائي</h4>
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); navigate('/accessories'); }} className="group flex flex-col items-center gap-6 w-[90%] mx-auto transition-transform hover:-translate-y-2 h-full">
                        <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gray-500/5 flex items-center justify-center py-10 px-4">
                            <img src="/images/user_accessories_bg_removed.png" alt="إكسسوارات" className="h-[550px] w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-2xl" />
                        </div>
                        <h4 className="text-[#800020] font-bold text-3xl tracking-wide transition drop-shadow-sm">إكسسوارات</h4>
                    </a>
                </div>
            </motion.section>


            {/* Footer */}
            <motion.footer
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={7} variants={staggerVariants}
                className="bg-[#800020] text-white pt-24 pb-12 px-12 relative overflow-hidden mt-12"
            >
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 text-sm leading-loose">
                    <div className="col-span-1">
                        <h2 className="text-4xl font-black mb-4 text-white">ثياب</h2>
                        <p className="text-white leading-relaxed mb-6 font-medium">علامة تجارية رائدة في صناعة الأزياء الراقية للرجال. نبتكر تصاميم عصرية بجودة عالية لتناسب أسلوب حياتك.</p>
                        <div className="flex gap-4">
                            <a href="#" aria-label="Twitter" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                            </a>
                            <a href="#" aria-label="Instagram" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </a>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <h3 className="font-bold text-lg mb-4 text-white">الخدمات</h3>
                        <ul className="flex flex-col gap-2">
                            <li><a href="#" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">القائمة</a></li>
                            <li><a href="#" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">الأكثر شعبية</a></li>
                            <li><Link to="/size-guide" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">دليل المقاسات</Link></li>
                            <li><a href="#" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">خدماتنا</a></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h3 className="font-bold text-lg mb-4 text-white">من نحن</h3>
                        <ul className="flex flex-col gap-2">
                            <li><Link to="/reviews" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">المراجعات</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h3 className="font-bold text-lg mb-4 text-white">الشؤون القانونية</h3>
                        <ul className="flex flex-col gap-2">
                            <li><a href="#" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">الشروط</a></li>
                            <li><a href="#" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">الأحكام</a></li>
                            <li><a href="#" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">السياسة</a></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h3 className="font-bold text-lg mb-4 text-white">اتصل بنا</h3>
                        <ul className="flex flex-col gap-2">
                            <li><a href="#" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">البريد الإلكتروني</a></li>
                            <li><a href="#" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">الهاتف</a></li>
                        </ul>
                    </div>
                </div>
            </motion.footer>
        </>
    );
}
export default App;
