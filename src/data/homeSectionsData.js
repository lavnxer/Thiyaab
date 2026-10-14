import { DEFAULT_HOME_OFFER } from './homeOfferData';

export const DEFAULT_MEN_OUTFITS = [
    {
        id: "outfit-men-1",
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
        id: "outfit-men-2",
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

export const DEFAULT_WOMEN_OUTFITS = [
    {
        id: "outfit-women-1",
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
        id: "outfit-women-2",
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

export const DEFAULT_BEST_SELLERS_CONFIG = {
    isActive: true,
    title: "الأكثر مبيعاً",
    subtitle: "القطع الأكثر طلباً وتميزاً. تصفح تشكيلتنا من المنتجات التي نالت إعجاب عملائنا بفضل جودتها وتصميمها الاستثنائي.",
    autoMode: true, // Automatically connected to top-selling products based on real orders
    limit: 8,
    customProductIds: []
};

export const DEFAULT_HOME_SECTIONS = {
    menOutfit: {
        id: 'men-outfit-section',
        name: 'قسم طقم رجالي متكامل',
        isActive: true,
        title: 'أطقم رجالية كاملة',
        outfits: DEFAULT_MEN_OUTFITS
    },
    bestSellers: {
        id: 'best-sellers-section',
        name: 'قسم الأكثر مبيعاً',
        ...DEFAULT_BEST_SELLERS_CONFIG
    },
    womenOutfit: {
        id: 'women-outfit-section',
        name: 'قسم طقم نسائي متكامل',
        isActive: true,
        title: 'أطقم نسائية كاملة',
        outfits: DEFAULT_WOMEN_OUTFITS
    },
    offer: {
        id: 'home-offer-section',
        name: 'بانر العرض الترويجي',
        ...DEFAULT_HOME_OFFER
    }
};
