export const initialAdminStats = {
    today: {
        revenue: 14250,
        ordersCount: 38,
        aov: 375,
        growth: '+14.2%',
        conversionRate: '4.2%',
        visitors: 1840,
    },
    week: {
        revenue: 68400,
        ordersCount: 172,
        aov: 397,
        growth: '+18.6%',
        conversionRate: '3.9%',
        visitors: 9420,
    },
    month: {
        revenue: 248900,
        ordersCount: 610,
        aov: 408,
        growth: '+22.4%',
        conversionRate: '3.8%',
        visitors: 38200,
    },
    year: {
        revenue: 1840000,
        ordersCount: 4620,
        aov: 398,
        growth: '+31.8%',
        conversionRate: '3.7%',
        visitors: 312000,
    }
};

export const salesTimelineData = [
    { label: 'السبت', revenue: 18500, orders: 42, day: 'Sat' },
    { label: 'الأحد', revenue: 22400, orders: 55, day: 'Sun' },
    { label: 'الإثنين', revenue: 19800, orders: 48, day: 'Mon' },
    { label: 'الثلاثاء', revenue: 26300, orders: 64, day: 'Tue' },
    { label: 'الأربعاء', revenue: 31200, orders: 75, day: 'Wed' },
    { label: 'الخميس', revenue: 42800, orders: 104, day: 'Thu' },
    { label: 'الجمعة', revenue: 47900, orders: 122, day: 'Fri' },
];

export const monthlySalesTimelineData = [
    { label: 'يناير', revenue: 142000, orders: 360 },
    { label: 'فبراير', revenue: 158000, orders: 390 },
    { label: 'مارس', revenue: 189000, orders: 470 },
    { label: 'أبريل', revenue: 174000, orders: 430 },
    { label: 'مايو', revenue: 165000, orders: 410 },
    { label: 'يونيو', revenue: 198000, orders: 490 },
    { label: 'يوليو', revenue: 215000, orders: 530 },
    { label: 'أغسطس', revenue: 204000, orders: 505 },
    { label: 'سبتمبر', revenue: 228000, orders: 560 },
    { label: 'أكتوبر', revenue: 248900, orders: 610 },
];

export const salesByCategory = [
    { name: 'أزياء رجالية', percentage: 46, revenue: 114494, count: 280, color: '#800020' },
    { name: 'أزياء نسائية', percentage: 26, revenue: 64714, count: 160, color: '#9e1b32' },
    { name: 'أحذية فاخرة', percentage: 17, revenue: 42313, count: 104, color: '#b33951' },
    { name: 'إكسسوارات وعطور', percentage: 11, revenue: 27379, count: 66, color: '#c46d7e' },
];

export const salesByPaymentMethod = [
    { name: 'مدى (Mada)', percentage: 45, icon: 'CreditCard', count: 275 },
    { name: 'أبل باي (Apple Pay)', percentage: 32, icon: 'Smartphone', count: 195 },
    { name: 'تمارا / تابي (أقساط)', percentage: 14, icon: 'Clock', count: 85 },
    { name: 'بطاقات ائتمانية (Visa / MC)', percentage: 7, icon: 'CreditCard', count: 43 },
    { name: 'الدفع عند الاستلام (COD)', percentage: 2, icon: 'Banknote', count: 12 },
];

export const salesByCity = [
    { city: 'الرياض', percentage: 52, revenue: 129428, orders: 317 },
    { city: 'جدة', percentage: 22, revenue: 54758, orders: 134 },
    { city: 'الدمام والخبر', percentage: 14, revenue: 34846, orders: 85 },
    { city: 'مكة المكرمة', percentage: 7, revenue: 17423, orders: 43 },
    { city: 'المدينة المنورة', percentage: 5, revenue: 12445, orders: 31 },
];

export const initialOrdersList = [];

