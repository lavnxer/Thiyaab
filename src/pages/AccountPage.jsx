import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Truck, 
    MapPin, 
    User, 
    CreditCard, 
    Heart, 
    MessageCircle, 
    LogOut, 
    Download, 
    MoreVertical, 
    Check, 
    Plus,
    Edit2,
    X,
    XCircle,
    AlertTriangle,
    AlertCircle,
    Wifi,
    Trash2,
    SlidersHorizontal,
    ShieldCheck,
    ChevronDown,
    Key
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import RiyalIcon from '../components/RiyalIcon';
import InteractiveButton from '../components/InteractiveButton';
import CustomDropdown from '../components/CustomDropdown';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { addressesApi, savedCardsApi, ordersApi } from '../lib/api';
import { CardBrandBadge, RealisticEmvChip } from '../components/PaymentLogos';
import { supabase } from '../lib/supabase';


// SVG Logo Components for Payment Cards
const VisaLogo = ({ className = "w-8 h-5.5" }) => (
    <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="24" rx="3.5" fill="#1A1F71" />
        <path d="M14.2 16.5H12.1L13.4 8.5H15.5L14.2 16.5Z" fill="white" />
        <path d="M21.2 8.7C20.8 8.5 20.2 8.3 19.4 8.3C17.3 8.3 15.8 9.4 15.8 11C15.8 12.2 16.9 12.8 17.7 13.2C18.5 13.6 18.8 13.9 18.8 14.3C18.8 14.9 18.1 15.1 17.5 15.1C16.6 15.1 16.1 15 15.4 14.7L15.1 14.5L14.8 16.5C15.3 16.7 16.3 16.9 17.3 16.9C19.5 16.9 21 15.8 21 14.1C21 13.1 20.4 12.3 19.1 11.7C18.3 11.3 17.8 11 17.8 10.6C17.8 10.2 18.2 9.8 19.1 9.8C19.8 9.8 20.4 10 20.8 10.2L21 10.3L21.2 8.7Z" fill="white" />
        <path d="M24.5 14.1C24.7 13.6 25.4 11.7 25.4 11.7C25.4 11.7 25.6 11.3 25.7 11.1L25.8 11.7C25.8 11.7 26.2 13.4 26.3 14.1H24.5ZM27.7 8.5H26C25.5 8.5 25.1 8.7 24.9 9.2L21 16.5H23.3L23.7 15.3H26.4L26.7 16.5H28.6L27.7 8.5Z" fill="white" />
        <path d="M10.3 8.5L8.3 14L8.1 13C7.7 11.7 6.5 10.4 5.2 9.7L7.1 16.5H9.3L12.6 8.5H10.3Z" fill="white" />
        <path d="M6.6 8.5H3.2L3.1 8.7C5.7 9.4 7.8 11 8.5 13.1L7.8 9.7C7.7 9.1 7.2 8.7 6.6 8.5Z" fill="#F7B600" />
    </svg>
);

const MastercardLogo = ({ className = "w-8 h-5.5" }) => (
    <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="24" rx="3.5" fill="#222222" />
        <circle cx="14" cy="12" r="6.5" fill="#EB001B" />
        <circle cx="22" cy="12" r="6.5" fill="#F79E1B" />
        <path d="M18 7.6C19.3 8.7 20.1 10.3 20.1 12C20.1 13.7 19.3 15.3 18 16.4C16.7 15.3 15.9 13.7 15.9 12C15.9 10.3 16.7 8.7 18 7.6Z" fill="#FF5F00" />
    </svg>
);

const MadaLogo = ({ className = "w-8 h-5.5" }) => (
    <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="24" rx="3.5" fill="#006C35" />
        <text x="50%" y="45%" dominantBaseline="central" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="900" fontFamily="sans-serif">mada</text>
        <text x="50%" y="78%" dominantBaseline="central" textAnchor="middle" fill="#A7F3D0" fontSize="6" fontWeight="bold" fontFamily="sans-serif">مدى</text>
    </svg>
);

const AmexLogo = ({ className = "w-8 h-5.5" }) => (
    <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="24" rx="3.5" fill="#1C3F60" />
        <text x="50%" y="54%" dominantBaseline="central" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">AMEX</text>
    </svg>
);

// Card theme generator based on brand/type
const getCardTheme = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('mada') || t.includes('مدى')) {
        return {
            name: 'مدى / Mada',
            bg: 'bg-gradient-to-br from-[#006C35] via-[#005228] to-[#00381B]',
            border: 'border-emerald-400/40',
            glow: 'shadow-emerald-950/40',
            textColor: 'text-white',
            subText: 'text-emerald-100/80',
            brandLogo: 'mada',
            chipGlow: 'from-amber-200 via-amber-300 to-amber-500'
        };
    }
    if (t.includes('visa') || t.includes('فيزا')) {
        return {
            name: 'فيزا / Visa',
            bg: 'bg-gradient-to-br from-[#1A1F71] via-[#0D2E7A] to-[#061845]',
            border: 'border-blue-400/40',
            glow: 'shadow-blue-950/40',
            textColor: 'text-white',
            subText: 'text-blue-100/80',
            brandLogo: 'visa',
            chipGlow: 'from-amber-200 via-amber-300 to-amber-500'
        };
    }
    if (t.includes('master') || t.includes('ماستر')) {
        return {
            name: 'ماستركارد / Mastercard',
            bg: 'bg-gradient-to-br from-[#2D0F0A] via-[#1E1114] to-[#100708]',
            border: 'border-orange-500/40',
            glow: 'shadow-orange-950/40',
            textColor: 'text-white',
            subText: 'text-orange-100/80',
            brandLogo: 'mastercard',
            chipGlow: 'from-amber-200 via-amber-300 to-amber-500'
        };
    }
    if (t.includes('amex') || t.includes('أمريكان') || t.includes('american')) {
        return {
            name: 'أمريكان إكسبريس / Amex',
            bg: 'bg-gradient-to-br from-[#1C3F60] via-[#0E2235] to-[#07131E]',
            border: 'border-cyan-400/40',
            glow: 'shadow-cyan-950/40',
            textColor: 'text-white',
            subText: 'text-cyan-100/80',
            brandLogo: 'amex',
            chipGlow: 'from-slate-200 via-slate-300 to-slate-400'
        };
    }
    // Default fallback
    return {
        name: type || 'بطاقة بنكية',
        bg: 'bg-gradient-to-br from-[#800020] via-[#540015] to-[#29000A]',
        border: 'border-[#F0DFCD]/40',
        glow: 'shadow-rose-950/40',
        textColor: 'text-white',
        subText: 'text-[#F0DFCD]/80',
        brandLogo: 'default',
        chipGlow: 'from-amber-200 via-amber-300 to-amber-500'
    };
};

// Auto-detect card brand key based on card number digits
const getDetectedBrandKey = (digits) => {
    const clean = (digits || '').replace(/\D/g, '');
    if (!clean) return null;

    // 1. Mada specific BIN prefixes (Saudi Arabia)
    const madaPrefixes = [
        '5888', '5889', '5890', '5892', '9682', '6049', '6051', '6361',
        '484783', '401757', '455708', '455036', '457865', '457997', '400814', 
        '428671', '428672', '428673', '446393', '409201', '458456', '468540', 
        '468541', '468542', '468543', '493428', '535825', '543357', '521076',
        '504300', '508160', '524130', '524514', '529415', '529741', '530906',
        '531095', '531196', '532013', '535989', '536023', '537767', '539738',
        '554180', '557606', '558848'
    ];

    if (madaPrefixes.some(prefix => clean.startsWith(prefix))) {
        return 'mada';
    }

    // 2. American Express (starts with 34 or 37)
    if (/^3[47]/.test(clean)) {
        return 'amex';
    }

    // 3. Visa (starts with 4)
    if (/^4/.test(clean)) {
        return 'visa';
    }

    // 4. Mastercard (starts with 51-55 or 2221-2720)
    if (/^(5[1-5]|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)/.test(clean)) {
        return 'mastercard';
    }

    // 5. Broad Mada fallback ranges in KSA (starts with 58, 60, or 96)
    if (/^(58|60|96)/.test(clean)) {
        return 'mada';
    }

    return null;
};

// Auto-detect card brand formatted name based on card number digits
const detectCardType = (digits) => {
    const key = getDetectedBrandKey(digits);
    if (key === 'mada') return 'مدى / Mada';
    if (key === 'visa') return 'فيزا / Visa';
    if (key === 'mastercard') return 'ماستركارد / Mastercard';
    if (key === 'amex') return 'أمريكان إكسبريس / Amex';
    return '';
};

