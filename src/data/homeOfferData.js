/**
 * Home Page Offer Section Data & Presets
 */

export const DEFAULT_HOME_OFFER = {
    id: 'default-home-offer',
    isActive: true,
    productId: '1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7', // حذاء جلدي فاخر
    productName: 'حذاء جلدي فاخر كلاسيكي',
    category: 'أحذية',
    title: 'عرض محدود وحصري',
    badgeText: 'خصم',
    discount: '70%',
    originalPrice: 400,
    salePrice: 150,
    imageUrl: '/new_offer_shoes_transparent.png',
    imageScale: 1.1,
    targetUrl: '/product/1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7',
    durationDays: 3,
    durationHours: 23,
    durationMinutes: 15,
    durationSeconds: 33,
    endTimestamp: null // If null, timer initializes dynamically
};

export const QUICK_OFFER_PRESETS = [
    {
        name: 'حذاء جلدي فاخر (العرض الحالي)',
        productId: '1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7',
        productName: 'حذاء جلدي فاخر كلاسيكي',
        category: 'أحذية',
        badgeText: 'خصم',
        discount: '70%',
        originalPrice: 400,
        salePrice: 150,
        imageUrl: '/new_offer_shoes_transparent.png',
        imageScale: 1.1,
        targetUrl: '/product/1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7'
    },
    {
        name: 'معطف جوخ مزدوج الصدر فاخر',
        productId: '1fe2999b-3b5f-4e89-a994-f6b5fb9ea961',
        productName: 'معطف جوخ مزدوج الصدر بحزام',
        category: 'معاطف وجاكيتات',
        badgeText: 'تخفيض حصري',
        discount: '50%',
        originalPrice: 1200,
        salePrice: 590,
        imageUrl: '/images/coat_transparent.png',
        imageScale: 1.0,
        targetUrl: '/product/1fe2999b-3b5f-4e89-a994-f6b5fb9ea961'
    },
    {
        name: 'حذاء لوفر صيفي أنيق',
        productId: 'f3335d50-60b9-4d7a-ae4e-004fadbe0786',
        productName: 'حذاء لوفر صيفي أنيق',
        category: 'أحذية',
        badgeText: 'تصفية خاصة',
        discount: '60%',
        originalPrice: 480,
        salePrice: 190,
        imageUrl: '/images/summer_loafers_transparent.png',
        imageScale: 1.05,
        targetUrl: '/product/f3335d50-60b9-4d7a-ae4e-004fadbe0786'
    },
    {
        name: 'طقم أكسسوارات وساعة ملكية',
        productId: 'c0d3ae2a-8fa5-48e0-b028-fa04468dc1f5',
        productName: 'طقم إكسسوارات وساعة فاخرة',
        category: 'إكسسوارات',
        badgeText: 'عرض خاص',
        discount: '45%',
        originalPrice: 1200,
        salePrice: 660,
        imageUrl: '/images/lux_accessories_bg_removed.png',
        imageScale: 1.0,
        targetUrl: '/product/c0d3ae2a-8fa5-48e0-b028-fa04468dc1f5'
    },
    {
        name: 'بلوفر ياقة عالية كلاسيكي',
        productId: 'f203ea74-16d8-4527-9f95-f27665996f5f',
        productName: 'بلوفر ياقة عالية كلاسيكي',
        category: 'كنزات وبلوفرات',
        badgeText: 'عرض شتوي',
        discount: '55%',
        originalPrice: 450,
        salePrice: 199,
        imageUrl: '/images/blover_transparent.png',
        imageScale: 1.0,
        targetUrl: '/product/f203ea74-16d8-4527-9f95-f27665996f5f'
    },
    {
        name: 'إطلالة الشتاء المتكاملة',
        productId: '72baf1c5-045e-4b01-9c0f-f7a26342dfc9',
        productName: 'إطلالة الشتاء المتكاملة',
        category: 'أطقم متكاملة',
        badgeText: 'طقم الموسم',
        discount: '33%',
        originalPrice: 1789,
        salePrice: 1200,
        imageUrl: '/images/winter_outfit_transparent.png',
        imageScale: 1.0,
        targetUrl: '/product/72baf1c5-045e-4b01-9c0f-f7a26342dfc9'
    }
];

export const OFFER_IMAGES_GALLERY = [
    { label: 'حذاء عرض شفاف (العرض الأساسي)', url: '/new_offer_shoes_transparent.png' },
    { label: 'حذاء جلد رسمي', url: '/images/leather_shoes_transparent.png' },
    { label: 'حذاء لوفر صيفي', url: '/images/summer_loafers_transparent.png' },
    { label: 'معطف جوخ فاخر', url: '/images/coat_transparent.png' },
    { label: 'جاكيت جلد طبيعي', url: '/images/leather_jacket_transparent.png' },
    { label: 'بلوفر صوف كلاسيك', url: '/images/blover_transparent.png' },
    { label: 'إطلالة شتاء كاملة', url: '/images/winter_outfit_transparent.png' },
    { label: 'ساعة يد وإكسسوارات', url: '/images/lux_accessories_bg_removed.png' },
    { label: 'طقم أساور وعطور', url: '/images/user_accessories_bg_removed.png' },
    { label: 'عطر مسك ومجوهرات', url: '/images/accessories_new_bg_removed.png' },
    { label: 'بنطال قماشي فاخر', url: '/images/pants_transparent.png' },
    { label: 'أزياء نسائية فاخرة', url: '/images/women_new_bg_removed.png' }
];