export const orderStatusMeta = {
    all: { label: 'جميع الطلبات', badgeColor: 'bg-neutral-800 text-white', dotColor: 'bg-neutral-400', textColor: 'text-neutral-800' },
    new: { label: 'طلب جديد', badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300', dotColor: 'bg-[#FBBF24]', textColor: 'text-amber-500' },
    processing: { label: 'قيد التجهيز', badgeColor: 'bg-blue-100 text-blue-900 border border-blue-300', dotColor: 'bg-blue-500', textColor: 'text-blue-700' },
    shipping: { label: 'جاري التوصيل', badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300', dotColor: 'bg-purple-500', textColor: 'text-purple-700' },
    delivered: { label: 'تم التوصيل', badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300', dotColor: 'bg-emerald-500', textColor: 'text-emerald-700' },
    cancelled: { label: 'ملغي', badgeColor: 'bg-rose-100 text-rose-900 border border-rose-300', dotColor: 'bg-rose-500', textColor: 'text-rose-700' },
};

export const storeQuickImages = [
    { name: 'معطف جوخ فاخر', url: '/images/coat_transparent.png', category: 'معاطف' },
    { name: 'بلوفر صوف كلاسيك', url: '/images/blover_transparent.png', category: 'قمصان' },
    { name: 'حذاء جلدي رسمي', url: '/images/leather_shoes_transparent.png', category: 'أحذية' },
    { name: 'بنطال قماشي أنيق', url: '/images/pants_transparent.png', category: 'بناطيل' },
    { name: 'إطلالة شتاء كاملة', url: '/images/winter_outfit_transparent.png', category: 'إطلالات' },
    { name: 'جاكيت جلد طبيعي', url: '/images/leather_jacket_transparent.png', category: 'معاطف' },
    { name: 'حذاء لوفر صيفي', url: '/images/summer_loafers_transparent.png', category: 'أحذية' },
    { name: 'بنطال سليم فيت', url: '/images/slim_trousers_transparent.png', category: 'بناطيل' },
    { name: 'ساعة يد فاخرة', url: '/images/lux_accessories_bg_removed.png', category: 'ساعات' },
    { name: 'طقم أساور وخواتم', url: '/images/user_accessories_bg_removed.png', category: 'خواتم' },
    { name: 'عطر مسك فاخر', url: '/images/accessories_new_bg_removed.png', category: 'عطور' },
    { name: 'عباءة وأزياء نسائية', url: '/images/women_new_bg_removed.png', category: 'عبايات' },
];

export const DEPARTMENT_CATEGORIES = {
    men: {
        id: 'men',
        label: 'رجالي',
        categories: [
            'إطلالات',
            'معاطف',
            'قمصان',
            'بناطيل',
            'أحذية'
        ]
    },
    women: {
        id: 'women',
        label: 'نسائي',
        categories: [
            'إطلالات',
            'فساتين',
            'عبايات',
            'قمصان',
            'بناطيل',
            'أحذية',
            'حقائب'
        ]
    },
    unisex: {
        id: 'unisex',
        label: 'إكسسوارات',
        categories: [
            'ساعات',
            'عطور',
            'خواتم',
            'نظارات',
            'محافظ',
            'أحزمة'
        ]
    }
};

export const productCategoriesList = [
    'إطلالات',
    'معاطف',
    'قمصان',
    'بناطيل',
    'أحذية',
    'فساتين',
    'عبايات',
    'حقائب',
    'ساعات',
    'عطور',
    'خواتم',
    'نظارات',
    'محافظ',
    'أحزمة'
];

export const abayaThobeSizesList = ['50', '52', '54', '56', '58', '60', '62'];
export const clothingSizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
export const shoeSizesList = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

export const commonSizesList = [
    'S', 'M', 'L', 'XL', 'XXL', '3XL',
    '50', '52', '54', '56', '58', '60', '62',
    '38', '39', '40', '41', '42', '43', '44', '45',
    'Free Size'
];

export const commonColorsList = [
    { name: 'أسود ملكي', hex: '#111111' },
    { name: 'رمادي غامق', hex: '#4a4a4c' },
    { name: 'رمادي فاتح', hex: '#b0b0b0' },
    { name: 'كحلي داكن', hex: '#0f172a' },
    { name: 'أزرق ملكي', hex: '#1e3a8a' },
    { name: 'جملي دافئ', hex: '#c19a6b' },
    { name: 'بني قهوة', hex: '#3e2723' },
    { name: 'عنابي ثياب', hex: '#800020' },
    { name: 'بيج رملي', hex: '#e8d8c8' },
    { name: 'أبيض ناصع', hex: '#ffffff' },
    { name: 'زيتوني هادئ', hex: '#4b5320' },
];