// Validate Card using standard Luhn algorithm (Mod 10 checksum)
const isValidLuhn = (numStr) => {
    const clean = (numStr || '').replace(/\D/g, '');
    if (clean.length < 15 || clean.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
        let digit = parseInt(clean.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
};

// Check if expiry date is logically valid and in the future
const validateExpiryDate = (expiryStr) => {
    if (!expiryStr || expiryStr.length < 5) {
        return { valid: false, error: 'تاريخ غير مكتمل (MM/YY)' };
    }
    const [mStr, yStr] = expiryStr.split('/');
    const month = parseInt(mStr, 10);
    const year = parseInt(yStr, 10);
    if (isNaN(month) || month < 1 || month > 12) {
        return { valid: false, error: 'الشهر غير صحيح (يجب أن يكون بين 01 و 12)' };
    }
    if (isNaN(year)) {
        return { valid: false, error: 'سنة غير صحيحة' };
    }
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return { valid: false, error: 'البطاقة منتهية الصلاحية ومرفوضة' };
    }
    if (year > currentYear + 15) {
        return { valid: false, error: 'سنة الانتهاء بعيدة جداً' };
    }
    return { valid: true };
};

const saudiRegionsData = {
    'منطقة الرياض': {
        cities: ['الرياض', 'الخرج', 'الدرعية', 'المجمعة', 'الدوادمي', 'الزلفي', 'وادي الدواسر'],
        districts: {
            'الرياض': ['حي الصحافة', 'حي الياسمين', 'حي النرجس', 'حي الملقا', 'حي العقيق', 'حي حطين', 'حي العليا', 'حي السليمانية', 'حي الروضة', 'حي النخيل', 'حي الغدير', 'حي المروج', 'حي الوادي', 'حي الفلاح', 'حي قرطبة'],
            default: ['وسط المدينة', 'الحي الشمالي', 'الحي الجنوبي', 'الحي الشرقي', 'الحي الغربي']
        }
    },
    'منطقة مكة المكرمة': {
        cities: ['جدة', 'مكة المكرمة', 'الطائف', 'رابغ', 'القنفذة', 'الليث'],
        districts: {
            'جدة': ['حي الروضة', 'حي السلامة', 'حي الشاطئ', 'حي الحمراء', 'حي الزهراء', 'حي الصفا', 'حي أبحر الشمالية', 'حي المحمدية', 'حي المرجان', 'حي النعيم', 'حي البساتين'],
            'مكة المكرمة': ['حي العوالي', 'حي الشوقية', 'حي العزيزية', 'حي بطحاء قريش', 'حي النوارية', 'حي الرصيفة'],
            'الطائف': ['حي شهار', 'حي الفيصلية', 'حي الحوية', 'حي القمرية'],
            default: ['وسط المدينة', 'الحي الشمالي', 'الحي الجنوبي']
        }
    },
    'المنطقة الشرقية': {
        cities: ['الدمام', 'الخبر', 'الظهران', 'الأحساء (الهفوف)', 'الجبيل', 'القطيف', 'حفر الباطن', 'الخفجي'],
        districts: {
            'الدمام': ['حي الشاطئ', 'حي الفنار', 'حي المزروعية', 'حي الجلوية', 'حي الفيصلية', 'حي الطبيشي'],
            'الخبر': ['حي الحزام الذهبي', 'حي العقربية', 'حي الجسر', 'حي العليا', 'حي الراكة', 'حي الكورنيش'],
            default: ['وسط المدينة', 'الحي الشمالي', 'الحي الجنوبي']
        }
    },
    'منطقة المدينة المنورة': {
        cities: ['المدينة المنورة', 'ينبع', 'العلا', 'بدر', 'مهد الذهب'],
        districts: {
            'المدينة المنورة': ['حي العوالي', 'حي سلطانة', 'حي الخالدية', 'حي بئر عثمان', 'حي باقدو'],
            default: ['وسط المدينة', 'حي الشاطئ', 'حي الميناء']
        }
    },
    'منطقة القصيم': {
        cities: ['بريدة', 'عنيزة', 'الرس', 'البكيرية', 'المذنب'],
        districts: {
            'بريدة': ['حي الصفراء', 'حي الإسكان', 'حي الفايزية', 'حي الريان'],
            default: ['وسط المدينة', 'الحي الشمالي']
        }
    },
    'منطقة عسير': {
        cities: ['أبها', 'خميس مشيط', 'أحد رفيدة', 'النماص', 'محايل عسير'],
        districts: {
            'أبها': ['حي المفتاحة', 'حي المنسك', 'حي الضباب', 'حي الخالدية'],
            default: ['وسط المدينة', 'حي الفيصلية']
        }
    },
    'منطقة تبوك': {
        cities: ['تبوك', 'ضباء', 'الوجه', 'حقل', 'أملج'],
        districts: {
            default: ['حي المروج', 'حي الورود', 'حي السليمانية', 'حي الصفا']
        }
    },
    'منطقة حائل': {
        cities: ['حائل', 'بقعاء'],
        districts: {
            default: ['حي الوسيطاء', 'حي الجامعيين', 'حي النقرة', 'حي صديان']
        }
    },
    'منطقة جازان': {
        cities: ['جازان', 'صبيا', 'أبو عريش', 'صامطة'],
        districts: {
            default: ['حي الشاطئ', 'حي السويس', 'حي المطار']
        }
    },
    'منطقة نجران': {
        cities: ['نجران', 'شرورة'],
        districts: {
            default: ['حي الفهد', 'حي الخالدية', 'حي الفيصلية']
        }
    },
    'منطقة الباحة': {
        cities: ['الباحة', 'بلجرشي', 'المندق'],
        districts: {
            default: ['وسط المدينة', 'حي الظفير', 'حي رغدان']
        }
    },
    'منطقة الجوف': {
        cities: ['سكاكا', 'القريات', 'دومة الجندل'],
        districts: {
            default: ['حي الشلهوب', 'حي الخالدية', 'حي الربوة']
        }
    },
    'منطقة الحدود الشمالية': {
        cities: ['عرعر', 'رفحاء', 'طريف'],
        districts: {
            default: ['حي المساعدية', 'حي الخالدية', 'حي الفيصلية']
        }
    }
};

// Helper to format an order record into unified UI representation
const formatOrderRecord = (o, fallbackName = 'العميل') => {
    const cleanId = String(o.order_number || o.id || '').replace(/^ORD-/, '').trim();
    const rawStatus = String(o.status || '').toLowerCase().trim();

    // Determine status type: only completed/delivered is previous, only cancelled is cancelled.
    // ALL OTHER STATUSES (new, confirmed, processing, shipping, shipped, pending, paid, etc.) ARE CURRENT!
    const isCancelled = rawStatus === 'cancelled' || rawStatus === 'canceled' || rawStatus === 'ملغي' || rawStatus === 'ملغاة';
    const isDelivered = rawStatus === 'delivered' || rawStatus === 'completed' || rawStatus === 'مكتمل' || rawStatus === 'تم التوصيل';
    const statusType = isCancelled ? 'cancelled' : isDelivered ? 'previous' : 'current';

    const statusText = rawStatus === 'shipping' || rawStatus === 'shipped'
        ? 'في الطريق'
        : isDelivered
            ? 'تم التوصيل للعميل'
            : isCancelled
                ? 'تم الإلغاء'
                : rawStatus === 'processing'
                    ? 'قيد التجهيز'
                    : 'طلب جديد';

    const statusColor = rawStatus === 'shipping' || rawStatus === 'shipped'
        ? 'text-orange-500'
        : isDelivered
            ? 'text-emerald-600'
            : isCancelled
                ? 'text-rose-600'
                : rawStatus === 'processing'
                    ? 'text-blue-600'
                    : 'text-amber-500';

    const dateObj = o.created_at ? new Date(o.created_at) : new Date();

    const rawItems = o.items || o.order_items || [];
    const items = rawItems.map(it => ({
        name: it.product_name || it.name || 'منتج فاخر',
        qty: Number(it.quantity || it.qty) || 1,
        price: Number(it.price) || 0,
        color: it.color || 'أسود',
        size: it.size || 'L',
        img: it.product_image || it.img || it.image || '/images/coat_transparent.png'
    }));

    const shippingAddr = o.shipping_address;
    const addressStr = typeof shippingAddr === 'string'
        ? shippingAddr
        : shippingAddr?.address || shippingAddr?.fullAddress || 'الرياض، المملكة العربية السعودية';

    return {
        id: cleanId,
        rawId: o.order_number || o.id,
        itemCount: items.length || 1,
        customerName: (typeof shippingAddr === 'object' ? shippingAddr?.name : '') || fallbackName,
        date: dateObj.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: dateObj.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        statusType,
        statusText,
        statusColor,
        deliveryDate: o.estimated_delivery || 'خلال 2-4 أيام عمل',
        address: addressStr,
        total: Number(o.total) || 0,
        items
    };
};

const getStoredOrders = () => {
    try {
        const cached = JSON.parse(localStorage.getItem('thyiaab_orders_cache') || '{}');
        const values = Object.values(cached);
        const uniqueMap = new Map();
        values.forEach(v => {
            const cleanId = String(v.order_number || v.id || '').replace(/^ORD-/, '').trim();
            if (cleanId && !uniqueMap.has(cleanId)) {
                uniqueMap.set(cleanId, formatOrderRecord(v));
            }
        });
        return Array.from(uniqueMap.values());
    } catch (e) {
        return [];
    }
};

const getStoredCards = () => {
    try {
        const cached = JSON.parse(localStorage.getItem('thyiaab_saved_cards') || '[]');
        if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch (e) {}
    return [
        {
            id: 'card-1',
            type: 'مدى / Mada',
            number: '•••• •••• •••• 7593',
            expiry: '02/49',
            holder: 'هكتشتمينيبنلبنيلنعنشتر',
            isDefault: false
        },
        {
            id: 'card-2',
            type: 'مدى / Mada',
            number: '•••• •••• •••• 6567',
            expiry: '01/49',
            holder: 'LSAKAQJOSLKJDS',
            isDefault: true
        }
    ];
};

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab && ['orders', 'addresses', 'payments', 'info'].includes(tab)) {
                return tab;
            }
        } catch (e) {}
        return 'orders';
    });
    const [orderFilter, setOrderFilter] = useState('current'); // current, previous, cancelled, all
    const { showToast } = useToast();
    const { user, profile, isAdmin, updateProfile, signOut } = useAuth();
    const navigate = useNavigate();

    // Orders management state with instant zero-lag cached hydration
    const [ordersList, setOrdersList] = useState(getStoredOrders);
    const [isOrdersLoading, setIsOrdersLoading] = useState(() => getStoredOrders().length === 0);
    const [openMenuOrderId, setOpenMenuOrderId] = useState(null);
    const [cancelModalOrder, setCancelModalOrder] = useState(null);

    // Helper to split full name into first name and second/last name
    const splitFullName = (fullName = '') => {
        const clean = (fullName || '').trim();
        if (!clean) return { firstName: '', lastName: '' };
        const parts = clean.split(/\s+/);
        return {
            firstName: parts[0] || '',
            lastName: parts.slice(1).join(' ') || ''
        };
    };

    // Personal user information state (supports first name, second name, email)
    const [userInfo, setUserInfo] = useState(() => {
        const rawName = profile?.full_name || user?.user_metadata?.full_name || '';
        const names = splitFullName(rawName);
        return {
            firstName: names.firstName,
            lastName: names.lastName,
            name: rawName,
            phone: profile?.phone || '',
            email: user?.email || ''
        };
    });

    // Update user info when profile loads
    React.useEffect(() => {
        if (profile || user) {
            const rawName = profile?.full_name || user?.user_metadata?.full_name || userInfo.name || '';
            const names = splitFullName(rawName);
            setUserInfo(prev => ({
                ...prev,
                firstName: prev.firstName || names.firstName,
                lastName: prev.lastName || names.lastName,
                name: rawName,
                phone: profile?.phone || prev.phone || '',
                email: user?.email || prev.email || ''
            }));
        }
    }, [profile, user]);

    // Fetch addresses, cards, and orders from Supabase (non-blocking, smooth hydration)
    React.useEffect(() => {
        // Hydrate from localStorage immediately so orders never disappear during refresh
        const cached = getStoredOrders();
        if (cached.length > 0) {
            setOrdersList(prev => prev.length === 0 ? cached : prev);
        }

        if (!user) {
            setSavedAddresses([]);
            const cachedCards = getStoredCards();
            if (cachedCards.length > 0) {
                setSavedCards(cachedCards);
            } else {
                setSavedCards([]);
            }
            setIsOrdersLoading(false);
            return;
        }

        // 1. Fetch addresses
        addressesApi.getAll().then(({ data, error }) => {
            if (!error && data) {
                if (data.length > 0) {
                    const mapped = data.map(a => ({
                        id: a.id,
                        title: a.label || 'المنزل',
                        address: [a.city, a.district, a.street, a.building].filter(Boolean).join('، '),
                        phone: a.phone || userInfo.phone || '',
                        isDefault: !!a.is_default
                    }));
                    setSavedAddresses(mapped);
                    const def = mapped.find(m => m.isDefault) || mapped[0];
                    if (def) setSavedAddress(def.address);
                } else {
                    setSavedAddresses([]);
                    setSavedAddress('');
                }
            }
        });

        // 2. Fetch saved cards
        savedCardsApi.getAll().then(({ data, error }) => {
            if (!error && data) {
                if (data.length > 0) {
                    const mapped = data.map(c => ({
                        id: c.id,
                        type: c.card_type === 'mada' ? 'مدى / Mada' : c.card_type === 'visa' ? 'فيزا / Visa' : c.card_type === 'mastercard' ? 'ماستركارد / Mastercard' : c.card_type,
                        number: `•••• •••• •••• ${c.last_four || '4242'}`,
                        expiry: `${String(c.expiry_month || 8).padStart(2, '0')}/${String(c.expiry_year || 28).slice(-2)}`,
                        holder: c.holder_name || profile?.full_name || 'حامل البطاقة',
                        isDefault: !!c.is_default
                    }));
                    setSavedCards(mapped);
                } else {
                    setSavedCards([]);
                }
            }
        });

        // 3. Fetch user orders from database & merge seamlessly with local cache
        ordersApi.getMyOrders(user.id).then(({ data, error }) => {
            setIsOrdersLoading(false);
            const combinedMap = new Map();

            // First: Add database orders
            if (!error && data && data.length > 0) {
                data.forEach(o => {
                    const formatted = formatOrderRecord(o, profile?.full_name || 'العميل');
                    if (formatted.id) {
                        combinedMap.set(formatted.id, formatted);
                    }
                });
            }

            // Second: Merge any local cached orders
            try {
                const cachedOrders = JSON.parse(localStorage.getItem('thyiaab_orders_cache') || '{}');
                Object.values(cachedOrders).forEach(c => {
                    const cleanId = String(c.order_number || c.id || '').replace(/^ORD-/, '').trim();
                    if (cleanId && !combinedMap.has(cleanId)) {
                        combinedMap.set(cleanId, formatOrderRecord(c, profile?.full_name || 'العميل'));
                    }
                });
            } catch (cacheErr) {
                console.error('Error merging cached orders in AccountPage:', cacheErr);
            }

            const result = Array.from(combinedMap.values());
            if (result.length > 0 || !error) {
                setOrdersList(result);
                // Update cache for instantaneous display on refresh
                try {
                    const updatedCache = {};
                    result.forEach(ord => {
                        updatedCache[ord.id] = ord;
                        updatedCache[`ORD-${ord.id}`] = ord;
                    });
                    localStorage.setItem('thyiaab_orders_cache', JSON.stringify(updatedCache));
                } catch (e) {}
            }
        }).catch(err => {
            console.error('Orders fetch failed:', err);
            setIsOrdersLoading(false);
        });
    }, [user, profile]);

    // Registered delivery addresses state
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [savedAddress, setSavedAddress] = useState('');

    // Clear legacy mock cache and sync savedAddresses to user-scoped storage
    React.useEffect(() => {
        try {
            localStorage.removeItem('thyiaab_saved_addresses');
            if (user && savedAddresses.length > 0) {
                localStorage.setItem(`thyiaab_saved_addresses_${user.id}`, JSON.stringify(savedAddresses));
            }
        } catch (e) {
            console.error('Error saving addresses:', e);
        }
    }, [savedAddresses, user]);

    // Registered payment cards state
    const [savedCards, setSavedCards] = useState(() => getStoredCards());

    React.useEffect(() => {
        try {
            if (savedCards.length > 0) {
                localStorage.setItem('thyiaab_saved_cards', JSON.stringify(savedCards));
            }
        } catch (e) {}
    }, [savedCards]);

    const defaultCard = savedCards.find(c => c.isDefault) || savedCards[0] || null;

    // Sanitizes address inputs to only allow Arabic/English letters, numbers, spaces, hyphens (-), and commas (,, ،)
    const sanitizeAddressText = (text) => {
        if (!text) return '';
        return text.replace(/[^a-zA-Z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\-,،]/g, '');
    };

    // Sanitizes title/label to only allow Arabic/English letters, numbers, and spaces (max 20)
    const sanitizeTitleText = (text) => {
        if (!text) return '';
        return text.replace(/[^a-zA-Z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]/g, '').slice(0, 20);
    };

    // Modals state
    const [addressModal, setAddressModal] = useState({ isOpen: false, mode: 'edit' });
    const [addressForm, setAddressForm] = useState({
        province: 'منطقة الرياض',
        city: 'الرياض',
        district: 'حي الصحافة',
        customDistrict: '',
        line1: '',
        line2: '',
        line3: '',
        postalCode: '',
        notes: ''
    });

    const availableCities = saudiRegionsData[addressForm.province]?.cities || ['الرياض'];
    const currentCityDistricts = saudiRegionsData[addressForm.province]?.districts[addressForm.city] 
        || saudiRegionsData[addressForm.province]?.districts.default 
        || ['وسط المدينة'];
    const availableDistricts = currentCityDistricts;

    const handleProvinceChange = (newProvince) => {
        const newCities = saudiRegionsData[newProvince]?.cities || [];
        const firstCity = newCities[0] || '';
        const newDistricts = saudiRegionsData[newProvince]?.districts[firstCity] 
            || saudiRegionsData[newProvince]?.districts.default 
            || ['وسط المدينة'];
        const firstDistrict = newDistricts[0] || '';
        setAddressForm(prev => ({
            ...prev,
            province: newProvince,
            city: firstCity,
            district: firstDistrict,
            customDistrict: ''
        }));
    };

    const handleCityChange = (newCity) => {
        const newDistricts = saudiRegionsData[addressForm.province]?.districts[newCity] 
            || saudiRegionsData[addressForm.province]?.districts.default 
            || ['وسط المدينة'];
        const firstDistrict = newDistricts[0] || '';
        setAddressForm(prev => ({
            ...prev,
            city: newCity,
            district: firstDistrict,
            customDistrict: ''
        }));
    };
    const [cardModal, setCardModal] = useState({ 
        isOpen: false, 
        mode: 'add', 
        cardId: null,
        type: 'مدى / Mada',
        number: '', 
        expiry: '', 
        holder: '' 
    });
    const [cardModalError, setCardModalError] = useState(null);
    const [isManageCardsOpen, setIsManageCardsOpen] = useState(false);

    const handleDownloadInvoice = (orderId) => {
        showToast(`جاري تحميل فاتورة الطلب #${orderId}...`);
    };

    const handleFirstNameChange = (val) => {
        setUserInfo(prev => ({
            ...prev,
            firstName: val,
            name: `${val} ${prev.lastName || ''}`.trim()
        }));
    };

    const handleLastNameChange = (val) => {
        setUserInfo(prev => ({
            ...prev,
            lastName: val,
            name: `${prev.firstName || ''} ${val}`.trim()
        }));
    };

    const handleSaveNameOnBlur = async () => {
        const fullName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim();
        if (user && fullName && fullName !== (profile?.full_name || '')) {
            const { error } = await updateProfile({ full_name: fullName });
            if (!error) {
                showToast('تم حفظ وتحديث الاسم بنجاح');
            }
        }
    };

    const handleRequestPasswordChange = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        // Auto-save name updates if any
        const fullName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim();
        if (user && fullName && fullName !== (profile?.full_name || '')) {
            await updateProfile({ full_name: fullName });
        }

        const targetEmail = (userInfo.email || user?.email || '').trim();
        if (!targetEmail) {
            showToast('يرجى إدخال البريد الإلكتروني أولاً', 'error');
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
                redirectTo: `${window.location.origin}/login`
            });
            if (error) {
                console.error('Password reset request error:', error);
                showToast(error.message || 'تعذر إرسال الطلب حالياً، يرجى المحاولة لاحقاً', 'error');
            } else {
                showToast('تم إرسال رابط تغيير كلمة السر إلى بريدك الإلكتروني بنجاح');
            }
        } catch (err) {
            console.error('Password reset request exception:', err);
            showToast('تم إرسال رابط تغيير كلمة السر إلى بريدك الإلكتروني بنجاح');
        }
    };

    const handleSaveInfo = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const fullName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim();
        if (user) {
            const { error } = await updateProfile({
                full_name: fullName || userInfo.name,
                phone: userInfo.phone
            });
            if (error) {
                showToast('حدث خطأ أثناء حفظ المعلومات', 'error');
                return;
            }
        }
        showToast('تم حفظ وتحديث المعلومات بنجاح');
    };

    // Address modal handlers
    const openAddressModal = (mode, addr = null) => {
        setAddressModal({
            isOpen: true,
            mode,
            addressId: addr?.id || null
        });
        if (mode === 'add') {
            setAddressForm({
                label: 'المنزل',
                province: 'منطقة الرياض',
                city: 'الرياض',
                district: 'حي الصحافة',
                customDistrict: '',
                line1: '',
                line2: '',
                line3: '',
                postalCode: '',
                notes: ''
            });
        } else {
            setAddressForm(prev => ({
                ...prev,
                label: addr?.title || prev.label || 'المنزل',
                line1: addr?.address || prev.line1 || savedAddress,
                line2: prev.line2 || '',
                line3: prev.line3 || '',
                postalCode: addr?.postal_code || addr?.postalCode || prev.postalCode || ''
            }));
        }
    };

    const handleSaveAddressModal = (e) => {
        e.preventDefault();

        // Validate mandatory postal code (numbers only, 5 to 7 digits)
        const cleanPostal = (addressForm.postalCode || '').trim();
        if (!cleanPostal) {
            showToast('يرجى إدخال الرمز البريدي', 'error');
            return;
        }
        if (!/^\d{5,7}$/.test(cleanPostal)) {
            showToast('الرمز البريدي يجب أن يتكون من 5 إلى 7 أرقام (مثال: 21289)', 'error');
            return;
        }

        const finalDistrict = addressForm.district === 'حي آخر (كتابة يدوية)' 
            ? (addressForm.customDistrict?.trim() || 'الحي') 
            : addressForm.district;

        const parts = [
            addressForm.province,
            addressForm.city,
            finalDistrict,
            addressForm.line1?.trim()
        ].filter(Boolean);

        if (addressForm.line2?.trim()) parts.push(addressForm.line2.trim());
        if (addressForm.line3?.trim()) parts.push(addressForm.line3.trim());
        if (addressForm.postalCode?.trim()) parts.push(`الرمز البريدي: ${addressForm.postalCode.trim()}`);
        if (addressForm.notes?.trim()) parts.push(`ملاحظة: ${addressForm.notes.trim()}`);

        const fullAddress = parts.join('، ');
        if (fullAddress.trim()) {
            const addressTitle = addressForm.label?.trim() || `عنوان (${finalDistrict})`;

            if (addressModal.mode === 'add') {
                const tempId = 'addr-' + Date.now();
                const newAddr = {
                    id: tempId,
                    title: addressTitle,
                    address: fullAddress,
                    phone: userInfo.phone || '+966 50 123 4567',
                    isDefault: savedAddresses.length === 0
                };
                setSavedAddresses(prev => [...prev, newAddr]);

                if (user) {
                    addressesApi.create({
                        label: addressTitle,
                        full_name: userInfo.name || profile?.full_name || 'العميل',
                        city: addressForm.city || 'الرياض',
                        district: finalDistrict,
                        street: addressForm.line1 || 'الشارع الرئيسي',
                        building: addressForm.line2 || '',
                        postal_code: addressForm.postalCode || '',
                        phone: userInfo.phone || '+966 50 123 4567',
                        is_default: savedAddresses.length === 0
                    }).then(({ data, error }) => {
                        if (error) {
                            console.error('Failed to create address in database:', error);
                        } else if (data) {
                            setSavedAddresses(prev => prev.map(a => a.id === tempId ? { ...a, id: data.id } : a));
                        }
                    });
                }
                showToast('تمت إضافة العنوان بنجاح');
            } else {
                setSavedAddress(fullAddress);
                setSavedAddresses(prev => prev.map(a => a.isDefault ? { ...a, title: addressTitle, address: fullAddress } : a));
                showToast('تم تعديل العنوان بنجاح');
            }
            setAddressModal({ isOpen: false, mode: 'edit' });
        }
    };

    const handleSetDefaultAddress = (id) => {
        setSavedAddresses(prev => prev.map(a => ({
            ...a,
            isDefault: a.id === id
        })));
        const target = savedAddresses.find(a => a.id === id);
        if (target) setSavedAddress(target.address);
        if (user && typeof id === 'string' && !id.startsWith('addr-') && id.includes('-')) {
            addressesApi.update(id, { is_default: true });
        }
        showToast('تم تغيير العنوان الافتراضي بنجاح');
    };

    const handleDeleteAddress = (id) => {
        if (savedAddresses.length <= 1) {
            showToast('يجب الاحتفاظ بعنوان واحد على الأقل', 'error');
            return;
        }
        setSavedAddresses(prev => {
            const filtered = prev.filter(a => a.id !== id);
            if (!filtered.some(a => a.isDefault) && filtered.length > 0) {
                filtered[0].isDefault = true;
                setSavedAddress(filtered[0].address);
            }
            return filtered;
        });
        if (user && typeof id === 'string' && !id.startsWith('addr-') && id.includes('-')) {
            addressesApi.delete(id);
        }
        showToast('تم حذف العنوان بنجاح');
    };

    // Card modal handlers
    const openCardModal = (mode, card = null) => {
        setCardModalError(null);
        setCardModal({
            isOpen: true,
            mode,
            cardId: card?.id || null,
            type: card ? card.type : '',
            number: card ? card.number : '',
            expiry: card ? card.expiry : '',
            holder: card ? card.holder : ''
        });
    };

    // Card inputs formatting and strict validation
    const handleCardNumberChange = (e) => {
        const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = rawDigits.match(/.{1,4}/g)?.join(' ') || rawDigits;
        const detectedType = rawDigits.length > 0 ? detectCardType(rawDigits) : '';
        setCardModal(prev => ({
            ...prev,
            number: formatted,
            type: detectedType
        }));

        if (rawDigits.length >= 15) {
            const detectedBrand = getDetectedBrandKey(rawDigits);
            if (!detectedBrand || !isValidLuhn(rawDigits)) {
                setCardModalError('البطاقة غير صالحة أو مرفوضة');
            } else {
                setCardModalError(null);
            }
        } else {
            if (cardModalError === 'البطاقة غير صالحة أو مرفوضة') {
                setCardModalError(null);
            }
        }
    };

    const handleCardExpiryChange = (e) => {
        const val = e.target.value;
        const clean = val.replace(/\D/g, '').slice(0, 4);
        
        let formatted = clean;
        if (clean.length > 2) {
            formatted = `${clean.slice(0, 2)}/${clean.slice(2)}`;
        } else if (clean.length === 2) {
            const prevClean = (cardModal.expiry || '').replace(/\D/g, '');
            if (clean.length > prevClean.length) {
                formatted = `${clean}/`;
            } else {
                formatted = clean;
            }
        }

        setCardModal(prev => ({ ...prev, expiry: formatted }));

        if (formatted.length === 5) {
            const check = validateExpiryDate(formatted);
            if (!check.valid) {
                setCardModalError(check.error || 'البطاقة غير صالحة أو مرفوضة');
            } else if (cardModalError && cardModalError.includes('الصلاحية')) {
                setCardModalError(null);
            }
        }
    };

    const handleCardHolderChange = (e) => {
        // Only letters and spaces allowed, no numbers, max 60 characters
        const cleaned = e.target.value
            .replace(/[0-9\u0660-\u0669\u06F0-\u06F9]/g, '')
            .replace(/[^a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]/g, '')
            .toUpperCase()
            .slice(0, 60);
        setCardModal(prev => ({ ...prev, holder: cleaned }));
        if (cardModalError && cardModalError.includes('حامل البطاقة')) {
            setCardModalError(null);
        }
    };

    const handleSaveCardModal = (e) => {
        e.preventDefault();

        const rawDigits = (cardModal.number || '').replace(/\D/g, '');
        const detectedBrand = getDetectedBrandKey(rawDigits);

        // 1. Strict Card Validation: Must be 15-16 digits, supported brand, and pass Luhn Mod10
        if (rawDigits.length < 15 || rawDigits.length > 16 || !detectedBrand || !isValidLuhn(rawDigits)) {
            setCardModalError('البطاقة غير صالحة أو مرفوضة');
            showToast('البطاقة غير صالحة أو مرفوضة', 'error');
            return;
        }

        // 2. Strict Expiry Date Validation
        const expiryCheck = validateExpiryDate(cardModal.expiry);
        if (!expiryCheck.valid) {
            setCardModalError(expiryCheck.error || 'البطاقة غير صالحة أو مرفوضة');
            showToast(expiryCheck.error || 'البطاقة غير صالحة أو مرفوضة', 'error');
            return;
        }

        // 3. Cardholder Name Validation
        if (!cardModal.holder || cardModal.holder.trim().length < 3) {
            setCardModalError('يرجى إدخال اسم حامل البطاقة');
            showToast('يرجى إدخال اسم حامل البطاقة', 'error');
            return;
        }

        setCardModalError(null);

        const detectedType = detectCardType(rawDigits) || cardModal.type;
        const cardType = detectedType || 'مدى / Mada';
        const formattedNumber = cardModal.number;

        if (cardModal.mode === 'edit' && cardModal.cardId) {
            setSavedCards(prev => prev.map(c => c.id === cardModal.cardId ? {
                ...c,
                type: cardType,
                number: formattedNumber,
                expiry: cardModal.expiry || '12/28',
                holder: cardModal.holder || 'CARDHOLDER'
            } : c));
            showToast('تم تعديل البطاقة بنجاح');
        } else {
            const newCard = {
                id: String(Date.now()),
                type: cardType,
                number: formattedNumber,
                expiry: cardModal.expiry,
                holder: cardModal.holder,
                isDefault: savedCards.length === 0
            };
            setSavedCards(prev => [...prev, newCard]);
            if (user) {
                const brand = cardType.toLowerCase().includes('mada') ? 'mada' : cardType.toLowerCase().includes('visa') ? 'visa' : 'mastercard';
                const parts = (cardModal.expiry || '12/28').split('/');
                savedCardsApi.create({
                    card_type: brand,
                    last_four: formattedNumber.replace(/\D/g, '').slice(-4) || '4242',
                    holder_name: cardModal.holder || 'AHMED MOHAMED',
                    expiry_month: parseInt(parts[0]) || 12,
                    expiry_year: 2000 + (parseInt(parts[1]) || 28),
                    is_default: savedCards.length === 0
                }).then(({ data }) => {
                    if (data) {
                        setSavedCards(prev => prev.map(c => c.id === newCard.id ? { ...c, id: data.id } : c));
                    }
                });
            }
            showToast('تمت إضافة البطاقة بنجاح');
        }
        setCardModal({ isOpen: false, mode: 'add', cardId: null, type: 'مدى / Mada', number: '', expiry: '', holder: '' });
    };

    const handleSetDefaultCard = (id) => {
        setSavedCards(prev => prev.map(c => ({
            ...c,
            isDefault: c.id === id
        })));
        showToast('تم تغيير البطاقة الافتراضية بنجاح');
    };

    const handleDeleteCard = (id) => {
        if (savedCards.length <= 1) {
            showToast('يجب الاحتفاظ ببطاقة واحدة على الأقل', 'error');
            return;
        }
        setSavedCards(prev => {
            const filtered = prev.filter(c => c.id !== id);
            if (!filtered.some(c => c.isDefault) && filtered.length > 0) {
                filtered[0].isDefault = true;
            }
            return filtered;
        });
        if (user && typeof id === 'string' && id.includes('-')) {
            savedCardsApi.delete(id);
        }
        showToast('تم حذف البطاقة بنجاح');
    };

    // Render Credit Card Component
    const renderCreditCard = (card) => {
        const theme = getCardTheme(card.type);
        return (
            <div 
                key={card.id || card.number}
                className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-2.5 xs:p-3 md:p-3.5 lg:p-6 shadow-xl ${theme.bg} ${theme.glow} border ${theme.border} text-white flex flex-col justify-between aspect-[1.586/1] w-full transition-all hover:-translate-y-1 duration-300`}
            >
                {/* Decorative glossy highlights */}
                <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-black/25 blur-2xl pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none" />

                {/* Card Header: Card Type / Title & Default Badge */}
                <div className="flex items-center justify-between relative z-10 gap-1">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-white/90 min-w-0">
                        <CreditCard className="w-2.5 h-2.5 xs:w-3 xs:h-3 md:w-3 md:h-3 lg:w-4 lg:h-4 text-white/80 shrink-0" />
                        <span className="font-bold text-[7.5px] xs:text-[8.5px] md:text-[8.5px] lg:text-xs xl:text-sm tracking-wide truncate">{card.type || 'بطاقة بنكية'}</span>
                    </div>

                    {card.isDefault ? (
                        <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[6.5px] xs:text-[7.5px] md:text-[7.5px] lg:text-[10px] xl:text-xs font-bold px-1.5 py-0.5 md:px-1.5 md:py-0.5 lg:px-2.5 lg:py-1 rounded-full shadow-xs whitespace-nowrap shrink-0">
                            البطاقة الافتراضية
                        </span>
                    ) : (
                        <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => handleSetDefaultCard(card.id)}
                                className="shine-button bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white px-1 py-0.5 xs:px-1.5 xs:py-0.5 md:px-1.5 md:py-0.5 lg:px-2 lg:py-1 rounded-md sm:rounded-lg text-[6.5px] xs:text-[7.5px] md:text-[7.5px] lg:text-[10px] xl:text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
                            >
                                <Check className="w-2 h-2 xs:w-2.5 xs:h-2.5 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 text-white relative z-10" />
                                <span className="relative z-10">تعيين كافتراضية</span>
                            </button>
                            {savedCards.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="p-0.5 rounded-md md:rounded-lg bg-black/20 hover:bg-rose-600/40 text-white/80 hover:text-white transition-all cursor-pointer active:scale-90"
                                    aria-label="حذف البطاقة"
                                >
                                    <Trash2 className="w-2 h-2 xs:w-2.5 xs:h-2.5 md:w-2.5 md:h-2.5 lg:w-3.5 lg:h-3.5 stroke-[2]" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Middle: Card Number (Centered & Spacious, single horizontal line) */}
                <div className="my-auto py-0.5 sm:py-1 relative z-10" dir="ltr">
                    <p className="font-mono text-[11px] xs:text-[12.5px] md:text-[10.5px] lg:text-base xl:text-xl font-bold lg:font-black tracking-[0.06em] xs:tracking-[0.09em] md:tracking-[0.06em] lg:tracking-[0.16em] xl:tracking-[0.22em] text-white drop-shadow-md select-all text-center whitespace-nowrap overflow-hidden">
                        {card.number}
                    </p>
                </div>

                {/* Bottom: Cardholder & Expiry */}
                <div className="flex items-end justify-between text-[7px] xs:text-[8px] md:text-[8px] lg:text-[10px] xl:text-xs relative z-10 pt-1 sm:pt-1.5 border-t border-white/10">
                    <div className="flex flex-col min-w-0 pr-1">
                        <span className="text-white/60 text-[6px] xs:text-[7px] md:text-[7px] lg:text-[9px] xl:text-[10px] uppercase font-bold tracking-wider mb-0.5">حامل البطاقة</span>
                        <span className="font-bold text-[7.5px] xs:text-[8.5px] md:text-[8.5px] lg:text-xs xl:text-sm text-white tracking-wide uppercase drop-shadow-xs truncate max-w-[90px] xs:max-w-[120px] md:max-w-[100px] lg:max-w-[180px] xl:max-w-none">{card.holder}</span>
                    </div>

                    <div className="flex flex-col items-end text-left shrink-0" dir="ltr">
                        <span className="text-white/60 text-[6px] xs:text-[7px] md:text-[7px] lg:text-[9px] xl:text-[10px] uppercase font-bold tracking-wider mb-0.5">EXPIRES</span>
                        <span className="font-mono font-bold text-[7.5px] xs:text-[8.5px] md:text-[8.5px] lg:text-xs xl:text-sm text-white tracking-wider drop-shadow-xs">{card.expiry}</span>
                    </div>
                </div>
            </div>
        );
    };

    const handleConfirmCancelOrder = (orderId) => {
        setOrdersList(prev => prev.map(ord => {
            if (ord.id === orderId) {
                return {
                    ...ord,
                    statusType: 'cancelled',
                    statusText: 'تم الإلغاء',
                    statusColor: 'text-rose-600',
                    deliveryDate: 'تم الإلغاء بناءً على طلب العميل'
                };
            }
            return ord;
        }));
        setCancelModalOrder(null);
        showToast(`تم إلغاء الطلبية #${orderId} بنجاح`);
    };

    const statusCounts = {
        all: ordersList.length,
        current: ordersList.filter(o => o.statusType === 'current').length,
        previous: ordersList.filter(o => o.statusType === 'previous').length,
        cancelled: ordersList.filter(o => o.statusType === 'cancelled').length
    };

    const filteredOrders = ordersList.filter((order) => {
        if (orderFilter === 'all') return true;
        return order.statusType === orderFilter;
    });

    return (
        <div dir="rtl" className="min-h-[100dvh] bg-brand-cream/30 text-[#800020] pt-20 sm:pt-28 pb-16 sm:pb-20 px-3 sm:px-6 lg:px-8 font-arabic w-full overflow-x-clip">
            {/* Address Modal (Edit or Add) */}
            <AnimatePresence>
                {addressModal.isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md"
                        onClick={() => setAddressModal({ ...addressModal, isOpen: false })}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: '#F0DFCD',
                                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.25))'
                            }}
                            className="relative rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-[#800020]/25 flex flex-col gap-5 text-right z-10 text-[#800020] max-h-[92dvh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-[#800020]/15">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-white/50 border border-[#800020]/20 flex items-center justify-center text-[#800020] shadow-xs">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-black text-lg sm:text-xl text-[#800020]">
                                        {addressModal.mode === 'edit' ? 'تعديل عنوان التوصيل' : 'إضافة عنوان توصيل جديد'}
                                    </h3>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setAddressModal({ ...addressModal, isOpen: false })}
                                    className="p-1.5 rounded-xl text-[#800020]/60 hover:text-[#800020] hover:bg-white/50 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveAddressModal} className="flex flex-col gap-4">
                                {/* 0. تسمية العنوان (المنزل، العمل، ...) */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-[#800020]">
                                        اسم العنوان (مثال: المنزل، العمل، الاستراحة...)
                                    </label>
                                    <input
                                        type="text"
                                        value={addressForm.label || ''}
                                        maxLength={20}
                                        onChange={(e) => setAddressForm({ ...addressForm, label: sanitizeTitleText(e.target.value) })}
                                        placeholder="المنزل، العمل، أو أي اسم تفضله..."
                                        className="w-full bg-white/25 backdrop-blur-xs border border-[#800020]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#800020] outline-none focus:border-[#800020] focus:bg-white/40 transition-all placeholder-[#800020]/45"
                                    />
                                </div>

                                {/* 1. المحافظة والمدينة (اختيارات) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-30">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-[#800020]">
                                            المحافظة / المنطقة <span className="text-red-500">*</span>
                                        </label>
                                        <CustomDropdown
                                            value={addressForm.province}
                                            onChange={(val) => handleProvinceChange(val)}
                                            options={Object.keys(saudiRegionsData)}
                                            placeholder="اختر المحافظة / المنطقة"
                                            className="w-full"
                                            triggerClassName="bg-white/25 backdrop-blur-xs py-2.5 rounded-xl border border-[#800020]/20"
                                            menuClassName="w-full"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-[#800020]">
                                            المدينة <span className="text-red-500">*</span>
                                        </label>
                                        <CustomDropdown
                                            value={addressForm.city}
                                            onChange={(val) => handleCityChange(val)}
                                            options={availableCities}
                                            placeholder="اختر المدينة"
                                            className="w-full"
                                            triggerClassName="bg-white/25 backdrop-blur-xs py-2.5 rounded-xl border border-[#800020]/20"
                                            menuClassName="w-full"
                                        />
                                    </div>
                                </div>

                                {/* 2. الحي / المنطقة (اختيارات) */}
                                <div className="flex flex-col gap-1.5 relative z-20">
                                    <label className="text-xs font-bold text-[#800020]">
                                        الحي / المنطقة <span className="text-red-500">*</span>
                                    </label>
                                    <CustomDropdown
                                        value={addressForm.district}
                                        onChange={(val) => setAddressForm({ ...addressForm, district: val })}
                                        options={[...availableDistricts, 'حي آخر (كتابة يدوية)']}
                                        placeholder="اختر الحي / المنطقة"
                                        className="w-full"
                                        triggerClassName="bg-white/25 backdrop-blur-xs py-2.5 rounded-xl border border-[#800020]/20"
                                        menuClassName="w-full"
                                    />
                                    {addressForm.district === 'حي آخر (كتابة يدوية)' && (
                                        <input
                                            type="text"
                                            maxLength={200}
                                            value={addressForm.customDistrict || ''}
                                            onChange={(e) => setAddressForm({ ...addressForm, customDistrict: sanitizeAddressText(e.target.value).slice(0, 200) })}
                                            placeholder="اكتب اسم الحي هنا..."
                                            className="mt-1.5 w-full bg-white/25 backdrop-blur-xs border border-[#800020]/20 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#800020] outline-none focus:border-[#800020] focus:bg-white/40 transition-all placeholder-[#800020]/45"
                                            required
                                        />
                                    )}
                                </div>

                                {/* 3. سطر العنوان اليدوي الأول */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-[#800020]">
                                        سطر العنوان اليدوي الأول <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={200}
                                        value={addressForm.line1}
                                        onChange={(e) => setAddressForm({ ...addressForm, line1: sanitizeAddressText(e.target.value).slice(0, 200) })}
                                        placeholder="اسم الشارع، رقم المبنى..."
                                        className="w-full bg-white/25 backdrop-blur-xs border border-[#800020]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#800020] outline-none focus:border-[#800020] focus:bg-white/40 transition-all placeholder-[#800020]/45"
                                        required
                                    />
                                </div>

                                {/* 4. سطر العنوان اليدوي الثاني */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-[#800020]">
                                        سطر العنوان اليدوي الثاني <span className="text-[#800020]/60 font-normal">(اختياري)</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={200}
                                        value={addressForm.line2}
                                        onChange={(e) => setAddressForm({ ...addressForm, line2: sanitizeAddressText(e.target.value).slice(0, 200) })}
                                        placeholder="رقم الشقة، الدور، علامة مميزة بجوار الموقع..."
                                        className="w-full bg-white/25 backdrop-blur-xs border border-[#800020]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#800020] outline-none focus:border-[#800020] focus:bg-white/40 transition-all placeholder-[#800020]/45"
                                    />
                                </div>

                                {/* 4.1 سطر العنوان اليدوي الثالث */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-[#800020]">
                                        سطر العنوان اليدوي الثالث <span className="text-[#800020]/60 font-normal">(اختياري)</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={200}
                                        value={addressForm.line3 || ''}
                                        onChange={(e) => setAddressForm({ ...addressForm, line3: sanitizeAddressText(e.target.value).slice(0, 200) })}
                                        placeholder="تفاصيل إضافية للعنوان أو معالم قريبة..."
                                        className="w-full bg-white/25 backdrop-blur-xs border border-[#800020]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#800020] outline-none focus:border-[#800020] focus:bg-white/40 transition-all placeholder-[#800020]/45"
                                    />
                                </div>

                                {/* 5. الـ Postal Code ورسالة اختيارية بجانب العنوان */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-[#800020] flex items-center gap-1">
                                            <span>الرمز البريدي (Postal Code)</span>
                                            <span className="text-rose-600 font-bold text-sm">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={7}
                                            value={addressForm.postalCode}
                                            onKeyDown={(e) => {
                                                if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key) || e.ctrlKey || e.metaKey) return;
                                                if (!/^\d$/.test(e.key)) e.preventDefault();
                                            }}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g, '').slice(0, 7);
                                                setAddressForm({ ...addressForm, postalCode: digits });
                                            }}
                                            placeholder="مثال: 21289"
                                            required
                                            dir="ltr"
                                            className="w-full bg-white/25 backdrop-blur-xs border border-[#800020]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#800020] outline-none focus:border-[#800020] focus:bg-white/40 transition-all placeholder-[#800020]/45 text-right"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-[#800020]">
                                            رسالة اختيارية بجانب العنوان <span className="text-[#800020]/60 font-normal">(اختياري)</span>
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={200}
                                            value={addressForm.notes}
                                            onChange={(e) => setAddressForm({ ...addressForm, notes: sanitizeAddressText(e.target.value).slice(0, 200) })}
                                            placeholder="مثال: يرجى الاتصال قبل الوصول..."
                                            className="w-full bg-white/25 backdrop-blur-xs border border-[#800020]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#800020] outline-none focus:border-[#800020] focus:bg-white/40 transition-all placeholder-[#800020]/45"
                                        />
                                    </div>
                                </div>

                                {/* Buttons Footer */}
                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#800020]/15">
                                    {/* زر إلغاء بنفس لون وتأثير أضف للسلة (shine-button bg-[#800020]) */}
                                    <button
                                        type="button"
                                        onClick={() => setAddressModal({ ...addressModal, isOpen: false })}
                                        className="shine-button bg-[#800020] text-[#F0DFCD] px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-sm hover:shadow-lg active:scale-98 cursor-pointer transition-all"
                                    >
                                        <span className="relative z-10">إلغاء</span>
                                    </button>

                                    {/* زر أضف العنوان بتأثير زر اتمام الشراء (shine-button) */}
                                    <button
                                        type="submit"
                                        className="shine-button bg-[#800020] text-[#F0DFCD] px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-sm hover:shadow-lg active:scale-98 cursor-pointer transition-all group"
                                    >
                                        <span className="relative z-10">
                                            {addressModal.mode === 'edit' ? 'حفظ العنوان' : 'أضف العنوان'}
                                        </span>
                                        <Check className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payment Method Modal (Edit or Add) */}
            <AnimatePresence>
                {cardModal.isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md"
                        onClick={() => setCardModal(prev => ({ ...prev, isOpen: false }))}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: '#F0DFCD',
                                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.25))'
                            }}
                            className="relative rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#800020]/25 flex flex-col gap-4 text-right z-10 text-[#800020]"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-[#800020]/15">
                                <h3 className="font-black text-lg text-[#800020]">
                                    {cardModal.mode === 'edit' ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع جديدة'}
                                </h3>
                                <button 
                                    type="button"
                                    onClick={() => setCardModal({ ...cardModal, isOpen: false })}
                                    className="p-1.5 rounded-lg text-[#800020]/60 hover:text-[#800020] hover:bg-white/50 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveCardModal} className="flex flex-col gap-4">
                                {/* Card Number Input with In-Field Card Brands */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs sm:text-sm font-bold text-[#800020]">
                                            رقم البطاقة <span className="text-red-500">*</span>
                                        </label>
                                    </div>
                                    
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            dir="ltr"
                                            inputMode="numeric"
                                            autoComplete="cc-number"
                                            maxLength={19}
                                            value={cardModal.number}
                                            onChange={handleCardNumberChange}
                                            className={`w-full bg-white/25 backdrop-blur-xs border rounded-xl pl-4 pr-24 py-3 text-sm font-semibold text-[#800020] outline-none transition-all text-left font-mono tracking-widest placeholder:text-[#800020]/45 placeholder:tracking-normal placeholder:font-sans ${
                                                cardModalError
                                                    ? 'border-red-500 focus:border-red-500 bg-red-500/10'
                                                    : 'border-[#800020]/20 focus:border-[#800020] focus:bg-white/40'
                                            }`}
                                            placeholder="0000 0000 0000 0000"
                                            required
                                        />

                                        {/* Card Brand Images inside the card number input */}
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none">
                                            {(() => {
                                                const brandKey = getDetectedBrandKey(cardModal.number);
                                                if (brandKey === 'visa') {
                                                    return (
                                                        <motion.div
                                                            key="visa-single"
                                                            initial={{ scale: 0.85, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                        >
                                                            <VisaLogo className="w-9 h-6 rounded-md shadow-xs border border-[#1A1F71]/30" />
                                                        </motion.div>
                                                    );
                                                }
                                                if (brandKey === 'mastercard') {
                                                    return (
                                                        <motion.div
                                                            key="mastercard-single"
                                                            initial={{ scale: 0.85, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                        >
                                                            <MastercardLogo className="w-9 h-6 rounded-md shadow-xs border border-stone-800/30" />
                                                        </motion.div>
                                                    );
                                                }
                                                if (brandKey === 'mada') {
                                                    return (
                                                        <motion.div
                                                            key="mada-single"
                                                            initial={{ scale: 0.85, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                        >
                                                            <MadaLogo className="w-9 h-6 rounded-md shadow-xs border border-[#006C35]/30" />
                                                        </motion.div>
                                                    );
                                                }
                                                if (brandKey === 'amex') {
                                                    return (
                                                        <motion.div
                                                            key="amex-single"
                                                            initial={{ scale: 0.85, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                        >
                                                            <AmexLogo className="w-9 h-6 rounded-md shadow-xs border border-[#1C3F60]/30" />
                                                        </motion.div>
                                                    );
                                                }
                                                // Default / Unrecognized: Visa and Master side by side
                                                return (
                                                    <div className="flex items-center gap-1.5">
                                                        <VisaLogo className="w-8 h-5.5 rounded-sm shadow-2xs border border-white/50" />
                                                        <MastercardLogo className="w-8 h-5.5 rounded-sm shadow-2xs border border-white/50" />
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* رسالة الخطأ المباشرة تحت رقم البطاقة */}
                                    {cardModalError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-1.5 text-xs text-red-600 font-bold mt-1"
                                        >
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                                            <span>{cardModalError}</span>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Expiry Date */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs sm:text-sm font-bold text-[#800020]">
                                            تاريخ الانتهاء <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            dir="ltr"
                                            inputMode="numeric"
                                            autoComplete="cc-exp"
                                            maxLength={5}
                                            value={cardModal.expiry}
                                            onChange={handleCardExpiryChange}
                                            className="w-full bg-white/25 backdrop-blur-xs border border-[#800020]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#800020] outline-none focus:border-[#800020] focus:bg-white/40 transition-all text-center font-mono tracking-wider placeholder:text-[#800020]/45"
                                            placeholder="MM/YY"
                                            required
                                        />
                                    </div>

                                    {/* Cardholder Name */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs sm:text-sm font-bold text-[#800020]">
                                            اسم حامل البطاقة <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            dir="ltr"
                                            autoComplete="cc-name"
                                            maxLength={60}
                                            value={cardModal.holder}
                                            onChange={handleCardHolderChange}
                                            className="w-full bg-white/25 backdrop-blur-xs border border-[#800020]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#800020] outline-none focus:border-[#800020] focus:bg-white/40 transition-all text-left font-mono tracking-wide uppercase placeholder:text-[#800020]/45 placeholder:normal-case placeholder:font-sans"
                                            placeholder="e.g. MOHAMMED AHMED"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* رسالة التنبيه بالأسفل إذا كانت البطاقة غير صالحة أو مرفوضة */}
                                {cardModalError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-center gap-2 text-xs sm:text-sm text-red-600 font-bold bg-red-500/10 border border-red-500/25 py-2.5 px-4 rounded-xl"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                                        <span>{cardModalError}</span>
                                    </motion.div>
                                )}

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#800020]/15">
                                    <button
                                        type="button"
                                        onClick={() => setCardModal(prev => ({ ...prev, isOpen: false }))}
                                        className="shine-button bg-[#800020] text-[#F0DFCD] px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow-lg active:scale-98 cursor-pointer transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="relative z-10">إلغاء</span>
                                    </button>
                                    <button
                                        type="submit"
                                        className="shine-button bg-[#800020] text-[#F0DFCD] px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow-lg active:scale-98 cursor-pointer transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="relative z-10">حفظ البطاقة</span>
                                        <Check className="w-4 h-4 relative z-10" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Manage Cards Modal */}
                {isManageCardsOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md font-arabic"
                        onClick={() => setIsManageCardsOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: '#F0DFCD',
                                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.25))'
                            }}
                            className="rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#800020]/25 flex flex-col gap-5 text-right relative max-h-[90dvh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between pb-3 border-b border-[#800020]/15">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#800020]/10 text-[#800020] flex items-center justify-center shrink-0 border border-[#800020]/15">
                                        <SlidersHorizontal className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg sm:text-xl text-[#800020]">
                                            إدارة البطاقات المحفوظة
                                        </h3>
                                        <p className="text-xs text-[#800020]/70 font-semibold mt-0.5">
                                            التحكم في طرق الدفع وتعيين البطاقة الافتراضية
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsManageCardsOpen(false)}
                                    className="p-1.5 rounded-lg text-[#800020]/60 hover:text-[#800020] hover:bg-[#800020]/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Cards List */}
                            <div className="flex flex-col gap-3">
                                {savedCards.map((card) => {
                                    const theme = getCardTheme(card.type);
                                    return (
                                        <div
                                            key={card.id || card.number}
                                            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                                card.isDefault
                                                    ? 'bg-white/80 border-[#800020]/30 shadow-xs'
                                                    : 'bg-white/40 border-[#800020]/10 hover:bg-white/60'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                {/* Mini Card Visual Badge */}
                                                <div className={`w-12 h-8 rounded-lg ${theme.bg} border ${theme.border} flex items-center justify-center shrink-0 shadow-2xs text-white`}>
                                                    {theme.brandLogo === 'mada' && <span className="font-bold text-[10px]">mada</span>}
                                                    {theme.brandLogo === 'visa' && <span className="font-bold italic text-[11px] font-sans">VISA</span>}
                                                    {theme.brandLogo === 'mastercard' && (
                                                        <div className="flex items-center">
                                                            <div className="w-3 h-3 rounded-full bg-[#EB001B] -mr-1" />
                                                            <div className="w-3 h-3 rounded-full bg-[#F79E1B]" />
                                                        </div>
                                                    )}
                                                    {theme.brandLogo === 'default' && <CreditCard className="w-4 h-4 text-white" />}
                                                </div>

                                                <div className="min-w-0 flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-sm text-[#800020]" dir="ltr">
                                                            {card.number}
                                                        </span>
                                                        {card.isDefault && (
                                                            <span className="text-[10px] font-bold bg-[#800020] text-[#F0DFCD] px-2.5 py-0.5 rounded-md shadow-xs">
                                                                افتراضية
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-[#800020]/70 font-medium">
                                                        حامل البطاقة: {card.holder} • ينتهي: {card.expiry}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions on this card */}
                                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                {!card.isDefault && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetDefaultCard(card.id)}
                                                        className="shine-button bg-[#800020] text-[#F0DFCD] px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:shadow-lg active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Check className="w-3 h-3 text-[#F0DFCD] relative z-10" />
                                                        <span className="relative z-10">تعيين كافتراضية</span>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsManageCardsOpen(false);
                                                        openCardModal('edit', card);
                                                    }}
                                                    className="p-1.5 text-[#800020]/60 hover:text-[#40000d] transition-colors bg-transparent border-0 cursor-pointer"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                {savedCards.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteCard(card.id)}
                                                        className="shine-text-btn group p-1.5 bg-transparent border-0 cursor-pointer active:scale-90 transition-all flex items-center justify-center"
                                                        aria-label="حذف البطاقة"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 stroke-[2] shine-icon" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Quick Add Button & Security Note */}
                            <div className="pt-2 flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsManageCardsOpen(false);
                                        openCardModal('add');
                                    }}
                                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#800020]/30 hover:border-[#800020] text-[#800020] hover:bg-[#800020]/5 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>إضافة بطاقة جديدة</span>
                                </button>

                                <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#800020]/15">
                                    <div className="flex items-center gap-2 text-[11px] text-[#800020]/70 font-medium">
                                        <ShieldCheck className="w-4 h-4 text-[#800020]" />
                                        <span>بيانات الدفع مشفرة بأعلى معايير الأمان المصرفي PCI-DSS</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsManageCardsOpen(false)}
                                        className="bg-[#800020] text-[#F0DFCD] hover:bg-[#600018] px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                                    >
                                        تم
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Cancel Order Confirmation Modal */}
                {cancelModalOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md font-arabic"
                        onClick={() => setCancelModalOrder(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: '#F0DFCD',
                                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.25))'
                            }}
                            className="rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#800020]/25 flex flex-col gap-5 text-right relative max-h-[90dvh] overflow-y-auto"
                        >
                            {/* Header: Warning Icon + Title + Close Button */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-[#800020]/10 text-[#800020] flex items-center justify-center shrink-0 border border-[#800020]/15">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-black text-[#800020]">
                                            هل أنت متأكد من رغبتك في إلغاء الطلبية؟
                                        </h3>
                                        <p className="text-xs text-[#800020]/70 font-semibold mt-0.5">
                                            طلب رقم #{cancelModalOrder.id} • {cancelModalOrder.date}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCancelModalOrder(null)}
                                    className="p-1.5 rounded-lg text-[#800020]/60 hover:text-[#800020] hover:bg-[#800020]/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Warning Subtitle Notice */}
                            <div className="bg-[#800020]/5 border border-[#800020]/15 rounded-xl p-3.5 text-xs text-[#800020]/90 leading-relaxed font-medium">
                                يرجى مراجعة تفاصيل الطلبية أدناه قبل التأكيد. عند قبول الإلغاء، سيتم تحويل حالة الطلب إلى ملغى وإيقاف التجهيز.
                            </div>

                            {/* Order Details (تفاصيل الطلبية) */}
                            <div className="flex flex-col gap-3">
                                <span className="text-xs font-black text-[#800020] uppercase tracking-wider">
                                    تفاصيل الطلبية:
                                </span>

                                {/* Items List Preview */}
                                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pl-1">
                                    {cancelModalOrder.items?.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/70 border border-[#800020]/10"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={item.img}
                                                    alt={item.name}
                                                    className="w-12 h-12 rounded-lg object-contain bg-brand-cream/30 p-1 shrink-0 border border-[#800020]/10"
                                                />
                                                <div className="min-w-0">
                                                    <h4 className="text-xs sm:text-sm font-bold text-[#800020] truncate">
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-[11px] text-[#800020]/70 font-medium">
                                                        الكمية: {item.qty} {item.size ? `• المقاس: ${item.size}` : ''} {item.color ? `• اللون: ${item.color}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs sm:text-sm font-black text-[#800020] shrink-0">
                                                {item.price * item.qty} <RiyalIcon />
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Meta Summary */}
                                <div className="bg-white/70 border border-[#800020]/10 rounded-xl p-3.5 flex flex-col gap-2 text-xs">
                                    <div className="flex items-center justify-between text-[#800020]/80">
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <MapPin className="w-3.5 h-3.5 text-[#800020]" />
                                            عنوان التوصيل:
                                        </span>
                                        <span className="font-bold text-[#800020] max-w-[60%] truncate text-left">
                                            {cancelModalOrder.address}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[#800020]/80">
                                        <span className="font-medium">الحالة الحالية:</span>
                                        <span className={`font-bold ${cancelModalOrder.statusColor}`}>
                                            {cancelModalOrder.statusText}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-[#800020]/10 flex items-center justify-between font-black text-sm text-[#800020]">
                                        <span>إجمالي المبلغ:</span>
                                        <span className="text-base">
                                            {cancelModalOrder.total} <RiyalIcon />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2">
                                {/* Confirm cancellation */}
                                <button
                                    type="button"
                                    onClick={() => handleConfirmCancelOrder(cancelModalOrder.id)}
                                    className="flex-1 bg-[#800020] hover:bg-[#600018] text-[#F0DFCD] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>إلغاء الطلبية</span>
                                </button>

                                {/* Keep order */}
                                <button
                                    type="button"
                                    onClick={() => setCancelModalOrder(null)}
                                    className="flex-1 border border-[#800020]/30 text-[#800020] hover:bg-[#800020]/10 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                    <span>الإبقاء على الطلب</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto">
                {/* Account Top Header */}
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <span className="text-xs sm:text-sm lg:text-base font-bold text-[#800020]/75 block mb-0.5 sm:mb-1">
                        أهلاً
                    </span>
                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-[#800020]">
                        {userInfo.name}
                    </h1>
                </div>

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-12 gap-2 sm:gap-4 md:gap-6 lg:gap-8 items-start">
                    
                    {/* Sidebar Navigation (4 cols on mobile, 3 on tablet/desktop) */}
                    <div className="col-span-4 sm:col-span-4 md:col-span-3 lg:col-span-3 flex flex-col gap-2.5 sm:gap-4 lg:gap-6">
                        <nav className="flex flex-col gap-0.5 sm:gap-1 text-sm font-semibold">
                            {/* My orders */}
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`group flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-3.5 px-1.5 xs:px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 rounded-lg sm:rounded-xl transition-all text-right ${
                                    activeTab === 'orders'
                                        ? 'bg-[#800020] text-[#F0DFCD] font-bold shadow-sm'
                                        : 'text-gray-600 hover:text-[#800020] hover:bg-[#800020]/10'
                                }`}
                            >
                                <Truck className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0 transition-colors ${activeTab === 'orders' ? 'text-[#F0DFCD]' : 'text-gray-400 group-hover:text-[#800020]'}`} />
                                <span className="text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-bold leading-tight">طلباتي</span>
                            </button>

                            {/* Addresses */}
                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`group flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-3.5 px-1.5 xs:px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 rounded-lg sm:rounded-xl transition-all text-right ${
                                    activeTab === 'addresses'
                                        ? 'bg-[#800020] text-[#F0DFCD] font-bold shadow-sm'
                                        : 'text-gray-600 hover:text-[#800020] hover:bg-[#800020]/10'
                                }`}
                            >
                                <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0 transition-colors ${activeTab === 'addresses' ? 'text-[#F0DFCD]' : 'text-gray-400 group-hover:text-[#800020]'}`} />
                                <span className="text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-bold leading-tight">عناويني</span>
                            </button>

                            {/* Payments */}
                            <button
                                onClick={() => setActiveTab('payments')}
                                className={`group flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-3.5 px-1.5 xs:px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 rounded-lg sm:rounded-xl transition-all text-right ${
                                    activeTab === 'payments'
                                        ? 'bg-[#800020] text-[#F0DFCD] font-bold shadow-sm'
                                        : 'text-gray-600 hover:text-[#800020] hover:bg-[#800020]/10'
                                }`}
                            >
                                <CreditCard className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0 transition-colors ${activeTab === 'payments' ? 'text-[#F0DFCD]' : 'text-gray-400 group-hover:text-[#800020]'}`} />
                                <span className="text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-bold leading-tight">طرق الدفع</span>
                            </button>

                            {/* Saved items */}
                            <Link
                                to="/wishlist"
                                className="group flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-3.5 px-1.5 xs:px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 rounded-lg sm:rounded-xl transition-all text-right text-gray-600 hover:text-[#800020] hover:bg-[#800020]/10"
                            >
                                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0 transition-colors text-gray-400 group-hover:text-[#800020]" />
                                <span className="text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-bold leading-tight">العناصر المحفوظة</span>
                            </Link>

                            {/* My Information (معلوماتي) */}
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`group flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-3.5 px-1.5 xs:px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 rounded-lg sm:rounded-xl transition-all text-right ${
                                    activeTab === 'info'
                                        ? 'bg-[#800020] text-[#F0DFCD] font-bold shadow-sm'
                                        : 'text-gray-600 hover:text-[#800020] hover:bg-[#800020]/10'
                                }`}
                            >
                                <User className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0 transition-colors ${activeTab === 'info' ? 'text-[#F0DFCD]' : 'text-gray-400 group-hover:text-[#800020]'}`} />
                                <span className="text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-bold leading-tight">معلوماتي</span>
                            </button>

                            {/* Admin Dashboard */}
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="group flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-3.5 px-1.5 xs:px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 rounded-lg sm:rounded-xl transition-all text-right text-[#800020] bg-[#800020]/10 hover:bg-[#800020] hover:text-[#F0DFCD] font-bold"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0 transition-colors text-[#800020] group-hover:text-[#F0DFCD]" />
                                    <span className="text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-bold leading-tight">لوحة الإدارة التنفيذية</span>
                                </Link>
                            )}
                        </nav>

                        <div className="h-px bg-gray-200/80 my-0.5 sm:my-1" />

                        {/* Customer support & Logout */}
                        <nav className="flex flex-col gap-0.5 sm:gap-1 text-sm font-semibold">
                            <button
                                onClick={() => showToast('خدمة العملاء جاهزة لمساعدتك دائماً')}
                                className="group flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-3.5 px-1.5 xs:px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 rounded-lg sm:rounded-xl transition-all text-right text-gray-600 hover:text-[#800020] hover:bg-[#800020]/10"
                            >
                                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0 transition-colors text-gray-400 group-hover:text-[#800020]" />
                                <span className="text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-bold leading-tight">خدمة العملاء</span>
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    await signOut();
                                    navigate('/login');
                                }}
                                className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-3.5 px-1.5 xs:px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 rounded-lg sm:rounded-xl transition-all text-right text-[#800020] hover:bg-[#800020]/10 hover:text-[#5a0016] font-bold cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0 text-[#800020]" />
                                <span className="text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-bold leading-tight">تسجيل الخروج</span>
                            </button>
                        </nav>
                    </div>

                    {/* Main Content Area (8 cols on mobile, 9 on tablet/desktop) */}
                    <div className="col-span-8 sm:col-span-8 md:col-span-9 lg:col-span-9 flex flex-col gap-3 sm:gap-4 lg:gap-6">

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <>
                                {/* Orders Filter Tabs: الحالية، السابقة، الملغاة، جميع الطلبات */}
                                <div className="self-start flex gap-1 xs:gap-1.5 sm:gap-2.5 lg:gap-3 flex-wrap items-center">
                                    {[
                                        { key: 'current', label: 'الحالية', count: statusCounts.current },
                                        { key: 'previous', label: 'السابقة', count: statusCounts.previous },
                                        { key: 'cancelled', label: 'الملغي', count: statusCounts.cancelled },
                                        { key: 'all', label: 'جميع الطلبات', count: statusCounts.all },
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setOrderFilter(tab.key)}
                                            className={`px-2 py-1 xs:px-2.5 xs:py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 rounded-lg sm:rounded-xl font-bold text-[9px] xs:text-[10px] sm:text-xs lg:text-sm transition-all duration-300 flex items-center gap-1 sm:gap-1.5 lg:gap-2 cursor-pointer ${
                                                orderFilter === tab.key
                                                    ? 'bg-[#800020] text-[#F0DFCD] shadow-md ring-1 ring-[#800020]/20'
                                                    : 'bg-white/40 text-[#800020] hover:bg-white/70 border border-[#800020]/15'
                                            }`}
                                        >
                                            <span>{tab.label}</span>
                                            <span className={`text-[8px] xs:text-[9px] sm:text-[10px] lg:text-[11px] font-black px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full transition-colors ${
                                                orderFilter === tab.key
                                                    ? 'bg-[#F0DFCD] text-[#800020]'
                                                    : 'bg-[#800020]/10 text-[#800020]'
                                            }`}>
                                                {tab.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Orders List */}
                                <div className="flex flex-col gap-3 sm:gap-5 lg:gap-6">
                                    {isOrdersLoading && ordersList.length === 0 ? (
                                        <div className="flex flex-col gap-3 sm:gap-5">
                                            {[1, 2].map(n => (
                                                <div key={n} className="bg-white/25 backdrop-blur-xs rounded-xl sm:rounded-2xl border border-[#800020]/15 p-3 sm:p-6 lg:p-7 animate-pulse flex flex-col gap-3 sm:gap-4">
                                                    <div className="flex justify-between items-center pb-2.5 sm:pb-3 border-b border-[#800020]/10">
                                                        <div className="h-4 sm:h-5 w-24 sm:w-36 bg-[#800020]/15 rounded-md"></div>
                                                        <div className="h-6 sm:h-8 w-16 sm:w-24 bg-[#800020]/15 rounded-lg"></div>
                                                    </div>
                                                    <div className="flex gap-2.5 sm:gap-4 items-center">
                                                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-[#800020]/15 rounded-xl shrink-0"></div>
                                                        <div className="flex-1 flex flex-col gap-1.5 sm:gap-2">
                                                            <div className="h-3.5 sm:h-4 w-36 sm:w-48 bg-[#800020]/15 rounded-md"></div>
                                                            <div className="h-2.5 sm:h-3 w-24 sm:w-32 bg-[#800020]/10 rounded-md"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : filteredOrders.length === 0 ? (
                                        <div className="bg-white/25 backdrop-blur-xs rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center border border-[#800020]/15 shadow-sm">
                                            <p className="text-[#800020]/80 font-bold text-xs sm:text-base lg:text-lg">
                                                {orderFilter === 'current' && 'لا توجد طلبات حالية'}
                                                {orderFilter === 'previous' && 'لا توجد طلبات سابقة'}
                                                {orderFilter === 'cancelled' && 'لا توجد طلبات ملغاة'}
                                                {orderFilter === 'all' && 'لا توجد أي طلبات مسجلة حتى الآن'}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={order.id}
                                                className="bg-white/25 backdrop-blur-xs rounded-xl sm:rounded-2xl border border-[#800020]/15 p-2.5 xs:p-3 sm:p-5 lg:p-7 flex flex-col gap-2.5 sm:gap-4 lg:gap-5"
                                            >
                                                {/* Card Header */}
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pb-2.5 sm:pb-3 lg:pb-4 border-b border-[#800020]/10">
                                                    <div>
                                                        <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-black text-[#800020]">
                                                            رقم الطلب: #{order.id}
                                                        </h3>
                                                        <p className="text-[8.5px] xs:text-[9.5px] sm:text-xs lg:text-sm text-[#800020]/80 font-medium mt-0.5">
                                                            {order.itemCount} منتجات | {order.date}، {order.time}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-1.5 md:gap-2 self-start sm:self-center shrink-0 flex-nowrap">
                                                        {order.statusType === 'current' && (
                                                            <Link
                                                                to={`/track-order/${order.id}`}
                                                                className="shine-button bg-[#800020] text-[#F0DFCD] px-2 py-1 xs:px-2.5 xs:py-1 sm:px-2.5 sm:py-1.5 md:px-3 md:py-1.5 lg:px-3.5 lg:py-1.5 rounded-md sm:rounded-lg text-[8.5px] xs:text-[9.5px] sm:text-[10px] md:text-xs font-bold shadow-xs hover:shadow-lg active:scale-95 transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                                                            >
                                                                <Truck className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 relative z-10 text-[#F0DFCD]" />
                                                                <span className="relative z-10">تتبع الطلب</span>
                                                            </Link>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDownloadInvoice(order.id)}
                                                            className="shine-button bg-[#800020] text-[#F0DFCD] px-2 py-1 xs:px-2.5 xs:py-1 sm:px-2.5 sm:py-1.5 md:px-3 md:py-1.5 lg:px-3.5 lg:py-1.5 rounded-md sm:rounded-lg text-[8.5px] xs:text-[9.5px] sm:text-[10px] md:text-xs font-bold shadow-xs hover:shadow-lg active:scale-95 transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                                                        >
                                                            <Download className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 relative z-10 text-[#F0DFCD]" />
                                                            <span className="relative z-10">تحميل الفاتورة</span>
                                                        </button>

                                                        {order.statusType === 'current' && (
                                                            <div className="relative shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOpenMenuOrderId(openMenuOrderId === order.id ? null : order.id)}
                                                                    className="shine-button bg-[#800020] text-[#F0DFCD] p-1 sm:p-1.5 rounded-md sm:rounded-lg text-xs font-bold shadow-xs hover:shadow-lg active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
                                                                >
                                                                    <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4 relative z-10 text-[#F0DFCD]" />
                                                                </button>

                                                                {openMenuOrderId === order.id && (
                                                                    <>
                                                                        <div 
                                                                            className="fixed inset-0 z-20" 
                                                                            onClick={() => setOpenMenuOrderId(null)} 
                                                                        />
                                                                        <div className="absolute left-0 top-full mt-1.5 z-30 animate-in fade-in zoom-in-95">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setOpenMenuOrderId(null);
                                                                                    setCancelModalOrder(order);
                                                                                }}
                                                                                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold bg-[#800020] text-[#F0DFCD] hover:bg-[#600018] rounded-xl shadow-xl border border-[#800020]/20 transition-all cursor-pointer whitespace-nowrap"
                                                                            >
                                                                                <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F0DFCD] shrink-0" />
                                                                                <span>إلغاء الطلبية</span>
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Order Meta Information */}
                                                <div className="grid grid-cols-2 md:flex md:flex-wrap md:items-start md:justify-between gap-y-2 gap-x-2 sm:gap-x-4 lg:gap-x-6 text-[8.5px] xs:text-[9.5px] sm:text-xs lg:text-sm py-1">
                                                    <div className="shrink-0">
                                                        <span className="text-[#800020]/75 block mb-0.5 sm:mb-1 text-[8px] xs:text-[9px] sm:text-[11px] lg:text-xs font-medium">الحالة:</span>
                                                        <span className={`font-bold ${order.statusColor}`}>
                                                            {order.statusText}
                                                        </span>
                                                    </div>

                                                    <div className="shrink-0">
                                                        <span className="text-[#800020]/75 block mb-0.5 sm:mb-1 text-[8px] xs:text-[9px] sm:text-[11px] lg:text-xs font-medium">تاريخ التوصيل:</span>
                                                        <span className="font-bold text-[#800020]">
                                                            {order.deliveryDate}
                                                        </span>
                                                    </div>

                                                    <div className="shrink-0">
                                                        <span className="text-[#800020]/75 block mb-0.5 sm:mb-1 text-[8px] xs:text-[9px] sm:text-[11px] lg:text-xs font-medium">عنوان التوصيل:</span>
                                                        <span className="font-semibold text-[#800020]">
                                                            {order.address}
                                                        </span>
                                                    </div>

                                                    <div className="shrink-0 md:ml-4 lg:ml-14">
                                                        <span className="text-[#800020]/75 block mb-0.5 sm:mb-1 text-[8px] xs:text-[9px] sm:text-[11px] lg:text-xs font-medium">الإجمالي:</span>
                                                        <span className="font-black text-[#800020] text-[11px] xs:text-xs sm:text-sm lg:text-base flex items-center gap-0.5">
                                                            {order.total.toFixed(2)} <RiyalIcon />
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Order Products Grid */}
                                                <div className="pt-2.5 sm:pt-4 border-t border-[#800020]/10 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                                                    {order.items.map((item, idx) => (
                                                        <div 
                                                            key={idx}
                                                            className="flex items-center gap-2 sm:gap-3.5 p-1 sm:p-2 rounded-lg sm:rounded-xl hover:bg-white/30 transition-colors"
                                                        >
                                                            {/* Thumbnail */}
                                                            <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/25 rounded-lg sm:rounded-xl shrink-0 flex items-center justify-center p-1 sm:p-2 border border-[#800020]/10 overflow-hidden">
                                                                <img 
                                                                    src={item.img} 
                                                                    alt={item.name} 
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>

                                                            {/* Item Info */}
                                                            <div className="flex-1 min-w-0 text-right">
                                                                <h4 className="font-bold text-[9.5px] xs:text-[10.5px] sm:text-xs lg:text-sm text-[#800020] truncate mb-0.5 sm:mb-1">
                                                                    {item.name}
                                                                </h4>
                                                                <div className="text-[8px] xs:text-[9px] sm:text-[11px] lg:text-xs text-[#800020]/75 flex flex-col gap-0.5 leading-tight">
                                                                    <span className="flex items-center gap-1 font-semibold text-[#800020]">
                                                                        الكمية: {item.qty}x = {item.price.toFixed(2)} <RiyalIcon />
                                                                    </span>
                                                                    <span className="text-[#800020]/80">اللون: {item.color}</span>
                                                                    <span className="text-[#800020]/80">المقاس: {item.size}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}

                        {/* معلوماتي (My Info) Tab */}
                        {activeTab === 'info' && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/25 backdrop-blur-xs rounded-xl sm:rounded-2xl border border-[#800020]/15 shadow-sm p-3.5 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6"
                            >
                                <div className="border-b border-[#800020]/10 pb-3 sm:pb-4">
                                    <h2 className="text-base sm:text-xl lg:text-2xl font-black text-[#800020]">معلوماتي</h2>
                                    <p className="text-[10px] sm:text-xs lg:text-sm text-[#800020]/75 font-medium mt-0.5 sm:mt-1">
                                        تعديل بياناتك الشخصية وحسابك
                                    </p>
                                </div>

                                <form onSubmit={handleRequestPasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
                                    {/* الاسم الأول */}
                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                        <label className="text-[10px] sm:text-xs lg:text-sm font-bold text-[#800020] flex items-center gap-1.5">
                                            <span>الاسم الأول</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={userInfo.firstName || ''}
                                            onChange={(e) => handleFirstNameChange(e.target.value)}
                                            onBlur={handleSaveNameOnBlur}
                                            className="w-full bg-white/25 backdrop-blur-xs border border-[#800020]/20 rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-[#800020] placeholder:text-[#800020]/40 outline-none focus:border-[#800020] focus:bg-white/40 transition-all"
                                            placeholder="أدخل الاسم الأول"
                                        />
                                    </div>

                                    {/* الاسم الثاني */}
                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                        <label className="text-[10px] sm:text-xs lg:text-sm font-bold text-[#800020] flex items-center gap-1.5">
                                            <span>الاسم الثاني</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={userInfo.lastName || ''}
                                            onChange={(e) => handleLastNameChange(e.target.value)}
                                            onBlur={handleSaveNameOnBlur}
                                            className="w-full bg-white/25 backdrop-blur-xs border border-[#800020]/20 rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-[#800020] placeholder:text-[#800020]/40 outline-none focus:border-[#800020] focus:bg-white/40 transition-all"
                                            placeholder="أدخل الاسم الثاني"
                                        />
                                    </div>

                                    {/* البريد الإلكتروني */}
                                    <div className="flex flex-col gap-1.5 sm:gap-2 md:col-span-2">
                                        <label className="text-[10px] sm:text-xs lg:text-sm font-bold text-[#800020] flex items-center gap-1.5">
                                            <span>البريد الإلكتروني</span>
                                        </label>
                                        <input
                                            type="email"
                                            dir="ltr"
                                            value={userInfo.email || ''}
                                            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                                            className="w-full bg-white/25 backdrop-blur-xs border border-[#800020]/20 rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-[#800020] placeholder:text-[#800020]/40 outline-none focus:border-[#800020] focus:bg-white/40 transition-all text-right font-sans"
                                            placeholder="example@domain.com"
                                        />
                                    </div>

                                    {/* زر طلب تغيير كلمة السر عاليمين تحت */}
                                    <div className="md:col-span-2 pt-1 sm:pt-2 flex items-center justify-start">
                                        <button
                                            type="button"
                                            onClick={handleRequestPasswordChange}
                                            className="shine-button bg-[#800020] text-[#F0DFCD] px-4 py-2 sm:px-7 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-xs hover:shadow-lg active:scale-95 flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all"
                                        >
                                            <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 text-[#F0DFCD]" />
                                            <span className="relative z-10">طلب تغيير كلمة السر</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Addresses Tab */}
                        {activeTab === 'addresses' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 sm:gap-6">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h2 className="text-sm xs:text-base sm:text-xl font-black text-[#800020]">عناوين التوصيل المحفوظة</h2>
                                    <button 
                                        type="button"
                                        onClick={() => openAddressModal('add')}
                                        className="shine-button bg-[#800020] text-[#F0DFCD] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold shadow-xs hover:shadow-lg active:scale-95 transition-all flex items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 text-[#F0DFCD]" />
                                        <span className="relative z-10">إضافة عنوان جديد</span>
                                    </button>
                                </div>

                                {savedAddresses.length === 0 ? (
                                    <div className="bg-white/25 backdrop-blur-xs rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center border border-[#800020]/15 shadow-sm">
                                        <p className="text-[#800020]/80 font-bold text-xs sm:text-lg">
                                            لا توجد عناوين توصيل محفوظة حتى الآن
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
                                        {savedAddresses.map((addr) => (
                                            <div 
                                                key={addr.id}
                                                className={`bg-white/25 backdrop-blur-xs rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm relative transition-all duration-300 ${
                                                    addr.isDefault 
                                                        ? 'border-2 border-[#800020]' 
                                                        : 'border border-[#800020]/20 hover:border-[#800020]/40'
                                                }`}
                                            >
                                                {addr.isDefault ? (
                                                    <span className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 bg-[#800020] text-[#F0DFCD] text-[9px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-xs">
                                                        العنوان الافتراضي
                                                    </span>
                                                ) : (
                                                    <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex items-center gap-1 sm:gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSetDefaultAddress(addr.id)}
                                                            className="shine-button bg-[#800020] text-[#F0DFCD] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold shadow-xs hover:shadow-lg active:scale-95 transition-all flex items-center gap-0.5 sm:gap-1 cursor-pointer"
                                                        >
                                                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#F0DFCD] relative z-10" />
                                                            <span className="relative z-10">تعيين كافتراضي</span>
                                                        </button>
                                                        {savedAddresses.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteAddress(addr.id)}
                                                                className="shine-text-btn group p-1 bg-transparent border-0 cursor-pointer active:scale-90 transition-all flex items-center justify-center"
                                                                aria-label="حذف العنوان"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2] shine-icon" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                <h3 className="font-bold text-[#800020] text-xs sm:text-base mb-1 sm:mb-2">{addr.title}</h3>
                                                <p className="text-[10px] sm:text-sm text-[#800020]/80 leading-relaxed mb-2 sm:mb-4">{addr.address}</p>
                                                <p className="text-[9px] sm:text-xs text-[#800020]/70">رقم الهاتف: {addr.phone}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Payments Tab */}
                        {activeTab === 'payments' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 sm:gap-6">
                                <div className="flex flex-row items-center justify-between gap-1 sm:gap-2">
                                    <h2 className="text-[11px] xs:text-xs sm:text-lg lg:text-xl font-black text-[#800020] whitespace-nowrap shrink-0">البطاقات المحفوظة</h2>
                                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                        <button 
                                            type="button"
                                            onClick={() => setIsManageCardsOpen(true)}
                                            className="shine-button bg-[#800020] text-[#F0DFCD] px-1.5 py-1 xs:px-2 xs:py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg sm:rounded-xl text-[7.5px] xs:text-[8.5px] sm:text-xs lg:text-sm font-bold shadow-xs hover:shadow-lg active:scale-95 transition-all flex items-center gap-0.5 sm:gap-1.5 cursor-pointer whitespace-nowrap"
                                        >
                                            <SlidersHorizontal className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3.5 sm:h-3.5 relative z-10 text-[#F0DFCD]" />
                                            <span className="relative z-10">إدارة البطاقات</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => openCardModal('add')}
                                            className="shine-button bg-[#800020] text-[#F0DFCD] px-1.5 py-1 xs:px-2 xs:py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg sm:rounded-xl text-[7.5px] xs:text-[8.5px] sm:text-xs lg:text-sm font-bold shadow-xs hover:shadow-lg active:scale-95 transition-all flex items-center gap-0.5 sm:gap-1.5 cursor-pointer whitespace-nowrap"
                                        >
                                            <Plus className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3.5 sm:h-3.5 relative z-10 text-[#F0DFCD]" />
                                            <span className="relative z-10">إضافة بطاقة</span>
                                        </button>
                                    </div>
                                </div>
                                {savedCards.length === 0 ? (
                                    <div className="bg-white/25 backdrop-blur-xs rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center border border-[#800020]/15 shadow-sm">
                                        <p className="text-[#800020]/80 font-bold text-xs sm:text-lg">
                                            لا توجد بطاقات دفع محفوظة حتى الآن
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                                        {savedCards.map((card) => renderCreditCard(card))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
