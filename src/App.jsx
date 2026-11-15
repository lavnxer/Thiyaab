import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { ArrowUpRight, Search, Heart, User, ShoppingBag, ChevronRight, ChevronLeft, Edit3, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import InteractiveButton from './components/InteractiveButton';
import { productsApi } from './lib/api';
import OutfitShowcaseSection, { SECOND_OUTFITS, WOMEN_OUTFITS } from './components/OutfitShowcaseSection';
import RiyalIcon from './components/RiyalIcon';
import Footer from './components/Footer';
import { useShop } from './context/ShopContext';
import { useAuth } from './context/AuthContext';

function App() {
    const navigate = useNavigate();
    const { homeOffer, homeSections, autoBestSellers, updateHomeOffer } = useShop();
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
            if (updateHomeOffer && !homeOffer?.endTimestamp) {
                updateHomeOffer({ endTimestamp: endTime });
            }
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
        homeOffer?.durationSeconds,
        updateHomeOffer
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
            <section className="relative w-full h-[72vh] sm:h-[85vh] flex items-center justify-center overflow-hidden">
                <div className="absolute z-0 text-[#800020] font-black select-none top-[55%] -translate-y-1/2 whitespace-nowrap w-full text-center flex justify-center tracking-normal pointer-events-none">
                    <span className="hidden sm:inline text-7xl md:text-8xl lg:text-9xl">
                        ثيـــــــــــــــــــــــــــــــــــــــــاب
                    </span>
                    <span className="sm:hidden text-5xl min-[390px]:text-6xl font-black">
                        ثيـــــــــــــــــاب
                    </span>
                </div>

                <motion.img
                    initial="hidden" animate="visible" custom={1} variants={staggerVariants}
                    src="/images/hero_model_transparent_v2.png"
                    alt="غازو مودل"
                    className="relative z-10 h-[88%] sm:h-[95%] object-contain mt-8 sm:mt-12 pointer-events-none"
                />

                <motion.div
                    initial="hidden" animate="visible" custom={2} variants={staggerVariants}
                    className="absolute right-4 sm:right-8 lg:right-12 top-8 sm:top-14 md:top-14 lg:top-32 z-20 flex flex-col items-start gap-2 sm:gap-6"
                >
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-[#800020] leading-tight">مزيج بين الأصالة والحداثة</h2>
                </motion.div>

                <motion.div
                    initial="hidden" animate="visible" custom={3} variants={staggerVariants}
                    className="absolute left-4 sm:left-16 lg:left-32 bottom-6 sm:bottom-12 z-20"
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
                        className="w-32 sm:w-48 shadow-xl text-sm sm:text-lg py-2.5 sm:py-3.5"
                    >
                        تسوق الآن
                    </InteractiveButton>
                </motion.div>
            </section>

            {/* Promo/Timer Banner */}
            {homeOffer?.isActive !== false && (
                <motion.section
                    initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4} variants={staggerVariants}
                    className="w-full bg-[#800020] text-white mt-8 sm:mt-16 md:mt-24 relative overflow-hidden flex items-stretch group/banner min-h-[145px] xs:min-h-[155px] sm:min-h-[220px] md:min-h-[250px] lg:min-h-[280px]"
                    style={{ boxShadow: '-4px 0 0 0 #800020, 4px 0 0 0 #800020' }}
                >
                    <div className="container mx-auto px-2 sm:px-6 lg:px-12 flex flex-row items-center justify-between relative w-full gap-1.5 sm:gap-4 md:gap-0 py-0">

                        {/* Right: Timer blocks */}
                        <div className="flex gap-1 xs:gap-1.5 sm:gap-3 md:gap-3 lg:gap-4 text-center items-center py-2 xs:py-2.5 sm:py-6 md:py-8 lg:py-9 shrink-0" dir="ltr">
                            <div className="flex flex-col items-center gap-0.5 xs:gap-1 sm:gap-2">
                                <div className="w-[28px] h-[28px] xs:w-[32px] xs:h-[32px] sm:w-[38px] sm:h-[38px] md:w-[44px] md:h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-[11px] xs:text-xs sm:text-lg md:text-xl lg:text-2xl font-bold rounded sm:rounded-md shadow-inner">{timer.days}</div>
                                <span className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs font-bold opacity-90">أيام</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5 xs:gap-1 sm:gap-2">
                                <div className="w-[28px] h-[28px] xs:w-[32px] xs:h-[32px] sm:w-[38px] sm:h-[38px] md:w-[44px] md:h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-[11px] xs:text-xs sm:text-lg md:text-xl lg:text-2xl font-bold rounded sm:rounded-md shadow-inner">{timer.hours}</div>
                                <span className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs font-bold opacity-90">ساعات</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5 xs:gap-1 sm:gap-2">
                                <div className="w-[28px] h-[28px] xs:w-[32px] xs:h-[32px] sm:w-[38px] sm:h-[38px] md:w-[44px] md:h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-[11px] xs:text-xs sm:text-lg md:text-xl lg:text-2xl font-bold rounded sm:rounded-md shadow-inner">{timer.minutes}</div>
                                <span className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs font-bold opacity-90">دقائق</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5 xs:gap-1 sm:gap-2">
                                <div className="w-[28px] h-[28px] xs:w-[32px] xs:h-[32px] sm:w-[38px] sm:h-[38px] md:w-[44px] md:h-[44px] lg:w-[48px] lg:h-[48px] flex items-center justify-center bg-black/25 text-[11px] xs:text-xs sm:text-lg md:text-xl lg:text-2xl font-bold rounded sm:rounded-md shadow-inner">{timer.seconds}</div>
                                <span className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs font-bold opacity-90">ثواني</span>
                            </div>
                        </div>

                        {/* Center: Text & Pricing */}
                        <div className="flex-1 flex justify-center items-center px-1 xs:px-2 sm:px-4 translate-x-1.5 xs:translate-x-2.5 sm:translate-x-6 md:translate-x-8 lg:translate-x-12">
                            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-6 lg:gap-8 text-[#E2D3C0]">
                                <div className="text-center">
                                    <span className="text-xs xs:text-sm sm:text-2xl lg:text-3xl font-black block leading-tight">{homeOffer?.badgeText || 'خصم'}</span>
                                    <span className="text-sm xs:text-base sm:text-3xl lg:text-4xl font-black block leading-tight">{homeOffer?.discount || '70%'}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center border-r sm:border-r-2 border-[#E2D3C0]/30 pr-1.5 xs:pr-2 sm:pr-6 lg:pr-8">
                                    {homeOffer?.originalPrice && (
                                        <span className="line-through opacity-70 text-[9px] xs:text-[10px] sm:text-lg block mb-0.5 leading-tight">{homeOffer.originalPrice} <RiyalIcon className="w-2.5 h-2.5 xs:w-2.5 xs:h-2.5 sm:w-3.5 sm:h-3.5" /></span>
                                    )}
                                    <span className="font-bold text-xs xs:text-sm sm:text-2xl block leading-tight">{homeOffer?.salePrice ?? 150} <RiyalIcon className="w-3 h-3 xs:w-3 xs:h-3 sm:w-4 sm:h-4" /></span>
                                </div>
                            </div>
                        </div>

                        {/* Left: Product Card Background block integrated seamlessly */}
                        <div
                            className="w-[115px] xs:w-[130px] sm:w-[200px] md:w-[250px] lg:w-[310px] self-stretch shrink-0 bg-[#f0dfcd] text-[#800020] flex flex-row items-center cursor-pointer group relative z-10 -ml-2 xs:-ml-3 sm:-ml-4 md:-ml-8 lg:-ml-20 mr-1 xs:mr-2 sm:mr-3 md:mr-4 lg:mr-20 overflow-visible"
                            onClick={() => navigate(homeOffer?.targetUrl || (homeOffer?.productId ? `/product/${homeOffer.productId}` : '/product/1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7'))}
                        >
                            <div className="w-full h-full relative z-20 flex items-center justify-center p-0.5 sm:p-2 group-hover:scale-105 transition-transform duration-500 overflow-visible">
                                <img
                                    src={homeOffer?.imageUrl || "/new_offer_shoes_transparent.png"}
                                    alt={homeOffer?.productName || "حذاء عرض"}
                                    className="w-[155px] xs:w-[170px] sm:w-[300px] md:w-[350px] lg:w-[415px] max-w-none h-auto object-contain origin-center absolute transition-transform duration-500 [--shoe-shift:26px] xs:[--shoe-shift:30px] sm:[--shoe-shift:44px] md:[--shoe-shift:58px] lg:[--shoe-shift:80px] [--offset-factor:0.25] xs:[--offset-factor:0.32] sm:[--offset-factor:0.6] md:[--offset-factor:0.8] lg:[--offset-factor:1]"
                                    style={{
                                        transform: `scale(${homeOffer?.imageScale || 1.1}) translateX(calc(var(--shoe-shift, 0px) + (${homeOffer?.imageOffsetX !== undefined ? `${homeOffer.imageOffsetX}px` : '45px'} - 45px) * var(--offset-factor, 1)))`
                                    }}
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
                className="w-full bg-[#800020] text-white mt-12 md:mt-24 mb-12 relative overflow-hidden flex items-stretch py-10 md:py-20"
                style={{ boxShadow: '-4px 0 0 0 #800020, 4px 0 0 0 #800020' }}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col items-center justify-center relative w-full">

                    {/* Top: Text */}
                    <div className="flex flex-col justify-center items-center text-center pb-6 sm:pb-8 text-[#E2D3C0] w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-base sm:text-xl font-bold opacity-80 tracking-widest uppercase">حصرياً</span>
                        </div>
                        <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-8">{homeSections?.bestSellers?.title || 'الأكثر مبيعاً'}</h3>
                        <p className="text-xs sm:text-lg opacity-90 leading-relaxed max-w-[95%]">
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
                            className="group flex absolute right-1 sm:right-1 md:right-3 top-0 bottom-0 my-auto h-fit z-30 p-1 sm:p-2 items-center justify-center cursor-pointer focus:outline-none bg-transparent border-0 shadow-none"
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 overflow-visible">
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
                            className="w-full bg-[#f0dfcd] text-[#800020] flex flex-row items-center justify-between gap-1.5 sm:gap-4 lg:gap-12 px-8 min-[390px]:px-10 sm:px-8 lg:px-12 py-3 sm:py-8 lg:py-12 relative z-10 shrink-0 overflow-hidden rounded-sm"
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
                                        className="flex-1 flex flex-col items-center text-center cursor-pointer group px-0.5 sm:px-2"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        <div className="relative w-full h-[95px] sm:h-[180px] lg:h-[250px] flex items-center justify-center mb-2 sm:mb-6">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className={`object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md ${product.category === 'أحذية' || product.name.includes('حذاء')
                                                        ? 'h-[75%] max-w-[80%]'
                                                        : 'w-full h-full'
                                                    }`}
                                            />
                                        </div>
                                        <h4 className="font-bold text-[11px] sm:text-sm lg:text-xl mb-1 sm:mb-2 line-clamp-1">{product.name}</h4>
                                        <p className="font-black text-xs sm:text-lg lg:text-2xl flex items-center justify-center gap-0.5 sm:gap-1">{product.price.toFixed(2)} <RiyalIcon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" /></p>
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
                            className="group flex absolute left-1 sm:left-1 md:left-3 top-0 bottom-0 my-auto h-fit z-30 p-1 sm:p-2 items-center justify-center cursor-pointer focus:outline-none bg-transparent border-0 shadow-none"
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 overflow-visible">
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
                    <div className="mt-8 sm:mt-12 flex justify-center">
                        <InteractiveButton
                            onClick={() => navigate('/men')}
                            inverse={true}
                            glow={true}
                            className="w-44 sm:w-56 text-base sm:text-lg transition-all duration-300 py-2 sm:py-3.5"
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
                className="container mx-auto px-4 sm:px-6 py-12 sm:py-20"
            >
                <h3 className="text-2xl sm:text-3xl font-bold text-[#800020] text-center mb-8 sm:mb-12">الأقسام</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-6">
                    <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); navigate('/men'); }} className="group flex flex-col items-center gap-2 sm:gap-6 w-full mx-auto transition-transform hover:-translate-y-2 h-full">
                        <div className="relative w-full h-[160px] sm:h-[350px] lg:h-[550px] rounded-xl sm:rounded-3xl overflow-hidden bg-gray-500/5 flex items-center justify-center p-2 sm:py-10 sm:px-4">
                            <img src="/images/men_category_new.png" alt="رجال" className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <h4 className="text-[#800020] font-bold text-xs sm:text-2xl lg:text-3xl tracking-wide transition drop-shadow-sm">رجال</h4>
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); navigate('/women'); }} className="group flex flex-col items-center gap-2 sm:gap-6 w-full mx-auto transition-transform hover:-translate-y-2 h-full">
                        <div className="relative w-full h-[160px] sm:h-[350px] lg:h-[550px] rounded-xl sm:rounded-3xl overflow-hidden bg-gray-500/5 flex items-center justify-center p-2 sm:py-10 sm:px-4">
                            <img src="/images/women_new_bg_removed.png" alt="نسائي" className="h-[95%] w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-xl" />
                        </div>
                        <h4 className="text-[#800020] font-bold text-xs sm:text-2xl lg:text-3xl tracking-wide transition drop-shadow-sm">نسائي</h4>
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); navigate('/accessories'); }} className="group flex flex-col items-center gap-2 sm:gap-6 w-full mx-auto transition-transform hover:-translate-y-2 h-full">
                        <div className="relative w-full h-[160px] sm:h-[350px] lg:h-[550px] rounded-xl sm:rounded-3xl overflow-hidden bg-gray-500/5 flex items-center justify-center p-2 sm:py-10 sm:px-4">
                            <img src="/images/user_accessories_bg_removed.png" alt="إكسسوارات" className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-2xl" />
                        </div>
                        <h4 className="text-[#800020] font-bold text-xs sm:text-2xl lg:text-3xl tracking-wide transition drop-shadow-sm">إكسسوارات</h4>
                    </a>
                </div>
            </motion.section>


            {/* Footer */}
            <Footer />
        </>
    );
}
export default App;
