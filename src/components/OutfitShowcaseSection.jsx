import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import InteractiveButton from './InteractiveButton';
import RiyalIcon from './RiyalIcon';
import { useShop } from '../context/ShopContext';

export const OUTFITS = [
    {
        title: "طقم رجالي متكامل",
        price: 1200.00,
        mainImage: "/images/winter_outfit_transparent.png",
        mainProductId: "72baf1c5-045e-4b01-9c0f-f7a26342dfc9",
        rightTop: { id: "1fe2999b-3b5f-4e89-a994-f6b5fb9ea961", name: "معطف جوخ مزدوج الصدر بحزام", price: 850.00, image: "/images/coat_transparent.png" },
        rightBottom: { id: "1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7", name: "حذاء جلدي فاخر", price: 450.00, image: "/images/leather_shoes_transparent.png" },
        leftTop: { id: "f203ea74-16d8-4527-9f95-f27665996f5f", name: "بلوفر ياقة عالية كلاسيكي", price: 299.00, image: "/images/blover_transparent.png" },
        leftBottom: { id: "a24387e1-aca8-46e0-9480-129e1784674f", name: "بنطال قماشي فاخر", price: 190.00, image: "/images/pants_transparent.png" }
    },
    {
        title: "طقم كاجوال فاخر",
        price: 980.00,
        mainImage: "/images/men_category_new.png",
        mainProductId: "c9883a3b-ce50-47c5-a725-b24f72e3a08a",
        rightTop: { id: "2c2c862d-f588-4fdf-9edf-517c612d6f44", name: "معطف جلدي كلاسيكي", price: 620.00, image: "/images/coat_transparent.png" },
        rightBottom: { id: "59c3bce8-c9dd-44dd-aaf3-83234a1d4c7d", name: "بنطال جينز فاخر", price: 260.00, image: "/images/pants_transparent.png" },
        leftTop: { id: "2fd5a3f4-68dd-42aa-8900-1cbb785c332c", name: "حذاء رياضي فاخر", price: 390.00, image: "/images/leather_shoes_transparent.png" },
        leftBottom: { id: "55255da6-cb85-4f95-be6d-6eebb80fbe25", name: "قميص رسمي أبيض", price: 210.00, image: "/images/blover_transparent.png" }
    }
];

export const WOMEN_OUTFITS = [
    {
        title: "طقم نسائي متكامل",
        price: 760.00,
        mainImage: "/images/women_new_bg_removed.png",
        mainProductId: "502d289e-97d0-48f4-9c6d-923802688adf",
        rightTop: { id: "af4bc8e6-2fc1-46b2-93f3-109d1286dd04", name: "عباءة مطرزة فاخرة", price: 390.00, image: "/images/coat_transparent.png" },
        rightBottom: { id: "c480b1a5-c02e-4022-b747-5234ecbbe1f6", name: "حقيبة يد كلاسيكية", price: 450.00, image: "/images/leather_shoes_transparent.png" },
        leftTop: { id: "53714b1b-735c-4847-ab9f-a0e8cf7787c8", name: "قميص حرير فاخر", price: 340.00, image: "/images/blover_transparent.png" },
        leftBottom: { id: "6fa9f0ac-5cd8-4480-bcbc-c6df16b032ae", name: "بنطال رسمي نسائي", price: 210.00, image: "/images/pants_transparent.png" }
    },
    {
        title: "إطلالة سهرة وأناقة نسائية",
        price: 580.00,
        mainImage: "/images/women_new_bg_removed.png",
        mainProductId: "82255044-7297-4680-adc7-f7b76d59cf67",
        rightTop: { id: "194e825e-f460-42f0-b6ae-de7f0e83da65", name: "كارديجان صوف فاخر", price: 310.00, image: "/images/blover_transparent.png" },
        rightBottom: { id: "e32a23ba-137d-4667-85fd-d86627e01b19", name: "حذاء كعب عالي", price: 380.00, image: "/images/leather_shoes_transparent.png" },
        leftTop: { id: "3863c784-b876-4ec5-8333-eabc066d0226", name: "عباءة سادة أنيقة", price: 280.00, image: "/images/coat_transparent.png" },
        leftBottom: { id: "fe099db4-5ba3-4442-abe8-9f4515635f2d", name: "فستان صيفي بوهيمي", price: 420.00, image: "/images/winter_outfit_transparent.png" }
    }
];

