import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, 
    MapPin, 
    CreditCard, 
    ShieldCheck, 
    Truck, 
    ArrowRight, 
    Plus, 
    AlertCircle, 
    ShoppingBag, 
    Tag, 
    ChevronDown, 
    Lock, 
    Building2,
    Calendar,
    Phone,
    User,
    CheckCircle2,
    ArrowLeft,
    Sparkles
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addressesApi, savedCardsApi, ordersApi } from '../lib/api';
import { supabase } from '../lib/supabase';
import RiyalIcon from '../components/RiyalIcon';
import CustomDropdown from '../components/CustomDropdown';
import { CardBrandBadge, RealisticEmvChip, MadaBadge, VisaBadge, MastercardBadge, AmexBadge, ContactlessWaves } from '../components/PaymentLogos';

// Saudi regions and cities dataset for quick accurate address entry
const saudiRegionsData = {
    'منطقة الرياض': {
        cities: ['الرياض', 'الخرج', 'الدرعية', 'المجمعة', 'الدوادمي', 'الزلفي'],
        districts: {
            'الرياض': ['حي الصحافة', 'حي الياسمين', 'حي النرجس', 'حي الملقا', 'حي العقيق', 'حي حطين', 'حي العليا', 'حي السليمانية', 'حي النخيل', 'حي الغدير'],
            default: ['وسط المدينة', 'الحي الشمالي', 'الحي الجنوبي']
        }
    },
    'منطقة مكة المكرمة': {
        cities: ['جدة', 'مكة المكرمة', 'الطائف', 'رابغ'],
        districts: {
            'جدة': ['حي الروضة', 'حي السلامة', 'حي الشاطئ', 'حي الحمراء', 'حي الزهراء', 'حي أبحر الشمالية'],
            'مكة المكرمة': ['حي العوالي', 'حي الشوقية', 'حي العزيزية', 'حي بطحاء قريش'],
            'الطائف': ['حي شهار', 'حي الفيصلية', 'حي الحوية'],
            default: ['وسط المدينة', 'الحي الشمالي']
        }
    },
    'المنطقة الشرقية': {
        cities: ['الدمام', 'الخبر', 'الظهران', 'الجبيل', 'الأحساء (الهفوف)'],
        districts: {
            'الدمام': ['حي الشاطئ', 'حي الفنار', 'حي المزروعية', 'حي الفيصلية'],
            'الخبر': ['حي الحزام الذهبي', 'حي العقربية', 'حي الجسر', 'حي العليا'],
            default: ['وسط المدينة', 'الحي الشمالي']
        }
    },
    'منطقة المدينة المنورة': {
        cities: ['المدينة المنورة', 'ينبع', 'العلا'],
        districts: {
            'المدينة المنورة': ['حي العوالي', 'حي سلطانة', 'حي الخالدية', 'حي باقدو'],
            default: ['وسط المدينة', 'حي الشاطئ']
        }
    },
    'منطقة القصيم': {
        cities: ['بريدة', 'عنيزة', 'الرس'],
        districts: {
            'بريدة': ['حي الصفراء', 'حي الإسكان', 'حي الفايزية'],
            default: ['وسط المدينة']
        }
    },
    'منطقة عسير': {
        cities: ['أبها', 'خميس مشيط'],
        districts: {
            'أبها': ['حي المفتاحة', 'حي المنسك', 'حي الضباب'],
            default: ['وسط المدينة']
        }
    }
};

// Card theme generator based on brand/type (matching AccountPage)
const getCardTheme = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('mada') || t.includes('مدى')) {
        return {
            name: 'مدى / Mada',
            bg: 'bg-gradient-to-br from-[#006C35] via-[#005228] to-[#00381B]',
            border: 'border-emerald-400/40',
            glow: 'shadow-emerald-950/30',
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
            glow: 'shadow-blue-950/30',
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
            glow: 'shadow-orange-950/30',
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
            glow: 'shadow-cyan-950/30',
            textColor: 'text-white',
            subText: 'text-cyan-100/80',
            brandLogo: 'amex',
            chipGlow: 'from-slate-200 via-slate-300 to-slate-400'
        };
    }
    return {
        name: type || 'بطاقة بنكية',
        bg: 'bg-gradient-to-br from-[#800020] via-[#540015] to-[#29000A]',
        border: 'border-[#F0DFCD]/40',
        glow: 'shadow-rose-950/30',
        textColor: 'text-white',
        subText: 'text-[#F0DFCD]/80',
        brandLogo: 'default',
        chipGlow: 'from-amber-200 via-amber-300 to-amber-500'
    };
};

