import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown, ShoppingBag, ArrowRight } from 'lucide-react';
import RiyalIcon from '../components/RiyalIcon';
import AnimatedSadX from '../components/AnimatedSadX';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { ordersApi, productsApi, cartApi } from '../lib/api';
import { supabase } from '../lib/supabase';

const getColorHex = (colorName = '') => {
    const n = (colorName || '').trim();
    if (n.includes('أسود')) return '#1a1a1a';
    if (n.includes('أبيض')) return '#ffffff';
    if (n.includes('رمادي') || n.includes('رصاصي')) return '#707070';
    if (n.includes('عنابي')) return '#800020';
    if (n.includes('كحلي') || n.includes('أزرق')) return '#1A1F71';
    if (n.includes('بيج') || n.includes('سكري')) return '#E8D8C8';
    if (n.includes('بني') || n.includes('عسلي')) return '#8B4513';
    if (n.includes('ذهبي')) return '#D4AF37';
    if (n.includes('فضي')) return '#C0C0C0';
    if (n.includes('زيتي') || n.includes('أخضر')) return '#2E5B3E';
    return '#800020';
};

export default function CartPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { cartItems, removeFromCart, updateCartQty, clearCart, setCartItems } = useShop();
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [productsMap, setProductsMap] = useState({});

    // Ensure every item in cart has a strictly unique id
    useEffect(() => {
        if (!cartItems || cartItems.length === 0) return;
        const seen = new Set();
        let hasDuplicates = false;
        for (const it of cartItems) {
            const idStr = String(it.id || '');
            if (!it.id || seen.has(idStr)) {
                hasDuplicates = true;
                break;
            }
            seen.add(idStr);
        }
        if (hasDuplicates) {
            const newSeen = new Set();
            setCartItems(prev => prev.map((it, idx) => {
                let uId = it.id;
                if (!uId || newSeen.has(String(uId))) {
                    uId = `cart-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`;
                }
                newSeen.add(String(uId));
                return { ...it, id: uId };
            }));
        }
    }, [cartItems, setCartItems]);

    // Fetch and index real products from database to link dropdown options to actual product definitions and live stock
    useEffect(() => {
        let isMounted = true;
        const fetchStockData = () => {
            productsApi.getAll().then(({ data }) => {
                if (!isMounted || !data) return;
                const map = {};
                data.forEach(p => {
                    map[p.id] = p;
                    map[String(p.id)] = p;
                    if (p.name) {
                        map[p.name.trim()] = p;
                    }
                });
                setProductsMap(map);
            });
        };

        fetchStockData();
        window.addEventListener('thyiaab_stock_updated', fetchStockData);

        return () => { 
            isMounted = false; 
            window.removeEventListener('thyiaab_stock_updated', fetchStockData);
        };
    }, []);

    // Helper to get maximum available stock for an item in the cart
    const getMaxStockForItem = (item) => {
        const prodId = item.productId || item.id;
        const prod = productsMap[prodId] || productsMap[String(prodId)] || (item.name ? productsMap[item.name.trim()] : null) || item.product;
        if (prod?.sizes && prod.sizes.length > 0) {
            const matchingSize = prod.sizes.find(s => isSizeMatch(item.size, s.size));
            if (matchingSize && matchingSize.stock_qty !== undefined && matchingSize.stock_qty !== null) {
                return Math.max(0, Number(matchingSize.stock_qty));
            }
            if (prod.sizes.length === 1 && prod.sizes[0].stock_qty !== undefined && prod.sizes[0].stock_qty !== null) {
                return Math.max(0, Number(prod.sizes[0].stock_qty));
            }
        }
        if (item.maxStock !== undefined && item.maxStock !== null) {
            return Math.max(0, Number(item.maxStock));
        }
        return 10;
    };

    // Helper to check color match
    const isColorMatch = (itemColor = '', optColor = '') => {
        if (!itemColor || !optColor) return false;
        if (itemColor === optColor) return true;
        const a = itemColor.trim().toLowerCase();
        const b = optColor.trim().toLowerCase();
        return a === b || a.includes(b) || b.includes(a);
    };

    // Helper to check size match
    const isSizeMatch = (itemSize = '', optSize = '') => {
        if (!itemSize || !optSize) return false;
        if (itemSize === optSize) return true;
        return itemSize.trim().toLowerCase() === optSize.trim().toLowerCase();
    };

    // Get product-specific available color options
    const getItemColorOptions = (item) => {
        const prod = productsMap[item.productId] || productsMap[item.id] || (item.name ? productsMap[item.name.trim()] : null) || item.product;

        // 1. From database product colors
        if (prod?.colors && prod.colors.length > 0) {
            return prod.colors.map(c => ({
                name: c.name,
                hex: c.hex || getColorHex(c.name)
            }));
        }

        // 2. From cart item colorObjects
        if (item.colorObjects && item.colorObjects.length > 0) {
            return item.colorObjects.map(c => ({
                name: c.name,
                hex: c.hex || getColorHex(c.name)
            }));
        }

        // 3. From cart item availableColors
        if (item.availableColors && item.availableColors.length > 0) {
            return item.availableColors.map(c => typeof c === 'string' ? { name: c, hex: getColorHex(c) } : c);
        }

        // 4. Product-specific fallback by name/category
        const name = (item.name || prod?.name || '').trim();
        const category = (item.category || prod?.category?.slug || prod?.category?.name || '').toLowerCase();

        if (name.includes('نظارة')) {
            return [
                { name: 'أسود كلاسيك', hex: '#1a1a1a' },
                { name: 'بني عسلي', hex: '#8B4513' },
                { name: 'فضي معدني', hex: '#A8A9AD' }
            ];
        }
        if (name.includes('ساعة') || category.includes('watch')) {
            return [
                { name: 'ذهبي', hex: '#c19a6b' },
                { name: 'فضي', hex: '#c0c0c0' },
                { name: 'أسود مطفي', hex: '#1a1a1a' }
            ];
        }
        if (name.includes('خاتم') || category.includes('ring')) {
            return [
                { name: 'ذهب أصفر', hex: '#ffd700' },
                { name: 'فضي ملكي', hex: '#c0c0c0' }
            ];
        }
        if (name.includes('عطر') || category.includes('perfume')) {
            return [
                { name: '100 مل', hex: '#800020' }
            ];
        }
        if (name.includes('محفظة') || name.includes('شنطة') || category.includes('wallet') || category.includes('bag')) {
            return [
                { name: 'بني داكن', hex: '#3e2723' },
                { name: 'أسود', hex: '#000000' }
            ];
        }
        if (name.includes('حذاء') || name.includes('شوز') || name.includes('بوت') || category.includes('shoe')) {
            return [
                { name: 'بيج', hex: '#d2b48c' },
                { name: 'أسود', hex: '#000000' },
                { name: 'بني', hex: '#654321' }
            ];
        }

        // 5. Item's chosen color or clothing colors
        if (item.color && item.color !== 'حسب الطلب' && item.color !== 'غير محدد') {
            return [
                { name: item.color, hex: getColorHex(item.color) },
                { name: 'أسود', hex: '#1a1a1a' },
                { name: 'رمادي', hex: '#707070' },
                { name: 'عنابي', hex: '#800020' }
            ].filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
        }

        return [
            { name: 'أسود', hex: '#1a1a1a' },
            { name: 'رمادي', hex: '#707070' },
            { name: 'عنابي', hex: '#800020' }
        ];
    };

    // Get product-specific available size options
    const getItemSizeOptions = (item) => {
        const prod = productsMap[item.productId] || productsMap[item.id] || (item.name ? productsMap[item.name.trim()] : null) || item.product;

        // 1. From database product sizes
        if (prod?.sizes && prod.sizes.length > 0) {
            return prod.sizes.map(s => typeof s === 'string' ? s : s.size).filter(Boolean);
        }

        // 2. From cart item availableSizes
        if (item.availableSizes && item.availableSizes.length > 0) {
            return item.availableSizes;
        }

        // 3. Name & Category specific sizes
        const name = (item.name || prod?.name || '').trim();
        const category = (item.category || prod?.category?.slug || prod?.category?.name || '').toLowerCase();

        if (name.includes('نظارة') || name.includes('شنطة') || name.includes('محفظة') || name.includes('سبحة') || name.includes('قلم') || name.includes('كبك') || category.includes('accessor')) {
            return ['One Size'];
        }

        if (name.includes('عطر') || category.includes('perfume')) {
            return ['100ml'];
        }

        if (category.includes('shoe') || name.includes('حذاء') || name.includes('شوز') || name.includes('بوت')) {
            return ['37', '38', '39', '40', '41', '42', '43', '44', '45'];
        }

        if (category.includes('watch') || name.includes('ساعة')) {
            return ['One Size', '38mm', '40mm', '42mm', '44mm'];
        }

        if (category.includes('ring') || name.includes('خاتم')) {
            return ['7', '8', '9', '10'];
        }

        // 4. Default clothing sizes
        return ['S', 'M', 'L', 'XL', 'XXL'];
    };

    const cartTotal = cartItems.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);

    const handleProceedToCheckout = () => {
        const invalidItem = cartItems.find(i => 
            !i.size || i.size === 'غير محدد' || !i.color || i.color === 'حسب الطلب' || i.color === 'غير محدد'
        );
        if (invalidItem) {
            showToast(`يرجى تحديد المقاس واللون للمنتج "${invalidItem.name}" للمتابعة لإتمام الشراء`, 'error');
            return;
        }

        // Validate that cart quantities do not exceed actual stock
        const overstocked = cartItems.find(i => {
            const maxS = getMaxStockForItem(i);
            return (Number(i.qty) || 1) > maxS;
        });
        if (overstocked) {
            const maxS = getMaxStockForItem(overstocked);
            showToast(`الكمية المطلوبة للمنتج "${overstocked.name}" تتجاوز المخزون الفعلي (${maxS} قطع). تم ضبط الكمية لتطابق المخزون.`, 'error');
            setCartItems(prev => prev.map(x => {
                const ms = getMaxStockForItem(x);
                return { ...x, qty: Math.max(1, Math.min(Number(x.qty) || 1, ms)), maxStock: ms };
            }));
            return;
        }

        navigate('/checkout');
    };

    const handleCheckout = async () => {
        if (!user) {
            showToast('يرجى تسجيل الدخول لإتمام عملية الشراء', 'info');
            navigate('/login');
            return;
        }

        // Validate that cart quantities do not exceed actual stock
        const overstocked = cartItems.find(i => {
            const maxS = getMaxStockForItem(i);
            return (Number(i.qty) || 1) > maxS;
        });
        if (overstocked) {
            const maxS = getMaxStockForItem(overstocked);
            showToast(`الكمية المطلوبة للمنتج "${overstocked.name}" تتجاوز المخزون الفعلي (${maxS} قطع). تم ضبط الكمية لتطابق المخزون.`, 'error');
            setCartItems(prev => prev.map(x => {
                const ms = getMaxStockForItem(x);
                return { ...x, qty: Math.max(1, Math.min(Number(x.qty) || 1, ms)), maxStock: ms };
            }));
            return;
        }

        setIsCheckingOut(true);
        try {
            const orderData = {
                subtotal: cartTotal,
                shipping_cost: 0,
                discount: 0,
                total: cartTotal,
                payment_method: 'mada',
                payment_status: 'paid',
                status: 'new',
                shipping_address: { city: 'الرياض', district: 'حي النخيل', street: 'شارع الأمير تركي الأول' }
            };

            const items = cartItems.map(i => ({
                product_id: i.productId || '1fe2999b-3b5f-4e89-a994-f6b5fb9ea961',
                product_name: i.name,
                product_image: i.img,
                price: i.price,
                quantity: i.qty,
                color: i.color,
                size: i.size
            }));

            const { data: createdOrder, error } = await ordersApi.create(orderData, items);
            if (error) {
                showToast('حدث خطأ أثناء إنشاء الطلب: ' + error.message, 'error');
                return;
            }

            clearCart();
            showToast(`تم إتمام الطلب بنجاح! رقم طلبك: ${createdOrder.order_number}`, 'sparkle');
            setTimeout(() => {
                navigate('/account');
            }, 1000);
        } catch (err) {
            showToast('حدث خطأ غير متوقع', 'error');
        } finally {
            setIsCheckingOut(false);
        }
    };

    useEffect(() => {
        if (!activeDropdown) return;

        const handleClickOutside = (e) => {
            const targetContainer = activeDropdown.rowKey
                ? `[data-dropdown-container="${activeDropdown.rowKey}-${activeDropdown.type}"]`
                : `[data-dropdown-container="${activeDropdown.id}-${activeDropdown.type}"]`;
            if (e.target.closest(targetContainer)) {
                return;
            }
            setActiveDropdown(null);
        };

        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('touchstart', handleClickOutside, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('touchstart', handleClickOutside, true);
        };
    }, [activeDropdown]);

    return (
        <div className="min-h-[100dvh] bg-brand-cream/20 pt-20 sm:pt-28 pb-16 sm:pb-20 text-brand-burgundy font-arabic w-full overflow-x-clip" dir="rtl">
            <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-12 xl:px-16">
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-20 opacity-60">
                        <ShoppingBag className="w-24 h-24" />
                        <p className="text-2xl font-bold">سلتك فارغة</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                        {/* Unified Items Table Container */}
                        <div className="flex-1 w-full bg-white/25 backdrop-blur-xs rounded-2xl border border-brand-burgundy/15 shadow-sm flex flex-col">
                            <AnimatePresence>
                                {cartItems.map((item, i) => {
                                    const itemColors = getItemColorOptions(item);
                                    const itemSizes = getItemSizeOptions(item);
                                    const rowKey = `${item.id || 'item'}_row_${i}`;
                                    const isColorOpen = activeDropdown?.rowKey === rowKey && activeDropdown.type === 'color';
                                    const isSizeOpen = activeDropdown?.rowKey === rowKey && activeDropdown.type === 'size';

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={item.id ? `${item.id}-${i}` : i}
                                            style={{ zIndex: (isColorOpen || isSizeOpen) ? 40 : cartItems.length - i }}
                                            className="@container flex flex-col sm:flex-row gap-3.5 sm:gap-6 p-3.5 sm:p-5 relative border-b border-brand-burgundy/15 last:border-b-0"
                                        >
                                            <AnimatedSadX
                                                onClick={() => {
                                                    setCartItems(prev => prev.filter((_, idx) => idx !== i));
                                                    showToast(`تمت إزالة "${item.name}" من السلة`);
                                                    if (user && typeof item.id === 'string' && item.id.includes('-') && !item.id.startsWith('cart-')) {
                                                        cartApi.removeItem(item.id).catch(() => {});
                                                    }
                                                }}
                                                buttonClassName="absolute top-4 left-4 text-brand-burgundy/60 hover:text-brand-burgundy transition-colors p-1 rounded-lg hover:bg-white/40"
                                                strokeWidth={1.5}
                                            />

                                            <div
                                                className="w-[120px] h-[142px] sm:w-[136px] sm:h-[162px] flex items-center justify-center p-1.5 shrink-0 cursor-pointer"
                                                onClick={() => navigate(`/product/${item.productId || item.id}`)}
                                            >
                                                <img src={item.img} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>

                                            <div className="flex-1 flex flex-col justify-center pt-1">
                                                <h3
                                                    className="text-lg sm:text-xl font-black uppercase tracking-wide mb-3 sm:mb-3.5 cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => navigate(`/product/${item.productId || item.id}`)}
                                                >
                                                    {item.name}
                                                </h3>

                                                {/* Price */}
                                                <div className="flex items-center gap-2 mb-4 sm:mb-4.5">
                                                    {item.oldPrice && (
                                                        <span className="line-through text-brand-burgundy/40 font-medium text-xs sm:text-sm">
                                                            {item.oldPrice} <RiyalIcon />
                                                        </span>
                                                    )}
                                                    <span className="text-base sm:text-lg font-black text-brand-burgundy">
                                                        {item.price} <RiyalIcon />
                                                    </span>
                                                </div>

                                                {/* Under Price: Color, Size & Quantity */}
                                                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4.5">
                                                    {/* Color and Size */}
                                                    <div className="flex items-center gap-2.5">
                                                        {/* Color Dropdown */}
                                                        <div className="relative" data-dropdown-container={`${rowKey}-color`}>
                                                            <div
                                                                className={`h-8 px-3 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all shadow-xs select-none whitespace-nowrap ${
                                                                    !item.color || item.color === 'حسب الطلب' || item.color === 'غير محدد'
                                                                        ? 'border border-red-500/50 bg-red-500/10 text-red-700'
                                                                        : 'bg-transparent border border-brand-burgundy/25 text-brand-burgundy hover:border-brand-burgundy/50 hover:bg-brand-burgundy/5'
                                                                }`}
                                                                onClick={() => setActiveDropdown(isColorOpen ? null : { rowKey, index: i, id: item.id, type: 'color' })}
                                                            >
                                                                <span className="text-xs font-bold whitespace-nowrap leading-none flex items-center gap-1.5">
                                                                    {item.color && item.color !== 'حسب الطلب' && item.color !== 'غير محدد' ? (
                                                                        <>
                                                                            <span
                                                                                className="w-2.5 h-2.5 rounded-full border border-brand-burgundy/20 inline-block shrink-0"
                                                                                style={{ backgroundColor: getColorHex(item.color) }}
                                                                            />
                                                                            <span>{item.color}</span>
                                                                        </>
                                                                    ) : 'اللون *'}
                                                                </span>
                                                                <ChevronDown className={`w-3.5 h-3.5 text-current shrink-0 transition-transform duration-200 ${isColorOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                                                            </div>
                                                            <AnimatePresence>
                                                                {isColorOpen && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -5, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.98 }}
                                                                        transition={{ duration: 0.16 }}
                                                                        className="absolute top-full right-0 mt-2 min-w-[10rem] bg-[#F0DFCD] border border-brand-burgundy/20 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 select-none whitespace-nowrap"
                                                                        style={{ boxShadow: '0 20px 40px -15px rgba(128, 0, 32, 0.25), 0 0 15px 0 rgba(128, 0, 32, 0.08)' }}
                                                                    >
                                                                        {itemColors.map(c => {
                                                                            const isSelected = isColorMatch(item.color, c.name);
                                                                            return (
                                                                                <div
                                                                                    key={c.name}
                                                                                    className={`px-4 py-2 hover:bg-brand-burgundy/10 cursor-pointer text-sm font-bold flex items-center justify-between gap-3 transition-colors ${
                                                                                        isSelected ? 'text-brand-burgundy bg-brand-burgundy/10' : 'text-brand-dark'
                                                                                    }`}
                                                                                    onClick={() => {
                                                                                        setCartItems(prev => prev.map((x, idx) => idx === i ? { ...x, color: c.name } : x));
                                                                                        setActiveDropdown(null);
                                                                                        showToast(`تم اختيار اللون: ${c.name}`);
                                                                                        if (user && typeof item.id === 'string' && item.id.includes('-') && !item.id.startsWith('cart-')) {
                                                                                            supabase.from('cart_items').update({ color: c.name }).eq('id', item.id).catch(() => {});
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <div className="flex items-center gap-2.5">
                                                                                        <div
                                                                                            className="w-3.5 h-3.5 rounded-full border border-brand-burgundy/20 shrink-0 shadow-2xs"
                                                                                            style={{ backgroundColor: c.hex }}
                                                                                        />
                                                                                        <span>{c.name}</span>
                                                                                    </div>
                                                                                    {isSelected && (
                                                                                        <span className="text-xs text-brand-burgundy font-black">✓</span>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>

                                                        {/* Size Dropdown */}
                                                        <div className="relative" data-dropdown-container={`${rowKey}-size`}>
                                                            <div
                                                                className={`h-8 px-3 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all shadow-xs select-none whitespace-nowrap ${
                                                                    !item.size || item.size === 'غير محدد'
                                                                        ? 'border border-red-500/50 bg-red-500/10 text-red-700'
                                                                        : 'bg-transparent border border-brand-burgundy/25 text-brand-burgundy hover:border-brand-burgundy/50 hover:bg-brand-burgundy/5'
                                                                }`}
                                                                onClick={() => setActiveDropdown(isSizeOpen ? null : { rowKey, index: i, id: item.id, type: 'size' })}
                                                            >
                                                                <span className="text-xs font-bold whitespace-nowrap leading-none">
                                                                    {item.size && item.size !== 'غير محدد' ? item.size : 'المقاس *'}
                                                                </span>
                                                                <ChevronDown className={`w-3.5 h-3.5 text-current shrink-0 transition-transform duration-200 ${isSizeOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                                                            </div>
                                                            <AnimatePresence>
                                                                {isSizeOpen && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -5, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.98 }}
                                                                        transition={{ duration: 0.16 }}
                                                                        className="absolute top-full right-0 mt-2 min-w-[7rem] bg-[#F0DFCD] border border-brand-burgundy/20 rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto scrollbar-hide py-2 z-50 select-none whitespace-nowrap"
                                                                        style={{ boxShadow: '0 20px 40px -15px rgba(128, 0, 32, 0.25), 0 0 15px 0 rgba(128, 0, 32, 0.08)' }}
                                                                    >
                                                                        {itemSizes.map(s => {
                                                                            const isSelected = isSizeMatch(item.size, s);
                                                                            return (
                                                                                <div
                                                                                    key={s}
                                                                                    className={`px-4 py-2 hover:bg-brand-burgundy/10 cursor-pointer text-sm font-bold text-center transition-colors flex items-center justify-between gap-2 ${
                                                                                        isSelected ? 'text-brand-burgundy bg-brand-burgundy/10' : 'text-brand-dark'
                                                                                    }`}
                                                                                    onClick={() => {
                                                                                        const prodId = item.productId || item.id;
                                                                                        const prod = productsMap[prodId] || productsMap[String(prodId)] || (item.name ? productsMap[item.name.trim()] : null);
                                                                                        const newSizeObj = prod?.sizes?.find(sz => isSizeMatch(s, sz.size));
                                                                                        const newStock = newSizeObj?.stock_qty !== undefined && newSizeObj.stock_qty !== null ? Number(newSizeObj.stock_qty) : (item.maxStock || 10);
                                                                                        const adjustedQty = Math.max(1, Math.min(Number(item.qty) || 1, newStock));

                                                                                        setCartItems(prev => prev.map((x, idx) => idx === i ? { ...x, size: s, qty: adjustedQty, maxStock: newStock } : x));
                                                                                        setActiveDropdown(null);
                                                                                        showToast(`تم اختيار المقاس: ${s}`);
                                                                                        if (user && typeof item.id === 'string' && item.id.includes('-') && !item.id.startsWith('cart-')) {
                                                                                            supabase.from('cart_items').update({ size: s, quantity: adjustedQty }).eq('id', item.id).catch(() => {});
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <span className="w-full text-center">{s}</span>
                                                                                    {isSelected && (
                                                                                        <span className="text-xs text-brand-burgundy font-black">✓</span>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>

                                                <div className="h-4 w-px bg-brand-burgundy/20 shrink-0" />

                                                {/* Quantity */}
                                                {(() => {
                                                    const maxStock = getMaxStockForItem(item);
                                                    const currentQty = Number(item.qty) || 1;
                                                    const isMaxReached = currentQty >= maxStock;

                                                    return (
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <button
                                                                onClick={() => {
                                                                    if (currentQty <= 1) {
                                                                        setCartItems(prev => prev.filter((_, idx) => idx !== i));
                                                                        showToast(`تمت إزالة "${item.name}" من السلة`);
                                                                        if (user && typeof item.id === 'string' && item.id.includes('-') && !item.id.startsWith('cart-')) {
                                                                            cartApi.removeItem(item.id).catch(() => {});
                                                                        }
                                                                    } else {
                                                                        const newQty = currentQty - 1;
                                                                        setCartItems(prev => prev.map((x, idx) => idx === i ? { ...x, qty: newQty, maxStock } : x));
                                                                        if (user && typeof item.id === 'string' && item.id.includes('-') && !item.id.startsWith('cart-')) {
                                                                            cartApi.updateQuantity(item.id, newQty).catch(() => {});
                                                                        }
                                                                    }
                                                                }}
                                                                className="w-8 h-8 flex items-center justify-center text-brand-burgundy hover:bg-brand-burgundy/10 rounded-lg font-bold text-base transition-colors cursor-pointer"
                                                            >
                                                                -
                                                            </button>
                                                            <div className="w-8 h-8 bg-transparent border border-brand-burgundy/25 text-brand-burgundy rounded-lg flex items-center justify-center font-bold text-xs select-none">
                                                                {currentQty}
                                                            </div>
                                                            <button
                                                                disabled={isMaxReached}
                                                                onClick={() => {
                                                                    if (isMaxReached) {
                                                                        showToast(`عفواً، لا يمكن تجاوز المخزون الفعلي المتوفر (${maxStock} قطع)`, 'error');
                                                                        return;
                                                                    }
                                                                    const newQty = currentQty + 1;
                                                                    setCartItems(prev => prev.map((x, idx) => idx === i ? { ...x, qty: newQty, maxStock } : x));
                                                                    if (user && typeof item.id === 'string' && item.id.includes('-') && !item.id.startsWith('cart-')) {
                                                                        cartApi.updateQuantity(item.id, newQty).catch(() => {});
                                                                    }
                                                                }}
                                                                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-base transition-colors ${
                                                                    isMaxReached 
                                                                        ? 'opacity-30 cursor-not-allowed text-brand-burgundy/40 bg-transparent' 
                                                                        : 'text-brand-burgundy hover:bg-brand-burgundy/10 cursor-pointer'
                                                                }`}
                                                                title={isMaxReached ? `تم الوصول للحد الأقصى للمخزون المتوفر (${maxStock})` : 'زيادة الكمية'}
                                                            >
                                                                +
                                                            </button>
                                                            {isMaxReached && (
                                                                <span className="text-[10px] text-amber-800 font-bold bg-amber-500/15 border border-amber-600/30 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                                                    الحد الأقصى ({maxStock})
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            </AnimatePresence>
                        </div>

                        {/* Summary Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                            className="w-full lg:w-[400px] bg-white/25 backdrop-blur-xs rounded-2xl p-8 shrink-0 lg:sticky lg:top-32 border border-brand-burgundy/15 shadow-sm"
                        >
                            <div className="flex flex-col gap-5 text-sm font-bold mb-10 uppercase tracking-wide">
                                {cartItems.map((item, idx) => (
                                    <div key={item.id ? `${item.id}-${idx}` : idx} className="flex justify-between items-center">
                                        <span>{item.name}</span>
                                        <span>{item.price * item.qty} <RiyalIcon /></span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-brand-burgundy/20 pt-6 pb-4 flex flex-col gap-4 text-sm font-bold uppercase tracking-wide">
                                <div className="flex justify-between items-center">
                                    <span>ضريبة المبيعات</span>
                                    <span className="flex items-center gap-1">مشمولة <span className="w-[1.2em]"></span></span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>سعر الشحن</span>
                                    <span className="flex items-center gap-1">مجاني <span className="w-[1.2em]"></span></span>
                                </div>
                            </div>

                            <div className="border-t border-brand-burgundy/20 pt-8 pb-10 flex justify-between items-center text-xl font-black uppercase tracking-wide">
                                <span>الإجمالي</span>
                                <span>{cartTotal} <RiyalIcon /></span>
                            </div>

                            <button
                                onClick={handleProceedToCheckout}
                                className="shine-button w-full bg-[#800020] text-[#F0DFCD] py-4 rounded-2xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs shadow-sm hover:shadow-lg active:scale-98 cursor-pointer transition-all group"
                            >
                                <span className="relative z-10">إتمام الشراء</span>
                                <ArrowRight className="w-4 h-4 relative z-10 group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