export const SECOND_OUTFITS = WOMEN_OUTFITS;

// Luxury gentle easing curve (silk ease - completely soft, pleasing, not sharp)
const gentleEase = [0.25, 1, 0.5, 1];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.03
        }
    },
    exit: {
        transition: {
            duration: 1.0
        }
    }
};

const centerVariants = {
    hidden: {
        opacity: 0,
        y: 16,
        scale: 0.96
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 1.0,
            ease: gentleEase
        }
    },
    exit: {
        scale: 0.88,
        opacity: [1, 1, 0],
        transition: {
            duration: 1.0,
            ease: [0.4, 0, 0.7, 1],
            opacity: {
                times: [0, 0.9, 1],
                duration: 1.0,
                ease: "linear"
            }
        }
    }
};

// Corner assembly entrance variants & Inward suction exit variants (1 full second)
// Top-Right: Enters from top-right (+x, -y), Exits inward toward center (-x, +y)
const topRightVariants = {
    hidden: {
        opacity: 0,
        x: 90,
        y: -70,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: {
            duration: 1.0,
            delay: 0.03,
            ease: gentleEase
        }
    },
    exit: {
        x: -120,
        y: 60,
        scale: 0.88,
        opacity: [1, 1, 0],
        transition: {
            duration: 1.0,
            ease: [0.4, 0, 0.7, 1],
            opacity: {
                times: [0, 0.9, 1],
                duration: 1.0,
                ease: "linear"
            }
        }
    }
};

// Bottom-Right: Enters from bottom-right (+x, +y), Exits inward toward center (-x, -y)
const bottomRightVariants = {
    hidden: {
        opacity: 0,
        x: 90,
        y: 70,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: {
            duration: 1.0,
            delay: 0.08,
            ease: gentleEase
        }
    },
    exit: {
        x: -120,
        y: -60,
        scale: 0.88,
        opacity: [1, 1, 0],
        transition: {
            duration: 1.0,
            ease: [0.4, 0, 0.7, 1],
            opacity: {
                times: [0, 0.9, 1],
                duration: 1.0,
                ease: "linear"
            }
        }
    }
};

// Top-Left: Enters from top-left (-x, -y), Exits inward toward center (+x, +y)
const topLeftVariants = {
    hidden: {
        opacity: 0,
        x: -90,
        y: -70,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: {
            duration: 1.0,
            delay: 0.03,
            ease: gentleEase
        }
    },
    exit: {
        x: 120,
        y: 60,
        scale: 0.88,
        opacity: [1, 1, 0],
        transition: {
            duration: 1.0,
            ease: [0.4, 0, 0.7, 1],
            opacity: {
                times: [0, 0.9, 1],
                duration: 1.0,
                ease: "linear"
            }
        }
    }
};

// Bottom-Left: Enters from bottom-left (-x, +y), Exits inward toward center (+x, -y)
const bottomLeftVariants = {
    hidden: {
        opacity: 0,
        x: -90,
        y: 70,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: {
            duration: 1.0,
            delay: 0.08,
            ease: gentleEase
        }
    },
    exit: {
        x: 120,
        y: -60,
        scale: 0.88,
        opacity: [1, 1, 0],
        transition: {
            duration: 1.0,
            ease: [0.4, 0, 0.7, 1],
            opacity: {
                times: [0, 0.9, 1],
                duration: 1.0,
                ease: "linear"
            }
        }
    }
};