const getDetectedBrandKey = (digits) => {
    const clean = (digits || '').replace(/\D/g, '');
    if (!clean) return null;
    const madaPrefixes = [
        '588845', '588846', '588847', '588848', '588849', '588850', '588851',
        '400861', '401757', '409201', '410685', '417633', '422817', '422818', '422819',
        '428671', '428672', '428673', '431361', '432328', '434107', '439954', '440647',
        '440795', '446404', '457865', '457997', '468540', '484783', '493428',
        '504300', '508160', '513213', '521076', '524130', '524514', '529415', '529741',
        '530906', '531095', '532013', '535825', '535989', '536023', '537767', '539738',
        '543357', '554180', '557606', '558848', '604906', '605141', '636120', '968201',
        '968202', '968203', '968204', '968205', '968206', '968207', '968208', '968209', '968211'
    ];
    if (madaPrefixes.some(prefix => clean.startsWith(prefix))) return 'mada';
    if (clean.startsWith('4')) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    if (/^(58|60|96)/.test(clean)) return 'mada';
    return null;
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
    const currentYear = now.getFullYear() % 100; // e.g. 26
    const currentMonth = now.getMonth() + 1;     // e.g. 10
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return { valid: false, error: 'البطاقة منتهية الصلاحية' };
    }
    if (year > currentYear + 15) {
        return { valid: false, error: 'سنة الانتهاء غير منطقية' };
    }
    return { valid: true, error: null };
};

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user, profile } = useAuth();
    const { cartItems, clearCart } = useShop();

    // Calculate subtotal
    const subtotal = cartItems.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 
        0
    );

    // Coupon and discounts
    const [couponCode, setCouponCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [discountMessage, setDiscountMessage] = useState('');

    const shippingCost = 0; // Free shipping
    const total = Math.max(0, subtotal - appliedDiscount + shippingCost);

    // Addresses management
    const [savedAddresses, setSavedAddresses] = useState([]);

    const [selectedAddressId, setSelectedAddressId] = useState(() => {
        const def = savedAddresses.find(a => a.isDefault);
        return def?.id || savedAddresses[0]?.id || '';
    });

    // Toggle for adding new address inline
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [newAddressForm, setNewAddressForm] = useState({
        label: 'المنزل',
        province: 'منطقة الرياض',
        city: 'الرياض',
        district: 'حي الصحافة',
        customDistrict: '',
        street: '',
        building: '',
        postalCode: '',
        phone: profile?.phone || '',
        notes: ''
    });

    // Payment methods
    // options: 'mada' | 'visa' | 'applepay' | 'tamara' | 'tabby' | 'cod'
    const [paymentMethod, setPaymentMethod] = useState('mada');

    // Card Details state
    const [cardDetails, setCardDetails] = useState({
        number: '',
        holder: profile?.full_name || user?.user_metadata?.full_name || '',
        expiry: '',
        cvv: ''
    });

    // Confirmation options & live validation states
    const [saveCardForFuture, setSaveCardForFuture] = useState(true);
    const [cardErrors, setCardErrors] = useState({});

    // Saved Cards from database/cache
    const [savedCards, setSavedCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState('');
    const [useNewCard, setUseNewCard] = useState(false);

    // Order placing state & Success Modal
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);

const defaultGuestAddresses = [
    {
        id: 'guest-addr-1',
        title: 'عنوان التوصيل (افتراضي)',
        address: 'الرياض، طريق الملك فهد، حي الصحافة',
        phone: '0501234567',
        isDefault: true
    }
];

const defaultGuestCards = [
    {
        id: 'guest-card-1',
        type: 'مدى / Mada',
        number: '•••• •••• •••• 5888',
        expiry: '08/28',
        holder: 'GUEST CLIENT',
        isDefault: true
    }
];

    // Fetch user addresses & cards on mount
    useEffect(() => {
        if (!user) {
            setSavedAddresses(defaultGuestAddresses);
            setSelectedAddressId(defaultGuestAddresses[0].id);
            setSavedCards(defaultGuestCards);
            setSelectedCardId(defaultGuestCards[0].id);
            setUseNewCard(false);
            return;
        }

        addressesApi.getAll().then(({ data, error }) => {
            if (!error && data) {
                if (data.length > 0) {
                    const mapped = data.map(a => ({
                        id: a.id,
                        title: a.label || 'المنزل',
                        address: [a.city, a.district, a.street, a.building].filter(Boolean).join('، '),
                        phone: a.phone || profile?.phone || '',
                        isDefault: !!a.is_default
                    }));
                    setSavedAddresses(mapped);
                    const def = mapped.find(m => m.isDefault) || mapped[0];
                    if (def) setSelectedAddressId(def.id);
                } else {
                    setSavedAddresses([]);
                    setSelectedAddressId('');
                    setIsAddingNewAddress(true);
                }
            }
        });

        savedCardsApi.getAll().then(({ data, error }) => {
            if (!error && data) {
                if (data.length > 0) {
                    const mapped = data.map(c => ({
                        id: c.id,
                        type: c.card_type === 'mada' ? 'مدى / Mada' : c.card_type === 'visa' ? 'فيزا / Visa' : 'ماستركارد / Mastercard',
                        number: `•••• •••• •••• ${c.last_four || '4242'}`,
                        expiry: `${String(c.expiry_month || 8).padStart(2, '0')}/${String(c.expiry_year || 28).slice(-2)}`,
                        holder: c.holder_name || profile?.full_name || '',
                        isDefault: !!c.is_default
                    }));
                    setSavedCards(mapped);
                    const def = mapped.find(m => m.isDefault) || mapped[0];
                    if (def) setSelectedCardId(def.id);
                } else {
                    setSavedCards([]);
                    setSelectedCardId('');
                    setUseNewCard(true);
                }
            }
        });
    }, [user]);

    // Handle Region & City selection for new address
    const availableCities = saudiRegionsData[newAddressForm.province]?.cities || ['الرياض'];
    const availableDistricts = saudiRegionsData[newAddressForm.province]?.districts?.[newAddressForm.city] 
        || saudiRegionsData[newAddressForm.province]?.districts?.default 
        || ['وسط المدينة'];

    const handleProvinceChange = (province) => {
        const cities = saudiRegionsData[province]?.cities || [];
        const firstCity = cities[0] || '';
        const districts = saudiRegionsData[province]?.districts?.[firstCity] || ['وسط المدينة'];
        setNewAddressForm(prev => ({
            ...prev,
            province,
            city: firstCity,
            district: districts[0] || 'وسط المدينة'
        }));
    };

    const handleCityChange = (city) => {
        const districts = saudiRegionsData[newAddressForm.province]?.districts?.[city] || ['وسط المدينة'];
        setNewAddressForm(prev => ({
            ...prev,
            city,
            district: districts[0] || 'وسط المدينة'
        }));
    };

    // Save New Address Inline
    const handleSaveNewAddress = async (e) => {
        e.preventDefault();

        const cleanPostal = (newAddressForm.postalCode || '').trim();
        if (!cleanPostal) {
            showToast('يرجى إدخال الرمز البريدي', 'error');
            return;
        }
        if (!/^\d{5,6}$/.test(cleanPostal)) {
            showToast('الرمز البريدي يجب أن يتكون من 5 أو 6 أرقام (مثال: 21289)', 'error');
            return;
        }

        const finalDistrict = newAddressForm.district === 'حي آخر (كتابة يدوية)' 
            ? (newAddressForm.customDistrict?.trim() || 'الحي') 
            : newAddressForm.district;

        const parts = [
            newAddressForm.province,
            newAddressForm.city,
            finalDistrict,
            newAddressForm.street?.trim()
        ].filter(Boolean);

        if (newAddressForm.building?.trim()) parts.push(newAddressForm.building.trim());
        if (cleanPostal) parts.push(`الرمز البريدي: ${cleanPostal}`);
        if (newAddressForm.notes?.trim()) parts.push(`ملاحظة: ${newAddressForm.notes.trim()}`);

        const fullAddress = parts.join('، ');
        if (!fullAddress.trim()) {
            showToast('يرجى ملء تفاصيل العنوان', 'error');
            return;
        }

        const addressTitle = newAddressForm.label?.trim() || `عنوان (${finalDistrict})`;
        const tempId = 'addr-' + Date.now();
        const newAddr = {
            id: tempId,
            title: addressTitle,
            address: fullAddress,
            phone: newAddressForm.phone || '+966 50 123 4567',
            isDefault: false
        };

        const updated = [...savedAddresses, newAddr];
        setSavedAddresses(updated);
        setSelectedAddressId(tempId);
        setIsAddingNewAddress(false);
        try {
            localStorage.setItem('thyiaab_saved_addresses', JSON.stringify(updated));
        } catch (err) {}

        if (user) {
            addressesApi.create({
                label: addressTitle,
                full_name: profile?.full_name || user?.user_metadata?.full_name || 'العميل',
                city: newAddressForm.city || 'الرياض',
                district: finalDistrict,
                street: newAddressForm.street || 'الشارع الرئيسي',
                building: newAddressForm.building || '',
                phone: newAddressForm.phone || '+966 50 123 4567',
                postal_code: cleanPostal,
                is_default: false
            }).then(({ data }) => {
                if (data) {
                    setSavedAddresses(prev => prev.map(a => a.id === tempId ? { ...a, id: data.id } : a));
                    setSelectedAddressId(data.id);
                }
            });
        }
        showToast('تمت إضافة العنوان بنجاح وتحديده للطلب');
    };

    // Apply Coupon Code
    const handleApplyCoupon = (e) => {
        e.preventDefault();
        const code = couponCode.trim().toUpperCase();
        if (!code) return;

        if (code === 'THYIAAB10' || code === 'WELCOME10' || code === 'FAV10') {
            const discountVal = Math.round(subtotal * 0.10);
            setAppliedDiscount(discountVal);
            setDiscountMessage('تم تطبيق خصم 10% بنجاح!');
            showToast('تم تطبيق كود الخصم 10% بنجاح!', 'sparkle');
        } else if (code === 'VIP20') {
            const discountVal = Math.round(subtotal * 0.20);
            setAppliedDiscount(discountVal);
            setDiscountMessage('تم تطبيق كود VIP بنجاح!');
            showToast('تم تطبيق كود VIP بخصم 20%!', 'sparkle');
        } else {
            showToast('عذراً، كود الخصم غير صالح أو منتهي الصلاحية', 'error');
        }
    };

    // Card Input Formatter & Strict Realtime Protection
    const handleCardNumberChange = (e) => {
        const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 16);

        // Immediate rejection for impossible card first digits (0, 1, 7, 8)
        if (rawDigits.length > 0 && ['0', '1', '7', '8'].includes(rawDigits[0])) {
            showToast(`أرقام البطاقات البنكية لا تبدأ بالرقم ${rawDigits[0]}، يرجى إدخال بطاقة صحيحة (مدى / فيزا)`, 'error');
            return;
        }

        const formatted = rawDigits.match(/.{1,4}/g)?.join(' ') || rawDigits;
        setCardDetails(prev => ({ ...prev, number: formatted }));
        if (cardErrors.number) setCardErrors(prev => ({ ...prev, number: null }));
    };

    const handleExpiryChange = (e) => {
        let clean = e.target.value.replace(/\D/g, '').slice(0, 4);

        // Auto-prepend 0 if user enters 2-9 as the first digit of month
        if (clean.length === 1 && parseInt(clean, 10) > 1) {
            clean = '0' + clean;
        }

        // Clamp month to maximum 12
        if (clean.length >= 2) {
            let month = parseInt(clean.slice(0, 2), 10);
            if (month === 0) {
                clean = '01' + clean.slice(2);
            } else if (month > 12) {
                clean = '12' + clean.slice(2);
            }
        }

        let formatted = clean;
        if (clean.length > 2) {
            formatted = `${clean.slice(0, 2)}/${clean.slice(2)}`;
        } else if (clean.length === 2) {
            formatted = `${clean}/`;
        }

        setCardDetails(prev => ({ ...prev, expiry: formatted }));
        if (cardErrors.expiry) setCardErrors(prev => ({ ...prev, expiry: null }));
    };

    const handleCvvChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        setCardDetails(prev => ({ ...prev, cvv: val }));
        if (cardErrors.cvv) setCardErrors(prev => ({ ...prev, cvv: null }));
    };

    const handleHolderChange = (e) => {
        const val = e.target.value.replace(/[^a-zA-Z\s]/g, '').toUpperCase().slice(0, 30);
        setCardDetails(prev => ({ ...prev, holder: val }));
        if (cardErrors.holder) setCardErrors(prev => ({ ...prev, holder: null }));
    };

    // Confirm and Adopt New Card Action Handler
    const handleConfirmNewCard = () => {
        const cleanNum = cardDetails.number.replace(/\D/g, '');
        const detected = getDetectedBrandKey(cleanNum);
        const newErrors = {};

        if (cleanNum.length < 15 || cleanNum.length > 16) {
            newErrors.number = 'رقم البطاقة غير مكتمل (16 رقماً)';
        } else if (!detected) {
            newErrors.number = 'نوع البطاقة غير معتمد (مدعوم فقط مدى / فيزا / ماستركارد)';
        } else if (!isValidLuhn(cleanNum)) {
            newErrors.number = 'رقم البطاقة غير صحيح (لم يجتز فحص خوارزمية لُوهن Luhn Check)';
        }

        const expiryCheck = validateExpiryDate(cardDetails.expiry);
        if (!expiryCheck.valid) {
            newErrors.expiry = expiryCheck.error;
        }

        if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
            newErrors.cvv = 'رمز CVV غير مكتمل (3 أو 4 أرقام)';
        }

        if (!cardDetails.holder || cardDetails.holder.trim().length < 3) {
            newErrors.holder = 'يرجى كتابة الاسم باللغة الإنجليزية كما يظهر على البطاقة';
        }

        if (Object.keys(newErrors).length > 0) {
            setCardErrors(newErrors);
            const firstMsg = Object.values(newErrors)[0];
            showToast(firstMsg, 'error');
            return;
        }

        // Card is completely valid
        setCardErrors({});
        const brandTitle = detected === 'mada' ? 'مدى / Mada' : detected === 'visa' ? 'فيزا / Visa' : 'ماستركارد / Mastercard';
        const tempCardId = 'card-' + Date.now();
        const maskedNum = `•••• •••• •••• ${cleanNum.slice(-4)}`;

        const createdCard = {
            id: tempCardId,
            type: brandTitle,
            number: maskedNum,
            expiry: cardDetails.expiry,
            holder: cardDetails.holder.trim(),
            isDefault: false
        };

        setSavedCards(prev => [...prev, createdCard]);
        setSelectedCardId(tempCardId);
        setUseNewCard(false);

        if (user && saveCardForFuture) {
            const parts = cardDetails.expiry.split('/');
            savedCardsApi.create({
                card_type: detected,
                last_four: cleanNum.slice(-4),
                holder_name: cardDetails.holder.trim(),
                expiry_month: parseInt(parts[0], 10),
                expiry_year: 2000 + parseInt(parts[1], 10),
                is_default: false
            }).then(({ data }) => {
                if (data?.id) {
                    setSavedCards(prev => prev.map(c => c.id === tempCardId ? { ...c, id: data.id } : c));
                    setSelectedCardId(data.id);
                }
            });
        }

        showToast('تم التحقق من صحة البطاقة وتأكيد اعتمادها بنجاح!', 'sparkle');
    };

    // Confirm Purchase / Place Order
    const handleConfirmOrder = async () => {
        if (cartItems.length === 0) {
            showToast('سلة المشتريات فارغة', 'error');
            navigate('/cart');
            return;
        }

        // Validate that every product has an explicit size and color selected
        const missingItem = cartItems.find(i => 
            !i.size || i.size === 'غير محدد' || !i.color || i.color === 'حسب الطلب' || i.color === 'غير محدد'
        );
        if (missingItem) {
            showToast(`لا يمكن إتمام عملية الشراء دون تحديد المقاس واللون للمنتج "${missingItem.name}"`, 'error');
            navigate('/cart');
            return;
        }

        let chosenAddress = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0];
        if (!chosenAddress && (newAddressForm.street || newAddressForm.city)) {
            chosenAddress = {
                id: 'inline-addr',
                title: newAddressForm.label || 'عنوان التوصيل',
                address: [newAddressForm.province, newAddressForm.city, newAddressForm.district, newAddressForm.street, newAddressForm.building].filter(Boolean).join('، '),
                phone: newAddressForm.phone || '0500000000'
            };
        }
        if (!chosenAddress) {
            showToast('يرجى تحديد عنوان التوصيل أولاً', 'error');
            return;
        }

        // Strict validation if paying by new card
        if ((paymentMethod === 'mada' || paymentMethod === 'visa') && useNewCard) {
            const cleanNum = cardDetails.number.replace(/\D/g, '');
            const detected = getDetectedBrandKey(cleanNum);
            if (cleanNum.length < 15 || cleanNum.length > 16 || !detected || !isValidLuhn(cleanNum)) {
                showToast('بيانات البطاقة غير سليمة: رقم البطاقة غير صالح ولا يطابق معايير التحقق البنكية', 'error');
                setCardErrors(prev => ({ ...prev, number: 'رقم البطاقة غير سليم' }));
                return;
            }
            const expiryCheck = validateExpiryDate(cardDetails.expiry);
            if (!expiryCheck.valid) {
                showToast(expiryCheck.error || 'تاريخ انتهاء البطاقة غير سليم', 'error');
                setCardErrors(prev => ({ ...prev, expiry: expiryCheck.error }));
                return;
            }
            if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
                showToast('يرجى إدخال رمز الأمان (CVV) صحيح', 'error');
                setCardErrors(prev => ({ ...prev, cvv: 'رمز أمان غير صحيح' }));
                return;
            }
        }

        setIsSubmitting(true);
        const generatedOrderNumber = String(Math.floor(70000 + Math.random() * 9000));

        try {
            const orderPayload = {
                subtotal,
                shipping_cost: shippingCost,
                discount: appliedDiscount,
                total,
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
                status: 'new',
                shipping_address: {
                    name: profile?.full_name || user?.user_metadata?.full_name || chosenAddress.title || 'العميل',
                    title: chosenAddress.title,
                    address: chosenAddress.address,
                    phone: chosenAddress.phone
                }
            };

            const itemsPayload = cartItems.map(i => ({
                product_id: i.productId || '1fe2999b-3b5f-4e89-a994-f6b5fb9ea961',
                product_name: i.name,
                product_image: i.img,
                price: Number(i.price) || 0,
                quantity: Number(i.qty) || 1,
                color: i.color || 'عنابي',
                size: i.size || 'L'
            }));

            let finalOrderNum = generatedOrderNumber;

            if (user) {
                const { data: created, error } = await ordersApi.create(orderPayload, itemsPayload);
                if (!error && created?.order_number) {
                    finalOrderNum = created.order_number;
                }
            } else {
                // Decrement stock directly for guest checkout
                for (const item of itemsPayload) {
                    if (item.product_id) {
                        try {
                            await supabase.rpc('decrement_product_stock', {
                                p_product_id: item.product_id,
                                p_size: item.size || '',
                                p_quantity: Number(item.quantity) || 1
                            });
                        } catch (stockErr) {
                            console.error('Failed to decrement stock for guest purchase:', stockErr);
                        }
                    }
                }
            }

            // Cache order details for immediate tracking
            const orderForTracking = {
                id: finalOrderNum,
                order_number: finalOrderNum,
                subtotal,
                shipping_cost: shippingCost,
                discount: appliedDiscount,
                total,
                payment_method: paymentMethod,
                status: 'new',
                created_at: new Date().toISOString(),
                shipping_address: {
                    name: profile?.full_name || user?.user_metadata?.full_name || chosenAddress.title || 'العميل',
                    title: chosenAddress.title,
                    address: chosenAddress.address,
                    phone: chosenAddress.phone
                },
                items: cartItems.map(i => ({
                    name: i.name,
                    qty: Number(i.qty) || 1,
                    price: Number(i.price) || 0,
                    color: i.color || '',
                    size: i.size || '',
                    img: i.img || ''
                }))
            };

            try {
                const ordersCache = JSON.parse(localStorage.getItem('thyiaab_orders_cache') || '{}');
                ordersCache[finalOrderNum] = orderForTracking;
                ordersCache[String(finalOrderNum).replace(/^ORD-/, '')] = orderForTracking;
                localStorage.setItem('thyiaab_orders_cache', JSON.stringify(ordersCache));
                localStorage.setItem('thyiaab_last_placed_order', JSON.stringify(orderForTracking));
            } catch (cacheErr) {
                console.error('Failed to cache order locally:', cacheErr);
            }

            // Notify application about stock updates
            window.dispatchEvent(new CustomEvent('thyiaab_stock_updated'));

            // Clear shopping cart
            clearCart();

            // Set completed order for celebration confirmation modal
            setCompletedOrder({
                orderNumber: finalOrderNum,
                total,
                address: chosenAddress,
                paymentMethod,
                date: new Date().toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }),
                itemsCount: cartItems.reduce((acc, it) => acc + (Number(it.qty) || 1), 0)
            });

            showToast('تم تأكيد طلبك بنجاح! شكراً لثقتكم بثياب', 'sparkle');
        } catch (err) {
            console.error('Order creation error:', err);
            // Fallback: Decrement stock directly
            for (const item of cartItems) {
                const pid = item.productId || item.id;
                if (pid) {
                    try {
                        await supabase.rpc('decrement_product_stock', {
                            p_product_id: pid,
                            p_size: item.size || '',
                            p_quantity: Number(item.qty) || 1
                        });
                    } catch (e) {
                        console.error('Stock decrement fallback failed:', e);
                    }
                }
            }
            window.dispatchEvent(new CustomEvent('thyiaab_stock_updated'));
            clearCart();
            setCompletedOrder({
                orderNumber: generatedOrderNumber,
                total,
                address: chosenAddress,
                paymentMethod,
                date: new Date().toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }),
                itemsCount: cartItems.reduce((acc, it) => acc + (Number(it.qty) || 1), 0)
            });
            showToast('تم تأكيد طلبك بنجاح!', 'sparkle');
        } finally {
            setIsSubmitting(false);
        }
    };

    // If cart is empty and no order just completed
    if (cartItems.length === 0 && !completedOrder) {
        return (
            <div dir="rtl" className="min-h-screen bg-brand-cream/30 text-[#800020] pt-32 pb-20 px-6 font-arabic flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-3xl bg-[#800020]/10 flex items-center justify-center mb-6 text-[#800020]">
                    <ShoppingBag className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black mb-3">سلتك فارغة حالياً</h2>
                <p className="text-sm text-[#800020]/75 mb-8 max-w-sm text-center">
                    أضف بعض المنتجات الراقية لسلتك لتتمكن من إتمام عملية الشراء.
                </p>
                <Link
                    to="/"
                    className="shine-button bg-[#800020] text-[#F0DFCD] px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-xl active:scale-95 transition-all flex items-center gap-2"
                >
                    <ArrowRight className="w-4 h-4" />
                    <span>تصفح تشكيلات ثياب</span>
                </Link>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-brand-cream/30 text-[#800020] pt-28 pb-20 px-4 sm:px-8 lg:px-12 xl:px-16 font-arabic">
            <div className="w-full max-w-[1720px] mx-auto flex flex-col gap-8">

                {/* Header & Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#800020]/15">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#800020]/60 mb-1.5">
                            <Link to="/" className="hover:text-[#800020] transition-colors">الرئيسية</Link>
                            <span>/</span>
                            <Link to="/cart" className="hover:text-[#800020] transition-colors">سلة المشتريات</Link>
                            <span>/</span>
                            <span className="text-[#800020] font-bold">إتمام الشراء</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#800020]">
                            إتمام عملية الشراء
                        </h1>
                    </div>
                </div>

                {/* Main 2-Column Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">

                    {/* Left Column (Main Form Steps - 7 Cols on lg, 8 Cols on xl) */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">

                        {/* STEP 1: DELIVERY ADDRESS (عنوان التوصيل) */}
                        <div className="bg-white/25 backdrop-blur-xs rounded-3xl p-6 sm:p-8 border border-[#800020]/15 shadow-sm flex flex-col gap-6">
                            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#800020]/10">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center font-black text-base shadow-xs">
                                        1
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-[#800020]">عنوان التوصيل</h2>
                                        <p className="text-xs sm:text-sm text-[#800020]/70 font-semibold">اختر مكان استلام طلبيتك الفاخرة</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                                    className="text-xs font-bold text-[#800020] hover:text-[#500014] bg-[#800020]/10 hover:bg-[#800020]/20 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>{isAddingNewAddress ? 'إلغاء الإضافة' : 'إضافة عنوان جديد'}</span>
                                </button>
                            </div>

                            {/* New Address Accordion Form */}
                            <AnimatePresence>
                                {isAddingNewAddress && (
                                    <motion.form
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        onSubmit={handleSaveNewAddress}
                                        className="bg-white/50 border border-[#800020]/20 rounded-2xl p-6 flex flex-col gap-4 overflow-hidden"
                                    >
                                        <h3 className="text-sm font-bold text-[#800020]">بيانات العنوان الجديد</h3>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-[#800020]">اسم العنوان</label>
                                                <input
                                                    type="text"
                                                    value={newAddressForm.label}
                                                    onChange={e => setNewAddressForm({ ...newAddressForm, label: e.target.value })}
                                                    placeholder="مثال: المنزل، العمل..."
                                                    className="bg-white/60 border border-[#800020]/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-[#800020]"
                                                    required
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-[#800020]">رقم الجوال للتوصيل</label>
                                                <input
                                                    type="text"
                                                    value={newAddressForm.phone}
                                                    onChange={e => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                                                    placeholder="+966 50 123 4567"
                                                    dir="ltr"
                                                    className="bg-white/60 border border-[#800020]/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-[#800020] text-right"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-[#800020]">المنطقة / المحافظة</label>
                                                <CustomDropdown
                                                    value={newAddressForm.province}
                                                    onChange={handleProvinceChange}
                                                    options={Object.keys(saudiRegionsData)}
                                                    triggerClassName="bg-white/60 border border-[#800020]/20 rounded-xl py-2.5 text-xs sm:text-sm"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-[#800020]">المدينة</label>
                                                <CustomDropdown
                                                    value={newAddressForm.city}
                                                    onChange={handleCityChange}
                                                    options={availableCities}
                                                    triggerClassName="bg-white/60 border border-[#800020]/20 rounded-xl py-2.5 text-xs sm:text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold text-[#800020]">الحي</label>
                                            <CustomDropdown
                                                value={newAddressForm.district}
                                                onChange={val => setNewAddressForm({ ...newAddressForm, district: val })}
                                                options={[...availableDistricts, 'حي آخر (كتابة يدوية)']}
                                                triggerClassName="bg-white/60 border border-[#800020]/20 rounded-xl py-2.5 text-xs sm:text-sm"
                                            />
                                            {newAddressForm.district === 'حي آخر (كتابة يدوية)' && (
                                                <input
                                                    type="text"
                                                    value={newAddressForm.customDistrict}
                                                    onChange={e => setNewAddressForm({ ...newAddressForm, customDistrict: e.target.value })}
                                                    placeholder="اكتب اسم الحي هنا..."
                                                    className="mt-1 bg-white/60 border border-[#800020]/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-[#800020]"
                                                    required
                                                />
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-[#800020]">الشارع / رقم المبنى</label>
                                                <input
                                                    type="text"
                                                    value={newAddressForm.street}
                                                    onChange={e => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                                                    placeholder="اسم الشارع، رقم العمارة..."
                                                    className="bg-white/60 border border-[#800020]/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-[#800020]"
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-[#800020] flex items-center gap-1">
                                                    <span>الرمز البريدي (Postal Code)</span>
                                                    <span className="text-rose-600 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    maxLength={6}
                                                    value={newAddressForm.postalCode || ''}
                                                    onKeyDown={(e) => {
                                                        if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key) || e.ctrlKey || e.metaKey) return;
                                                        if (!/^\d$/.test(e.key)) e.preventDefault();
                                                    }}
                                                    onChange={e => {
                                                        const digits = e.target.value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g, '').slice(0, 6);
                                                        setNewAddressForm({ ...newAddressForm, postalCode: digits });
                                                    }}
                                                    placeholder="مثال: 21289"
                                                    dir="ltr"
                                                    className="bg-white/60 border border-[#800020]/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-[#800020] text-right"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold text-[#800020]">رقم الشقة / تفاصيل إضافية</label>
                                            <input
                                                type="text"
                                                value={newAddressForm.building}
                                                onChange={e => setNewAddressForm({ ...newAddressForm, building: e.target.value })}
                                                placeholder="اختياري (شقة 4، الدور الثاني...)"
                                                className="bg-white/60 border border-[#800020]/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-[#800020]"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2.5 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingNewAddress(false)}
                                                className="px-4 py-2 text-xs font-bold text-[#800020] bg-transparent border border-[#800020]/20 rounded-xl hover:bg-white/50 cursor-pointer"
                                            >
                                                إلغاء
                                            </button>
                                            <button
                                                type="submit"
                                                className="shine-button bg-[#800020] text-[#F0DFCD] px-5 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
                                            >
                                                حفظ واعتماد العنوان
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            {/* Saved Addresses List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {savedAddresses.map((addr) => {
                                    const isSelected = selectedAddressId === addr.id;
                                    return (
                                        <div
                                            key={addr.id}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                            className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 relative flex flex-col justify-between min-h-[160px] ${
                                                isSelected
                                                    ? 'bg-white/85 border-2 border-[#800020] shadow-md -translate-y-0.5 ring-2 ring-[#800020]/10'
                                                    : 'bg-white/40 border border-[#800020]/20 hover:border-[#800020]/40 hover:bg-white/60'
                                            }`}
                                        >
                                            <div>
                                                {/* Card Header: Title + Radio Check + Default Badge */}
                                                <div className="flex items-center justify-between gap-3 mb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                                                            isSelected ? 'bg-[#800020] border-[#800020] text-[#F0DFCD]' : 'border-[#800020]/30 bg-white/40'
                                                        }`}>
                                                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                        </div>
                                                        <span className="font-bold text-base text-[#800020]">
                                                            {addr.title}
                                                        </span>
                                                    </div>

                                                    {addr.isDefault && (
                                                        <span className="bg-[#800020] text-[#F0DFCD] text-xs font-bold px-3 py-1 rounded-full shadow-2xs shrink-0">
                                                            الافتراضي
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Address Details with clear padding and word wrap */}
                                                <p className="text-sm text-[#800020]/80 leading-relaxed font-medium break-words pl-1">
                                                    {addr.address}
                                                </p>
                                            </div>

                                            {/* Bottom Phone Bar with dedicated border and spacing */}
                                            <div className="pt-3.5 mt-4 border-t border-[#800020]/10 flex items-center justify-between text-xs text-[#800020]/75">
                                                <div className="flex items-center gap-2 font-mono font-bold" dir="ltr">
                                                    <Phone className="w-3.5 h-3.5 text-[#800020]/70 shrink-0" />
                                                    <span>{addr.phone}</span>
                                                </div>
                                                {isSelected && (
                                                    <span className="text-[11px] font-bold text-[#800020] bg-[#800020]/10 px-2 py-0.5 rounded-md">
                                                        تم التحديد
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* STEP 2: PAYMENT METHOD (طريقة الدفع) */}
                        <div className="bg-white/25 backdrop-blur-xs rounded-3xl p-6 sm:p-8 border border-[#800020]/15 shadow-sm flex flex-col gap-6">
                            <div className="flex items-center gap-3.5 pb-4 border-b border-[#800020]/10">
                                <div className="w-10 h-10 rounded-xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center font-black text-base shadow-xs">
                                    2
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[#800020]">طريقة الدفع</h2>
                                    <p className="text-xs sm:text-sm text-[#800020]/70 font-semibold">اختر وسيلة الدفع الآمنة المفضلة لديك</p>
                                </div>
                            </div>

                            {/* Payment Options Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                                {/* Option 1: Mada / Credit Cards */}
                                <div
                                    onClick={() => setPaymentMethod('mada')}
                                    className={`p-5 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${
                                        paymentMethod === 'mada' || paymentMethod === 'visa'
                                            ? 'bg-white/80 border-2 border-[#800020] shadow-sm ring-2 ring-[#800020]/10'
                                            : 'bg-white/40 border-[#800020]/20 hover:bg-white/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                                            paymentMethod === 'mada' || paymentMethod === 'visa'
                                                ? 'bg-[#800020] border-[#800020] text-[#F0DFCD]'
                                                : 'border-[#800020]/30 bg-white/40'
                                        }`}>
                                            {(paymentMethod === 'mada' || paymentMethod === 'visa') && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <div>
                                            <span className="font-bold text-sm block text-[#800020]">
                                                بطاقة بنكية (مدى / فيزا)
                                            </span>
                                            <span className="text-xs text-[#800020]/70">الدفع الفوري المشفر</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <div className="h-6 px-1.5 bg-white rounded-md shadow-2xs border border-white/60 flex items-center justify-center">
                                            <MadaBadge className="h-3.5 w-auto" />
                                        </div>
                                        <div className="h-6 px-1.5 bg-white rounded-md shadow-2xs border border-white/60 flex items-center justify-center">
                                            <VisaBadge className="h-2.5 w-auto" />
                                        </div>
                                    </div>
                                </div>

                                {/* Option 4: Cash on Delivery */}
                                <div
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`p-5 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${
                                        paymentMethod === 'cod'
                                            ? 'bg-white/80 border-2 border-[#800020] shadow-sm ring-2 ring-[#800020]/10'
                                            : 'bg-white/40 border-[#800020]/20 hover:bg-white/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                                            paymentMethod === 'cod' ? 'bg-[#800020] border-[#800020] text-[#F0DFCD]' : 'border-[#800020]/30 bg-white/40'
                                        }`}>
                                            {paymentMethod === 'cod' && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <div>
                                            <span className="font-bold text-sm block text-[#800020]">
                                                الدفع عند الاستلام
                                            </span>
                                            <span className="text-xs text-[#800020]/70">نقداً أو بالبطاقة عند الباب</span>
                                        </div>
                                    </div>
                                    <Truck className="w-5 h-5 text-[#800020]/80" />
                                </div>
                            </div>

                            {/* Card Details Sub-Form (When Mada / Visa is active) */}
                            {(paymentMethod === 'mada' || paymentMethod === 'visa') && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/50 border border-[#800020]/20 rounded-2xl p-5 flex flex-col gap-4 mt-1"
                                >
                                    {/* Choice between saved cards or new card */}
                                    {savedCards.length > 0 && (
                                        <div className="flex items-center justify-between pb-3 border-b border-[#800020]/10">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setUseNewCard(false)}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                                        !useNewCard ? 'bg-[#800020] text-[#F0DFCD]' : 'bg-white/50 text-[#800020]'
                                                    }`}
                                                >
                                                    البطاقة المحفوظة
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setUseNewCard(true)}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                                        useNewCard ? 'bg-[#800020] text-[#F0DFCD]' : 'bg-white/50 text-[#800020]'
                                                    }`}
                                                >
                                                    + بطاقة جديدة
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!useNewCard && savedCards.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            {savedCards.map(card => {
                                                const theme = getCardTheme(card.type);
                                                const isSelected = selectedCardId === card.id || (savedCards.length === 1 && selectedCardId === '1');
                                                return (
                                                    <div
                                                        key={card.id}
                                                        onClick={() => setSelectedCardId(card.id)}
                                                        className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer shadow-md ${theme.bg} ${theme.glow} border ${theme.border} text-white flex items-center justify-between gap-4 select-none ${
                                                            isSelected ? 'ring-2 ring-white/70 scale-[1.01]' : 'opacity-85 hover:opacity-100 hover:scale-[1.005]'
                                                        }`}
                                                    >
                                                        {/* Decorative glossy highlights */}
                                                        <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                                                        <div className="absolute -left-12 -bottom-12 w-36 h-36 rounded-full bg-black/25 blur-xl pointer-events-none" />

                                                        <div className="flex items-center gap-3 sm:gap-3.5 relative z-10 min-w-0">
                                                            {/* Card Visual Brand Badge */}
                                                            <CardBrandBadge brand={theme.brandLogo} className="h-8.5 px-2.5 shadow-sm" />

                                                            {/* Realistic Metallic Gold Chip */}
                                                            <RealisticEmvChip className="w-8.5 h-6 hidden sm:block" />

                                                            {/* Card Info */}
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono font-bold text-sm sm:text-base text-white tracking-widest block" dir="ltr">
                                                                        {card.number}
                                                                    </span>
                                                                    {card.isDefault && (
                                                                        <span className="text-[10px] font-bold bg-white/20 border border-white/25 text-white px-2 py-0.5 rounded-full shadow-2xs">
                                                                            افتراضية
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className={`text-xs ${theme.subText} font-medium block mt-0.5`}>
                                                                    {card.holder} • ينتهي في {card.expiry}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Radio Check Circle */}
                                                        <div className="relative z-10 shrink-0">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                                                isSelected 
                                                                    ? 'bg-white text-emerald-900 shadow-sm' 
                                                                    : 'border border-white/40 bg-white/10'
                                                            }`}>
                                                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-900" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3.5">
                                            {/* Card Number Input */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-[#800020]">رقم البطاقة البنكية</label>
                                                    <span className="text-[10px] text-[#800020]/60">16 رقماً مشفراً</span>
                                                </div>
                                                <div className="relative">
                                                    {(() => {
                                                        const cleanDigits = cardDetails.number.replace(/\D/g, '');
                                                        const is16 = cleanDigits.length === 16;
                                                        const isLuhn = is16 && isValidLuhn(cleanDigits);
                                                        const brand = getDetectedBrandKey(cleanDigits);
                                                        const hasError = !!cardErrors.number || (is16 && (!isLuhn || !brand));

                                                        return (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    value={cardDetails.number}
                                                                    onChange={handleCardNumberChange}
                                                                    placeholder="•••• •••• •••• ••••"
                                                                    dir="ltr"
                                                                    maxLength={19}
                                                                    className={`w-full bg-white/70 border rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold outline-none text-right transition-colors ${
                                                                        hasError
                                                                            ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                                                                            : is16 && isLuhn && brand
                                                                                ? 'border-emerald-500 focus:border-emerald-600 bg-emerald-50/20'
                                                                                : 'border-[#800020]/20 focus:border-[#800020]'
                                                                    }`}
                                                                />

                                                                <div className="absolute top-2.5 left-3 flex items-center gap-1.5 pointer-events-none">
                                                                    {is16 && isLuhn && (
                                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                                    )}
                                                                    {brand ? (
                                                                        <CardBrandBadge brand={brand} className="h-6 px-1.5 shadow-2xs" />
                                                                    ) : (
                                                                        <CreditCard className="w-4 h-4 text-[#800020]/50" />
                                                                    )}
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                                {cardErrors.number && (
                                                    <span className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        <span>{cardErrors.number}</span>
                                                    </span>
                                                )}
                                                {(() => {
                                                    const cleanDigits = cardDetails.number.replace(/\D/g, '');
                                                    if (cleanDigits.length === 16 && !isValidLuhn(cleanDigits)) {
                                                        return (
                                                            <span className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                                                                <AlertCircle className="w-3.5 h-3.5" />
                                                                <span>رقم البطاقة غير سليم ولا يطابق خوارزمية التحقق البنكية (Luhn Check)</span>
                                                            </span>
                                                        );
                                                    }
                                                    if (cleanDigits.length === 16 && isValidLuhn(cleanDigits)) {
                                                        const b = getDetectedBrandKey(cleanDigits);
                                                        return (
                                                            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>تم التحقق من سلامة رقم البطاقة ({b === 'mada' ? 'مدى' : b === 'visa' ? 'فيزا' : 'ماستركارد'})</span>
                                                            </span>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>

                                            {/* Cardholder Name Input */}
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-[#800020]">اسم حامل البطاقة (بالإنجليزية كما يظهر على البطاقة)</label>
                                                <input
                                                    type="text"
                                                    value={cardDetails.holder}
                                                    onChange={handleHolderChange}
                                                    placeholder="AHMED MOHAMED"
                                                    dir="ltr"
                                                    className={`w-full bg-white/70 border rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none text-right uppercase ${
                                                        cardErrors.holder ? 'border-red-400 focus:border-red-500 bg-red-50/20' : 'border-[#800020]/20 focus:border-[#800020]'
                                                    }`}
                                                />
                                                {cardErrors.holder && (
                                                    <span className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        <span>{cardErrors.holder}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Expiry and CVV Inputs */}
                                            <div className="grid grid-cols-2 gap-3.5">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-bold text-[#800020]">تاريخ الانتهاء (MM/YY)</label>
                                                    <input
                                                        type="text"
                                                        value={cardDetails.expiry}
                                                        onChange={handleExpiryChange}
                                                        placeholder="12/28"
                                                        dir="ltr"
                                                        maxLength={5}
                                                        className={`w-full bg-white/70 border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none text-right ${
                                                            cardErrors.expiry ? 'border-red-400 focus:border-red-500 bg-red-50/20' : 'border-[#800020]/20 focus:border-[#800020]'
                                                        }`}
                                                    />
                                                    {cardErrors.expiry && (
                                                        <span className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                            <span>{cardErrors.expiry}</span>
                                                        </span>
                                                    )}
                                                    {cardDetails.expiry.length === 5 && !cardErrors.expiry && (() => {
                                                        const res = validateExpiryDate(cardDetails.expiry);
                                                        if (!res.valid) {
                                                            return (
                                                                <span className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                                    <span>{res.error}</span>
                                                                </span>
                                                            );
                                                        }
                                                        return (
                                                            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>تاريخ صالح</span>
                                                            </span>
                                                        );
                                                    })()}
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-bold text-[#800020]">رمز الأمان (CVV)</label>
                                                    <input
                                                        type="password"
                                                        value={cardDetails.cvv}
                                                        onChange={handleCvvChange}
                                                        placeholder="•••"
                                                        dir="ltr"
                                                        maxLength={4}
                                                        className={`w-full bg-white/70 border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none text-right ${
                                                            cardErrors.cvv ? 'border-red-400 focus:border-red-500 bg-red-50/20' : 'border-[#800020]/20 focus:border-[#800020]'
                                                        }`}
                                                    />
                                                    {cardErrors.cvv && (
                                                        <span className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                            <span>{cardErrors.cvv}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Save & Confirm Checkbox Option */}
                                            <label className="flex items-center gap-2.5 cursor-pointer pt-2 select-none border-t border-[#800020]/10">
                                                <input
                                                    type="checkbox"
                                                    checked={saveCardForFuture}
                                                    onChange={e => setSaveCardForFuture(e.target.checked)}
                                                    className="w-4 h-4 rounded text-[#800020] accent-[#800020] cursor-pointer"
                                                />
                                                <span className="text-xs font-semibold text-[#800020]">
                                                    حفظ هذه البطاقة بأمان في حسابي للمشتريات القادمة
                                                </span>
                                            </label>

                                            {/* Confirmation & Cancel Action Bar */}
                                            <div className="flex items-center justify-between pt-2">
                                                {savedCards.length > 0 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setUseNewCard(false)}
                                                        className="px-4 py-2 rounded-xl text-xs font-bold text-[#800020]/70 hover:bg-[#800020]/10 transition-colors cursor-pointer"
                                                    >
                                                        إلغاء والعودة للبطاقات المحفوظة
                                                    </button>
                                                ) : <div />}

                                                <button
                                                    type="button"
                                                    onClick={handleConfirmNewCard}
                                                    className="shine-button bg-[#800020] hover:bg-[#600018] text-[#F0DFCD] px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-2"
                                                >
                                                    <ShieldCheck className="w-4 h-4" />
                                                    <span>تأكيد واعتماد البطاقة</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                        </div>

                    </div>

                    {/* Right Column: Order Summary & Confirm Purchase (5 Cols on lg, 4 Cols on xl) */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-32">

                        <div className="bg-white/25 backdrop-blur-xs rounded-3xl p-6 sm:p-8 border border-[#800020]/15 shadow-sm flex flex-col gap-6">
                            <div className="flex items-center justify-between pb-3 border-b border-[#800020]/10">
                                <h3 className="font-black text-lg text-[#800020] flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-[#800020]" />
                                    <span>ملخص الطلب ({cartItems.length})</span>
                                </h3>
                            </div>

                            {/* Items Mini List */}
                            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pl-1">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-white/40 border border-[#800020]/10">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-12 h-12 rounded-xl bg-white/60 p-1 flex items-center justify-center shrink-0 border border-[#800020]/10">
                                                <img 
                                                    src={item.img} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-[#800020] truncate">
                                                    {item.name}
                                                </h4>
                                                {(!item.size || item.size === 'غير محدد' || !item.color || item.color === 'حسب الطلب' || item.color === 'غير محدد') ? (
                                                    <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                                                        ⚠️ يجب تحديد المقاس واللون
                                                    </span>
                                                ) : (
                                                    <p className="text-[11px] text-[#800020]/70 font-medium">
                                                        الكمية: {item.qty} • المقاس: <span className="font-bold text-[#800020]">{item.size}</span> • اللون: <span className="font-bold text-[#800020]">{item.color}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-[#800020] shrink-0 font-mono">
                                            {item.price * item.qty} <RiyalIcon />
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Input Form */}
                            <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value)}
                                        placeholder="كوبون الخصم (مثال: THYIAAB10)"
                                        className="w-full bg-white/40 border border-[#800020]/20 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#800020] uppercase placeholder:font-normal placeholder:normal-case"
                                    />
                                    <Tag className="w-3.5 h-3.5 text-[#800020]/40 absolute top-2.5 left-2.5 pointer-events-none" />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-[#800020] text-[#F0DFCD] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#650019] transition-colors cursor-pointer"
                                >
                                    تطبيق
                                </button>
                            </form>
                            {discountMessage && (
                                <p className="text-xs font-bold text-emerald-700 -mt-2">{discountMessage}</p>
                            )}

                            {/* Price Breakdown */}
                            <div className="flex flex-col gap-2.5 pt-3 border-t border-[#800020]/10 text-xs font-bold">
                                <div className="flex justify-between items-center text-[#800020]/80">
                                    <span>المجموع الفرعي</span>
                                    <span>{subtotal} <RiyalIcon /></span>
                                </div>

                                {appliedDiscount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-700">
                                        <span>خصم الكوبون</span>
                                        <span>- {appliedDiscount} <RiyalIcon /></span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-[#800020]/80">
                                    <span>ضريبة القيمة المضافة (15%)</span>
                                    <span className="text-emerald-700 font-semibold">مشمولة في السعر</span>
                                </div>

                                <div className="flex justify-between items-center text-[#800020]/80">
                                    <span>سعر الشحن والتوصيل</span>
                                    <span className="text-emerald-700 font-semibold">مجاني لجميع مناطق المملكة</span>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-[#800020]/15 text-base sm:text-lg font-black text-[#800020]">
                                    <span>المبلغ الإجمالي</span>
                                    <span className="text-xl text-[#800020]">{total} <RiyalIcon /></span>
                                </div>
                            </div>


                            {/* Confirm Purchase Action Button */}
                            <button
                                type="button"
                                onClick={handleConfirmOrder}
                                disabled={isSubmitting}
                                className="shine-button w-full bg-[#800020] hover:bg-[#600018] text-[#F0DFCD] py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-md hover:shadow-xl active:scale-98 cursor-pointer transition-all disabled:opacity-60 group mt-1"
                            >
                                <span className="relative z-10">
                                    {isSubmitting ? 'جاري تأكيد الطلب ومعالجة الدفع...' : `تأكيد الشراء ودفع ${total} ر.س`}
                                </span>
                                <Check className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                            </button>

                            {/* Trust Guarantees */}
                            <div className="grid grid-cols-3 gap-2 text-[10px] text-[#800020]/80 font-bold text-center pt-2">
                                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/25 border border-[#800020]/10 shadow-2xs">
                                    <Truck className="w-3.5 h-3.5 text-[#800020] shrink-0" />
                                    <span>توصيل سريع 2-4 أيام</span>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/25 border border-[#800020]/10 shadow-2xs">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#800020] shrink-0" />
                                    <span>استبدال مجاني 14 يوم</span>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/25 border border-[#800020]/10 shadow-2xs">
                                    <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>دفع مشفر وآمن 100%</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Success Order Confirmation Modal */}
            <AnimatePresence>
                {completedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#F0DFCD] border border-[#800020]/25 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
                            style={{
                                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4))'
                            }}
                        >
                            {/* Animated Success Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                                className="w-20 h-20 rounded-full bg-[#800020] text-[#F0DFCD] flex items-center justify-center shadow-lg mb-5"
                            >
                                <Check className="w-10 h-10 stroke-[3]" />
                            </motion.div>

                            <span className="text-xs font-black uppercase tracking-widest text-[#800020]/70 mb-1">
                                تهانينا! تم استلام طلبك
                            </span>
                            <h2 className="text-2xl font-black text-[#800020] mb-2">
                                تم تأكيد الشراء بنجاح
                            </h2>
                            <p className="text-xs text-[#800020]/80 leading-relaxed font-semibold max-w-xs mb-6">
                                سنبدأ فوراً بتجهيز طلبيتك الفاخرة بأعلى معايير الجودة والتغليف الملكي.
                            </p>

                            {/* Order Details Card */}
                            <div className="w-full bg-white/60 border border-[#800020]/15 rounded-2xl p-4 flex flex-col gap-3 text-xs mb-6 text-right">
                                <div className="flex justify-between items-center pb-2 border-b border-[#800020]/10">
                                    <span className="font-bold text-[#800020]/70">رقم الطلب:</span>
                                    <span className="font-mono font-black text-sm text-[#800020]">#{completedOrder.orderNumber}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-[#800020]/10">
                                    <span className="font-bold text-[#800020]/70">تاريخ الطلب:</span>
                                    <span className="font-semibold text-[#800020]">{completedOrder.date}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-[#800020]/10">
                                    <span className="font-bold text-[#800020]/70">عنوان التوصيل:</span>
                                    <span className="font-semibold text-[#800020] truncate max-w-[200px]">{completedOrder.address?.address}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-[#800020]/70">الإجمالي المدفوع:</span>
                                    <span className="font-black text-sm text-[#800020]">{completedOrder.total} <RiyalIcon /></span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                                <Link
                                    to={`/track-order/${completedOrder.orderNumber}`}
                                    className="shine-button w-full sm:flex-1 bg-[#800020] text-[#F0DFCD] py-3.5 rounded-xl font-bold text-xs shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Truck className="w-4 h-4" />
                                    <span>تتبع حالة الطلب الآن</span>
                                </Link>

                                <Link
                                    to="/"
                                    className="w-full sm:flex-1 bg-white/60 hover:bg-white text-[#800020] border border-[#800020]/25 py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                                >
                                    <span>العودة للرئيسية</span>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