export default function OutfitShowcaseSection({ title = "", outfits = null, sectionType = null, className = "" }) {
    const navigate = useNavigate();
    const { homeSections } = useShop();

    // Determine section config based on sectionType prop or title
    const isMen = sectionType === 'men' || (!sectionType && (title.includes('رجال') || title === "أطقم رجالية كاملة"));
    const isWomen = sectionType === 'women' || (!sectionType && (title.includes('نساء') || title === "أطقم نسائية كاملة"));

    const sectionConfig = isMen 
        ? homeSections?.menOutfit 
        : isWomen 
            ? homeSections?.womenOutfit 
            : null;

    // If section was deactivated by admin, don't render
    if (sectionConfig && sectionConfig.isActive === false) {
        return null;
    }

    const effectiveTitle = sectionConfig?.title || title || (isWomen ? "أطقم نسائية كاملة" : "أطقم رجالية كاملة");
    const effectiveOutfits = (sectionConfig?.outfits && sectionConfig.outfits.length > 0)
        ? sectionConfig.outfits
        : (outfits || (isWomen ? WOMEN_OUTFITS : OUTFITS));

    const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
    const [hasAppeared, setHasAppeared] = useState(false);

    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => {
                setHasAppeared(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isInView]);

    const handleNext = () => {
        setCurrentOutfitIndex((prev) => (prev + 1) % effectiveOutfits.length);
    };

    const handlePrev = () => {
        setCurrentOutfitIndex((prev) => (prev - 1 + effectiveOutfits.length) % effectiveOutfits.length);
    };

    // Auto-rotate every 5 seconds; starts only after the section has appeared
    useEffect(() => {
        if (!hasAppeared) return;
        const timer = setTimeout(() => {
            handleNext();
        }, 5000);
        return () => clearTimeout(timer);
    }, [hasAppeared, currentOutfitIndex, effectiveOutfits.length]);

    const currentOutfit = effectiveOutfits[currentOutfitIndex] || effectiveOutfits[0];

    const getItemImgClass = (item) => {
        const isShoe = item?.name?.includes('حذاء') || item?.category === 'أحذية';
        if (isShoe) {
            return "h-[58%] max-w-[65%] w-auto object-contain transition-transform duration-500 group-hover:scale-105";
        }
        return "h-[75%] max-w-[78%] w-auto object-contain transition-transform duration-500 group-hover:scale-105";
    };

    return (
        <motion.section
            ref={sectionRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`container mx-auto px-6 pt-14 pb-16 overflow-hidden relative ${className}`}
        >
            {/* Section Header Title */}
            {effectiveTitle && (
                <div className="text-center mb-10">
                    <h2 className="text-3xl lg:text-5xl font-black text-[#800020] tracking-tight">
                        {effectiveTitle}
                    </h2>
                </div>
            )}

            <div className="relative">
                {/* Side Floating Navigation Arrows (مربع بأنيميشن InteractiveButton) */}
                <button
                    onClick={handlePrev}
                    aria-label="الطقم السابق"
                    className="flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-sm overflow-hidden bg-[#ebd5c1] items-center justify-center active:scale-95 group cursor-pointer focus:outline-none shadow-none border-0"
                >
                    {/* 1. Base Icon (Burgundy, slides out to the right on hover) */}
                    <div className="absolute inset-0 flex items-center justify-center text-[#800020] z-0 transition-all duration-500 ease-in-out group-hover:translate-x-6 group-hover:opacity-0">
                        <ChevronRight className="w-6 h-6" />
                    </div>

                    {/* 2. Sliding Burgundy Sheet (Enters from left at 35deg skew) */}
                    <span className="absolute inset-0 rounded-sm overflow-hidden pointer-events-none z-10">
                        <span className="absolute -inset-x-8 -inset-y-4 bg-[#800020] -translate-x-[140%] skew-x-[35deg] transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
                    </span>

                    {/* 3. Hover Icon (Beige, enters from left to center on hover) */}
                    <div className="absolute inset-0 flex items-center justify-center text-[#F0DFCD] z-20 pointer-events-none transition-all duration-500 ease-in-out -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                        <ChevronRight className="w-6 h-6 transition-transform duration-500 ease-in-out group-hover:translate-x-0.5" />
                    </div>
                </button>

                <button
                    onClick={handleNext}
                    aria-label="الطقم التالي"
                    className="flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-sm overflow-hidden bg-[#ebd5c1] items-center justify-center active:scale-95 group cursor-pointer focus:outline-none shadow-none border-0"
                >
                    {/* 1. Base Icon (Burgundy, slides out to the left on hover) */}
                    <div className="absolute inset-0 flex items-center justify-center text-[#800020] z-0 transition-all duration-500 ease-in-out group-hover:-translate-x-6 group-hover:opacity-0">
                        <ChevronLeft className="w-6 h-6" />
                    </div>

                    {/* 2. Sliding Burgundy Sheet (Enters from right at -35deg skew) */}
                    <span className="absolute inset-0 rounded-sm overflow-hidden pointer-events-none z-10">
                        <span className="absolute -inset-x-8 -inset-y-4 bg-[#800020] translate-x-[140%] -skew-x-[35deg] transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
                    </span>

                    {/* 3. Hover Icon (Beige, enters from right to center on hover) */}
                    <div className="absolute inset-0 flex items-center justify-center text-[#F0DFCD] z-20 pointer-events-none transition-all duration-500 ease-in-out translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                        <ChevronLeft className="w-6 h-6 transition-transform duration-500 ease-in-out group-hover:-translate-x-0.5" />
                    </div>
                </button>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentOutfitIndex}
                        initial="hidden"
                        animate={hasAppeared ? "visible" : "hidden"}
                        exit="exit"
                        variants={containerVariants}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8 origin-center"
                    >
                        {/* Right Items */}
                        <div className="flex flex-col gap-8">
                            {currentOutfit.rightTop && (
                                <motion.div
                                    key={`rt-${currentOutfit.rightTop.id}`}
                                    className="group cursor-pointer"
                                    onClick={() => navigate(`/product/${currentOutfit.rightTop.id}`)}
                                    variants={topRightVariants}
                                >
                                    <div className="relative bg-[#f0dfcd]/20 overflow-hidden rounded-sm aspect-[10/9] flex items-center justify-center">
                                        <img
                                            src={currentOutfit.rightTop.image}
                                            alt={currentOutfit.rightTop.name}
                                            className={getItemImgClass(currentOutfit.rightTop)}
                                        />
                                    </div>
                                    <div className="text-center mt-4">
                                        <h4 className="font-bold text-lg text-[#800020]">{currentOutfit.rightTop.name}</h4>
                                        <p className="text-[#800020] font-bold mt-1 flex items-center justify-center gap-1">{currentOutfit.rightTop.price.toFixed(2)} <RiyalIcon /></p>
                                    </div>
                                </motion.div>
                            )}

                            {currentOutfit.rightBottom && (
                                <motion.div
                                    key={`rb-${currentOutfit.rightBottom.id}`}
                                    className="group cursor-pointer"
                                    onClick={() => navigate(`/product/${currentOutfit.rightBottom.id}`)}
                                    variants={bottomRightVariants}
                                >
                                    <div className="relative bg-[#f0dfcd]/20 overflow-hidden rounded-sm aspect-[10/9] flex items-center justify-center">
                                        <img
                                            src={currentOutfit.rightBottom.image}
                                            alt={currentOutfit.rightBottom.name}
                                            className={getItemImgClass(currentOutfit.rightBottom)}
                                        />
                                    </div>
                                    <div className="text-center mt-4">
                                        <h4 className="font-bold text-lg text-[#800020]">{currentOutfit.rightBottom.name}</h4>
                                        <p className="text-[#800020] font-bold mt-1 flex items-center justify-center gap-1">{currentOutfit.rightBottom.price.toFixed(2)} <RiyalIcon /></p>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Main Center Item */}
                        <motion.div
                            variants={centerVariants}
                            className="group cursor-pointer lg:row-span-2 flex flex-col h-full z-10 relative"
                            onClick={() => navigate(`/product/${currentOutfit.mainProductId}`)}
                        >
                            <div className="relative bg-[#f0dfcd]/20 overflow-hidden rounded-sm flex-1 min-h-[420px] flex items-center justify-center">
                                <div className="absolute top-4 left-4 z-20 shadow-md">
                                    <InteractiveButton>
                                        شراء الطقم كامل
                                    </InteractiveButton>
                                </div>
                                <img
                                    src={currentOutfit.mainImage}
                                    alt={currentOutfit.title}
                                    className="w-[90%] h-[90%] object-cover translate-y-8 transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="text-center mt-6">
                                <h4 className="font-bold text-2xl text-[#800020]">{currentOutfit.title}</h4>
                                <p className="text-[#800020] font-bold mt-2 text-xl flex items-center justify-center gap-1">
                                    {typeof currentOutfit.price === 'number' ? currentOutfit.price.toFixed(2) : currentOutfit.price} <RiyalIcon />
                                </p>
                            </div>
                        </motion.div>

                        {/* Left Items */}
                        <div className="flex flex-col gap-8">
                            {currentOutfit.leftTop && (
                                <motion.div
                                    key={`lt-${currentOutfit.leftTop.id}`}
                                    className="group cursor-pointer"
                                    onClick={() => navigate(`/product/${currentOutfit.leftTop.id}`)}
                                    variants={topLeftVariants}
                                >
                                    <div className="relative bg-[#f0dfcd]/20 overflow-hidden rounded-sm aspect-[10/9] flex items-center justify-center">
                                        <img
                                            src={currentOutfit.leftTop.image}
                                            alt={currentOutfit.leftTop.name}
                                            className={getItemImgClass(currentOutfit.leftTop)}
                                        />
                                    </div>
                                    <div className="text-center mt-4">
                                        <h4 className="font-bold text-lg text-[#800020]">{currentOutfit.leftTop.name}</h4>
                                        <p className="text-[#800020] font-bold mt-1 flex items-center justify-center gap-1">{currentOutfit.leftTop.price.toFixed(2)} <RiyalIcon /></p>
                                    </div>
                                </motion.div>
                            )}

                            {currentOutfit.leftBottom && (
                                <motion.div
                                    key={`lb-${currentOutfit.leftBottom.id}`}
                                    className="group cursor-pointer"
                                    onClick={() => navigate(`/product/${currentOutfit.leftBottom.id}`)}
                                    variants={bottomLeftVariants}
                                >
                                    <div className="relative bg-[#f0dfcd]/20 overflow-hidden rounded-sm aspect-[10/9] flex items-center justify-center">
                                        <img
                                            src={currentOutfit.leftBottom.image}
                                            alt={currentOutfit.leftBottom.name}
                                            className={getItemImgClass(currentOutfit.leftBottom)}
                                        />
                                    </div>
                                    <div className="text-center mt-4">
                                        <h4 className="font-bold text-lg text-[#800020]">{currentOutfit.leftBottom.name}</h4>
                                        <p className="text-[#800020] font-bold mt-1 flex items-center justify-center gap-1">{currentOutfit.leftBottom.price.toFixed(2)} <RiyalIcon /></p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation Bar (البار السفلي بنقاط التبديل الحمراء فقط دون أزرار) */}
            <div className="mt-8 flex items-center justify-center relative z-30">
                <div className="flex items-center gap-2 bg-[#f0dfcd]/70 backdrop-blur-md px-4 py-2 rounded-full shadow-none border-0">
                    {effectiveOutfits.map((_, index) => {
                        const isActive = index === currentOutfitIndex;
                        return (
                            <button
                                key={index}
                                onClick={() => setCurrentOutfitIndex(index)}
                                aria-label={`الطقم ${index + 1}`}
                                className="p-1 focus:outline-none flex items-center justify-center cursor-pointer"
                            >
                                <motion.div
                                    className="rounded-full bg-[#800020]"
                                    initial={false}
                                    animate={{
                                        width: isActive ? 34 : 10,
                                        height: 10,
                                        opacity: isActive ? 1 : 0.35,
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 350,
                                        damping: 25
                                    }}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>
        </motion.section>
    );
}
