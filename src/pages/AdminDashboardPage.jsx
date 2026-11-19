import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    TrendingUp,
    ShoppingBag,
    PlusCircle,
    Plus,
    Package,
    Search,
    Filter,
    ChevronDown,
    Check,
    X,
    Eye,
    Printer,
    Download,
    DollarSign,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    CreditCard,
    Smartphone,
    Clock,
    MapPin,
    Phone,
    Calendar,
    Tag,
    Layers,
    Image as ImageIcon,
    Images,
    UploadCloud,
    RotateCcw,
    CheckCircle2,
    AlertTriangle,
    Trash2,
    Edit3,
    ExternalLink,
    Boxes,
    ArrowRight,
    ChevronLeft,
    ShieldAlert,
    Lock,
    Home,
    LogIn,
    LogOut,
    Wand2,
    BarChart3,
    PieChart,
    LineChart,
    AreaChart
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import RiyalIcon from '../components/RiyalIcon';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { productsApi, ordersApi, categoriesApi } from '../lib/api';
import { removeImageBackground } from '../lib/backgroundRemoval';
import CustomDropdown from '../components/CustomDropdown';
import OfferManagementSection from '../components/OfferManagementSection';
import HomeSectionsManagement from '../components/HomeSectionsManagement';

const orderStatusOptions = [
    { value: 'new', label: 'تم تأكيد الطلب', colorHex: '#059669' },
    { value: 'processing', label: 'قيد التجهيز', colorHex: '#2563eb' },
    { value: 'shipping', label: 'جاري التوصيل', colorHex: '#9333ea' },
    { value: 'delivered', label: 'تم التوصيل', colorHex: '#059669' },
    { value: 'cancelled', label: 'ملغاة', colorHex: '#e11d48' },
];

const badgeOptions = [
    { value: '', label: 'بدون شارة' },
    { value: 'جديد', label: 'جديد' },
    { value: 'الأكثر مبيعاً', label: 'الأكثر مبيعاً' },
    { value: 'الأكثر طلباً', label: 'الأكثر طلباً' },
    { value: 'عرض خاص', label: 'عرض خاص' },
    { value: 'حصري', label: 'حصري' },
    { value: 'حصري وفاخر', label: 'حصري وفاخر' },
    { value: 'مميز', label: 'مميز' },
    { value: 'خصم مميز', label: 'خصم مميز' },
    { value: 'كمية محدودة', label: 'كمية محدودة' },
    { value: 'تخفيض خاص', label: 'تخفيض خاص' },
    { value: 'تريند', label: 'تريند' },
];
import {
    orderStatusMeta,
    storeQuickImages,
    productCategoriesList,
    DEPARTMENT_CATEGORIES,
    commonSizesList,
    commonColorsList,
    abayaThobeSizesList,
    clothingSizesList,
    shoeSizesList
} from '../data/mockAdminData';

const getPaymentMethodLabel = (method) => {
    switch (method?.toLowerCase()) {
        case 'mada': return 'مدى (Mada)';
        case 'apple_pay': case 'applepay': return 'أبل باي (Apple Pay)';
        case 'credit_card': case 'visa': case 'mastercard': return 'بطاقة ائتمانية (Visa / MC)';
        case 'tamara': return 'تمارا (أقساط)';
        case 'tabby': return 'تابي (أقساط)';
        case 'cod': return 'الدفع عند الاستلام';
        default: return method || 'مدى (Mada)';
    }
};

export default function AdminDashboardPage({ initialTab = 'overview' }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Determine default active tab based on route
    const defaultTab = useMemo(() => {
        if (location.pathname.includes('/add-product')) return 'add-product';
        if (location.pathname.includes('/orders')) return 'orders';
        if (location.pathname.includes('/sales')) return 'sales';
        if (location.pathname.includes('/products') || location.pathname.includes('/inventory') || location.search.includes('tab=products') || location.search.includes('edit=')) return 'products';
        if (location.pathname.includes('/offer') || location.search.includes('tab=offer')) return 'offer';
        if (location.pathname.includes('/sections') || location.search.includes('tab=sections')) return 'sections';
        return initialTab || 'overview';
    }, [location.pathname, location.search, initialTab]);

    const [activeTab, setActiveTab] = useState(defaultTab);
    const [salesPeriod, setSalesPeriod] = useState('week'); // today, week, month, year
    const [analyticsDept, setAnalyticsDept] = useState('all'); // 'all', 'men', 'women', 'unisex'
    const [analyticsSubCat, setAnalyticsSubCat] = useState('all');
    const [analyticsOrderSearch, setAnalyticsOrderSearch] = useState('');
    const [analyticsChartView, setAnalyticsChartView] = useState('bars'); // 'bars' | 'area'
    const [analyticsMetric, setAnalyticsMetric] = useState('revenue'); // 'revenue' | 'orders'
    const [hoveredDayIdx, setHoveredDayIdx] = useState(null);
    const [orders, setOrders] = useState([]);
    const [orderFilterStatus, setOrderFilterStatus] = useState('all');
    const [orderSearchQuery, setOrderSearchQuery] = useState('');
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [productsList, setProductsList] = useState([]);
    const [editingStockId, setEditingStockId] = useState(null);
    const [newStockVal, setNewStockVal] = useState('');
    const { user, profile, isAdmin, loading, signOut } = useAuth();
    const { homeOffer, updateHomeOffer, resetHomeOffer } = useShop();
    const [categories, setCategories] = useState([]);
    const [dbStats, setDbStats] = useState(null);

    // Dynamic categories list unified from database and standard store categories
    const categoryOptions = useMemo(() => {
        const fromDb = (categories || []).map(c => c.name).filter(Boolean);
        return Array.from(new Set([...productCategoriesList, ...fromDb]));
    }, [categories]);

    // Available departments / audiences
    const departmentOptions = [
        { value: 'men', label: 'رجالي' },
        { value: 'women', label: 'نسائي' },
        { value: 'unisex', label: 'إكسسوارات' },
    ];

    // Helper to auto-infer department based on chosen category
    const inferGenderFromCategory = useCallback((categoryName) => {
        if (!categoryName) return 'men';
        const c = String(categoryName).trim();
        if (['فساتين', 'عبايات', 'حقائب', 'أزياء نسائية'].includes(c)) return 'women';
        if (['ساعات', 'عطور', 'خواتم', 'نظارات', 'محافظ', 'أحزمة', 'عطور ومنتجات عناية', 'إكسسوارات'].includes(c)) return 'unisex';
        return 'men';
    }, []);

    // Department-specific categories helper
    const getCategoriesForDepartment = useCallback((gender) => {
        const key = gender === 'women' ? 'women' : gender === 'unisex' ? 'unisex' : 'men';
        return DEPARTMENT_CATEGORIES[key]?.categories || productCategoriesList;
    }, []);

    // --- EDIT PRODUCT MODAL STATE ---
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [customEditSizeInput, setCustomEditSizeInput] = useState('');
    const [customEditColorName, setCustomEditColorName] = useState('');
    const [customEditColorHex, setCustomEditColorHex] = useState('#800020');
    const [customEditColorImage, setCustomEditColorImage] = useState('');
    const [activeColorImagePicker, setActiveColorImagePicker] = useState(null);
    const [newGalleryImageUrl, setNewGalleryImageUrl] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');

    // Two-tier filter state for products table
    const [selectedDepartment, setSelectedDepartment] = useState('all'); // 'all' | 'men' | 'women' | 'unisex'
    const [selectedSubCategory, setSelectedSubCategory] = useState('all');

    // --- GALLERY & IMAGE PICKER STATE ---
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [galleryTarget, setGalleryTarget] = useState('edit'); // 'edit' | 'add'
    const [gallerySearch, setGallerySearch] = useState('');
    const [galleryCategory, setGalleryCategory] = useState('الكل');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [autoRemoveBg, setAutoRemoveBg] = useState(true);
    const [isRemovingBg, setIsRemovingBg] = useState(false);
    const [bgRemovalProgress, setBgRemovalProgress] = useState(null);

    // --- SALES BREAKDOWN DRILLDOWN MODAL STATE ---
    const [selectedSalesBreakdown, setSelectedSalesBreakdown] = useState(null);
    const [drilldownSearchQuery, setDrilldownSearchQuery] = useState('');

    // --- ADD PRODUCT FORM STATE ---
    const initialFormState = {
        name: '',
        category: 'معاطف',
        gender: 'men',
        price: '',
        originalPrice: '',
        stock: '25',
        sku: 'THY-' + Math.floor(1000 + Math.random() * 9000),
        badge: 'جديد',
        description: '',
        image: '/images/coat_transparent.png',
        sizes: ['M', 'L', 'XL'],
        colors: [
            { name: 'أسود ملكي', hex: '#111111' },
            { name: 'رمادي غامق', hex: '#4a4a4c' }
        ],
        tags: 'شتوي, فاخر, كلاسيك',
        inStock: true
    };

    const [productForm, setProductForm] = useState(initialFormState);
    const [customSizeInput, setCustomSizeInput] = useState('');
    const [customColorName, setCustomColorName] = useState('');
    const [customColorHex, setCustomColorHex] = useState('#800020');
    const [selectedQuickImgIndex, setSelectedQuickImgIndex] = useState(0);

    // Fetch initial data from Supabase
    React.useEffect(() => {
        if (!isAdmin) return;

        // 1. Fetch categories
        categoriesApi.getAll().then(({ data }) => {
            if (data && data.length > 0) setCategories(data);
        });

        // 2. Fetch products
        productsApi.getAll().then(({ data }) => {
            if (data && data.length > 0) {
                const mapped = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description || '',
                    price: Number(p.price),
                    originalPrice: p.original_price ? Number(p.original_price) : null,
                    category: p.category?.name || 'معاطف',
                    categoryId: p.category?.id || p.category_id,
                    gender: p.gender || inferGenderFromCategory(p.category?.name),
                    image: p.image_url || '/images/coat_transparent.png',
                    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : ['/images/coat_transparent.png']),
                    colors: Array.isArray(p.colors)
                        ? p.colors.map(c => ({ name: c.name, hex: c.hex, image: c.image_url || c.image || '', image_url: c.image_url || c.image || '' }))
                        : [],
                    sizes: Array.isArray(p.sizes) ? p.sizes.map(s => s.size) : [],
                    inStock: p.in_stock,
                    stock: p.stock_qty !== null && p.stock_qty !== undefined
                        ? Number(p.stock_qty)
                        : (p.sizes && p.sizes.length > 0
                            ? p.sizes.reduce((sum, s) => sum + (Number(s.stock_qty) || 0), 0)
                            : (p.in_stock ? 20 : 0)),
                    isNew: p.is_new,
                    badge: p.is_new ? 'جديد' : (p.is_featured ? 'مميز' : ''),
                    rating: Number(p.rating) || 5.0,
                    reviews: p.reviews_count || 0,
                    tags: p.tags || []
                }));
                setProductsList(mapped);
            }
        });

        // 3. Fetch orders
        ordersApi.getAllOrders().then(({ data }) => {
            if (data && data.length > 0) {
                const mapped = data.map(o => {
                    const createdAtDate = new Date(o.created_at);
                    const formattedDate = createdAtDate.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' });
                    const formattedTime = createdAtDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
                    const items = o.items?.map(it => ({
                        name: it.product_name || it.product?.name || 'منتج ثياب',
                        qty: it.quantity || 1,
                        price: Number(it.price) || 0,
                        color: it.color || '',
                        size: it.size || '',
                        category: it.product?.category?.name || it.category || 'أزياء فاخرة',
                        image: it.product_image || it.product?.image_url || '/images/coat_transparent.png'
                    })) || [];

                    return {
                        id: o.order_number || (o.id ? o.id.slice(0, 8).toUpperCase() : 'ORD'),
                        dbId: o.id,
                        customerName: o.user?.full_name || o.shipping_address?.name || 'عميل المتجر',
                        customerPhone: o.user?.phone || o.shipping_address?.phone || '',
                        customerCity: o.shipping_address?.city || 'الرياض',
                        city: o.shipping_address?.city || 'الرياض',
                        phone: o.user?.phone || o.shipping_address?.phone || 'غير مسجل',
                        date: formattedDate,
                        time: formattedTime,
                        rawDate: o.created_at,
                        itemsCount: items.reduce((sum, it) => sum + (it.qty || 1), 0) || items.length,
                        items: items,
                        total: Number(o.total) || 0,
                        subtotal: Number(o.subtotal) || Number(o.total) || 0,
                        shippingCost: Number(o.shipping_cost) || 0,
                        paymentMethod: getPaymentMethodLabel(o.payment_method),
                        paymentStatus: o.payment_status === 'paid' ? 'مدفوع' : (o.payment_status === 'pending' ? 'قيد الانتظار' : (o.payment_status || 'مدفوع')),
                        status: o.status || 'new',
                        notes: o.notes || '',
                        shippingAddress: o.shipping_address
                    };
                });
                setOrders(mapped);
            } else {
                setOrders([]);
            }
        }).catch(() => {
            setOrders([]);
        });

        // 4. Fetch dashboard stats
        ordersApi.getDashboardStats().then(stats => {
            if (stats) setDbStats(stats);
        });
    }, [isAdmin]);

    // Sync tab when route changes
    React.useEffect(() => {
        if (location.pathname.includes('/add-product')) setActiveTab('add-product');
        else if (location.pathname.includes('/orders')) setActiveTab('orders');
        else if (location.pathname.includes('/sales')) setActiveTab('sales');
        else if (location.pathname.includes('/products') || location.pathname.includes('/inventory') || location.search.includes('edit=')) setActiveTab('products');
        else if (location.pathname.includes('/offer') || location.search.includes('tab=offer')) setActiveTab('offer');
    }, [location.pathname, location.search]);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter(ord => {
            const matchesStatus = orderFilterStatus === 'all' || ord.status === orderFilterStatus;
            const matchesSearch =
                ord.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                ord.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                ord.city.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                ord.phone.includes(orderSearchQuery);
            return matchesStatus && matchesSearch;
        });
    }, [orders, orderFilterStatus, orderSearchQuery]);

    // Order status counts
    const statusCounts = useMemo(() => {
        const counts = { all: orders.length, new: 0, processing: 0, shipping: 0, delivered: 0, cancelled: 0 };
        orders.forEach(o => {
            if (counts[o.status] !== undefined) counts[o.status]++;
        });
        return counts;
    }, [orders]);

    // Handle order status update
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
            setSelectedOrderDetails(prev => ({ ...prev, status: newStatus }));
        }

        const targetOrder = orders.find(o => o.id === orderId);
        if (targetOrder?.dbId) {
            await ordersApi.updateStatus(targetOrder.dbId, newStatus);
        }

        showToast(`تم تحديث حالة الطلب ${orderId} إلى "${orderStatusMeta[newStatus]?.label}"`, 'sparkle');
    };

    // Export orders list
    const handleExportOrders = () => {
        try {
            const dataToExport = filteredOrders.length > 0 ? filteredOrders : orders;
            const headers = ['رقم الطلب', 'اسم العميل', 'رقم الهاتف', 'المدينة', 'العنوان', 'إجمالي المبلغ (ر.س)', 'طريقة الدفع', 'حالة الطلب', 'التاريخ', 'الوقت'];
            const rows = dataToExport.map(o => [
                `"${o.id || ''}"`,
                `"${(o.customerName || '').replace(/"/g, '""')}"`,
                `"${o.phone || ''}"`,
                `"${(o.city || '').replace(/"/g, '""')}"`,
                `"${(o.address || '').replace(/"/g, '""')}"`,
                `"${o.total || 0}"`,
                `"${(o.paymentMethod || '').replace(/"/g, '""')}"`,
                `"${orderStatusMeta[o.status]?.label || o.status || ''}"`,
                `"${o.date || ''}"`,
                `"${o.time || ''}"`
            ]);
            const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `thyiaab_orders_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('تم تصدير كشف الطلبات بنجاح', 'sparkle');
        } catch (e) {
            console.error('Error exporting orders:', e);
            showToast('تم تصدير كشف الطلبات بنجاح', 'success');
        }
    };

    // Quick stock edit
    const handleSaveStock = async (productId) => {
        const qty = parseInt(newStockVal);
        if (isNaN(qty) || qty < 0) {
            showToast('يرجى إدخال كمية صحيحة', 'error');
            return;
        }
        setProductsList(prev => prev.map(p => p.id === productId ? { ...p, inStock: qty > 0, stock: qty } : p));
        setEditingStockId(null);

        if (typeof productId === 'string' && productId.includes('-')) {
            const { error } = await productsApi.update(productId, {
                stock_qty: qty,
                in_stock: qty > 0
            });
            if (error) {
                console.error('Failed to update stock in Supabase:', error);
                showToast(`تنبيه: تعذر تحديث المخزون في السيرفر (${error.message})`, 'error');
                return;
            }
        }

        showToast('تم تحديث وحفظ كمية المخزون بنجاح', 'success');
    };

    // Toggle product active / inStock
    const handleToggleProductStock = async (productId) => {
        setProductsList(prev => prev.map(p => {
            if (p.id === productId) {
                const nextVal = !p.inStock;
                const nextStock = nextVal ? (p.stock > 0 ? p.stock : 20) : 0;
                showToast(nextVal ? 'تم تفعيل توفر المنتج في المتجر' : 'تم تعيين المنتج كنافد في المتجر', 'info');
                if (typeof productId === 'string' && productId.includes('-')) {
                    productsApi.update(productId, { in_stock: nextVal, stock_qty: nextStock });
                }
                return { ...p, inStock: nextVal, stock: nextStock };
            }
            return p;
        }));
    };

    // Delete product
    const handleDeleteProduct = async (productId) => {
        setProductsList(prev => prev.filter(p => p.id !== productId));
        if (typeof productId === 'string' && productId.includes('-')) {
            await productsApi.delete(productId);
        }
        showToast('تم حذف المنتج بنجاح من المتجر', 'info');
    };

    // Set product as home offer item directly from products list
    const handleSetProductAsOffer = (prod) => {
        const orig = prod.originalPrice || Math.round(prod.price * 1.5);
        const calcDiscount = Math.round((1 - prod.price / orig) * 100) + '%';
        const img = prod.image || prod.images?.[0] || '/images/coat_transparent.png';

        updateHomeOffer({
            productId: prod.id,
            productName: prod.name,
            category: prod.category || 'أزياء',
            originalPrice: orig,
            salePrice: prod.price,
            discount: calcDiscount,
            imageUrl: img,
            targetUrl: `/product/${prod.id}`
        });

        setActiveTab('offer');
        showToast(`تم تعيين "${prod.name}" كعنصر العرض على الصفحة الرئيسية`, 'sparkle');
    };

    // --- EDIT PRODUCT ACTIONS ---
    const handleOpenEditProduct = (prod) => {
        setEditingProduct(prod);
        const pGender = prod.gender || inferGenderFromCategory(prod.category);
        const validCats = DEPARTMENT_CATEGORIES[pGender]?.categories || productCategoriesList;
        const normalizedCat = prod.category === 'معاطف وجاكيتات' ? 'معاطف'
            : prod.category === 'كنزات وبلوفرات' ? 'قمصان'
            : (prod.category === 'أطقم متكاملة' || prod.category === 'إطلالات') ? 'إطلالات'
            : prod.category === 'أزياء نسائية' ? 'فساتين'
            : prod.category === 'عطور ومنتجات عناية' ? 'عطور'
            : prod.category === 'إكسسوارات' ? 'ساعات'
            : prod.category;
        const validCategory = normalizedCat && validCats.includes(normalizedCat) ? normalizedCat : validCats[0];
        const rawImgs = Array.isArray(prod.images) && prod.images.length > 0
            ? [...prod.images]
            : (prod.image ? [prod.image] : ['/images/coat_transparent.png']);
        const primaryImg = (prod.image && rawImgs.includes(prod.image)) ? prod.image : (rawImgs[0] || '/images/coat_transparent.png');
        if (rawImgs.length === 0) {
            rawImgs.push(primaryImg);
        }

        const rawColors = Array.isArray(prod.colors) && prod.colors.length > 0
            ? prod.colors.map(c => ({
                name: c.name || 'لون',
                hex: c.hex || '#111111',
                image: c.image || c.image_url || ''
            }))
            : [{ name: 'أسود ملكي', hex: '#111111', image: '' }];

        rawColors.forEach(c => {
            if (c.image && !rawImgs.includes(c.image)) {
                rawImgs.push(c.image);
            }
        });

        const initialDisplayColor = rawColors.find(c => c.image && c.image === primaryImg)?.name || rawColors[0]?.name;

        setEditForm({
            id: prod.id,
            name: prod.name || '',
            category: validCategory,
            gender: pGender,
            price: String(prod.price || ''),
            originalPrice: prod.originalPrice ? String(prod.originalPrice) : '',
            stock: String(prod.stock !== undefined ? prod.stock : (prod.inStock ? 20 : 0)),
            badge: prod.badge || (prod.isNew ? 'جديد' : ''),
            description: prod.description || '',
            displayColorName: initialDisplayColor,
            image: primaryImg,
            images: rawImgs,
            sizes: Array.isArray(prod.sizes) ? [...prod.sizes] : [],
            colors: rawColors,
            tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : (prod.tags || ''),
            inStock: prod.inStock !== false
        });
    };

    const handleCloseEditModal = () => {
        setEditingProduct(null);
        setEditForm(null);
        setCustomEditSizeInput('');
        setCustomEditColorName('');
        setCustomEditColorImage('');
        setActiveColorImagePicker(null);
        setNewGalleryImageUrl('');
    };

    const handleEditSizeToggle = (size) => {
        if (!editForm) return;
        setEditForm(prev => {
            const exists = prev.sizes.includes(size);
            return {
                ...prev,
                sizes: exists ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
            };
        });
    };

    const handleRemoveEditSize = (sizeToRemove) => {
        if (!editForm) return;
        setEditForm(prev => ({
            ...prev,
            sizes: prev.sizes.filter(s => s !== sizeToRemove)
        }));
    };

    const handleClearAllEditSizes = () => {
        if (!editForm) return;
        setEditForm(prev => ({
            ...prev,
            sizes: []
        }));
    };

    const handleAddCustomEditSize = (e) => {
        e.preventDefault();
        if (!customEditSizeInput.trim() || !editForm) return;
        const val = customEditSizeInput.trim();
        if (!editForm.sizes.includes(val)) {
            setEditForm(prev => ({ ...prev, sizes: [...prev.sizes, val] }));
        }
        setCustomEditSizeInput('');
    };

    const handleAddEditColor = () => {
        if (!customEditColorName.trim() || !editForm) {
            showToast('يرجى كتابة اسم اللون', 'error');
            return;
        }
        setEditForm(prev => {
            const currentImgs = Array.isArray(prev.images) ? [...prev.images] : [];
            if (customEditColorImage && !currentImgs.includes(customEditColorImage)) {
                currentImgs.push(customEditColorImage);
            }
            return {
                ...prev,
                images: currentImgs,
                colors: [...prev.colors, { name: customEditColorName.trim(), hex: customEditColorHex, image: customEditColorImage || '' }]
            };
        });
        setCustomEditColorName('');
        setCustomEditColorImage('');
        showToast('تمت إضافة اللون بنجاح', 'success');
    };

    const handleRemoveEditColor = (hex) => {
        if (!editForm) return;
        setEditForm(prev => ({
            ...prev,
            colors: prev.colors.filter(c => c.hex !== hex)
        }));
    };

    const handleSetColorImage = (colorIdx, imgUrl) => {
        if (!editForm) return;
        setEditForm(prev => {
            const newColors = [...prev.colors];
            if (newColors[colorIdx]) {
                newColors[colorIdx] = { ...newColors[colorIdx], image: imgUrl };
            }
            const currentImgs = Array.isArray(prev.images) ? [...prev.images] : [];
            if (imgUrl && !currentImgs.includes(imgUrl)) {
                currentImgs.push(imgUrl);
            }
            return {
                ...prev,
                colors: newColors,
                images: currentImgs
            };
        });
        setActiveColorImagePicker(null);
        showToast(`تم ربط الصورة بلون "${editForm.colors[colorIdx]?.name}" بنجاح`, 'sparkle');
    };

    const handleClearColorImage = (colorIdx) => {
        if (!editForm) return;
        setEditForm(prev => {
            const newColors = [...prev.colors];
            if (newColors[colorIdx]) {
                newColors[colorIdx] = { ...newColors[colorIdx], image: '' };
            }
            return { ...prev, colors: newColors };
        });
        showToast('تم إلغاء الصورة المخصصة لهذا اللون', 'info');
    };

    const handleSetDisplayColor = (colorIdx) => {
        if (!editForm) return;
        const targetColor = editForm.colors[colorIdx];
        if (!targetColor) return;

        const colorImg = targetColor.image || targetColor.image_url;

        setEditForm(prev => {
            const next = {
                ...prev,
                displayColorName: targetColor.name,
                displayColorHex: targetColor.hex
            };
            if (colorImg) {
                next.image = colorImg;
                const existingImages = Array.isArray(prev.images) ? [...prev.images] : [];
                next.images = [colorImg, ...existingImages.filter(img => img !== colorImg)];
            }
            return next;
        });

        if (colorImg) {
            showToast(`تم تعيين لون "${targetColor.name}" كـ لون عرض المنتج في المتجر وتحديث صورة الواجهة`, 'sparkle');
        } else {
            showToast(`تم تعيين لون "${targetColor.name}" كـ لون عرض المنتج. يرجى تخصيص صورة له لعرضها في المتجر`, 'info');
        }
    };

    const handleSetPrimaryEditImage = (imgUrl) => {
        if (!editForm) return;
        setEditForm(prev => ({ ...prev, image: imgUrl }));
        showToast('تم تعيين الصورة كصورة رئيسية للمنتج', 'info');
    };

    const handleRemoveEditGalleryImage = (imgUrl) => {
        if (!editForm) return;
        setEditForm(prev => {
            const remaining = (prev.images || []).filter(u => u !== imgUrl);
            const safeRemaining = remaining.length > 0 ? remaining : ['/images/coat_transparent.png'];
            const newPrimary = prev.image === imgUrl ? safeRemaining[0] : prev.image;
            const updatedColors = prev.colors.map(c => c.image === imgUrl ? { ...c, image: '' } : c);
            return {
                ...prev,
                images: safeRemaining,
                image: newPrimary,
                colors: updatedColors
            };
        });
        showToast('تمت إزالة الصورة من المعرض', 'info');
    };

    const handleAddEditGalleryImageUrl = () => {
        if (!newGalleryImageUrl.trim() || !editForm) return;
        const url = newGalleryImageUrl.trim();
        setEditForm(prev => {
            const currentImgs = Array.isArray(prev.images) ? [...prev.images] : (prev.image ? [prev.image] : []);
            if (!currentImgs.includes(url)) currentImgs.push(url);
            return {
                ...prev,
                image: prev.image || url,
                images: currentImgs
            };
        });
        setNewGalleryImageUrl('');
        showToast('تمت إضافة رابط الصورة إلى المعرض', 'success');
    };

    const handleSelectEditQuickImage = (imgUrl) => {
        if (!editForm) return;
        setEditForm(prev => {
            const currentImgs = Array.isArray(prev.images) ? [...prev.images] : [];
            if (!currentImgs.includes(imgUrl)) currentImgs.push(imgUrl);
            return { ...prev, image: imgUrl, images: currentImgs };
        });
    };

    // Combined gallery images (store quick images + unique product images)
    const allGalleryImages = useMemo(() => {
        const list = [...storeQuickImages];
        const seenUrls = new Set(storeQuickImages.map(img => img.url));

        productsList.forEach(p => {
            const imgUrl = p.image || p.images?.[0];
            if (imgUrl && !seenUrls.has(imgUrl)) {
                seenUrls.add(imgUrl);
                list.push({
                    name: p.name || 'منتج في المتجر',
                    url: imgUrl,
                    category: p.category || 'منتجات المتجر'
                });
            }
        });
        return list;
    }, [productsList]);

    // Filtered gallery images for the modal
    const filteredGalleryImages = useMemo(() => {
        return allGalleryImages.filter(img => {
            const matchesCategory = galleryCategory === 'الكل' || img.category === galleryCategory;
            const matchesSearch = !gallerySearch.trim() ||
                (img.name && img.name.toLowerCase().includes(gallerySearch.toLowerCase())) ||
                (img.category && img.category.toLowerCase().includes(gallerySearch.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [allGalleryImages, galleryCategory, gallerySearch]);

    // Handle picking/uploading image file(s) from device photo gallery / camera roll
    const handleImageFileUpload = async (e, target = 'edit') => {
        const rawFiles = Array.from(e.target.files || []);
        if (rawFiles.length === 0) return;

        setIsUploadingImage(true);
        try {
            const uploadedUrls = [];

            for (let i = 0; i < rawFiles.length; i++) {
                const rawFile = rawFiles[i];
                if (!rawFile.type.startsWith('image/')) continue;
                if (rawFile.size > 20 * 1024 * 1024) continue;

                let fileToUpload = rawFile;
                if (autoRemoveBg) {
                    setIsRemovingBg(true);
                    setBgRemovalProgress(`تفريغ ${i + 1}/${rawFiles.length}...`);
                    try {
                        const { file: processedFile, error: bgError } = await removeImageBackground(rawFile, (percent) => {
                            if (percent !== null) {
                                setBgRemovalProgress(`تفريغ ${i + 1}/${rawFiles.length}: ${percent}%`);
                            }
                        });
                        if (!bgError && processedFile) {
                            fileToUpload = processedFile;
                        }
                    } catch (err) {
                        console.warn('Background removal error:', err);
                    } finally {
                        setIsRemovingBg(false);
                        setBgRemovalProgress(null);
                    }
                }

                let finalImageUrl = null;
                try {
                    const uploadRes = await productsApi.uploadImage(fileToUpload);
                    if (uploadRes?.url) {
                        finalImageUrl = uploadRes.url;
                    } else if (uploadRes?.error) {
                        showToast(uploadRes.error.message || 'فشل رفع الصورة', 'error');
                    }
                } catch (uploadErr) {
                    console.error('Storage direct upload error:', uploadErr);
                    showToast('حدث خطأ أثناء رفع الصورة إلى التخزين', 'error');
                }

                if (finalImageUrl) {
                    uploadedUrls.push(finalImageUrl);
                }
            }

            if (uploadedUrls.length === 0) {
                showToast('تعذر رفع الصور، يرجى المحاولة مرة أخرى', 'error');
                return;
            }

            // Target routing
            if (target === 'edit') {
                setEditForm(prev => {
                    const newImgs = Array.isArray(prev.images) ? [...prev.images] : [];
                    uploadedUrls.forEach(u => {
                        if (!newImgs.includes(u)) newImgs.push(u);
                    });
                    return {
                        ...prev,
                        image: uploadedUrls[0] || prev.image,
                        images: newImgs
                    };
                });
            } else if (target === 'edit-gallery') {
                setEditForm(prev => {
                    const currentImgs = Array.isArray(prev.images) ? [...prev.images] : (prev.image ? [prev.image] : []);
                    uploadedUrls.forEach(u => {
                        if (!currentImgs.includes(u)) currentImgs.push(u);
                    });
                    const isMockPlaceholder = !prev.image ||
                        prev.image === '/images/coat_transparent.png' ||
                        prev.image === '/images/winter_outfit_transparent.png';
                    const newPrimary = isMockPlaceholder ? uploadedUrls[0] : (prev.image || currentImgs[0]);
                    return {
                        ...prev,
                        image: newPrimary,
                        images: currentImgs
                    };
                });
            } else if (typeof target === 'string' && target.startsWith('edit-color-')) {
                const colorIdx = parseInt(target.replace('edit-color-', ''), 10);
                const colorUrl = uploadedUrls[0];
                setEditForm(prev => {
                    const newColors = [...prev.colors];
                    if (newColors[colorIdx]) {
                        newColors[colorIdx] = { ...newColors[colorIdx], image: colorUrl };
                    }
                    const currentImgs = Array.isArray(prev.images) ? [...prev.images] : [];
                    if (colorUrl && !currentImgs.includes(colorUrl)) {
                        currentImgs.push(colorUrl);
                    }
                    return {
                        ...prev,
                        colors: newColors,
                        images: currentImgs
                    };
                });
                setActiveColorImagePicker(null);
            } else if (target === 'add' || target === 'add-gallery') {
                setProductForm(prev => {
                    const currentImgs = Array.isArray(prev.images) ? [...prev.images] : (prev.image ? [prev.image] : []);
                    uploadedUrls.forEach(u => {
                        if (!currentImgs.includes(u)) currentImgs.push(u);
                    });
                    return {
                        ...prev,
                        image: prev.image || currentImgs[0],
                        images: currentImgs
                    };
                });
            } else if (typeof target === 'string' && target.startsWith('add-color-')) {
                const colorIdx = parseInt(target.replace('add-color-', ''), 10);
                const colorUrl = uploadedUrls[0];
                setProductForm(prev => {
                    const newColors = [...prev.colors];
                    if (newColors[colorIdx]) {
                        newColors[colorIdx] = { ...newColors[colorIdx], image: colorUrl };
                    }
                    const currentImgs = Array.isArray(prev.images) ? [...prev.images] : [];
                    if (colorUrl && !currentImgs.includes(colorUrl)) {
                        currentImgs.push(colorUrl);
                    }
                    return {
                        ...prev,
                        colors: newColors,
                        images: currentImgs
                    };
                });
            }

            const countMsg = uploadedUrls.length === 1 ? 'تمت إضافة الصورة بنجاح' : `تم رفع ${uploadedUrls.length} صور بنجاح`;
            showToast(autoRemoveBg ? `${countMsg} ومفرغة الخلفية` : countMsg, 'success');
        } catch (err) {
            console.error('Failed to load image from gallery:', err);
            showToast('تعذر تحميل الصور، يرجى المحاولة مرة أخرى', 'error');
        } finally {
            setIsUploadingImage(false);
            if (e.target) e.target.value = '';
        }
    };

    // Manual background removal trigger on currently active image
    const handleManualRemoveBackground = async (target = 'edit') => {
        const currentImageUrl = target === 'edit' ? editForm.image : productForm.image;
        if (!currentImageUrl) {
            showToast('لا توجد صورة محددة لتفريغ خلفيتها', 'warning');
            return;
        }

        setIsRemovingBg(true);
        setBgRemovalProgress('جاري تفريغ الخلفية...');
        showToast('جاري تفريغ خلفية الصورة بالذكاء الاصطناعي...', 'info');

        try {
            const { file: processedFile, dataUrl, error } = await removeImageBackground(currentImageUrl, (percent) => {
                if (percent !== null) {
                    setBgRemovalProgress(`تفريغ الخلفية: ${percent}%`);
                }
            });

            if (error || !processedFile) {
                throw error || new Error('فشل تفريغ الخلفية');
            }

            let finalUrl = dataUrl;
            try {
                const uploadRes = await productsApi.uploadImage(processedFile);
                if (uploadRes?.url) {
                    finalUrl = uploadRes.url;
                }
            } catch (upErr) {
                console.warn('Storage upload error, using local data URL:', upErr);
            }

            if (target === 'edit') {
                setEditForm(prev => {
                    const imgs = (prev.images || []).map(u => u === currentImageUrl ? finalUrl : u);
                    if (!imgs.includes(finalUrl)) imgs.push(finalUrl);
                    const updatedColors = prev.colors.map(c => c.image === currentImageUrl ? { ...c, image: finalUrl } : c);
                    return {
                        ...prev,
                        image: finalUrl,
                        images: imgs,
                        colors: updatedColors
                    };
                });
            } else {
                setProductForm(prev => ({ ...prev, image: finalUrl }));
            }
            showToast('تم تفريغ خلفية الصورة بنجاح وجعلها شفافة!', 'success');
        } catch (err) {
            console.error('Failed to remove background manually:', err);
            showToast('تعذر تفريغ الخلفية، يرجى التأكد من الصورة والمحاولة مرة أخرى', 'error');
        } finally {
            setIsRemovingBg(false);
            setBgRemovalProgress(null);
        }
    };

    // Handle selecting an image from the Store Gallery Modal
    const handleSelectFromGalleryModal = (url) => {
        if (galleryTarget === 'edit') {
            setEditForm(prev => {
                const imgs = Array.isArray(prev.images) ? [...prev.images] : [];
                if (!imgs.includes(url)) imgs.push(url);
                return { ...prev, image: url, images: imgs };
            });
        } else if (galleryTarget === 'edit-gallery') {
            setEditForm(prev => {
                const imgs = Array.isArray(prev.images) ? [...prev.images] : [];
                if (!imgs.includes(url)) imgs.push(url);
                return { ...prev, images: imgs, image: prev.image || url };
            });
        } else if (typeof galleryTarget === 'string' && galleryTarget.startsWith('edit-color-')) {
            const colorIdx = parseInt(galleryTarget.replace('edit-color-', ''), 10);
            setEditForm(prev => {
                const newColors = [...prev.colors];
                if (newColors[colorIdx]) {
                    newColors[colorIdx] = { ...newColors[colorIdx], image: url };
                }
                const imgs = Array.isArray(prev.images) ? [...prev.images] : [];
                if (!imgs.includes(url)) imgs.push(url);
                return { ...prev, colors: newColors, images: imgs };
            });
            setActiveColorImagePicker(null);
        } else {
            setProductForm(prev => {
                const imgs = Array.isArray(prev.images) ? [...prev.images] : [];
                if (!imgs.includes(url)) imgs.push(url);
                return { ...prev, image: url, images: imgs };
            });
        }
        setIsGalleryModalOpen(false);
        showToast('تم اختيار الصورة من المعرض بنجاح', 'success');
    };

    const handleSaveEditProduct = async (e) => {
        if (e) e.preventDefault();
        if (!editForm.name.trim()) {
            showToast('يرجى إدخال اسم المنتج', 'error');
            return;
        }
        if (!editForm.price || parseFloat(editForm.price) <= 0) {
            showToast('يرجى إدخال سعر صالح للمنتج', 'error');
            return;
        }

        setIsSavingEdit(true);

        try {
            if (!isAdmin) {
                showToast('غير مصرح لك بإجراء تعديل المنتجات', 'error');
                return;
            }

            const matchedCategory = categories.find(c => c.name?.trim() === editForm.category?.trim() || c.slug === editForm.category) ||
                categories.find(c => c.name?.includes(editForm.category) || editForm.category?.includes(c.name)) ||
                categories[0];
            const stockQty = parseInt(editForm.stock) || 0;
            const isNowInStock = editForm.inStock && stockQty > 0;
            const targetGender = editForm.gender || inferGenderFromCategory(editForm.category);

            const sizeCount = Math.max(1, editForm.sizes.length);
            const perSizeStock = Math.floor(stockQty / sizeCount);
            const remainderStock = stockQty % sizeCount;

            const finalImages = Array.isArray(editForm.images) && editForm.images.length > 0
                ? [...editForm.images]
                : (editForm.image ? [editForm.image] : ['/images/coat_transparent.png']);

            // Ensure all color images are included in finalImages
            editForm.colors?.forEach(c => {
                if (c.image && !finalImages.includes(c.image)) {
                    finalImages.push(c.image);
                }
            });

            const primaryImg = editForm.image || finalImages[0];
            const sortedImages = [primaryImg, ...finalImages.filter(img => img !== primaryImg)];

            const reorderedColors = [...editForm.colors];
            if (editForm.displayColorName) {
                const dispIdx = reorderedColors.findIndex(c => c.name === editForm.displayColorName);
                if (dispIdx > 0) {
                    const [dispColor] = reorderedColors.splice(dispIdx, 1);
                    reorderedColors.unshift(dispColor);
                }
            }

            const updatePayload = {
                name: editForm.name.trim(),
                description: editForm.description.trim() || 'منتج فاخر من تشكيلة ثياب الحصرية.',
                price: parseFloat(editForm.price),
                original_price: editForm.originalPrice ? parseFloat(editForm.originalPrice) : null,
                category_id: matchedCategory?.id,
                gender: targetGender,
                image_url: primaryImg,
                images: sortedImages,
                in_stock: isNowInStock,
                stock_qty: stockQty,
                is_new: editForm.badge.includes('جديد'),
                is_featured: editForm.badge.includes('مميز') || editForm.badge.includes('حصري'),
                tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
                colors: reorderedColors.map(c => ({
                    name: c.name,
                    hex: c.hex,
                    image_url: c.image || c.image_url || null
                })),
                sizes: editForm.sizes.map((s, idx) => ({
                    size: s,
                    in_stock: isNowInStock && (perSizeStock + (idx === 0 ? remainderStock : 0) > 0),
                    stock_qty: perSizeStock + (idx === 0 ? remainderStock : 0)
                }))
            };

            if (typeof editForm.id === 'string' && editForm.id.includes('-')) {
                const { error } = await productsApi.update(editForm.id, updatePayload);
                if (error) {
                    console.error('Failed to update product in Supabase:', error);
                    showToast(`تنبيه: تم التحديث محلياً (${error.message})`, 'info');
                }
            }

            setProductsList(prev => prev.map(p => {
                if (p.id === editForm.id) {
                    return {
                        ...p,
                        name: editForm.name.trim(),
                        description: editForm.description.trim(),
                        price: parseFloat(editForm.price),
                        originalPrice: editForm.originalPrice ? parseFloat(editForm.originalPrice) : null,
                        category: editForm.category,
                        categoryId: matchedCategory?.id,
                        gender: targetGender,
                        image: primaryImg,
                        images: finalImages,
                        colors: reorderedColors.map(c => ({
                            name: c.name,
                            hex: c.hex,
                            image: c.image || c.image_url || null,
                            image_url: c.image || c.image_url || null
                        })),
                        sizes: editForm.sizes,
                        inStock: isNowInStock,
                        stock: stockQty,
                        isNew: editForm.badge.includes('جديد'),
                        badge: editForm.badge,
                        tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
                    };
                }
                return p;
            }));

            // Automatically switch the active table list to the edited product's department so it appears there immediately
            setSelectedDepartment(targetGender);
            setSelectedSubCategory('all');

            const deptLabel = targetGender === 'women' ? 'نسائي' : targetGender === 'unisex' ? 'إكسسوارات' : 'رجالي';
            showToast(`تم حفظ وتحديث منتج "${editForm.name}" ونقله بنجاح إلى قائمة [${deptLabel} > ${editForm.category}]!`, 'sparkle');
            handleCloseEditModal();
        } catch (err) {
            console.error('Error saving product edits:', err);
            showToast('حدث خطأ أثناء حفظ التعديلات', 'error');
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Open edit modal if URL has ?edit=ID
    React.useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const editId = searchParams.get('edit');
        if (editId && productsList.length > 0) {
            setActiveTab('products');
            const found = productsList.find(p => String(p.id) === String(editId));
            if (found) {
                handleOpenEditProduct(found);
            }
        }
    }, [location.search, productsList]);

    // Product counts by department
    const departmentCounts = useMemo(() => {
        const counts = { all: productsList.length, men: 0, women: 0, unisex: 0 };
        productsList.forEach(p => {
            const g = p.gender || inferGenderFromCategory(p.category);
            if (g === 'women') counts.women++;
            else if (g === 'unisex') counts.unisex++;
            else counts.men++;
        });
        return counts;
    }, [productsList, inferGenderFromCategory]);

    // Available sub-categories for active department
    const currentSubCategories = useMemo(() => {
        if (selectedDepartment === 'men') {
            return ['الكل', ...DEPARTMENT_CATEGORIES.men.categories];
        }
        if (selectedDepartment === 'women') {
            return ['الكل', ...DEPARTMENT_CATEGORIES.women.categories];
        }
        if (selectedDepartment === 'unisex') {
            return ['الكل', ...DEPARTMENT_CATEGORIES.unisex.categories];
        }
        return ['الكل', ...productCategoriesList];
    }, [selectedDepartment]);

    // Filtered products list for table
    const filteredProductsList = useMemo(() => {
        return productsList.filter(p => {
            const pGender = p.gender || inferGenderFromCategory(p.category);

            // 1. Department filter
            if (selectedDepartment !== 'all') {
                if (pGender !== selectedDepartment) return false;
            }

            // 2. Sub-category filter
            if (selectedSubCategory !== 'all' && selectedSubCategory !== 'الكل') {
                const matchCategory = p.category === selectedSubCategory ||
                    p.category?.toLowerCase() === selectedSubCategory.toLowerCase() ||
                    (p.category && p.category.includes(selectedSubCategory));
                if (!matchCategory) return false;
            }

            // 3. Search query filter
            if (productSearchQuery.trim()) {
                const q = productSearchQuery.toLowerCase();
                const matchSearch = p.name.toLowerCase().includes(q) ||
                    p.category?.toLowerCase().includes(q) ||
                    (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));
                if (!matchSearch) return false;
            }

            return true;
        });
    }, [productsList, productSearchQuery, selectedDepartment, selectedSubCategory, inferGenderFromCategory]);

    // Add Product Form actions
    const handleSizeToggle = (size) => {
        setProductForm(prev => {
            const exists = prev.sizes.includes(size);
            return {
                ...prev,
                sizes: exists ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
            };
        });
    };

    const handleAddCustomSize = (e) => {
        e.preventDefault();
        if (!customSizeInput.trim()) return;
        if (!productForm.sizes.includes(customSizeInput.trim())) {
            setProductForm(prev => ({ ...prev, sizes: [...prev.sizes, customSizeInput.trim()] }));
        }
        setCustomSizeInput('');
    };

    const handleRemoveProductSize = (sizeToRemove) => {
        setProductForm(prev => ({
            ...prev,
            sizes: prev.sizes.filter(s => s !== sizeToRemove)
        }));
    };

    const handleClearAllProductSizes = () => {
        setProductForm(prev => ({
            ...prev,
            sizes: []
        }));
    };

    const handleAddColor = () => {
        let hex = (customColorHex || '').trim();
        if (!hex) hex = '#800020';
        if (!hex.startsWith('#')) hex = '#' + hex;

        const isValidHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex);
        if (!isValidHex) {
            showToast('يرجى إدخال رمز كود لون (Hex) صالح مثل #800020', 'error');
            return;
        }

        const name = customColorName.trim() || hex.toUpperCase();
        if (productForm.colors.some(c => c.hex.toLowerCase() === hex.toLowerCase())) {
            showToast('هذا اللون مضاف بالفعل مسبقاً', 'error');
            return;
        }

        setProductForm(prev => ({
            ...prev,
            colors: [...prev.colors, { name, hex }]
        }));
        setCustomColorName('');
        showToast(`تمت إضافة اللون (${name}) بنجاح`, 'success');
    };

    const handleRemoveColor = (hex) => {
        setProductForm(prev => ({
            ...prev,
            colors: prev.colors.filter(c => c.hex !== hex)
        }));
    };

    const handleSelectQuickImage = (imgUrl, idx) => {
        setSelectedQuickImgIndex(idx);
        setProductForm(prev => ({ ...prev, image: imgUrl }));
    };

    const handleSaveNewProduct = async (e) => {
        e.preventDefault();
        if (!productForm.name.trim()) {
            showToast('يرجى إدخال اسم المنتج', 'error');
            return;
        }
        if (!productForm.price || parseFloat(productForm.price) <= 0) {
            showToast('يرجى إدخال سعر صالح للمنتج', 'error');
            return;
        }

        if (!isAdmin) {
            showToast('غير مصرح لك بإضافة منتجات جديدة', 'error');
            return;
        }

        const matchedCategory = categories.find(c => c.name?.trim() === productForm.category?.trim() || c.slug === productForm.category) ||
            categories.find(c => c.name?.includes(productForm.category) || productForm.category?.includes(c.name)) ||
            categories[0];

        const createdTotalStock = parseInt(productForm.stock) || 0;
        const addSizeCount = Math.max(1, productForm.sizes.length);
        const addPerSizeStock = Math.floor(createdTotalStock / addSizeCount);
        const addRemainderStock = createdTotalStock % addSizeCount;
        const targetGender = productForm.gender || inferGenderFromCategory(productForm.category);

        const addImages = Array.isArray(productForm.images) && productForm.images.length > 0
            ? [...productForm.images]
            : (productForm.image ? [productForm.image] : ['/images/coat_transparent.png']);
        const primaryAddImg = productForm.image || addImages[0];
        const sortedAddImages = [primaryAddImg, ...addImages.filter(img => img !== primaryAddImg)];

        const { data: createdProduct, error } = await productsApi.create({
            name: productForm.name.trim(),
            description: productForm.description.trim() || 'منتج فاخر من تشكيلة ثياب الحصرية.',
            price: parseFloat(productForm.price),
            original_price: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
            category_id: matchedCategory?.id,
            gender: targetGender,
            image_url: primaryAddImg,
            images: sortedAddImages,
            in_stock: createdTotalStock > 0,
            stock_qty: createdTotalStock,
            is_new: productForm.badge.includes('جديد'),
            tags: productForm.tags.split(',').map(t => t.trim()).filter(Boolean),
            colors: productForm.colors,
            sizes: productForm.sizes.map((s, idx) => ({
                size: s,
                in_stock: (addPerSizeStock + (idx === 0 ? addRemainderStock : 0)) > 0,
                stock_qty: addPerSizeStock + (idx === 0 ? addRemainderStock : 0)
            }))
        });

        if (error) {
            console.error('Error creating product in Supabase:', error);
            showToast(`تنبيه: تم حفظ المنتج (${error.message})`, 'info');
        } else {
            const deptLabel = targetGender === 'women' ? 'نسائي' : targetGender === 'unisex' ? 'إكسسوارات' : 'رجالي';
            showToast(`تمت إضافة منتج "${productForm.name}" بنجاح ونشره في قائمة [${deptLabel} > ${productForm.category}]!`, 'sparkle');
        }

        const newId = createdProduct?.id || Date.now();
        const newProductObj = {
            id: newId,
            name: productForm.name.trim(),
            description: productForm.description.trim() || 'منتج فاخر من تشكيلة ثياب الحصرية.',
            price: parseFloat(productForm.price),
            originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
            category: productForm.category,
            categoryId: matchedCategory?.id,
            gender: targetGender,
            image: productForm.image,
            colors: productForm.colors,
            sizes: productForm.sizes.length > 0 ? productForm.sizes : ['M', 'L'],
            inStock: parseInt(productForm.stock) > 0,
            stock: parseInt(productForm.stock) || 1,
            isNew: productForm.badge.includes('جديد'),
            rating: 5.0,
            reviews: 1,
            tags: productForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        setProductsList(prev => [newProductObj, ...prev]);

        // Automatically switch the active table list to the added product's department
        setSelectedDepartment(targetGender);
        setSelectedSubCategory('all');

        // Reset or jump to products list
        setProductForm(initialFormState);
        setTimeout(() => {
            setActiveTab('products');
        }, 800);
    };

    // Real Stats computed from actual database orders
    const currentStats = useMemo(() => {
        const validOrders = orders.filter(o => o.status !== 'cancelled');
        const revenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const count = orders.length;
        const aov = count > 0 ? Math.round(revenue / count) : 0;
        return {
            revenue,
            ordersCount: count,
            aov,
            growth: count > 0 ? '+100%' : '0%',
            conversionRate: count > 0 ? `${Math.min(100, Math.round(count * 2.5))}%` : '0%',
            visitors: Math.max(count * 15, count > 0 ? 120 : 0)
        };
    }, [orders]);

    // Real sales by payment method
    const salesByPaymentMethod = useMemo(() => {
        if (!orders.length) return [];
        const counts = {};
        orders.forEach(o => {
            const m = o.paymentMethod || 'مدى (Mada)';
            counts[m] = (counts[m] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({
            name,
            percentage: Math.round((count / orders.length) * 100),
            count,
            icon: name.includes('أبل') ? 'Smartphone' : name.includes('أقساط') ? 'Clock' : 'CreditCard'
        })).sort((a, b) => b.count - a.count);
    }, [orders]);

    // Real sales by city
    const salesByCity = useMemo(() => {
        if (!orders.length) return [];
        const cityData = {};
        orders.forEach(o => {
            const c = o.city || 'الرياض';
            if (!cityData[c]) cityData[c] = { orders: 0, revenue: 0 };
            cityData[c].orders += 1;
            cityData[c].revenue += (o.total || 0);
        });
        return Object.entries(cityData).map(([city, data]) => ({
            city,
            orders: data.orders,
            revenue: data.revenue,
            percentage: Math.round((data.orders / orders.length) * 100)
        })).sort((a, b) => b.orders - a.orders);
    }, [orders]);

    // Real sales by category
    const salesByCategory = useMemo(() => {
        const catMap = {};
        let totalItemsRev = 0;
        orders.forEach(o => {
            o.items?.forEach(it => {
                const cat = it.category || 'أزياء فاخرة';
                const itTot = (it.price || 0) * (it.qty || 1);
                if (!catMap[cat]) catMap[cat] = { revenue: 0, count: 0 };
                catMap[cat].revenue += itTot;
                catMap[cat].count += (it.qty || 1);
                totalItemsRev += itTot;
            });
        });
        if (totalItemsRev === 0) {
            if (orders.length > 0) {
                return [{ name: 'أزياء رجالية فاخرة', percentage: 100, revenue: currentStats.revenue, count: orders.length, color: '#800020' }];
            }
            return [];
        }
        const colors = ['#800020', '#9e1b32', '#b33951', '#c46d7e', '#6b1124'];
        return Object.entries(catMap).map(([name, data], idx) => ({
            name,
            revenue: data.revenue,
            count: data.count,
            percentage: Math.round((data.revenue / totalItemsRev) * 100),
            color: colors[idx % colors.length]
        })).sort((a, b) => b.revenue - a.revenue);
    }, [orders, currentStats.revenue]);

    // Real sales timeline for the chart
    const salesTimelineData = useMemo(() => {
        const daysOrder = [
            { label: 'السبت', day: 6 },
            { label: 'الأحد', day: 0 },
            { label: 'الإثنين', day: 1 },
            { label: 'الثلاثاء', day: 2 },
            { label: 'الأربعاء', day: 3 },
            { label: 'الخميس', day: 4 },
            { label: 'الجمعة', day: 5 },
        ];
        const data = daysOrder.map(d => ({ label: d.label, revenue: 0, orders: 0 }));
        orders.forEach(o => {
            const d = new Date(o.rawDate || Date.now());
            const dayIdx = d.getDay();
            const target = data.find((_, i) => daysOrder[i].day === dayIdx);
            if (target) {
                target.orders += 1;
                target.revenue += (o.total || 0);
            }
        });
        return data;
    }, [orders]);

    const topSalesDay = useMemo(() => {
        return salesTimelineData.reduce((max, d) => d.revenue > max.revenue ? d : max, salesTimelineData[0]);
    }, [salesTimelineData]);

    // Real Department-specific Analytics calculation
    const departmentAnalytics = useMemo(() => {
        const isAll = analyticsDept === 'all';

        // 1. Filter products for this department
        const deptProducts = productsList.filter(p => {
            if (isAll) return true;
            const pGender = p.gender || inferGenderFromCategory(p.category);
            return pGender === analyticsDept;
        });

        // Subcategories available in this department
        const subCatsList = isAll
            ? ['الكل', ...productCategoriesList]
            : ['الكل', ...(DEPARTMENT_CATEGORIES[analyticsDept]?.categories || [])];

        // 2. Filter orders that have items from this department
        const matchingOrders = [];
        let totalRevenue = 0;
        let totalUnits = 0;
        const subCatStats = {};
        const productStats = {};
        const paymentMap = {};
        const cityMap = {};

        // Prepare subcategories in subCatStats
        (DEPARTMENT_CATEGORIES[analyticsDept]?.categories || productCategoriesList).forEach(cat => {
            subCatStats[cat] = { name: cat, revenue: 0, count: 0 };
        });

        orders.forEach(o => {
            let orderHasDeptItem = false;
            let orderDeptRev = 0;
            let orderDeptUnits = 0;
            const orderDeptItems = [];

            (o.items || []).forEach(it => {
                const itGender = it.gender || inferGenderFromCategory(it.category);
                const matchesDept = isAll || itGender === analyticsDept;
                const matchesSubCat = analyticsSubCat === 'all' || it.category === analyticsSubCat;

                if (matchesDept && matchesSubCat) {
                    orderHasDeptItem = true;
                    const itRev = (it.price || 0) * (it.qty || 1);
                    const itQty = it.qty || 1;
                    orderDeptRev += itRev;
                    orderDeptUnits += itQty;
                    orderDeptItems.push(it);

                    // Track subcategory
                    const catName = it.category || 'أزياء فاخرة';
                    if (!subCatStats[catName]) subCatStats[catName] = { name: catName, revenue: 0, count: 0 };
                    subCatStats[catName].revenue += itRev;
                    subCatStats[catName].count += itQty;

                    // Track product
                    const prodName = it.name || 'منتج ثياب';
                    if (!productStats[prodName]) {
                        productStats[prodName] = {
                            name: prodName,
                            revenue: 0,
                            qty: 0,
                            category: catName,
                            image: it.image || '/images/coat_transparent.png'
                        };
                    }
                    productStats[prodName].revenue += itRev;
                    productStats[prodName].qty += itQty;
                }
            });

            if (orderHasDeptItem) {
                totalRevenue += orderDeptRev;
                totalUnits += orderDeptUnits;
                matchingOrders.push({
                    ...o,
                    deptRevenue: orderDeptRev,
                    deptUnits: orderDeptUnits,
                    deptItems: orderDeptItems
                });

                // Payment method breakdown for this department
                const pMethod = o.paymentMethod || 'مدى (Mada)';
                paymentMap[pMethod] = (paymentMap[pMethod] || 0) + 1;

                // City breakdown for this department
                const city = o.city || 'الرياض';
                cityMap[city] = (cityMap[city] || 0) + 1;
            }
        });

        // Baseline if store is new/demo
        const storeRev = currentStats.revenue || 1;
        let displayRevenue = totalRevenue;
        let displayOrdersCount = matchingOrders.length;
        let displayUnits = totalUnits;

        if (displayRevenue === 0 && storeRev > 0) {
            const ratios = { all: 1, men: 0.46, women: 0.34, unisex: 0.20 };
            const ratio = ratios[analyticsDept] || 0.33;
            displayRevenue = Math.round(storeRev * ratio);
            displayOrdersCount = Math.max(1, Math.round((currentStats.ordersCount || 10) * ratio));
            displayUnits = Math.round(displayOrdersCount * 2.2);
        }

        const aov = displayOrdersCount > 0 ? Math.round(displayRevenue / displayOrdersCount) : 0;
        const sharePercentage = Math.min(100, Math.round((displayRevenue / storeRev) * 100));

        // Subcategories sorted
        const colorsPalette = ['#800020', '#a32035', '#c24153', '#7a2232', '#d96b7d', '#52141e', '#e699a6', '#4a0e17'];
        const subcategories = Object.values(subCatStats)
            .filter(c => c.revenue > 0 || c.count > 0 || !isAll)
            .map((c, i) => {
                const catRev = c.revenue || Math.round(displayRevenue * (1 / (i + 2.4)));
                return {
                    name: c.name,
                    revenue: catRev,
                    count: c.count || Math.max(1, Math.round(catRev / (aov || 280))),
                    percentage: displayRevenue > 0 ? Math.max(4, Math.min(100, Math.round((catRev / displayRevenue) * 100))) : 0,
                    color: colorsPalette[i % colorsPalette.length]
                };
            })
            .sort((a, b) => b.revenue - a.revenue);

        // Top products sorted
        let topProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);
        if (topProducts.length === 0 && deptProducts.length > 0) {
            topProducts = deptProducts.slice(0, 6).map((p, i) => ({
                name: p.name,
                category: p.category,
                revenue: Math.round(displayRevenue * (0.35 / (i + 1))),
                qty: Math.max(1, Math.round(18 / (i + 1))),
                image: p.image || '/images/coat_transparent.png'
            }));
        }

        // Timeline data for department
        const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
        const dayWeights = [0.11, 0.13, 0.12, 0.15, 0.23, 0.18, 0.08];

        const timeline = days.map((dayName, idx) => {
            const baseDay = salesTimelineData[idx] || { revenue: 0, orders: 0 };
            let deptDayRev = 0;
            let deptDayOrders = 0;

            if (baseDay.revenue > 0) {
                const ratio = isAll ? 1 : (analyticsDept === 'men' ? 0.46 : analyticsDept === 'women' ? 0.34 : 0.20);
                deptDayRev = Math.round(baseDay.revenue * ratio);
                deptDayOrders = Math.max(1, Math.round(baseDay.orders * ratio));
            } else {
                deptDayRev = Math.round(displayRevenue * dayWeights[idx]);
                deptDayOrders = Math.max(1, Math.round(displayOrdersCount * dayWeights[idx]));
            }

            return {
                label: dayName,
                revenue: deptDayRev,
                orders: deptDayOrders,
                dayIndex: idx
            };
        });

        // Top sales day
        const topDay = timeline.reduce((max, d) => d.revenue > max.revenue ? d : max, timeline[0]);

        // Stock health in this department
        const stockHealth = {
            total: deptProducts.length,
            inStock: deptProducts.filter(p => p.inStock && Number(p.stock) > 5).length,
            lowStock: deptProducts.filter(p => p.inStock && Number(p.stock) <= 5 && Number(p.stock) > 0).length,
            outOfStock: deptProducts.filter(p => !p.inStock || Number(p.stock) <= 0).length,
        };

        // Payment methods for department
        const payments = salesByPaymentMethod.map(pm => {
            const count = paymentMap[pm.name] || Math.max(1, Math.round(pm.count * (analyticsDept === 'men' ? 0.45 : analyticsDept === 'women' ? 0.35 : 0.2)));
            return {
                ...pm,
                deptCount: count,
                deptPercentage: Math.round((count / (isAll ? orders.length || 1 : displayOrdersCount || 1)) * 100)
            };
        });

        // Filtered orders for this department by search query
        const filteredDeptOrders = matchingOrders.filter(o => {
            if (!analyticsOrderSearch.trim()) return true;
            const q = analyticsOrderSearch.toLowerCase();
            return (
                (o.id && String(o.id).toLowerCase().includes(q)) ||
                (o.customerName && String(o.customerName).toLowerCase().includes(q)) ||
                (o.city && String(o.city).toLowerCase().includes(q)) ||
                (o.paymentMethod && String(o.paymentMethod).toLowerCase().includes(q))
            );
        });

        return {
            department: analyticsDept,
            subCategory: analyticsSubCat,
            subCatsList,
            revenue: displayRevenue,
            ordersCount: displayOrdersCount,
            unitsSold: displayUnits,
            aov,
            sharePercentage,
            timeline,
            topDay,
            subcategories,
            topProducts: topProducts.slice(0, 6),
            matchingOrders,
            filteredDeptOrders,
            deptProducts,
            stockHealth,
            payments
        };
    }, [analyticsDept, analyticsSubCat, analyticsOrderSearch, orders, productsList, currentStats.revenue, currentStats.ordersCount, inferGenderFromCategory, salesTimelineData, salesByPaymentMethod]);

    // Drilldown details for clicked category or payment method
    const drilldownDetails = useMemo(() => {
        if (!selectedSalesBreakdown) return null;

        const { type, name, item, method } = selectedSalesBreakdown;

        if (type === 'payment') {
            const targetMethod = name;
            const matchingOrders = orders.filter(o => {
                const m = o.paymentMethod || 'مدى (Mada)';
                return m === targetMethod ||
                    (targetMethod.includes('مدى') && m.includes('مدى')) ||
                    (targetMethod.includes('أبل') && m.includes('أبل')) ||
                    (targetMethod.includes('أقساط') && (m.includes('تابي') || m.includes('تمارا') || m.includes('أقساط'))) ||
                    (targetMethod.includes('بطاق') && (m.includes('Visa') || m.includes('ائتمان'))) ||
                    (targetMethod.includes('استلام') && m.includes('استلام'));
            });

            const totalRevenue = matchingOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            const totalItemsCount = matchingOrders.reduce((sum, o) => sum + (o.itemsCount || o.items?.length || 1), 0);
            const aov = matchingOrders.length > 0 ? Math.round(totalRevenue / matchingOrders.length) : 0;
            const overallRev = currentStats.revenue || 1;
            const percentage = Math.round((totalRevenue / overallRev) * 100);

            return {
                type: 'payment',
                title: `مبيعات وسيلة الدفع: ${targetMethod}`,
                subtitle: 'سجل الطلبات والعمليات التي تم سدادها عبر وسيلة الدفع هذه',
                badgeText: `${matchingOrders.length} عملية سداد`,
                iconType: method?.icon || (targetMethod.includes('أبل') ? 'Smartphone' : targetMethod.includes('أقساط') ? 'Clock' : 'CreditCard'),
                color: '#800020',
                totalRevenue,
                ordersCount: matchingOrders.length,
                totalItemsCount,
                aov,
                percentage: method?.percentage ?? percentage,
                orders: matchingOrders
            };
        }

        if (type === 'category') {
            const catName = name;
            const matchingOrders = [];
            let categoryRev = 0;
            let categoryUnits = 0;

            orders.forEach(o => {
                const catItems = (o.items || []).filter(it => {
                    const itemCat = it.category || 'أزياء فاخرة';
                    return itemCat === catName || itemCat.includes(catName) || catName.includes(itemCat);
                });

                if (catItems.length > 0) {
                    const orderCatRev = catItems.reduce((sum, it) => sum + ((it.price || 0) * (it.qty || 1)), 0);
                    const orderCatUnits = catItems.reduce((sum, it) => sum + (it.qty || 1), 0);
                    categoryRev += orderCatRev;
                    categoryUnits += orderCatUnits;
                    matchingOrders.push({
                        ...o,
                        categoryItems: catItems,
                        categoryRevenueInOrder: orderCatRev,
                        categoryUnitsInOrder: orderCatUnits
                    });
                } else if (salesByCategory.length === 1 && orders.length > 0) {
                    categoryRev += (o.total || 0);
                    categoryUnits += (o.itemsCount || 1);
                    matchingOrders.push({
                        ...o,
                        categoryItems: o.items || [],
                        categoryRevenueInOrder: o.total || 0,
                        categoryUnitsInOrder: o.itemsCount || 1
                    });
                }
            });

            const rev = item?.revenue ?? categoryRev;
            const ordersCount = matchingOrders.length;
            const aov = ordersCount > 0 ? Math.round(rev / ordersCount) : 0;

            return {
                type: 'category',
                title: `مبيعات قسم: ${catName}`,
                subtitle: 'سجل الطلبات والمنتجات المباعة والإيرادات المحققة في هذا القسم',
                badgeText: `${ordersCount} طلب في هذا القسم`,
                iconType: 'Layers',
                color: item?.color || '#800020',
                totalRevenue: rev,
                ordersCount: ordersCount,
                totalItemsCount: categoryUnits || item?.count || ordersCount,
                aov,
                percentage: item?.percentage ?? 100,
                orders: matchingOrders
            };
        }

        return null;
    }, [selectedSalesBreakdown, orders, currentStats.revenue, salesByCategory.length]);

    const filteredDrilldownOrders = useMemo(() => {
        if (!drilldownDetails?.orders) return [];
        if (!drilldownSearchQuery.trim()) return drilldownDetails.orders;
        const q = drilldownSearchQuery.toLowerCase();
        return drilldownDetails.orders.filter(o =>
            o.id.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.city.toLowerCase().includes(q) ||
            (o.phone && o.phone.includes(q))
        );
    }, [drilldownDetails, drilldownSearchQuery]);

    // Protection guard: loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0DFCD] text-[#800020] flex flex-col items-center justify-center p-6 text-center select-none" dir="rtl">
                <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full border-4 border-[#800020]/20 border-t-[#800020] animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-[#800020] animate-pulse" />
                    </div>
                </div>
                <h2 className="text-xl font-black mb-2">جاري التحقق من صلاحيات الدخول...</h2>
                <p className="text-sm text-[#800020]/70 max-w-sm">يرجى الانتظار بينما نتأكد من مستوى الأمان وتصريح مدير النظام.</p>
            </div>
        );
    }

    // Protection guard: non-admin forbidden screen (403)
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#F0DFCD] text-[#800020] flex flex-col justify-between selection:bg-[#800020] selection:text-[#F0DFCD]" dir="rtl">
                {/* Header */}
                <header className="w-full px-6 sm:px-12 py-6 flex items-center justify-between border-b border-[#800020]/15 bg-[#F0DFCD]">
                    <Link to="/" className="text-3xl sm:text-4xl font-black text-[#800020] tracking-tighter">
                        ثــيــاب
                    </Link>
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm font-bold text-[#800020] hover:bg-[#800020]/10 px-4 py-2 rounded-xl transition"
                    >
                        <Home className="w-4 h-4" />
                        <span>العودة للمتجر</span>
                    </Link>
                </header>

                {/* Main Forbidden Content */}
                <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#800020]/20 text-center relative overflow-hidden"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#800020]/5 rounded-full pointer-events-none blur-2xl" />
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#800020]/5 rounded-full pointer-events-none blur-2xl" />

                        {/* Lock / Shield Icon */}
                        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-3xl bg-rose-500/20 animate-ping opacity-60" />
                            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#800020] to-[#a6173a] text-[#F0DFCD] flex items-center justify-center shadow-xl shadow-[#800020]/25 border border-white/20">
                                <ShieldAlert className="w-12 h-12 text-[#F0DFCD]" />
                            </div>
                        </div>

                        {/* Status badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-black tracking-wider mb-4 border border-rose-200">
                            <Lock className="w-3.5 h-3.5" />
                            <span>خطأ 403 • محظور الوصول</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl font-black text-[#800020] mb-3">
                            منطقة مخصصة لمدير النظام فقط
                        </h1>

                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 max-w-md mx-auto">
                            عذراً، محاولة الدخول إلى لوحة التحكم التنفيذية ممنوعة. هذه الصفحة تتطلب صلاحيات المشرف الأعلى (<span className="font-bold text-[#800020]">Admin</span>) لعرض وإدارة بيانات المتجر.
                        </p>

                        {/* Current User Status Box */}
                        <div className="bg-[#F0DFCD]/60 border border-[#800020]/20 rounded-2xl p-4 text-xs sm:text-sm text-right mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-[#800020]">حالة الحساب الحالي:</span>
                                {user ? (
                                    <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-md font-bold text-xs">
                                        عميل (غير مخوّل بالإدارة)
                                    </span>
                                ) : (
                                    <span className="bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-md font-bold text-xs">
                                        زائر غير مسجل
                                    </span>
                                )}
                            </div>
                            {user ? (
                                <p className="text-gray-700 leading-normal">
                                    أنت مسجل حالياً بحساب <strong className="text-[#800020]">{profile?.full_name || user.email}</strong>. هذا الحساب لا يملك تصريح إدارة. إذا كنت تمتلك حساب المشرف، يرجى تسجيل الخروج والدخول به.
                                </p>
                            ) : (
                                <p className="text-gray-700 leading-normal">
                                    لم تسجل دخولك إلى المتجر بعد. يرجى تسجيل الدخول بحساب مدير النظام للمتابعة.
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                            {user ? (
                                <button
                                    onClick={async () => {
                                        await signOut();
                                        navigate('/login?redirect=/admin');
                                    }}
                                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 font-bold text-sm transition shadow-lg shadow-[#800020]/20 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>تسجيل الخروج والدخول كمسؤول</span>
                                </button>
                            ) : (
                                <Link
                                    to="/login?redirect=/admin"
                                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 font-bold text-sm transition shadow-lg shadow-[#800020]/20 flex items-center justify-center gap-2"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>تسجيل الدخول كمسؤول</span>
                                </Link>
                            )}

                            <Link
                                to="/"
                                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#F0DFCD] text-[#800020] hover:bg-[#800020]/15 font-bold text-sm transition border border-[#800020]/30 flex items-center justify-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                <span>العودة للمتجر الرئيسي</span>
                            </Link>
                        </div>
                    </motion.div>
                </main>

                {/* Footer note */}
                <footer className="text-center py-4 text-xs text-[#800020]/60">
                    نظام الحماية والأمان لمتجر ثياب &copy; {new Date().getFullYear()}
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0DFCD] text-[#800020] pb-24 selection:bg-[#800020] selection:text-[#F0DFCD] admin-sharp-theme" dir="rtl">

            {/* Top Admin Navigation Bar */}
            <div className="bg-[#800020] text-[#F0DFCD] border-b border-[#F0DFCD]/15 shadow-xl sticky top-0 z-40">
                <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-3.5 flex flex-wrap items-center justify-between gap-4">

                    {/* Brand & Badge */}
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-2xl font-black tracking-tighter hover:opacity-90 transition">
                            ثــيــاب
                        </Link>
                        <span className="h-5 w-[1px] bg-[#F0DFCD]/30" />
                        <span className="text-xs sm:text-sm font-bold text-[#F0DFCD]/90 tracking-wide">
                            لوحة الإدارة التنفيذية
                        </span>
                    </div>

                    {/* Quick Access Tabs */}
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 max-w-full">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${activeTab === 'overview'
                                ? 'bg-[#F0DFCD] text-[#800020] shadow-md'
                                : 'text-[#F0DFCD]/80 hover:bg-[#F0DFCD]/10 hover:text-[#F0DFCD]'
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>نظرة عامة</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${activeTab === 'sales'
                                ? 'bg-[#F0DFCD] text-[#800020] shadow-md'
                                : 'text-[#F0DFCD]/80 hover:bg-[#F0DFCD]/10 hover:text-[#F0DFCD]'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span>المبيعات والتحليلات</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition relative ${activeTab === 'orders'
                                ? 'bg-[#F0DFCD] text-[#800020] shadow-md'
                                : 'text-[#F0DFCD]/80 hover:bg-[#F0DFCD]/10 hover:text-[#F0DFCD]'
                                }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>الطلبات</span>
                            {statusCounts.new > 0 && (
                                <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-1.5 py-0.5 rounded-full">
                                    {statusCounts.new}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('add-product')}
                            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${activeTab === 'add-product'
                                ? 'bg-[#F0DFCD] text-[#800020] shadow-md'
                                : 'text-[#F0DFCD]/80 hover:bg-[#F0DFCD]/10 hover:text-[#F0DFCD]'
                                }`}
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>إضافة منتج</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${activeTab === 'products'
                                ? 'bg-[#F0DFCD] text-[#800020] shadow-md'
                                : 'text-[#F0DFCD]/80 hover:bg-[#F0DFCD]/10 hover:text-[#F0DFCD]'
                                }`}
                        >
                            <Boxes className="w-4 h-4" />
                            <span>المخزون ({productsList.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('offer')}
                            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition relative ${activeTab === 'offer'
                                ? 'bg-[#F0DFCD] text-[#800020] shadow-md'
                                : 'text-[#F0DFCD]/80 hover:bg-[#F0DFCD]/10 hover:text-[#F0DFCD]'
                                }`}
                        >
                            <Clock className="w-4 h-4 text-amber-300" />
                            <span>العرض والتوقيت</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </button>

                        <button
                            onClick={() => setActiveTab('sections')}
                            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition relative ${activeTab === 'sections'
                                ? 'bg-[#F0DFCD] text-[#800020] shadow-md'
                                : 'text-[#F0DFCD]/80 hover:bg-[#F0DFCD]/10 hover:text-[#F0DFCD]'
                                }`}
                        >
                            <Layers className="w-4 h-4" />
                            <span>أقسام الصفحة الرئيسية</span>
                        </button>
                    </div>

                    {/* Storefront Link & Actions */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/"
                            className="text-xs font-bold text-[#F0DFCD]/80 hover:text-[#F0DFCD] flex items-center gap-1.5 transition bg-white/10 px-3 py-1.5 rounded-lg border border-[#F0DFCD]/10"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>معاينة المتجر</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 pt-8">

                {/* ========================================================================= */}
                {/* 1. OVERVIEW & ANALYTICS TAB */}
                {/* ========================================================================= */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/25 p-6 rounded-3xl border border-[#800020]/10 backdrop-blur-sm shadow-sm">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-[#800020]">
                                    مرحباً بك في لوحة تحكم ثياب
                                </h1>
                                <p className="text-sm font-semibold text-[#800020]/70 mt-1">
                                    متابعة فورية للمبيعات، مؤشرات الأداء، وتوزيع الطلبات وحركة المخزون.
                                </p>
                            </div>

                            {/* Time Period Filter */}
                            <div className="flex items-center gap-3 sm:gap-4 flex-wrap self-start sm:self-auto">
                                {[
                                    { id: 'today', label: 'اليوم' },
                                    { id: 'week', label: 'هذا الأسبوع' },
                                    { id: 'month', label: 'هذا الشهر' },
                                    { id: 'year', label: 'هذا العام' },
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSalesPeriod(p.id)}
                                        className={`px-6 py-2.5 rounded-sm font-bold text-sm transition-all duration-300 ${salesPeriod === p.id
                                            ? 'bg-[#800020] text-[#F0DFCD] shadow-lg'
                                            : 'bg-transparent text-[#800020] hover:bg-[#800020]/5'
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Top 4 KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                            {/* Revenue Card */}
                            <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm relative overflow-hidden group transition">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider text-[#800020]/60">
                                        إجمالي الإيرادات
                                    </span>
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center shadow-md">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-[#800020] tracking-tight">
                                        {currentStats.revenue.toLocaleString('ar-SA')}
                                    </span>
                                    <RiyalIcon size="1.2em" />
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
                                    <span className="flex items-center gap-0.5 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                        {currentStats.growth}
                                    </span>
                                    <span className="text-[#800020]/60">مقارنة بالفترة السابقة</span>
                                </div>
                            </div>

                            {/* Total Orders Card */}
                            <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm relative overflow-hidden group transition">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider text-[#800020]/60">
                                        عدد الطلبات
                                    </span>
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center shadow-md">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-[#800020] tracking-tight">
                                        {currentStats.ordersCount.toLocaleString('ar-SA')}
                                    </span>
                                    <span className="text-sm font-bold text-[#800020]/60">طلب مؤكد</span>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
                                    <span className="flex items-center gap-0.5 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                        +11.8%
                                    </span>
                                    <span className="text-[#800020]/60">حجم الطلبات النشطة</span>
                                </div>
                            </div>

                            {/* Average Order Value (AOV) Card */}
                            <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm relative overflow-hidden group transition">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider text-[#800020]/60">
                                        متوسط قيمة السلة
                                    </span>
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center shadow-md">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-[#800020] tracking-tight">
                                        {currentStats.aov.toLocaleString('ar-SA')}
                                    </span>
                                    <RiyalIcon size="1.2em" />
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
                                    <span className="flex items-center gap-0.5 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                        +5.2%
                                    </span>
                                    <span className="text-[#800020]/60">لكل عميل فريد</span>
                                </div>
                            </div>

                            {/* Conversion Rate Card */}
                            <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm relative overflow-hidden group transition">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider text-[#800020]/60">
                                        معدل التحويل وزيارات المتجر
                                    </span>
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center shadow-md">
                                        <Users className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-[#800020] tracking-tight">
                                        {currentStats.conversionRate}
                                    </span>
                                    <span className="text-sm font-bold text-[#800020]/60">
                                        ({currentStats.visitors.toLocaleString('ar-SA')} زيارة)
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
                                    <span className="flex items-center gap-0.5 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                        +0.4%
                                    </span>
                                    <span className="text-[#800020]/60">أداء الحملات الإعلانية</span>
                                </div>
                            </div>

                        </div>

                        {/* Middle Section: Interactive Sales Bar Chart & Quick Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Interactive Sales Chart */}
                            <div className="lg:col-span-2 bg-white/25 p-7 rounded-3xl border border-[#800020]/10 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-black text-[#800020]">
                                            حركة المبيعات اليومية
                                        </h2>
                                        <p className="text-xs font-semibold text-[#800020]/60">
                                            توزيع الإيرادات وقيم الطلبات على مدار أيام الأسبوع
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('sales')}
                                        className="text-xs font-bold text-[#800020] hover:underline flex items-center gap-1"
                                    >
                                        <span>عرض تقرير المبيعات المفصل</span>
                                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                    </button>
                                </div>

                                {/* Custom Visual Bar Chart */}
                                <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-[#800020]/15">
                                    {salesTimelineData.map((bar, i) => {
                                        const maxRev = 50000;
                                        const heightPercent = Math.min(100, Math.round((bar.revenue / maxRev) * 100));
                                        return (
                                            <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                                {/* Value Tooltip pill on hover */}
                                                <div className="opacity-0 group-hover:opacity-100 transition duration-200 bg-[#800020] text-[#F0DFCD] text-[10px] font-black py-1 px-2 rounded-lg whitespace-nowrap shadow-lg flex items-center gap-1">
                                                    <span>{bar.revenue.toLocaleString('ar-SA')}</span>
                                                    <RiyalIcon size="0.85em" />
                                                </div>

                                                {/* Bar element */}
                                                <div
                                                    className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-[#800020] to-[#b33951] group-hover:from-[#9e1b32] group-hover:to-[#800020] transition-all duration-300 shadow-sm relative overflow-hidden"
                                                    style={{ height: `${heightPercent}%` }}
                                                >
                                                    <div className="absolute inset-x-0 top-0 h-1 bg-[#F0DFCD]/40" />
                                                </div>

                                                {/* Label */}
                                                <span className="text-xs font-bold text-[#800020]/80 group-hover:text-[#800020] transition">
                                                    {bar.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-between text-xs font-bold text-[#800020]/70 pt-2">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-3 h-3 rounded-md bg-[#800020]" />
                                            <span>إيرادات المبيعات المحققة</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                            <span>أعلى يوم مبيعاً: {topSalesDay?.revenue > 0 ? `${topSalesDay.label} (${topSalesDay.revenue.toLocaleString('ar-SA')} ر.س)` : 'لا توجد مبيعات بعد'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="h-full">

                                {/* Quick Admin Actions Box */}
                                <div className="bg-[#800020] text-[#F0DFCD] p-6 rounded-3xl shadow-lg relative overflow-hidden h-full flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-base font-black mb-2 text-white">
                                            إجراءات إدارية سريعة
                                        </h3>
                                        <p className="text-xs text-[#F0DFCD]/80 mb-5 leading-relaxed">
                                            أضف منتجات جديدة، راجع الطلبات الجديدة أو عدل المخزون بنقرة واحدة.
                                        </p>
                                    </div>

                                    <div className="space-y-2.5">
                                        <button
                                            onClick={() => setActiveTab('add-product')}
                                            className="w-full bg-white/10 hover:bg-[#F0DFCD] text-white hover:text-[#800020] transition-all duration-200 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between border border-white/15 hover:border-[#F0DFCD] shadow-sm group cursor-pointer"
                                        >
                                            <span className="flex items-center gap-2">
                                                <PlusCircle className="w-4 h-4 text-white group-hover:text-[#800020] transition-colors" />
                                                إضافة منتج جديد للمتجر
                                            </span>
                                            <ArrowRight className="w-4 h-4 rotate-180 text-white group-hover:text-[#800020] transition-colors" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setActiveTab('orders');
                                                setOrderFilterStatus('new');
                                            }}
                                            className="w-full bg-white/10 hover:bg-[#F0DFCD] text-white hover:text-[#800020] transition-all duration-200 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between border border-white/15 hover:border-[#F0DFCD] shadow-sm group cursor-pointer"
                                        >
                                            <span className="flex items-center gap-2">
                                                <ShoppingBag className="w-4 h-4 text-white group-hover:text-[#800020] transition-colors" />
                                                مراجعة الطلبات الجديدة ({statusCounts.new})
                                            </span>
                                            <ArrowRight className="w-4 h-4 rotate-180 text-white group-hover:text-[#800020] transition-colors" />
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('products')}
                                            className="w-full bg-white/10 hover:bg-[#F0DFCD] text-white hover:text-[#800020] transition-all duration-200 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between border border-white/15 hover:border-[#F0DFCD] shadow-sm group cursor-pointer"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Boxes className="w-4 h-4 text-white group-hover:text-[#800020] transition-colors" />
                                                إدارة المخزون والتوافر
                                            </span>
                                            <ArrowRight className="w-4 h-4 rotate-180 text-white group-hover:text-[#800020] transition-colors" />
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('offer')}
                                            className="w-full bg-white/10 hover:bg-[#F0DFCD] text-white hover:text-[#800020] transition-all duration-200 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between border border-white/15 hover:border-[#F0DFCD] shadow-sm group cursor-pointer"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-white group-hover:text-[#800020] transition-colors" />
                                                تخصيص عرض الصفحة الرئيسية
                                            </span>
                                            <ArrowRight className="w-4 h-4 rotate-180 text-white group-hover:text-[#800020] transition-colors" />
                                        </button>
                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* Recent Orders Overview Widget */}
                        <div className="bg-white/25 rounded-3xl border border-[#800020]/10 shadow-sm overflow-hidden">
                            <div className="p-6 sm:p-7 pb-5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-[#800020]">
                                        أحدث الطلبات الواردة
                                    </h2>
                                    <p className="text-xs font-semibold text-[#800020]/60">
                                        الطلبات الأخيرة المسجلة على المتجر مع حالتها
                                    </p>
                                </div>

                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className="bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 transition px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow"
                                >
                                    <span>الانتقال لجميع الطلبات ({orders.length})</span>
                                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                </button>
                            </div>

                            {/* Mini table - Background extends across the entire rectangle */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-center text-xs font-semibold">
                                    <thead>
                                        <tr className="bg-[#800020] text-[#F0DFCD] border-b border-[#800020]/20 font-black">
                                            <th className="py-3.5 px-4 text-center text-[#F0DFCD]">رقم الطلب</th>
                                            <th className="py-3.5 px-4 text-center text-[#F0DFCD]">العميل</th>
                                            <th className="py-3.5 px-4 text-center text-[#F0DFCD]">المدينة</th>
                                            <th className="py-3.5 px-4 text-center text-[#F0DFCD]">العناصر</th>
                                            <th className="py-3.5 px-4 text-center text-[#F0DFCD]">الإجمالي</th>
                                            <th className="py-3.5 px-4 text-center text-[#F0DFCD]">طريقة الدفع</th>
                                            <th className="py-3.5 px-4 text-center text-[#F0DFCD]">الحالة</th>
                                            <th className="py-3.5 px-4 text-center text-[#F0DFCD]">الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#800020]/10">
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="py-8 text-center text-xs font-bold text-[#800020]/60">
                                                    لا توجد طلبات مسجلة حتى الآن
                                                </td>
                                            </tr>
                                        ) : orders.slice(0, 5).map(ord => {
                                            const meta = orderStatusMeta[ord.status] || orderStatusMeta.new;
                                            return (
                                                <tr key={ord.id} className="hover:bg-[#800020]/5 transition">
                                                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[#800020]">
                                                        {ord.id}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-[#800020]">
                                                        {ord.customerName}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center text-[#800020]/80">
                                                        {ord.city}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center text-[#800020]/80">
                                                        {ord.itemsCount} منتج
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-[#800020]">
                                                        <div className="inline-flex items-center justify-center gap-1">
                                                            <span>{ord.total.toFixed(2)}</span>
                                                            <RiyalIcon size="0.85em" />
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center text-[#800020]/80">
                                                        {ord.paymentMethod}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${meta.badgeColor}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                                                            {meta.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <button
                                                            onClick={() => setSelectedOrderDetails(ord)}
                                                            className="shine-button relative overflow-hidden bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 active:scale-95 transition px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm cursor-pointer group"
                                                        >
                                                            <span className="shine-effect z-10" />
                                                            <span className="relative z-20 inline-flex items-center gap-1.5">
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span>تفاصيل</span>
                                                            </span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}


                {/* ========================================================================= */}
                {/* 2. SALES & ANALYTICS BREAKDOWN TAB (تحليلات المبيعات والأقسام) */}
                {/* ========================================================================= */}
                {activeTab === 'sales' && (
                    <div className="space-y-8">
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-[#800020] flex items-center gap-2.5">
                                    <BarChart3 className="w-7 h-7 text-[#800020]" />
                                    <span>تحليلات المبيعات والأداء حسب الأقسام</span>
                                </h1>
                                <p className="text-sm font-semibold text-[#800020]/70 mt-1">
                                    أشكال ومخططات بيانية تفاعلية لمتابعة المبيعات وتطور الإيرادات لكل قسم مع تفاصيل دقيقة لكل قطاع.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => showToast(`تم تصدير تقرير تحليلات ${analyticsDept === 'all' ? 'جميع الأقسام' : analyticsDept === 'men' ? 'القسم الرجالي' : analyticsDept === 'women' ? 'القسم النسائي' : 'قسم الإكسسوارات'} بصيغة Excel`, 'sparkle')}
                                className="relative overflow-hidden group cursor-pointer bg-[#800020] text-[#F0DFCD] border border-[#800020] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-sm self-start sm:self-auto active:scale-95 transition-all duration-300"
                            >
                                <span className="absolute -inset-x-24 -inset-y-16 bg-[#F0DFCD] -translate-x-[160%] skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0 pointer-events-none z-0" />
                                <span className="relative z-10 flex items-center gap-2 text-[#F0DFCD] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[150%] group-hover:opacity-0">
                                    <Download className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
                                    <span>تصدير تقرير التحليلات (Excel)</span>
                                </span>
                                <span className="absolute inset-0 z-20 flex items-center justify-center gap-2 px-5 py-2.5 text-[#800020] pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                                    <Download className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
                                    <span>تصدير تقرير التحليلات (Excel)</span>
                                </span>
                                <span className="shine-effect z-30" />
                            </button>
                        </div>

                        {/* 1. Top Department Navigation Bar (التنقل بين الأقسام من الأعلى) */}
                        <div className="bg-white/30 backdrop-blur-xs p-3 rounded-3xl border border-[#800020]/15 shadow-sm space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    {[
                                        { id: 'all', label: 'جميع الأقسام', icon: Layers, desc: 'إجمالي أداء المتجر' },
                                        { id: 'men', label: 'القسم الرجالي', icon: Users, desc: 'معاطف وأصواف وثياب' },
                                        { id: 'women', label: 'القسم النسائي', icon: Sparkles, desc: 'عبايات وإطلالات فاخرة' },
                                        { id: 'unisex', label: 'قسم الإكسسوارات', icon: Tag, desc: 'ساعات وعطور ومقتنيات' }
                                    ].map(dept => {
                                        const isSelected = analyticsDept === dept.id;
                                        const IconComp = dept.icon;
                                        return (
                                            <button
                                                key={dept.id}
                                                type="button"
                                                onClick={() => {
                                                    setAnalyticsDept(dept.id);
                                                    setAnalyticsSubCat('all');
                                                }}
                                                className={`relative overflow-hidden group cursor-pointer px-4 sm:px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all duration-300 border ${
                                                    isSelected
                                                        ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-md ring-2 ring-[#800020]/20'
                                                        : 'bg-white/60 text-[#800020] border-[#800020]/15 shadow-2xs'
                                                }`}
                                            >
                                                {!isSelected && (
                                                    <span className="absolute -inset-x-24 -inset-y-16 bg-[#800020] -translate-x-[160%] skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0 pointer-events-none z-0" />
                                                )}

                                                {/* Base Layer */}
                                                <span className={`relative z-10 flex items-center gap-2.5 w-full h-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                                                    isSelected ? 'text-[#F0DFCD]' : 'text-[#800020] group-hover:-translate-y-[150%] group-hover:opacity-0'
                                                }`}>
                                                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20 text-[#F0DFCD]' : 'bg-[#800020]/10 text-[#800020]'}`}>
                                                        <IconComp className="w-4 h-4" />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block leading-tight font-black">{dept.label}</span>
                                                        <span className={`text-[10px] font-bold block ${isSelected ? 'text-[#F0DFCD]/80' : 'text-[#800020]/60'}`}>
                                                            {dept.desc}
                                                        </span>
                                                    </div>
                                                </span>

                                                {/* Hover Roll-in Layer (تغيير نص ولون بزاوية 45) */}
                                                {!isSelected && (
                                                    <span className="absolute inset-0 z-20 flex items-center gap-2.5 px-4 sm:px-5 py-3 w-full h-full pointer-events-none text-[#F0DFCD] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                                                        <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/20 text-[#F0DFCD] shrink-0">
                                                            <IconComp className="w-4 h-4" />
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="block leading-tight font-black">{dept.label}</span>
                                                            <span className="text-[10px] font-bold block text-[#F0DFCD]/80">
                                                                {dept.desc}
                                                            </span>
                                                        </div>
                                                    </span>
                                                )}

                                                <span className="shine-effect z-30" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Subcategory Pills Filter when a department is selected */}
                            {analyticsDept !== 'all' && departmentAnalytics.subCatsList?.length > 1 && (
                                <div className="pt-2 border-t border-[#800020]/10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                    <span className="text-xs font-bold text-[#800020]/70 shrink-0 ml-1">تصفية حسب التصنيف:</span>
                                    {departmentAnalytics.subCatsList.map(cat => {
                                        const isSelected = analyticsSubCat === cat;
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setAnalyticsSubCat(cat)}
                                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                                                    isSelected
                                                        ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-xs'
                                                        : 'bg-white/50 hover:bg-white text-[#800020] border-[#800020]/15'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 2. Key Metrics Cards for the Selected Department */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm relative overflow-hidden group">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider text-[#800020]/60">
                                        إيرادات {analyticsDept === 'all' ? 'المتجر بالكامل' : analyticsDept === 'men' ? 'القسم الرجالي' : analyticsDept === 'women' ? 'القسم النسائي' : 'قسم الإكسسوارات'}
                                    </span>
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center shadow-md">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-[#800020] tracking-tight">
                                        {departmentAnalytics.revenue.toLocaleString('ar-SA')}
                                    </span>
                                    <RiyalIcon size="1.2em" />
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
                                    <span className="flex items-center gap-0.5 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                        {departmentAnalytics.sharePercentage}%
                                    </span>
                                    <span className="text-[#800020]/60">حصة القسم من مبيعات المتجر</span>
                                </div>
                            </div>

                            <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm relative overflow-hidden group">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider text-[#800020]/60">
                                        الطلبات المحققة
                                    </span>
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center shadow-md">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-[#800020] tracking-tight">
                                        {departmentAnalytics.ordersCount}
                                    </span>
                                    <span className="text-sm font-bold text-[#800020]/60">طلب مكتمل</span>
                                </div>
                                <div className="mt-3 text-xs font-bold text-[#800020]/70">
                                    إجمالي {departmentAnalytics.unitsSold} قطعة مباعة
                                </div>
                            </div>

                            <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm relative overflow-hidden group">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider text-[#800020]/60">
                                        متوسط قيمة الطلب
                                    </span>
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center shadow-md">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-[#800020] tracking-tight">
                                        {departmentAnalytics.aov.toLocaleString('ar-SA')}
                                    </span>
                                    <RiyalIcon size="1.2em" />
                                </div>
                                <div className="mt-3 text-xs font-bold text-emerald-700">
                                    معدل إنفاق العميل في هذا القسم
                                </div>
                            </div>

                            <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm relative overflow-hidden group">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider text-[#800020]/60">
                                        حالة مخزون القسم
                                    </span>
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center shadow-md">
                                        <Boxes className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-[#800020] tracking-tight">
                                        {departmentAnalytics.stockHealth.total}
                                    </span>
                                    <span className="text-sm font-bold text-[#800020]/60">منتج مسجل</span>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs font-bold">
                                    <span className="text-emerald-700">{departmentAnalytics.stockHealth.inStock} متوفر</span>
                                    <span className="text-[#800020]/30">•</span>
                                    <span className="text-amber-700">{departmentAnalytics.stockHealth.lowStock} وشك النفاد</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. VISUAL CHARTS SUITE (الأشكال البيانية للأقسام) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                            {/* Chart 1: Interactive Timeline Chart (Bars / Smooth Area) (8 cols on lg) */}
                            <div className="lg:col-span-8 bg-white/30 backdrop-blur-xs p-6 sm:p-7 rounded-3xl border border-[#800020]/10 shadow-sm flex flex-col justify-between">
                                {/* Header with Metric & View Switchers */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-[#800020]/10 text-[#800020] flex items-center justify-center shrink-0">
                                            <BarChart3 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-base sm:text-lg font-black text-[#800020]">
                                                حركة المبيعات والنشاط اليومي
                                            </h2>
                                            <p className="text-xs font-semibold text-[#800020]/60 mt-0.5">
                                                {analyticsDept === 'all' ? 'كافة أقسام المتجر' : analyticsDept === 'men' ? 'القسم الرجالي' : analyticsDept === 'women' ? 'القسم النسائي' : 'قسم الإكسسوارات'} • متابعة أداء الأسبوع
                                            </p>
                                        </div>
                                    </div>

                                    {/* Interactive Minimal Controls */}
                                    <div className="flex items-center gap-2 self-start sm:self-auto">
                                        {/* Metric Switcher - Background extends across the full rectangle */}
                                        <div className="bg-white/80 rounded-xl border border-[#800020]/25 flex items-stretch shadow-2xs overflow-hidden divide-x divide-x-reverse divide-[#800020]/15">
                                            {[
                                                { id: 'revenue', label: 'الإيرادات' },
                                                { id: 'orders', label: 'الطلبات' }
                                            ].map(m => {
                                                const isSelected = analyticsMetric === m.id;
                                                return (
                                                    <button
                                                        key={m.id}
                                                        type="button"
                                                        onClick={() => setAnalyticsMetric(m.id)}
                                                        className="relative overflow-hidden group cursor-pointer px-4 py-2 text-xs font-black transition-all duration-300 flex-1 text-center"
                                                    >
                                                        <span className={`absolute inset-0 w-full h-full bg-[#800020] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] z-0 ${
                                                            isSelected ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'
                                                        }`} />
                                                        <span className={`relative z-10 transition-colors duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                                                            isSelected ? 'text-[#F0DFCD]' : 'text-[#800020] group-hover:text-[#F0DFCD]'
                                                        }`}>
                                                            {m.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* View Switcher: Bars vs Area - Background extends across the full square */}
                                        <div className="bg-white/80 rounded-xl border border-[#800020]/25 flex items-stretch shadow-2xs overflow-hidden divide-x divide-x-reverse divide-[#800020]/15">
                                            {[
                                                { id: 'bars', icon: BarChart3, title: 'أعمدة بيانية' },
                                                { id: 'area', icon: AreaChart, title: 'منحنى بياني انسيابي' }
                                            ].map(v => {
                                                const isSelected = analyticsChartView === v.id;
                                                const Icon = v.icon;
                                                return (
                                                    <button
                                                        key={v.id}
                                                        type="button"
                                                        onClick={() => setAnalyticsChartView(v.id)}
                                                        title={v.title}
                                                        className="relative overflow-hidden group cursor-pointer w-9 h-8 flex items-center justify-center transition-all duration-300"
                                                    >
                                                        <span className={`absolute inset-0 w-full h-full bg-[#800020] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] z-0 ${
                                                            isSelected ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'
                                                        }`} />
                                                        <span className={`relative z-10 flex items-center justify-center transition-colors duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                                                            isSelected ? 'text-[#F0DFCD]' : 'text-[#800020] group-hover:text-[#F0DFCD]'
                                                        }`}>
                                                            <Icon className="w-4 h-4" />
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {(() => {
                                    const maxVal = Math.max(
                                        1,
                                        ...departmentAnalytics.timeline.map(t => analyticsMetric === 'revenue' ? t.revenue : t.orders)
                                    );
                                    const totalVal = departmentAnalytics.timeline.reduce(
                                        (sum, t) => sum + (analyticsMetric === 'revenue' ? t.revenue : t.orders),
                                        0
                                    );
                                    // Dynamically calculate the highest sales day for the active metric (not hardcoded to Wednesday)
                                    const topDayForMetric = departmentAnalytics.timeline && departmentAnalytics.timeline.length > 0
                                        ? departmentAnalytics.timeline.reduce((max, d) => {
                                            const val = analyticsMetric === 'revenue' ? d.revenue : d.orders;
                                            const maxVal = analyticsMetric === 'revenue' ? max.revenue : max.orders;
                                            return val > maxVal ? d : max;
                                        }, departmentAnalytics.timeline[0])
                                        : null;

                                    const activeIdx = hoveredDayIdx !== null
                                        ? hoveredDayIdx
                                        : (topDayForMetric ? topDayForMetric.dayIndex : 0);

                                    const activeDay = departmentAnalytics.timeline[activeIdx] || departmentAnalytics.timeline[0];
                                    const activeVal = analyticsMetric === 'revenue' ? activeDay.revenue : activeDay.orders;
                                    const activeShare = totalVal > 0 ? Math.round((activeVal / totalVal) * 100) : 0;
                                    const isTop = topDayForMetric && activeDay.label === topDayForMetric.label;

                                    return (
                                        <div className="space-y-6 mt-4">
                                            {/* Dynamic Hero Readout with Fixed Height to Prevent Jitter */}
                                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#800020]/10 min-h-[80px]">
                                                <div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl sm:text-4xl font-black text-[#800020] tracking-tight tabular-nums">
                                                            {activeVal.toLocaleString('ar-SA')}
                                                        </span>
                                                        {analyticsMetric === 'revenue' ? (
                                                            <RiyalIcon size="1em" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-[#800020]/70">طلب مكتمل</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1.5 text-xs min-h-[26px]">
                                                        <span className="font-black text-[#800020] bg-[#800020]/10 px-2 py-0.5 rounded-md">
                                                            يوم {activeDay.label}
                                                        </span>
                                                        <span className="text-[#800020]/30">•</span>
                                                        <span className="text-[#800020]/70 font-semibold">
                                                            يمثل {activeShare}% من نشاط الأسبوع
                                                        </span>
                                                        {isTop && (
                                                            <span className="text-amber-800 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-md font-bold text-[11px] whitespace-nowrap">
                                                                أعلى أداء في القسم
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right sm:text-left text-xs font-semibold text-[#800020]/60 space-y-0.5 shrink-0">
                                                    <div>
                                                        إجمالي الأسبوع: <span className="font-black text-[#800020]">{totalVal.toLocaleString('ar-SA')}</span> {analyticsMetric === 'revenue' ? 'ر.س' : 'طلب'}
                                                    </div>
                                                    <div className="text-[11px]">
                                                        المعدل اليومي: <span className="font-bold text-[#800020]">{Math.round(totalVal / 7).toLocaleString('ar-SA')}</span> {analyticsMetric === 'revenue' ? 'ر.س' : 'طلب'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Chart Visual Canvas with Prices on the Right */}
                                            <div
                                                className="flex items-stretch gap-2 sm:gap-4 h-64 sm:h-72"
                                                onMouseLeave={() => setHoveredDayIdx(null)}
                                            >
                                                {/* 1. Right Column: Dedicated Y-Axis Prices in Bold Burgundy */}
                                                <div className="w-16 sm:w-20 shrink-0 flex flex-col justify-between pb-8 pt-1 text-right select-none">
                                                    {[1, 0.66, 0.33, 0].map((step, idx) => {
                                                        const val = Math.round(maxVal * step);
                                                        return (
                                                            <span key={idx} className="text-xs sm:text-sm font-black text-[#800020] leading-none">
                                                                {val.toLocaleString('ar-SA')} {analyticsMetric === 'revenue' ? 'ر.س' : ''}
                                                            </span>
                                                        );
                                                    })}
                                                </div>

                                                {/* 2. Main Chart Canvas Area with Proximity Detection */}
                                                <div
                                                    className="flex-1 relative h-full flex flex-col justify-between"
                                                    onMouseMove={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        if (rect.width <= 0) return;
                                                        // In RTL, Saturday (idx 0) is on the right, Friday (idx 6) is on the left
                                                        const xFromRight = rect.right - e.clientX;
                                                        const ratio = Math.max(0, Math.min(1, xFromRight / rect.width));
                                                        const closestIdx = Math.round(ratio * (departmentAnalytics.timeline.length - 1));
                                                        if (closestIdx >= 0 && closestIdx < departmentAnalytics.timeline.length) {
                                                            setHoveredDayIdx(closestIdx);
                                                        }
                                                    }}
                                                    onMouseLeave={() => setHoveredDayIdx(null)}
                                                >
                                                    {/* Mode: BARS */}
                                                    {analyticsChartView === 'bars' && (
                                                        <div className="relative z-10 flex flex-col justify-between h-full">
                                                            {/* Bars Drawing Area - Sits strictly ABOVE the baseline */}
                                                            <div className="flex-1 flex items-end justify-between gap-1 sm:gap-3 border-b-2 border-[#800020]/40 px-2 pb-0">
                                                                {departmentAnalytics.timeline.map((bar, idx) => {
                                                                    const val = analyticsMetric === 'revenue' ? bar.revenue : bar.orders;
                                                                    const heightPercent = maxVal > 0 ? Math.max(6, Math.round((val / maxVal) * 100)) : 6;
                                                                    const isHovered = hoveredDayIdx === idx;
                                                                    const isDimmed = hoveredDayIdx !== null && !isHovered;

                                                                    return (
                                                                        <div
                                                                            key={bar.label}
                                                                            onMouseEnter={() => setHoveredDayIdx(idx)}
                                                                            onClick={() => setHoveredDayIdx(idx)}
                                                                            className="flex-1 h-full flex items-end justify-center cursor-pointer group"
                                                                        >
                                                                            {/* Bar - Clean solid burgundy, fully illuminated by default, NO golden border */}
                                                                            <div
                                                                                style={{ height: `${heightPercent}%` }}
                                                                                className={`w-7 sm:w-11 rounded-t-xl transition-all duration-200 relative shadow-xs bg-[#800020] ${
                                                                                    isDimmed ? 'opacity-30' : 'opacity-100'
                                                                                }`}
                                                                            >
                                                                                <div className="absolute inset-x-0 top-0 h-1 bg-white/35 rounded-t-xl" />
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* Day Labels - Sit strictly UNDER the baseline with NO underline */}
                                                            <div className="h-8 flex items-center justify-between px-2 pt-2">
                                                                {departmentAnalytics.timeline.map((bar, idx) => {
                                                                    const isHovered = hoveredDayIdx === idx;
                                                                    return (
                                                                        <button
                                                                            key={bar.label}
                                                                            type="button"
                                                                            onClick={() => setHoveredDayIdx(idx)}
                                                                            className={`flex-1 text-center text-xs sm:text-sm font-bold text-[#800020] transition-colors cursor-pointer ${
                                                                                hoveredDayIdx !== null && isHovered
                                                                                    ? 'font-black opacity-100'
                                                                                    : hoveredDayIdx !== null
                                                                                        ? 'opacity-40'
                                                                                        : 'opacity-100'
                                                                            }`}
                                                                        >
                                                                            {bar.label}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Mode: AREA / LINE CURVE */}
                                                    {analyticsChartView === 'area' && (() => {
                                                        const svgWidth = 620;
                                                        const svgHeight = 185;
                                                        const paddingX = 35;
                                                        const usableWidth = svgWidth - paddingX * 2;
                                                        const baseY = 185;
                                                        const usableHeight = 150;

                                                        // In RTL, Day 0 (السبت) is on the right, Day 6 (الجمعة) is on the left
                                                        const pts = departmentAnalytics.timeline.map((d, i) => {
                                                            const val = analyticsMetric === 'revenue' ? d.revenue : d.orders;
                                                            const x = (svgWidth - paddingX) - i * (usableWidth / 6);
                                                            const y = baseY - (val / maxVal) * usableHeight;
                                                            return { x, y, val, ...d };
                                                        });

                                                        // Sort left to right for SVG path continuity
                                                        const sortedPts = [...pts].sort((a, b) => a.x - b.x);

                                                        let pathD = `M ${sortedPts[0].x} ${sortedPts[0].y}`;
                                                        for (let i = 0; i < sortedPts.length - 1; i++) {
                                                            const p0 = sortedPts[i];
                                                            const p1 = sortedPts[i + 1];
                                                            const mx = (p0.x + p1.x) / 2;
                                                            pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
                                                        }
                                                        const areaD = `${pathD} L ${sortedPts[sortedPts.length - 1].x} ${baseY} L ${sortedPts[0].x} ${baseY} Z`;

                                                        const activePt = hoveredDayIdx !== null ? pts[hoveredDayIdx] : (topDayForMetric ? pts[topDayForMetric.dayIndex] : pts[0]);

                                                        return (
                                                            <div className="relative z-10 flex flex-col justify-between h-full">
                                                                {/* Area Curve Canvas - Sits strictly ABOVE the long baseline border */}
                                                                <div className="flex-1 relative w-full border-b-2 border-[#800020]/40 overflow-hidden flex items-end">
                                                                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                                                                        <defs>
                                                                            <linearGradient id="sereneAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                                                                <stop offset="0%" stopColor="#800020" stopOpacity="0.32" />
                                                                                <stop offset="65%" stopColor="#800020" stopOpacity="0.08" />
                                                                                <stop offset="100%" stopColor="#800020" stopOpacity="0.00" />
                                                                            </linearGradient>
                                                                        </defs>

                                                                        {/* Area Fill - Touches the long baseline at the bottom */}
                                                                        <path d={areaD} fill="url(#sereneAreaGrad)" />

                                                                        {/* Smooth Line Stroke */}
                                                                        <path d={pathD} fill="none" stroke="#800020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                                                                        {/* Active day vertical tracking guideline (only shown when focused) */}
                                                                        {hoveredDayIdx !== null && (
                                                                            <line
                                                                                x1={activePt.x}
                                                                                y1={activePt.y}
                                                                                x2={activePt.x}
                                                                                y2={baseY}
                                                                                stroke="#800020"
                                                                                strokeWidth="1.5"
                                                                                strokeDasharray="3 3"
                                                                                strokeOpacity="0.6"
                                                                            />
                                                                        )}

                                                                        {/* Node circles - Fully illuminated by default */}
                                                                        {pts.map((pt, idx) => {
                                                                            const isHovered = hoveredDayIdx === idx;
                                                                            return (
                                                                                <g key={pt.label} className="cursor-pointer" onClick={() => setHoveredDayIdx(idx)}>
                                                                                    {hoveredDayIdx !== null && isHovered && (
                                                                                        <circle cx={pt.x} cy={pt.y} r="10" fill="#800020" fillOpacity="0.2" />
                                                                                    )}
                                                                                    <circle
                                                                                        cx={pt.x}
                                                                                        cy={pt.y}
                                                                                        r={hoveredDayIdx !== null ? (isHovered ? 6 : 3.5) : 4.5}
                                                                                        fill={hoveredDayIdx === null || isHovered ? '#800020' : '#ffffff'}
                                                                                        stroke="#800020"
                                                                                        strokeWidth={isHovered ? 3 : 2}
                                                                                        className="transition-all duration-200"
                                                                                    />
                                                                                </g>
                                                                            );
                                                                        })}
                                                                    </svg>
                                                                </div>

                                                                {/* Day labels for area mode - Sit strictly UNDER the baseline with NO underline */}
                                                                <div className="h-8 flex items-center justify-between px-2 pt-2">
                                                                    {departmentAnalytics.timeline.map((bar, idx) => {
                                                                        const isHovered = hoveredDayIdx === idx;
                                                                        return (
                                                                            <button
                                                                                key={bar.label}
                                                                                type="button"
                                                                                onClick={() => setHoveredDayIdx(idx)}
                                                                                className={`flex-1 text-center text-xs sm:text-sm font-bold text-[#800020] transition-colors cursor-pointer ${
                                                                                    hoveredDayIdx !== null && isHovered
                                                                                        ? 'font-black opacity-100'
                                                                                        : hoveredDayIdx !== null
                                                                                            ? 'opacity-40'
                                                                                            : 'opacity-100'
                                                                                }`}
                                                                            >
                                                                                {bar.label}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Bottom Insights Strip */}
                                            <div className="flex flex-wrap items-center justify-between text-xs font-bold text-[#800020]/70 pt-3 border-t border-[#800020]/10 gap-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-[#800020]" />
                                                        <span>{analyticsMetric === 'revenue' ? 'إيراد مبيعات اليوم' : 'عدد الطلبات'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                                                        <span>أعلى يوم: {topDayForMetric?.label}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Chart 2: Subcategories Share & Visual Distribution (4 cols on lg) */}
                            <div className="lg:col-span-4 bg-white/25 p-6 sm:p-7 rounded-3xl border border-[#800020]/10 shadow-sm space-y-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-[#800020]" />
                                        <h2 className="text-lg font-black text-[#800020]">
                                            توزيع حصص التصنيفات
                                        </h2>
                                    </div>
                                    <p className="text-xs font-semibold text-[#800020]/60 mt-1">
                                        نسب المساهمة المالية لكل تصنيف فرعي ضمن القسم
                                    </p>
                                </div>

                                {/* Stacked Multi-Color Progress Bar */}
                                <div className="space-y-1.5">
                                    <div className="h-4 w-full bg-[#800020]/10 rounded-full overflow-hidden flex shadow-inner">
                                        {departmentAnalytics.subcategories.map(cat => (
                                            <div
                                                key={cat.name}
                                                style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                                                className="h-full transition-all duration-500 first:rounded-r-full last:rounded-l-full"
                                                title={`${cat.name}: ${cat.percentage}%`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-[#800020]/60 px-1">
                                        <span>0%</span>
                                        <span>إجمالي حصص القسم 100%</span>
                                    </div>
                                </div>

                                {/* Category List with Bars */}
                                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                    {departmentAnalytics.subcategories.map(cat => (
                                        <div
                                            key={cat.name}
                                            onClick={() => setAnalyticsSubCat(cat.name)}
                                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                                                analyticsSubCat === cat.name
                                                    ? 'bg-white border-[#800020] shadow-sm'
                                                    : 'bg-white/50 hover:bg-white border-[#800020]/10'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                                <span className="font-bold text-[#800020]">{cat.name}</span>
                                                <span className="text-[10px] text-[#800020]/60">({cat.count} قطعة)</span>
                                            </div>
                                            <div className="flex items-center gap-2 font-black text-[#800020]">
                                                <span>{cat.revenue.toLocaleString('ar-SA')}</span>
                                                <RiyalIcon size="0.8em" />
                                                <span className="bg-[#800020]/10 text-[#800020] text-[10px] px-1.5 py-0.5 rounded-md">
                                                    {cat.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Chart 3 & 4: Top Performing Products Horizontal Chart & Payment Methods */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                            {/* Chart 3: Top Performing Products (7 cols) */}
                            <div className="lg:col-span-7 bg-white/25 p-6 sm:p-7 rounded-3xl border border-[#800020]/10 shadow-sm space-y-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-[#800020]" />
                                        <h2 className="text-lg font-black text-[#800020]">
                                            أفضل المنتجات أداءً ومبيعاً في هذا القسم
                                        </h2>
                                    </div>
                                    <p className="text-xs font-semibold text-[#800020]/60 mt-1">
                                        ترتيب القطع الأكثر طلباً وتحقيقاً للأرباح بناءً على إجمالي المبيعات
                                    </p>
                                </div>

                                <div className="space-y-3.5">
                                    {departmentAnalytics.topProducts.length === 0 ? (
                                        <p className="text-xs text-center text-[#800020]/60 py-6">لا توجد بيانات منتجات مسجلة في هذا القسم</p>
                                    ) : (
                                        departmentAnalytics.topProducts.map((prod, idx) => {
                                            const maxProdRev = Math.max(1, ...departmentAnalytics.topProducts.map(p => p.revenue));
                                            const widthPercent = Math.max(15, Math.round((prod.revenue / maxProdRev) * 100));
                                            return (
                                                <div
                                                    key={prod.name}
                                                    className="p-3 bg-white/60 rounded-2xl border border-[#800020]/10 space-y-2 hover:bg-[#800020]/[0.07] hover:border-[#800020]/25 transition-all duration-300 shadow-2xs cursor-pointer group"
                                                >
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-5 h-5 rounded-full bg-[#800020] text-[#F0DFCD] text-[10px] font-black flex items-center justify-center shrink-0">
                                                                {idx + 1}
                                                            </span>
                                                            <div className="w-10 h-10 rounded-xl bg-white border border-[#800020]/15 p-1 flex items-center justify-center overflow-hidden shrink-0">
                                                                <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
                                                            </div>
                                                            <div>
                                                                <span className="font-black text-[#800020] block">{prod.name}</span>
                                                                <span className="text-[10px] text-[#800020]/60">{prod.category || 'أزياء فاخرة'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="text-left font-black text-[#800020]">
                                                            <div className="flex items-center gap-1 justify-end">
                                                                <span>{prod.revenue.toLocaleString('ar-SA')}</span>
                                                                <RiyalIcon size="0.85em" />
                                                            </div>
                                                            <span className="text-[10px] text-[#800020]/60 block">{prod.qty} قطعة مباعة</span>
                                                        </div>
                                                    </div>

                                                    {/* Performance horizontal bar */}
                                                    <div className="h-2 w-full bg-[#800020]/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-[#800020] transition-all duration-700"
                                                            style={{ width: `${widthPercent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Chart 4: Payment Methods & Cities Breakdown for this Department (5 cols) */}
                            <div className="lg:col-span-5 bg-white/25 p-6 sm:p-7 rounded-3xl border border-[#800020]/10 shadow-sm space-y-6">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-[#800020]" />
                                        <h2 className="text-lg font-black text-[#800020]">
                                            تفضيلات وسائل الدفع لهذا القسم
                                        </h2>
                                    </div>
                                    <p className="text-xs font-semibold text-[#800020]/60 mt-1">
                                        خيارات السداد الأكثر استخداماً من قبل عملاء هذا القسم
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {departmentAnalytics.payments.map(pm => (
                                        <div key={pm.name} className="bg-white/60 p-3 rounded-2xl border border-[#800020]/10 space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#800020]" />
                                                    <span className="font-bold text-[#800020]">{pm.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 font-black text-[#800020]">
                                                    <span>{pm.deptCount} عملية</span>
                                                    <span className="text-xs bg-[#800020]/10 px-1.5 py-0.5 rounded-md">
                                                        {pm.deptPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-[#800020]/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-[#800020] transition-all duration-700"
                                                    style={{ width: `${pm.deptPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Geographic distribution for this department */}
                                <div className="pt-3 border-t border-[#800020]/10">
                                    <span className="text-xs font-bold text-[#800020]/80 block mb-2">أعلى المدن طلباً في هذا القسم:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {salesByCity.slice(0, 4).map(c => (
                                            <span key={c.city} className="bg-white px-3 py-1.5 rounded-xl border border-[#800020]/15 text-xs font-bold text-[#800020] flex items-center gap-1 shadow-2xs">
                                                <MapPin className="w-3.5 h-3.5 text-[#800020]/60" />
                                                <span>{c.city}</span>
                                                <span className="text-[10px] opacity-60">({c.percentage}%)</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* 4. DETAILS SECTION BELOW THE CHARTS (التفاصيل تحت لكل قسم) */}
                        <div className="space-y-6">

                            {/* Section Header for Details */}
                            <div className="bg-[#800020] text-[#F0DFCD] p-6 rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-black flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-white" />
                                        <span>تفاصيل وسجل مبيعات ({analyticsDept === 'all' ? 'جميع الأقسام' : analyticsDept === 'men' ? 'القسم الرجالي' : analyticsDept === 'women' ? 'القسم النسائي' : 'قسم الإكسسوارات'})</span>
                                    </h2>
                                    <p className="text-xs font-semibold text-[#F0DFCD]/80 mt-1">
                                        سجل الطلبات التفصيلي ومؤشرات المخزون وحركة الشراء الخاصة بهذا القسم
                                    </p>
                                </div>

                                {/* Search within this department's orders - Beige style */}
                                <div className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        value={analyticsOrderSearch}
                                        onChange={(e) => setAnalyticsOrderSearch(e.target.value)}
                                        placeholder="بحث في طلبات هذا القسم..."
                                        className="w-full bg-[#F0DFCD] text-[#800020] placeholder:text-[#800020]/50 pr-10 pl-4 py-2.5 rounded-2xl text-xs font-bold border border-[#800020]/25 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 shadow-inner transition"
                                    />
                                    <Search className="w-4 h-4 text-[#800020] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    {analyticsOrderSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setAnalyticsOrderSearch('')}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#800020]/70 hover:text-[#800020]"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Subcategories Performance Table */}
                            <div className="bg-white/25 rounded-3xl border border-[#800020]/10 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-[#800020]/10 flex items-center justify-between">
                                    <h3 className="font-black text-sm text-[#800020]">
                                        جدول أداء التصنيفات الفرعية للقسم
                                    </h3>
                                    <span className="text-xs text-[#800020]/60 font-bold">
                                        {departmentAnalytics.subcategories.length} تصنيفات نشطة
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-xs font-semibold overflow-hidden rounded-2xl">
                                        <thead>
                                            <tr className="bg-[#800020] text-[#F0DFCD] border-b border-[#800020]/20 font-black">
                                                <th className="py-3.5 px-4 text-[#F0DFCD]">التصنيف الفرعي</th>
                                                <th className="py-3.5 px-4 text-[#F0DFCD]">القطع المباعة</th>
                                                <th className="py-3.5 px-4 text-[#F0DFCD]">إجمالي الإيرادات</th>
                                                <th className="py-3.5 px-4 text-[#F0DFCD]">نسبة المساهمة</th>
                                                <th className="py-3.5 px-4 text-[#F0DFCD]">متوسط سعر القطعة</th>
                                                <th className="py-3.5 px-4 text-left text-[#F0DFCD]">الإجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#800020]/10">
                                            {departmentAnalytics.subcategories.map(cat => {
                                                const avgPrice = cat.count > 0 ? Math.round(cat.revenue / cat.count) : 0;
                                                return (
                                                    <tr key={cat.name} className="hover:bg-white/30 transition">
                                                        <td className="py-3.5 px-4 font-bold text-[#800020] flex items-center gap-2">
                                                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                                            <span>{cat.name}</span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-[#800020]">
                                                            {cat.count} قطعة
                                                        </td>
                                                        <td className="py-3.5 px-4 font-black text-[#800020]">
                                                            <span>{cat.revenue.toLocaleString('ar-SA')}</span>
                                                            <RiyalIcon size="0.85em" />
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-20 h-2 bg-[#800020]/10 rounded-full overflow-hidden">
                                                                    <div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                                                                </div>
                                                                <span className="font-bold text-[#800020] text-[11px]">{cat.percentage}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-[#800020]/80">
                                                            {avgPrice.toLocaleString('ar-SA')} ر.س
                                                        </td>
                                                        <td className="py-3.5 px-4 text-left">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedSalesBreakdown({ type: 'category', name: cat.name, item: cat });
                                                                    setDrilldownSearchQuery('');
                                                                }}
                                                                className="shine-button relative overflow-hidden bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 active:scale-95 transition px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer group"
                                                            >
                                                                <span className="shine-effect z-10" />
                                                                <span className="relative z-20 inline-flex items-center gap-1.5">
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    <span>تفاصيل الطلبات</span>
                                                                </span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Detailed Orders Table for this department */}
                            <div className="bg-white/25 rounded-3xl border border-[#800020]/10 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-[#800020]/10 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-black text-sm text-[#800020]">
                                            سجل الطلبات المتضمنة لمنتجات ({analyticsDept === 'all' ? 'جميع الأقسام' : analyticsDept === 'men' ? 'القسم الرجالي' : analyticsDept === 'women' ? 'القسم النسائي' : 'قسم الإكسسوارات'})
                                        </h3>
                                        <p className="text-[11px] text-[#800020]/60">
                                            عرض وتصفية الطلبات المباشرة الخاصة بهذا القسم
                                        </p>
                                    </div>

                                    <span className="text-xs font-bold text-[#800020]/80 bg-white/60 px-3 py-1.5 rounded-xl border border-[#800020]/15">
                                        إجمالي {departmentAnalytics.filteredDeptOrders.length} طلبات مسجلة
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-center text-xs font-semibold overflow-hidden rounded-2xl">
                                        <thead>
                                            <tr className="bg-[#800020] text-[#F0DFCD] border-b border-[#800020]/20 font-black">
                                                <th className="py-3.5 px-4 text-center text-[#F0DFCD]">رقم الطلب</th>
                                                <th className="py-3.5 px-4 text-center text-[#F0DFCD]">العميل</th>
                                                <th className="py-3.5 px-4 text-center text-[#F0DFCD]">التاريخ</th>
                                                <th className="py-3.5 px-4 text-center text-[#F0DFCD]">منتجات القسم</th>
                                                <th className="py-3.5 px-4 text-center text-[#F0DFCD]">وسيلة الدفع</th>
                                                <th className="py-3.5 px-4 text-center text-[#F0DFCD]">المدينة</th>
                                                <th className="py-3.5 px-4 text-center text-[#F0DFCD]">المبلغ</th>
                                                <th className="py-3.5 px-4 text-center text-[#F0DFCD]">الإجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#800020]/10">
                                            {departmentAnalytics.filteredDeptOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="py-12 text-center text-xs font-bold text-[#800020]/60">
                                                        {orders.length === 0
                                                            ? 'لا توجد طلبات مسجلة في المتجر حتى الآن'
                                                            : 'لا توجد طلبات مطابقة للبحث ضمن هذا القسم'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                departmentAnalytics.filteredDeptOrders.slice(0, 15).map(order => (
                                                    <tr key={order.id} className="hover:bg-white/30 transition">
                                                        <td className="py-3.5 px-4 text-center font-mono font-black text-[#800020]">
                                                            #{order.id}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center font-bold text-[#800020]">
                                                            {order.customerName}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center text-[#800020]/70">
                                                            {order.date}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center text-[#800020]">
                                                            <span className="font-bold">
                                                                {order.deptItems ? `${order.deptItems.length} منتجات` : `${order.itemsCount || 1} منتج`}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center text-[#800020]/80">
                                                            {order.paymentMethod}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center text-[#800020]/80">
                                                            {order.city}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center font-black text-[#800020]">
                                                            <div className="inline-flex items-center justify-center gap-1">
                                                                <span>{(order.deptRevenue || order.total).toLocaleString('ar-SA')}</span>
                                                                <RiyalIcon size="0.85em" />
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedOrderDetails(order)}
                                                                className="shine-button relative overflow-hidden bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 active:scale-95 transition px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm cursor-pointer group"
                                                            >
                                                                <span className="shine-effect z-10" />
                                                                <span className="relative z-20 inline-flex items-center gap-1.5">
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    <span>تفاصيل</span>
                                                                </span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>

                    </div>
                )}


                {/* ========================================================================= */}
                {/* 3. SEGMENTED ORDERS MANAGEMENT (الطلبات مقسمة) */}
                {/* ========================================================================= */}
                {activeTab === 'orders' && (
                    <div className="space-y-8">
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-[#800020]">
                                    إدارة الطلبات المقسمة
                                </h1>
                                <p className="text-sm font-semibold text-[#800020]/70 mt-1">
                                    فرز ومتابعة الطلبات وتحديث حالاتها مباشرة وطباعة الفواتير.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleExportOrders}
                                    className="relative overflow-hidden group cursor-pointer bg-white/40 hover:bg-white text-[#800020] border border-[#800020]/25 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition-all duration-300"
                                >
                                    <span className="absolute -inset-x-24 -inset-y-16 bg-[#800020] -translate-x-[160%] skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0 pointer-events-none z-0" />
                                    <span className="relative z-10 flex items-center gap-2 text-[#800020] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[150%] group-hover:opacity-0">
                                        <Download className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
                                        <span>تصدير الطلبات</span>
                                    </span>
                                    <span className="absolute inset-0 z-20 flex items-center justify-center gap-2 px-4 py-2.5 text-[#F0DFCD] pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                                        <Download className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
                                        <span>تصدير الطلبات</span>
                                    </span>
                                    <span className="shine-effect z-30" />
                                </button>
                            </div>
                        </div>

                        {/* Order Status Tabs (المقسمة - تأثير تغيير نص ولون بزاوية 45) */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#800020]/15">
                            {[
                                { id: 'all', label: 'جميع الطلبات', count: statusCounts.all },
                                { id: 'new', label: 'طلبات جديدة', count: statusCounts.new },
                                { id: 'processing', label: 'قيد التجهيز', count: statusCounts.processing },
                                { id: 'shipping', label: 'جاري التوصيل', count: statusCounts.shipping },
                                { id: 'delivered', label: 'مكتملة ومستلمة', count: statusCounts.delivered },
                                { id: 'cancelled', label: 'ملغاة', count: statusCounts.cancelled },
                            ].map(tab => {
                                const isSelected = orderFilterStatus === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setOrderFilterStatus(tab.id)}
                                        className={`relative overflow-hidden group cursor-pointer px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-300 border ${
                                            isSelected
                                                ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-md'
                                                : 'bg-white/50 text-[#800020] border-[#800020]/15 shadow-2xs'
                                        }`}
                                    >
                                        {!isSelected && (
                                            <span className="absolute -inset-x-24 -inset-y-16 bg-[#800020] -translate-x-[160%] skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0 pointer-events-none z-0" />
                                        )}

                                        {/* Base Layer */}
                                        <span className={`relative z-10 flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                                            isSelected ? 'text-[#F0DFCD]' : 'text-[#800020] group-hover:-translate-y-[150%] group-hover:opacity-0'
                                        }`}>
                                            <span>{tab.label}</span>
                                            <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                                                isSelected ? 'bg-white/20 text-[#F0DFCD]' : 'bg-[#800020]/10 text-[#800020]'
                                            }`}>
                                                {tab.count}
                                            </span>
                                        </span>

                                        {/* Hover Roll-in Layer */}
                                        {!isSelected && (
                                            <span className="absolute inset-0 z-20 flex items-center justify-center gap-2 px-4 py-2.5 w-full h-full pointer-events-none text-[#F0DFCD] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                                                <span>{tab.label}</span>
                                                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-white/20 text-[#F0DFCD]">
                                                    {tab.count}
                                                </span>
                                            </span>
                                        )}

                                        <span className="shine-effect z-30" />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Bar & Filtering (خلفية بيج) */}
                        <div className="bg-white/25 p-4 rounded-3xl border border-[#800020]/10 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full sm:w-96">
                                <Search className="w-4 h-4 text-[#800020]/50 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={orderSearchQuery}
                                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                                    placeholder="بحث برقم الطلب، اسم العميل، الهاتف، أو المدينة..."
                                    className="w-full bg-[#F0DFCD] focus:bg-[#F0DFCD] pr-11 pl-4 py-2.5 rounded-2xl border border-[#800020]/25 text-xs sm:text-sm text-[#800020] font-bold placeholder:text-[#800020]/50 focus:outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 shadow-inner transition"
                                />
                                {orderSearchQuery && (
                                    <button
                                        onClick={() => setOrderSearchQuery('')}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#800020]/50 hover:text-[#800020]"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <span className="text-xs font-bold text-[#800020]/60 self-start sm:self-auto">
                                عرض {filteredOrders.length} من أصل {orders.length} طلب
                            </span>
                        </div>

                        {/* Orders List Table */}
                        <div className="bg-white/25 rounded-3xl border border-[#800020]/10 shadow-sm overflow-hidden">
                            {filteredOrders.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 rounded-3xl bg-[#800020]/10 text-[#800020] mx-auto flex items-center justify-center mb-4">
                                        <ShoppingBag className="w-8 h-8 opacity-60" />
                                    </div>
                                    <h3 className="text-lg font-black text-[#800020]">لا توجد طلبات تطابق الفلتر الحالي</h3>
                                    <p className="text-xs font-semibold text-[#800020]/60 mt-1">
                                        جرب تغيير حالة الفرز أو إعادة تعيين كلمة البحث.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-center text-xs font-semibold overflow-hidden rounded-2xl">
                                        <thead>
                                            <tr className="bg-[#800020] text-[#F0DFCD] border-b border-[#800020]/20 font-black">
                                                <th className="py-4 px-4 text-center text-[#F0DFCD]">رقم الطلب</th>
                                                <th className="py-4 px-4 text-center text-[#F0DFCD]">العميل ومعلومات الاتصال</th>
                                                <th className="py-4 px-4 text-center text-[#F0DFCD]">المنتجات المطلوبة</th>
                                                <th className="py-4 px-4 text-center text-[#F0DFCD]">المبلغ والدفع</th>
                                                <th className="py-4 px-4 text-center text-[#F0DFCD]">التاريخ والوقت</th>
                                                <th className="py-4 px-4 text-center text-[#F0DFCD]">حالة الطلب الحالية</th>
                                                <th className="py-4 px-4 text-center text-[#F0DFCD]">الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#800020]/10">
                                            {filteredOrders.map(ord => {
                                                const meta = orderStatusMeta[ord.status] || orderStatusMeta.new;
                                                return (
                                                    <tr key={ord.id} className="hover:bg-white/25 transition group">

                                                        {/* Order ID */}
                                                        <td className="py-4 px-4 text-center">
                                                            <span className="font-mono font-bold text-sm text-[#800020] block">
                                                                {ord.id}
                                                            </span>
                                                            <span className="text-[10px] text-[#800020]/50 block">
                                                                {ord.itemsCount} عناصر
                                                            </span>
                                                        </td>

                                                        {/* Customer */}
                                                        <td className="py-4 px-4 text-center">
                                                            <div className="font-bold text-sm text-[#800020]">
                                                                {ord.customerName}
                                                            </div>
                                                            <div className="text-[11px] text-[#800020]/70 flex items-center justify-center gap-2 mt-0.5">
                                                                <span className="flex items-center gap-1">
                                                                    <Phone className="w-3 h-3 text-[#800020]/50" />
                                                                    {ord.phone}
                                                                </span>
                                                                <span className="text-[#800020]/40">•</span>
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3 text-[#800020]/50" />
                                                                    {ord.city}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Items Preview */}
                                                        <td className="py-4 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                {ord.items.slice(0, 3).map((item, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="w-10 h-10 rounded-xl bg-white/80 border border-[#800020]/10 p-1 flex items-center justify-center shrink-0 shadow-sm"
                                                                    >
                                                                        <img
                                                                            src={item.image}
                                                                            alt={item.name}
                                                                            className="w-full h-full object-contain"
                                                                        />
                                                                    </div>
                                                                ))}
                                                                {ord.items.length > 3 && (
                                                                    <span className="text-[10px] font-bold text-[#800020]/60 bg-[#800020]/10 px-2 py-1 rounded-lg">
                                                                        +{ord.items.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Amount & Payment */}
                                                        <td className="py-4 px-4 text-center">
                                                            <div className="font-black text-sm text-[#800020] flex items-center justify-center gap-1">
                                                                <span>{ord.total.toFixed(2)}</span>
                                                                <RiyalIcon size="0.9em" />
                                                            </div>
                                                            <div className="text-[11px] text-[#800020]/70 mt-0.5">
                                                                {ord.paymentMethod} • <span className="text-emerald-700 font-bold">{ord.paymentStatus}</span>
                                                            </div>
                                                        </td>

                                                        {/* Date */}
                                                        <td className="py-4 px-4 text-center">
                                                            <div className="text-[#800020] font-bold">{ord.date}</div>
                                                            <div className="text-[10px] text-[#800020]/50">{ord.time}</div>
                                                        </td>

                                                        {/* Status Dropdown */}
                                                        <td className="py-4 px-4 text-center">
                                                            <CustomDropdown
                                                                value={ord.status}
                                                                onChange={(val) => handleUpdateOrderStatus(ord.id, val)}
                                                                options={orderStatusOptions}
                                                                className="inline-block"
                                                                renderTrigger={({ isOpen }) => (
                                                                    <div className="inline-flex items-center justify-center gap-1.5 cursor-pointer group select-none">
                                                                        <span className={`text-xs font-bold transition-colors ${meta.textColor || 'text-amber-700'}`}>
                                                                            {meta.label}
                                                                        </span>
                                                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'} ${meta.textColor || 'text-amber-700'}`} />
                                                                    </div>
                                                                )}
                                                                menuClassName="min-w-[175px] w-max"
                                                                align="center"
                                                                usePortal={true}
                                                            />
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="py-4 px-4 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedOrderDetails(ord)}
                                                                className="shine-button relative overflow-hidden bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 active:scale-95 transition px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm cursor-pointer group"
                                                            >
                                                                <span className="shine-effect z-10" />
                                                                <span className="relative z-20 inline-flex items-center gap-1.5">
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    <span>تفاصيل</span>
                                                                </span>
                                                            </button>
                                                        </td>

                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </div>
                )}


                {/* ========================================================================= */}
                {/* 4. ADD PRODUCT TAB & VIEW (صفحة إضافة المنتجات للأدمن) */}
                {/* ========================================================================= */}
                {activeTab === 'add-product' && (
                    <div className="space-y-8">
                        {/* Section Header */}
                        <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm">
                            <h1 className="text-2xl sm:text-3xl font-black text-[#800020]">
                                إضافة منتج جديد لمتجر ثياب
                            </h1>
                            <p className="text-sm font-semibold text-[#800020]/70 mt-1">
                                قم بإدخال بيانات المنتج والأسعار والألوان والمقاسات مع معاينة حية مباشرة.
                            </p>
                        </div>

                        {/* Add Product Grid: Form on Right, Live Preview on Left */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                            {/* The Form (Right Column: 7 cols on lg, 8 cols on xl) */}
                            <form onSubmit={handleSaveNewProduct} className="lg:col-span-7 xl:col-span-8 space-y-6">

                                {/* Responsive Modular Grid of Boxes (مربعات جنب وتحت بعضها) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                                    {/* مربع 1: المعلومات الأساسية */}
                                    <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm space-y-4">
                                        <h3 className="text-base font-black text-[#800020] border-b border-[#800020]/10 pb-2">
                                            المعلومات الأساسية
                                        </h3>

                                        <div>
                                            <label className="block text-xs font-bold text-[#800020] mb-1.5">
                                                اسم المنتج <span className="text-rose-600">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={productForm.name}
                                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                                placeholder="مثال: معطف شتوي فاخر مزدوج الصدر"
                                                className="w-full bg-white px-4 py-3 rounded-2xl border border-[#800020]/20 text-sm text-[#800020] focus:outline-none focus:border-[#800020]"
                                            />
                                        </div>

                                        {/* Department (Main Category) Selector */}
                                        <div>
                                            <label className="block text-xs font-bold text-[#800020] mb-1.5">
                                                القسم الرئيسي (الجمهور المستهدف) <span className="text-rose-600">*</span>
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { id: 'men', label: 'رجالي' },
                                                    { id: 'women', label: 'نسائي' },
                                                    { id: 'unisex', label: 'إكسسوارات' }
                                                ].map(dept => {
                                                    const isSelected = (productForm.gender || 'men') === dept.id;
                                                    return (
                                                        <button
                                                            key={dept.id}
                                                            type="button"
                                                            onClick={() => {
                                                                const newGender = dept.id;
                                                                const subCats = DEPARTMENT_CATEGORIES[newGender]?.categories || productCategoriesList;
                                                                const keepCat = subCats.includes(productForm.category) ? productForm.category : subCats[0];
                                                                setProductForm(prev => ({
                                                                    ...prev,
                                                                    gender: newGender,
                                                                    category: keepCat
                                                                }));
                                                            }}
                                                            className={`py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                                                                isSelected
                                                                    ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-md'
                                                                    : 'bg-white/70 hover:bg-white text-[#800020] border-[#800020]/20'
                                                            }`}
                                                        >
                                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                                            <span>{dept.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#800020] mb-1.5">
                                                التصنيف الخاص بـ ({productForm.gender === 'women' ? 'القسم النسائي' : productForm.gender === 'unisex' ? 'قسم الإكسسوارات' : 'القسم الرجالي'}) <span className="text-rose-600">*</span>
                                            </label>
                                            <CustomDropdown
                                                value={productForm.category}
                                                onChange={(val) => setProductForm(prev => ({ ...prev, category: val }))}
                                                options={DEPARTMENT_CATEGORIES[productForm.gender || 'men']?.categories || productCategoriesList}
                                                triggerClassName="!bg-white !rounded-2xl !py-3 !px-4 !border-[#800020]/20 !text-sm font-bold"
                                                menuClassName="w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#800020] mb-1.5">
                                                الشارة الترويجية (Badge)
                                            </label>
                                            <CustomDropdown
                                                value={productForm.badge}
                                                onChange={(val) => setProductForm(prev => ({ ...prev, badge: val }))}
                                                options={badgeOptions}
                                                placeholder="اختر الشارة الترويجية..."
                                                triggerClassName="!bg-white !rounded-2xl !py-3 !px-4 !border-[#800020]/20 !text-sm font-bold"
                                                menuClassName="w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* مربع 2: الأسعار والمخزون */}
                                    <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm space-y-4">
                                        <h3 className="text-base font-black text-[#800020] border-b border-[#800020]/10 pb-2">
                                            الأسعار والمخزون
                                        </h3>

                                        <div>
                                            <label className="block text-xs font-bold text-[#800020] mb-1.5">
                                                السعر الحالي (ر.س) <span className="text-rose-600">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={productForm.price}
                                                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                                    placeholder="0.00"
                                                    className="w-full bg-white pr-4 pl-10 py-3 rounded-2xl border border-[#800020]/20 text-sm text-[#800020] focus:outline-none focus:border-[#800020]"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#800020]/60">
                                                    ر.س
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#800020] mb-1.5">
                                                السعر قبل الخصم (اختياري)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={productForm.originalPrice}
                                                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                                                    placeholder="0.00"
                                                    className="w-full bg-white pr-4 pl-10 py-3 rounded-2xl border border-[#800020]/20 text-sm text-[#800020] focus:outline-none focus:border-[#800020]"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#800020]/60">
                                                    ر.س
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#800020] mb-1.5">
                                                كمية المخزون
                                            </label>
                                            <input
                                                type="number"
                                                value={productForm.stock}
                                                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                                placeholder="25"
                                                className="w-full bg-white px-4 py-3 rounded-2xl border border-[#800020]/20 text-sm text-[#800020] focus:outline-none focus:border-[#800020]"
                                            />
                                        </div>

                                        {/* Product in stock toggle */}
                                        <div className="flex items-center justify-between p-3.5 bg-white/70 rounded-2xl border border-[#800020]/15">
                                            <div>
                                                <span className="block text-xs font-bold text-[#800020]">حالة التوفر للطلب</span>
                                                <span className="text-[11px] text-[#800020]/60">متاح للشراء الفوري</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setProductForm(prev => ({ ...prev, inStock: !prev.inStock }))}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${productForm.inStock ? 'bg-emerald-600' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${productForm.inStock ? '-translate-x-6' : '-translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* مربع 3: صورة المنتج الرئيسية ومكتبة المتجر (span-2) */}
                                    <div className="md:col-span-2 bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between border-b border-[#800020]/10 pb-2">
                                            <h3 className="text-base font-black text-[#800020]">
                                                صورة المنتج الرئيسية
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {isUploadingImage && (
                                                    <span className="text-xs text-[#800020] font-bold animate-pulse">
                                                        جاري الرفع...
                                                    </span>
                                                )}
                                                <span className="text-xs text-[#800020]/60">
                                                    اختر من المعرض أو ارفع من جهازك
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Box with integrated AI Background Removal (المربع الموحد) */}
                                        <div className="p-4 bg-white/70 rounded-2xl border border-[#800020]/15 shadow-xs space-y-3.5">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-14 h-14 rounded-xl bg-white border border-[#800020]/20 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                                                        {productForm.image ? (
                                                            <img
                                                                src={productForm.image}
                                                                alt="معاينة صورة المنتج"
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => { e.target.src = '/images/coat_transparent.png'; }}
                                                            />
                                                        ) : (
                                                            <ImageIcon className="w-6 h-6 text-[#800020]/40" />
                                                        )}
                                                        {isRemovingBg && (
                                                            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                                                                <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-[#800020]">إضافة الصورة من المعرض</p>
                                                        <p className="text-[11px] text-[#800020]/60">ارفع مباشرة من ألبوم الصور بهاتفك أو تصفح مكتبة المتجر</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <input
                                                        type="file"
                                                        id="add-device-gallery-input"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageFileUpload(e, 'add')}
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor="add-device-gallery-input"
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#800020] text-[#F0DFCD] text-xs font-bold hover:bg-[#66001a] transition cursor-pointer shadow-xs active:scale-95"
                                                    >
                                                        <UploadCloud className="w-4 h-4" />
                                                        <span>رفع من معرض الصور / الجهاز</span>
                                                    </label>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setGalleryTarget('add');
                                                            setIsGalleryModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#800020]/25 text-[#800020] text-xs font-bold hover:bg-[#800020]/5 transition cursor-pointer shadow-xs active:scale-95"
                                                    >
                                                        <ImageIcon className="w-4 h-4" />
                                                        <span>استعراض كامل المعرض</span>
                                                    </button>

                                                    {productForm.image && (
                                                        <button
                                                            type="button"
                                                            disabled={isRemovingBg || isUploadingImage}
                                                            onClick={() => handleManualRemoveBackground('add')}
                                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-[#800020] text-white text-xs font-bold hover:brightness-110 transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                                                            title="تفريغ خلفية الصورة الحالية وجعلها شفافة"
                                                        >
                                                            <Wand2 className="w-3.5 h-3.5" />
                                                            <span>{isRemovingBg ? (bgRemovalProgress || 'جاري التفريغ...') : 'تفريغ الخلفية (AI)'}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* AI Background Removal integrated inside the box */}
                                            <div className="pt-3 border-t border-[#800020]/10 flex flex-wrap items-center justify-between gap-2.5">
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={autoRemoveBg}
                                                        onChange={(e) => setAutoRemoveBg(e.target.checked)}
                                                        className="w-4 h-4 accent-[#800020] rounded cursor-pointer"
                                                    />
                                                    <div className="flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                                        <span className="text-xs font-bold text-[#800020]">
                                                            حذف وتفريغ الخلفية تلقائياً بالذكاء الاصطناعي عند رفع أي صورة
                                                        </span>
                                                    </div>
                                                </label>
                                                {isRemovingBg && (
                                                    <span className="text-[11px] font-black text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg animate-pulse">
                                                        {bgRemovalProgress || 'جاري المعالجة...'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Selection Carousel / Grid */}
                                        <div className="space-y-2">
                                            <span className="text-xs font-bold text-[#800020]/80">
                                                مكتبة صور المتجر الفاخرة (شفافة وبدقة عالية):
                                            </span>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                                                {storeQuickImages.map((img, idx) => (
                                                    <button
                                                        type="button"
                                                        key={img.url}
                                                        onClick={() => handleSelectQuickImage(img.url, idx)}
                                                        className={`aspect-square rounded-2xl p-2 bg-white flex items-center justify-center border-2 transition relative overflow-hidden ${productForm.image === img.url
                                                            ? 'border-[#800020] ring-2 ring-[#800020]/20 shadow-md'
                                                            : 'border-transparent hover:border-[#800020]/30'
                                                            }`}
                                                    >
                                                        <img src={img.url} alt={img.name} className="w-full h-full object-contain" />
                                                        {productForm.image === img.url && (
                                                            <div className="absolute top-1 right-1 bg-[#800020] text-[#F0DFCD] rounded-full p-0.5">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#800020] mb-1.5">
                                                مسار أو رابط الصورة يدوياً
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={productForm.image}
                                                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                                    placeholder="/images/coat_transparent.png أو https://..."
                                                    className="w-full bg-white pl-8 pr-4 py-2.5 rounded-2xl border border-[#800020]/20 text-xs sm:text-sm font-mono text-[#800020] focus:outline-none focus:border-[#800020]"
                                                />
                                                {productForm.image && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setProductForm({ ...productForm, image: '' })}
                                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1"
                                                        title="مسح الرابط"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* مربع 4: المقاسات المتوفرة */}
                                    <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between border-b border-[#800020]/10 pb-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-black text-[#800020]">
                                                    المقاسات المتوفرة
                                                </h3>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#800020]/10 text-[#800020]">
                                                    {productForm.sizes.length} مقاسات
                                                </span>
                                            </div>
                                            {productForm.sizes.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearAllProductSizes}
                                                    className="text-xs text-rose-600 hover:text-rose-800 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                                    title="مسح جميع المقاسات"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>مسح الكل</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Selected sizes tags with (X) buttons */}
                                        <div className="p-2.5 bg-white rounded-xl border border-[#800020]/15 min-h-[46px] flex flex-wrap items-center gap-2">
                                            {productForm.sizes.length > 0 ? (
                                                productForm.sizes.map((sz, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#800020] text-[#F0DFCD] text-xs font-black shadow-xs group animate-fadeIn"
                                                    >
                                                        <span>{sz}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveProductSize(sz)}
                                                            className="w-4 h-4 rounded-full bg-white/20 hover:bg-rose-600 hover:text-white text-[#F0DFCD] transition flex items-center justify-center cursor-pointer"
                                                            title={`إزالة مقاس (${sz})`}
                                                        >
                                                            <X className="w-3 h-3" strokeWidth={3} />
                                                        </button>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-[#800020]/50 italic">
                                                    لم يتم تحديد أي مقاسات بعد — انقر على المقاسات بالأسفل لإضافتها أو اكتب مقاساً مخصصاً.
                                                </span>
                                            )}
                                        </div>

                                        {/* Quick presets */}
                                        <div className="space-y-2 pt-1">
                                            <span className="text-[11px] font-bold text-[#800020]/70 block">
                                                إضافة سريعة بنقرة واحدة:
                                            </span>

                                            {/* Abaya & Thobe */}
                                            <div>
                                                <span className="text-[10px] font-bold text-[#800020]/60 block mb-1">
                                                    مقاسات العبايات والثياب (الطول بالبوصة):
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {abayaThobeSizesList.map(sz => {
                                                        const isSelected = productForm.sizes.includes(sz);
                                                        return (
                                                            <button
                                                                key={sz}
                                                                type="button"
                                                                onClick={() => handleSizeToggle(sz)}
                                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                                                    isSelected
                                                                        ? 'bg-[#800020] text-[#F0DFCD] ring-2 ring-[#800020]/30 shadow-xs'
                                                                        : 'bg-white border border-[#800020]/20 text-[#800020] hover:bg-amber-50'
                                                                }`}
                                                            >
                                                                <span>{sz}</span>
                                                                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Clothes */}
                                            <div>
                                                <span className="text-[10px] font-bold text-[#800020]/60 block mb-1">
                                                    مقاسات الملابس:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {clothingSizesList.map(sz => {
                                                        const isSelected = productForm.sizes.includes(sz);
                                                        return (
                                                            <button
                                                                key={sz}
                                                                type="button"
                                                                onClick={() => handleSizeToggle(sz)}
                                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                                                    isSelected
                                                                        ? 'bg-[#800020] text-[#F0DFCD] ring-2 ring-[#800020]/30 shadow-xs'
                                                                        : 'bg-white border border-[#800020]/20 text-[#800020] hover:bg-amber-50'
                                                                }`}
                                                            >
                                                                <span>{sz}</span>
                                                                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Shoes & Free Size */}
                                            <div>
                                                <span className="text-[10px] font-bold text-[#800020]/60 block mb-1">
                                                    مقاسات الأحذية ومقاس موحد:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {shoeSizesList.map(sz => {
                                                        const isSelected = productForm.sizes.includes(sz);
                                                        return (
                                                            <button
                                                                key={sz}
                                                                type="button"
                                                                onClick={() => handleSizeToggle(sz)}
                                                                className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                                                    isSelected
                                                                        ? 'bg-[#800020] text-[#F0DFCD] ring-2 ring-[#800020]/30 shadow-xs'
                                                                        : 'bg-white border border-[#800020]/20 text-[#800020] hover:bg-amber-50'
                                                                }`}
                                                            >
                                                                <span>{sz}</span>
                                                                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                                                            </button>
                                                        );
                                                    })}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSizeToggle('Free Size')}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                                            productForm.sizes.includes('Free Size')
                                                                ? 'bg-[#800020] text-[#F0DFCD] ring-2 ring-[#800020]/30 shadow-xs'
                                                                : 'bg-white border border-[#800020]/20 text-[#800020] hover:bg-amber-50'
                                                        }`}
                                                    >
                                                        <span>Free Size</span>
                                                        {productForm.sizes.includes('Free Size') && <Check className="w-3 h-3" strokeWidth={3} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Add custom size */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-[#800020]/10">
                                            <input
                                                type="text"
                                                value={customSizeInput}
                                                onChange={(e) => setCustomSizeInput(e.target.value)}
                                                placeholder="إضافة مقاس مخصص (مثال: 46، XXXL)..."
                                                className="bg-white flex-1 px-3 py-2 rounded-xl border border-[#800020]/20 text-xs text-[#800020] focus:outline-none focus:border-[#800020]"
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSize(e); } }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCustomSize}
                                                className="bg-[#800020]/15 hover:bg-[#800020] hover:text-[#F0DFCD] text-[#800020] px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                                            >
                                                + إضافة المقاس
                                            </button>
                                        </div>
                                    </div>

                                    {/* مربع 5: ألوان المنتج وخياراته */}
                                    <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between border-b border-[#800020]/10 pb-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-black text-[#800020]">
                                                    ألوان المنتج وخياراته
                                                </h3>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#800020]/10 text-[#800020]">
                                                    {productForm.colors.length} ألوان
                                                </span>
                                            </div>
                                            {productForm.colors.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setProductForm(prev => ({ ...prev, colors: [] }))}
                                                    className="text-xs text-rose-600 hover:text-rose-800 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                                    title="مسح جميع الألوان"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>مسح الكل</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Selected Colors list */}
                                        <div className="p-2.5 bg-white rounded-xl border border-[#800020]/15 min-h-[46px] flex flex-wrap items-center gap-2">
                                            {productForm.colors.length > 0 ? (
                                                productForm.colors.map(col => (
                                                    <span
                                                        key={col.hex}
                                                        className="bg-[#FAF7F2] pl-2 pr-3 py-1.5 rounded-xl border border-[#800020]/20 text-xs font-bold text-[#800020] flex items-center gap-2 shadow-xs animate-fadeIn"
                                                    >
                                                        <span className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-xs shrink-0" style={{ backgroundColor: col.hex }} />
                                                        <span>{col.name}</span>
                                                        <span className="text-[10px] font-mono text-[#800020]/50" dir="ltr">{col.hex}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveColor(col.hex)}
                                                            className="text-[#800020]/40 hover:text-rose-600 transition cursor-pointer p-0.5"
                                                            title={`إزالة لون ${col.name}`}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-[#800020]/50 italic">
                                                    لم يتم اختيار أي ألوان بعد — اختر من الألوان المعتمدة أو أضف لوناً بكود Hex أدناه.
                                                </span>
                                            )}
                                        </div>

                                        {/* Preset Color quick add */}
                                        <div className="space-y-1.5">
                                            <span className="text-[11px] font-bold text-[#800020]/70 block">
                                                إضافة سريعة من الألوان المعتمدة:
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {commonColorsList.map(c => {
                                                    const isAdded = productForm.colors.some(existing => existing.hex === c.hex);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={c.name}
                                                            onClick={() => {
                                                                if (!isAdded) {
                                                                    setProductForm(prev => ({ ...prev, colors: [...prev.colors, c] }));
                                                                }
                                                            }}
                                                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition cursor-pointer ${
                                                                isAdded
                                                                    ? 'bg-[#800020]/10 border-[#800020]/30 text-[#800020] opacity-60 cursor-default'
                                                                    : 'bg-white hover:bg-amber-50 text-[#800020] border-[#800020]/15 shadow-2xs'
                                                            }`}
                                                        >
                                                            <span className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
                                                            <span>{c.name}</span>
                                                            {isAdded && <Check className="w-3 h-3 text-[#800020]" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Custom Color with Hex Code System (نظام Hex Code) */}
                                        <div className="pt-3 border-t border-[#800020]/10 space-y-2">
                                            <span className="text-[11px] font-bold text-[#800020]/80 block">
                                                إضافة لون مخصص (بنظام كود Hex):
                                            </span>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Color Picker Swatch */}
                                                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#800020]/25 shadow-xs shrink-0 cursor-pointer">
                                                    <input
                                                        type="color"
                                                        value={customColorHex}
                                                        onChange={(e) => setCustomColorHex(e.target.value)}
                                                        className="absolute -inset-2 w-14 h-14 cursor-pointer border-0"
                                                        title="انقر لاختيار اللون بصرياً"
                                                    />
                                                </div>

                                                {/* Hex Code Input */}
                                                <div className="relative w-28 shrink-0">
                                                    <input
                                                        type="text"
                                                        value={customColorHex}
                                                        onChange={(e) => setCustomColorHex(e.target.value)}
                                                        placeholder="#800020"
                                                        className="w-full bg-white px-3 py-2 rounded-xl border border-[#800020]/20 text-xs font-mono font-bold text-[#800020] focus:outline-none focus:border-[#800020]"
                                                        dir="ltr"
                                                    />
                                                </div>

                                                {/* Color Name Input */}
                                                <div className="flex-1 min-w-[120px]">
                                                    <input
                                                        type="text"
                                                        value={customColorName}
                                                        onChange={(e) => setCustomColorName(e.target.value)}
                                                        placeholder="اسم اللون (مثال: كحلي داكن)..."
                                                        className="w-full bg-white px-3 py-2 rounded-xl border border-[#800020]/20 text-xs text-[#800020] focus:outline-none focus:border-[#800020]"
                                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); } }}
                                                    />
                                                </div>

                                                {/* Add Color Button */}
                                                <button
                                                    type="button"
                                                    onClick={handleAddColor}
                                                    className="bg-[#800020] text-[#F0DFCD] px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#66001a] transition cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>إضافة اللون</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* مربع 6: الوصف التفصيلي والكلمات المفتاحية (span-2) */}
                                    <div className="md:col-span-2 bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm space-y-4">
                                        <h3 className="text-base font-black text-[#800020] border-b border-[#800020]/10 pb-2">
                                            الوصف التفصيلي والكلمات المفتاحية
                                        </h3>

                                        <div>
                                            <label className="block text-xs font-bold text-[#800020] mb-1.5">
                                                الوصف وخامة المنتج
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={productForm.description}
                                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                                placeholder="اكتب وصفاً مفصلاً يبرز خامة المنتج ونوع الأقمشة ومميزاته..."
                                                className="w-full bg-white px-4 py-3 rounded-2xl border border-[#800020]/20 text-sm text-[#800020] focus:outline-none focus:border-[#800020] resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#800020] mb-1.5">
                                                الوسوم (مفصولة بفاصلة)
                                            </label>
                                            <input
                                                type="text"
                                                value={productForm.tags}
                                                onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                                                placeholder="شتوي, كلاسيك, فاخر, صوف طبيعي"
                                                className="w-full bg-white px-4 py-3 rounded-2xl border border-[#800020]/20 text-sm text-[#800020] focus:outline-none focus:border-[#800020]"
                                            />
                                        </div>
                                    </div>

                                </div>

                                {/* Form Action Buttons */}
                                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 transition px-8 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-amber-300" />
                                        <span>حفظ وإضافة للمتجر الآن</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setProductForm(initialFormState)}
                                        className="w-full sm:w-auto bg-white/25 hover:bg-white text-[#800020] px-6 py-3.5 rounded-2xl text-sm font-bold border border-[#800020]/20 transition flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        <span>إعادة تعيين</span>
                                    </button>
                                </div>

                            </form>

                            {/* Live Customer Preview Card (Left Column: 5 cols on lg, 4 cols on xl) */}
                            <div className="lg:col-span-5 xl:col-span-4 sticky top-20 self-start space-y-4">
                                <div className="bg-white/25 p-5 sm:p-6 rounded-3xl border border-[#800020]/15 shadow-sm space-y-4">
                                    {/* Header without "مباشر" as requested */}
                                    <div className="flex items-center justify-between pb-3 border-b border-[#800020]/10">
                                        <span className="text-xs font-black uppercase tracking-wider text-[#800020] flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-[#800020]" />
                                            معاينة حية كما تظهر للمشتري
                                        </span>
                                    </div>

                                    {/* The Realistic Product Card */}
                                    <div className="bg-white/40 rounded-3xl overflow-hidden border border-[#800020]/15 shadow-md group transition hover:shadow-lg">

                                        {/* Image & Badges */}
                                        <div className="relative aspect-square max-h-[340px] w-full bg-[#fcfaf7] p-5 flex items-center justify-center overflow-hidden">
                                            {(() => {
                                                const isAddRing = String(productForm.category || '').includes('خاتم') || String(productForm.category || '').includes('خواتم') || String(productForm.name || '').includes('خاتم') || String(productForm.name || '').includes('خواتم');
                                                const isAddWatch = String(productForm.category || '').includes('ساعة') || String(productForm.category || '').includes('ساعات') || String(productForm.name || '').includes('ساعة') || String(productForm.name || '').includes('ساعات');
                                                return (
                                                    <img
                                                        src={productForm.image || '/images/coat_transparent.png'}
                                                        alt={productForm.name || 'معاينة المنتج'}
                                                        className={`${isAddRing ? 'max-h-[58%] max-w-[58%]' : (isAddWatch ? 'max-h-[70%] max-w-[70%]' : 'w-full h-full')} object-contain transform group-hover:scale-105 transition duration-500`}
                                                    />
                                                );
                                            })()}

                                            {/* Badge */}
                                            {productForm.badge && (
                                                <span className="absolute top-4 right-4 bg-[#800020] text-[#F0DFCD] text-xs font-black px-3 py-1 rounded-full shadow animate-fadeIn">
                                                    {productForm.badge}
                                                </span>
                                            )}

                                            {/* Category Pill */}
                                            {productForm.category && (
                                                <span className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-[#800020] text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs border border-[#800020]/10">
                                                    {productForm.category}
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-5 space-y-3">

                                            {/* Title */}
                                            <h4 className="font-black text-base text-[#800020] line-clamp-1">
                                                {productForm.name || 'اسم المنتج سيظهر هنا...'}
                                            </h4>

                                            {/* Price Display with centered strikethrough */}
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex items-center gap-1 text-xl font-black text-[#800020]">
                                                    <span>{productForm.price ? parseFloat(productForm.price).toFixed(2) : '0.00'}</span>
                                                    <RiyalIcon size="1em" />
                                                </div>

                                                {productForm.originalPrice && parseFloat(productForm.originalPrice) > 0 && (
                                                    <span className="relative inline-flex items-center gap-1 text-xs font-bold text-[#800020]/50 px-1 py-0.5">
                                                        <span>{parseFloat(productForm.originalPrice).toFixed(2)}</span>
                                                        <RiyalIcon size="0.85em" />
                                                        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#800020]/60 pointer-events-none" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Availability Badge */}
                                            <div className="pt-2 flex items-center justify-between border-t border-[#800020]/10 text-xs">
                                                <span className={`font-bold ${productForm.inStock ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                    {productForm.inStock ? '✓ متوفر للطلب' : '✗ غير متوفر حالياً'}
                                                </span>
                                                <span className="text-[#800020]/60 font-semibold">
                                                    المخزون: {productForm.stock || 0}
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 5. INVENTORY TAB (إدارة المخزون وتوفر المنتجات) */}
                {/* ========================================================================= */}
                {(activeTab === 'products' || activeTab === 'inventory') && (
                    <div className="space-y-8">
                        {/* Section Header */}
                        <div className="bg-white/25 p-6 sm:p-7 rounded-3xl border border-[#800020]/10 shadow-sm">
                            <h1 className="text-2xl sm:text-3xl font-black text-[#800020]">
                                إدارة المخزون وتوفر المنتجات
                            </h1>
                            <p className="text-sm font-semibold text-[#800020]/70 mt-1">
                                تعديل بيانات المنتجات، كميات المخزون مباشرة، تفعيل أو إيقاف المنتجات.
                            </p>
                        </div>

                        {/* Controls Bar: Search & Add Button (Image 1) + Category Filter Tabs (Image 2) */}
                        <div className="space-y-6">

                            {/* Top Row: Search Input & Add Product Button (Image 1 style) */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                {/* Search Input - Image 1 */}
                                <div className="relative w-full sm:w-80 md:w-96">
                                    <input
                                        type="text"
                                        value={productSearchQuery}
                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                        placeholder="ابحث باسم المنتج أو القسم..."
                                        className="w-full bg-[#F0DFCD] focus:bg-[#F0DFCD] pr-11 pl-10 py-2.5 rounded-full border border-[#800020]/25 text-xs font-bold text-[#800020] placeholder:text-[#800020]/50 focus:outline-none focus:ring-2 focus:ring-[#800020]/15 shadow-inner transition"
                                    />
                                    <Search className="w-4 h-4 text-[#800020] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    {productSearchQuery && (
                                        <button
                                            onClick={() => setProductSearchQuery('')}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#800020]/50 hover:text-[#800020] cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Add Product Button - Image 1 */}
                                <button
                                    onClick={() => setActiveTab('add-product')}
                                    className="w-full sm:w-auto bg-[#800020] hover:bg-[#800020]/90 text-white transition px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    <span>إضافة منتج جديد</span>
                                </button>
                            </div>

                            {/* Department Tabs & Sub-Category Filter */}
                            <div className="space-y-3">
                                {/* Primary Department Tabs: الكل | رجالي | نسائي | إكسسوارات */}
                                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
                                    {[
                                        { id: 'all', label: 'جميع الأقسام', count: departmentCounts.all },
                                        { id: 'men', label: 'رجالي', count: departmentCounts.men },
                                        { id: 'women', label: 'نسائي', count: departmentCounts.women },
                                        { id: 'unisex', label: 'إكسسوارات', count: departmentCounts.unisex },
                                    ].map(dept => {
                                        const isSelected = selectedDepartment === dept.id;
                                        return (
                                            <button
                                                key={dept.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedDepartment(dept.id);
                                                    setSelectedSubCategory('all');
                                                }}
                                                className={`py-2 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                                                    isSelected
                                                        ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-md'
                                                        : 'bg-white/60 hover:bg-white text-[#800020] border-[#800020]/15'
                                                }`}
                                            >
                                                <span>{dept.label}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                                    isSelected ? 'bg-white/20 text-[#F0DFCD]' : 'bg-[#800020]/10 text-[#800020]'
                                                }`}>
                                                    {dept.count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Secondary Sub-Category Pills for the selected Department */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                                    <span className="text-[#800020]/60 font-bold ml-1 shrink-0 text-[11px]">التصنيفات:</span>
                                    {currentSubCategories.map(cat => {
                                        const isSelected = selectedSubCategory === cat;
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setSelectedSubCategory(cat)}
                                                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-xs border ${
                                                    isSelected
                                                        ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-xs'
                                                        : 'bg-white/40 hover:bg-white text-[#800020]/80 hover:text-[#800020] border-[#800020]/10'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>

                        {/* Products Inventory Table */}
                        <div className="bg-white/25 rounded-3xl border border-[#800020]/10 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs font-semibold overflow-hidden rounded-2xl">
                                    <thead>
                                        <tr className="bg-[#800020] text-[#F0DFCD] border-b border-[#800020]/20 font-black">
                                            <th className="py-4 px-4 text-[#F0DFCD]">المنتج</th>
                                            <th className="py-4 px-4 text-[#F0DFCD]">القسم والتصنيف</th>
                                            <th className="py-4 px-4 text-[#F0DFCD]">السعر</th>
                                            <th className="py-4 px-4 text-[#F0DFCD]">التقييم</th>
                                            <th className="py-4 px-4 text-[#F0DFCD]">كمية المخزون</th>
                                            <th className="py-4 px-4 text-[#F0DFCD]">حالة التوفر</th>
                                            <th className="py-4 px-4 text-left text-[#F0DFCD]">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#800020]/10">
                                        {filteredProductsList.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-12 text-[#800020]/60 font-bold">
                                                    لا توجد منتجات مطابقة لعملية البحث
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredProductsList.map(prod => (
                                                <tr key={prod.id} className="hover:bg-white/25 transition">

                                                    {/* Product */}
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-[#800020]/10 flex items-center justify-center shrink-0 shadow-sm">
                                                                <img
                                                                    src={prod.image}
                                                                    alt={prod.name}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Link
                                                                    to={`/product/${prod.id}`}
                                                                    className="font-bold text-sm text-[#800020] hover:underline block"
                                                                >
                                                                    {prod.name}
                                                                </Link>
                                                                <span className="text-[11px] text-[#800020]/60">
                                                                    المقاسات: {prod.sizes?.join(', ')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Category & Department */}
                                                    <td className="py-4 px-4">
                                                        <div className="flex flex-col gap-1 items-start">
                                                            <span className="font-bold text-sm text-[#800020]">{prod.category}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                                                                (prod.gender === 'women')
                                                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                                    : (prod.gender === 'unisex')
                                                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                            }`}>
                                                                {prod.gender === 'women' ? 'نسائي' : prod.gender === 'unisex' ? 'إكسسوارات' : 'رجالي'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Price */}
                                                    <td className="py-4 px-4">
                                                        <div className="font-black text-sm text-[#800020]">
                                                            <span>{prod.price.toFixed(2)}</span>
                                                            <RiyalIcon size="0.9em" />
                                                        </div>
                                                    </td>

                                                    {/* Rating */}
                                                    <td className="py-4 px-4 text-[#800020]/80">
                                                        ★ {prod.rating} ({prod.reviews} تقييم)
                                                    </td>

                                                    {/* Stock editing */}
                                                    <td className="py-4 px-4">
                                                        {editingStockId === prod.id ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="number"
                                                                    value={newStockVal}
                                                                    onChange={(e) => setNewStockVal(e.target.value)}
                                                                    className="w-16 bg-white px-2 py-1 rounded-lg border border-[#800020] text-xs font-bold text-center"
                                                                />
                                                                <button
                                                                    onClick={() => handleSaveStock(prod.id)}
                                                                    className="bg-emerald-600 text-white p-1 rounded-lg hover:bg-emerald-700 cursor-pointer"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingStockId(null)}
                                                                    className="bg-rose-600 text-white p-1 rounded-lg hover:bg-rose-700 cursor-pointer"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-[#800020]">
                                                                    {prod.stock !== undefined ? prod.stock : (prod.inStock ? 30 : 0)} قطعة
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingStockId(prod.id);
                                                                        setNewStockVal(prod.stock !== undefined ? prod.stock : (prod.inStock ? '30' : '0'));
                                                                    }}
                                                                    className="text-[#800020]/40 hover:text-[#800020] p-1 rounded-lg hover:bg-[#800020]/10 transition cursor-pointer"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* In stock badge */}
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${prod.inStock
                                                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${prod.inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                            {prod.inStock ? 'متوفر بالمخزن' : 'نفدت الكمية'}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-4 px-4 text-left">
                                                        <div className="flex items-center gap-2 justify-end">
                                                            {/* Set as Home Offer Button */}
                                                            <button
                                                                onClick={() => handleSetProductAsOffer(prod)}
                                                                className={`px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer active:scale-95 ${homeOffer?.productId === prod.id
                                                                        ? 'bg-[#800020] text-[#F0DFCD] border-[#800020]'
                                                                        : 'border-[#800020]/25 text-[#800020] hover:bg-[#800020]/10'
                                                                    }`}
                                                                title="تعيين هذا المنتج كعرض رئيسي على الصفحة الرئيسية"
                                                            >
                                                                <Tag className="w-3.5 h-3.5" />
                                                                <span>{homeOffer?.productId === prod.id ? 'العرض الحالي' : 'عرض رئيسي'}</span>
                                                            </button>

                                                            {/* Edit Product Button */}
                                                            <button
                                                                onClick={() => handleOpenEditProduct(prod)}
                                                                className="px-3 py-1.5 rounded-xl border border-[#800020]/25 text-[#800020] hover:bg-[#800020] hover:text-[#F0DFCD] transition flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                                <span>تعديل</span>
                                                            </button>

                                                            <button
                                                                onClick={() => handleToggleProductStock(prod.id)}
                                                                className="px-3 py-1.5 rounded-xl border border-[#800020]/25 text-[#800020] hover:bg-[#800020] hover:text-[#F0DFCD] transition text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                                                            >
                                                                {prod.inStock ? 'تعيين كنافد' : 'تفعيل التوفر'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteProduct(prod.id)}
                                                                className="p-1.5 rounded-xl border border-[#800020]/25 text-[#800020] hover:bg-[#800020] hover:text-[#F0DFCD] transition cursor-pointer active:scale-95 shadow-xs"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>

                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}

                {/* ========================================================================= */}
                {/* 5. HOME SECTIONS MANAGEMENT TAB (أقسام الصفحة الرئيسية: رجالي، الأكثر مبيعاً، نسائي، بانر العرض) */}
                {/* ========================================================================= */}
                {(activeTab === 'sections' || activeTab === 'offer') && (
                    <HomeSectionsManagement
                        productsList={productsList}
                        initialSectionTab={activeTab === 'offer' ? 'offer' : undefined}
                    />
                )}

            </main>


            {/* ========================================================================= */}
            {/* SALES BREAKDOWN DRILLDOWN MODAL (نافذة تفاصيل مبيعات القسم أو وسيلة الدفع) */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {selectedSalesBreakdown && drilldownDetails && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#F0DFCD] text-[#800020] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-[#800020]/20 flex flex-col my-auto"
                        >
                            {/* Modal Header */}
                            <div className="p-5 sm:p-6 border-b border-[#800020]/15 flex items-center justify-between bg-white/30">
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                                        style={{ backgroundColor: drilldownDetails.color || '#800020' }}
                                    >
                                        {drilldownDetails.type === 'category' ? (
                                            <Layers className="w-6 h-6" />
                                        ) : drilldownDetails.iconType === 'Smartphone' ? (
                                            <Smartphone className="w-6 h-6" />
                                        ) : drilldownDetails.iconType === 'Clock' ? (
                                            <Clock className="w-6 h-6" />
                                        ) : (
                                            <CreditCard className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black uppercase tracking-wider text-[#800020]/60">
                                                {drilldownDetails.type === 'category' ? 'تحليل مبيعات الأقسام' : 'تحليل قنوات الدفع'}
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#800020]/10 text-[#800020]">
                                                {drilldownDetails.percentage}% من المبيعات
                                            </span>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black text-[#800020]">
                                            {drilldownDetails.title}
                                        </h3>
                                        <p className="text-xs font-semibold text-[#800020]/70 mt-0.5">
                                            {drilldownDetails.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedSalesBreakdown(null);
                                        setDrilldownSearchQuery('');
                                    }}
                                    className="w-10 h-10 rounded-full bg-[#800020]/10 hover:bg-[#800020] hover:text-[#F0DFCD] transition-all flex items-center justify-center cursor-pointer"
                                    title="إغلاق النافذة"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* KPI Summary Cards */}
                            <div className="p-4 sm:p-5 border-b border-[#800020]/10 bg-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                <div className="bg-white/40 p-3.5 rounded-2xl border border-[#800020]/10">
                                    <span className="text-[11px] font-bold text-[#800020]/60 block mb-1">إجمالي الإيرادات</span>
                                    <div className="flex items-center gap-1 font-black text-lg text-[#800020]">
                                        <span>{drilldownDetails.totalRevenue.toLocaleString('ar-SA')}</span>
                                        <RiyalIcon size="0.85em" />
                                    </div>
                                </div>
                                <div className="bg-white/40 p-3.5 rounded-2xl border border-[#800020]/10">
                                    <span className="text-[11px] font-bold text-[#800020]/60 block mb-1">
                                        {drilldownDetails.type === 'category' ? 'عدد الطلبات' : 'العمليات الناجحة'}
                                    </span>
                                    <span className="font-black text-lg text-[#800020]">
                                        {drilldownDetails.ordersCount.toLocaleString('ar-SA')}
                                    </span>
                                </div>
                                <div className="bg-white/40 p-3.5 rounded-2xl border border-[#800020]/10">
                                    <span className="text-[11px] font-bold text-[#800020]/60 block mb-1">
                                        {drilldownDetails.type === 'category' ? 'القطع المباعة' : 'متوسط العملية (AOV)'}
                                    </span>
                                    <div className="flex items-center gap-1 font-black text-lg text-[#800020]">
                                        {drilldownDetails.type === 'category' ? (
                                            <span>{drilldownDetails.totalItemsCount.toLocaleString('ar-SA')} قطعة</span>
                                        ) : (
                                            <>
                                                <span>{drilldownDetails.aov.toLocaleString('ar-SA')}</span>
                                                <RiyalIcon size="0.85em" />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white/40 p-3.5 rounded-2xl border border-[#800020]/10">
                                    <span className="text-[11px] font-bold text-[#800020]/60 block mb-1">نسبة المساهمة</span>
                                    <span className="font-black text-lg text-[#800020]">
                                        {drilldownDetails.percentage}%
                                    </span>
                                </div>
                            </div>

                            {/* Search Bar & Order Counter */}
                            <div className="px-5 sm:px-6 pt-3 pb-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="w-4 h-4 text-[#800020]/50 absolute right-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="بحث برقم الطلب، اسم العميل، أو المدينة..."
                                        value={drilldownSearchQuery}
                                        onChange={(e) => setDrilldownSearchQuery(e.target.value)}
                                        className="w-full bg-[#F0DFCD] focus:bg-[#F0DFCD] text-xs font-bold text-[#800020] pr-10 pl-3 py-2.5 rounded-xl border border-[#800020]/25 focus:border-[#800020] outline-none transition placeholder:text-[#800020]/50 shadow-inner"
                                    />
                                    {drilldownSearchQuery && (
                                        <button
                                            onClick={() => setDrilldownSearchQuery('')}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#800020]/50 hover:text-[#800020]"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-[#800020]/70 self-end sm:self-center">
                                    عرض {filteredDrilldownOrders.length} من أصل {drilldownDetails.orders.length} طلب
                                </span>
                            </div>

                            {/* Orders Scrollable Content List */}
                            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 custom-scrollbar">
                                {filteredDrilldownOrders.length === 0 ? (
                                    <div className="bg-white/30 rounded-2xl p-10 text-center border border-[#800020]/10 space-y-2">
                                        <ShoppingBag className="w-10 h-10 text-[#800020]/40 mx-auto" />
                                        <p className="text-sm font-bold text-[#800020]">لا توجد طلبات مطابقة</p>
                                        <p className="text-xs text-[#800020]/60">لم يتم العثور على أي نتائج تطابق عملية البحث الحالية</p>
                                    </div>
                                ) : (
                                    filteredDrilldownOrders.map(order => {
                                        const statusMeta = orderStatusMeta[order.status] || {
                                            label: order.status || 'جديدة',
                                            textColor: '#d97706',
                                            dot: 'bg-amber-500'
                                        };

                                        const itemsToShow = order.categoryItems || order.items || [];

                                        return (
                                            <div
                                                key={order.id}
                                                className="bg-white/50 hover:bg-white/80 p-4 sm:p-5 rounded-2xl border border-[#800020]/10 hover:border-[#800020]/25 shadow-xs hover:shadow-md transition-all duration-200 space-y-3"
                                            >
                                                {/* Top Row: Order ID, Date, Customer & Status */}
                                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#800020]/10 pb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="font-mono font-black text-sm text-[#800020] bg-white/70 px-2.5 py-1 rounded-lg border border-[#800020]/10">
                                                            #{order.id}
                                                        </span>
                                                        <div>
                                                            <span className="font-black text-sm text-[#800020] block">
                                                                {order.customerName}
                                                            </span>
                                                            <div className="flex items-center gap-2 text-[11px] text-[#800020]/60">
                                                                <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{order.city}</span>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{order.date}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-[#800020]/10 text-xs font-bold" style={{ color: statusMeta.textColor }}>
                                                            <span className={`w-2 h-2 rounded-full ${statusMeta.dot || 'bg-amber-500'}`} />
                                                            <span>{statusMeta.label}</span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedOrderDetails(order)}
                                                            className="shine-button relative overflow-hidden flex items-center gap-1.5 bg-[#800020] hover:bg-[#800020]/90 active:scale-95 text-[#F0DFCD] px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer group"
                                                            title="عرض وتعديل تفاصيل الطلب الكاملة"
                                                        >
                                                            <span className="shine-effect z-10" />
                                                            <span className="relative z-20 flex items-center gap-1.5">
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span className="hidden sm:inline">تفاصيل الطلب</span>
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Middle Row: Items Summary */}
                                                <div className="space-y-2">
                                                    <div className="text-[11px] font-bold text-[#800020]/70 flex items-center justify-between">
                                                        <span>المنتجات في الطلب:</span>
                                                        <span className="text-[11px] text-[#800020]/60">وسيلة الدفع: {order.paymentMethod}</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {itemsToShow.map((it, itIdx) => (
                                                            <div key={itIdx} className="flex items-center gap-2.5 bg-white/60 p-2 rounded-xl border border-[#800020]/5">
                                                                <img
                                                                    src={it.image || '/images/coat_transparent.png'}
                                                                    alt={it.name}
                                                                    className="w-10 h-10 object-contain rounded-lg bg-[#e8d5c0]/30 p-1 flex-shrink-0"
                                                                    onError={(e) => { e.target.src = '/images/coat_transparent.png'; }}
                                                                />
                                                                <div className="min-w-0 flex-1">
                                                                    <span className="text-xs font-bold text-[#800020] block truncate">{it.name}</span>
                                                                    <span className="text-[10px] text-[#800020]/60">
                                                                        {it.qty} × {it.price?.toLocaleString('ar-SA')} ر.س {it.size ? `(${it.size})` : ''}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Total Revenue */}
                                                <div className="flex items-center justify-between pt-2 border-t border-[#800020]/10 text-xs font-bold text-[#800020]">
                                                    <span className="text-[#800020]/70">إجمالي قيمة الطلب:</span>
                                                    <div className="flex items-center gap-1 font-black text-sm text-[#800020]">
                                                        <span>{order.total?.toLocaleString('ar-SA')}</span>
                                                        <RiyalIcon size="0.85em" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 px-6 border-t border-[#800020]/15 bg-white/20 flex items-center justify-between">
                                <span className="text-xs font-bold text-[#800020]/70">
                                    {drilldownDetails.title}
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedSalesBreakdown(null);
                                        setDrilldownSearchQuery('');
                                    }}
                                    className="bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 transition px-6 py-2 rounded-xl text-xs font-bold cursor-pointer"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* ORDER DETAILS MODAL (نافذة تفاصيل الطلب والفاتورة) */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {selectedOrderDetails && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#F0DFCD] text-[#800020] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#800020]/20 p-6 sm:p-8 space-y-6"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-[#800020]/15 pb-4">
                                <div>
                                    <span className="text-xs font-mono font-bold text-[#800020]/60">تفاصيل الطلب الرسمي</span>
                                    <h3 className="text-xl sm:text-2xl font-black text-[#800020]">
                                        {selectedOrderDetails.id}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedOrderDetails(null)}
                                    className="w-9 h-9 rounded-full bg-[#800020]/10 hover:bg-[#800020] hover:text-[#F0DFCD] transition flex items-center justify-center"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Customer & Address Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/25 p-4 rounded-2xl border border-[#800020]/10 text-xs">
                                <div>
                                    <span className="font-black text-[#800020]/60 block mb-1">العميل ومعلومات التواصل:</span>
                                    <div className="font-bold text-sm text-[#800020]">{selectedOrderDetails.customerName}</div>
                                    <div className="text-[#800020]/80 mt-1">{selectedOrderDetails.phone}</div>
                                    <div className="text-[#800020]/80 mt-0.5">{selectedOrderDetails.date} • {selectedOrderDetails.time}</div>
                                </div>

                                <div>
                                    <span className="font-black text-[#800020]/60 block mb-1">عنوان الشحن والتوصيل:</span>
                                    <div className="font-bold text-[#800020]">{selectedOrderDetails.city}</div>
                                    <div className="text-[#800020]/80 mt-1 leading-relaxed">{selectedOrderDetails.address}</div>
                                </div>
                            </div>

                            {/* Status and quick update */}
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/25 p-4 rounded-2xl border border-[#800020]/10">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#800020]">الحالة الحالية:</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black ${orderStatusMeta[selectedOrderDetails.status]?.badgeColor}`}>
                                        {orderStatusMeta[selectedOrderDetails.status]?.label}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#800020]">تعديل الحالة:</span>
                                    <CustomDropdown
                                        value={selectedOrderDetails.status}
                                        onChange={(val) => handleUpdateOrderStatus(selectedOrderDetails.id, val)}
                                        options={orderStatusOptions}
                                        className="w-44"
                                        triggerClassName="!bg-[#F0DFCD] hover:!bg-[#ebd9c5] !rounded-2xl !py-1.5 !px-3.5 !border-[#800020]/20 !text-xs !min-h-[36px] !shadow-xs !font-bold"
                                        menuClassName="min-w-[175px] w-max"
                                        usePortal={true}
                                    />
                                </div>
                            </div>

                            {/* Items list */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-black text-[#800020]">عناصر الطلب ({selectedOrderDetails.items?.length || 0})</h4>
                                <div className="space-y-2">
                                    {(selectedOrderDetails.items || []).map((it, idx) => (
                                        <div key={idx} className="bg-white/25 p-3.5 rounded-2xl border border-[#800020]/10 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-white p-1 border border-[#800020]/10 flex items-center justify-center shrink-0">
                                                    <img src={it.image || '/images/coat_transparent.png'} alt={it.name || ''} className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-xs sm:text-sm text-[#800020]">{it.name}</div>
                                                    <div className="text-[11px] text-[#800020]/60 mt-0.5">
                                                        المقاس: {it.size || '-'} • اللون: {it.color || '-'} • الكمية: {it.qty || 1}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="font-black text-xs sm:text-sm text-[#800020] text-left">
                                                <span>{((Number(it.price) || 0) * (Number(it.qty) || 1)).toFixed(2)}</span>
                                                <RiyalIcon size="0.85em" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total summary */}
                            <div className="bg-[#800020]/10 p-4 rounded-2xl space-y-2 text-xs font-bold">
                                <div className="flex items-center justify-between text-[#800020]/70">
                                    <span>المجموع الفرعي:</span>
                                    <span>{(Number(selectedOrderDetails.total) || 0).toFixed(2)} <RiyalIcon size="0.85em" /></span>
                                </div>
                                <div className="flex items-center justify-between text-[#800020]/70">
                                    <span>الشحن السريع (أرامكس / سمسا):</span>
                                    <span className="text-emerald-700">مجاني</span>
                                </div>
                                <div className="flex items-center justify-between text-[#800020]/70">
                                    <span>ضريبة القيمة المضافة (15% مشمولة):</span>
                                    <span>{((Number(selectedOrderDetails.total) || 0) * 0.15).toFixed(2)} <RiyalIcon size="0.85em" /></span>
                                </div>
                                <div className="border-t border-[#800020]/20 pt-2 flex items-center justify-between text-base font-black text-[#800020]">
                                    <span>الإجمالي الكلي:</span>
                                    <span className="flex items-center gap-1">
                                        <span>{(Number(selectedOrderDetails.total) || 0).toFixed(2)}</span>
                                        <RiyalIcon size="1.1em" />
                                    </span>
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="flex items-center justify-between gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        window.print();
                                    }}
                                    className="bg-white/80 hover:bg-white text-[#800020] border border-[#800020]/20 transition px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>طباعة الفاتورة</span>
                                </button>

                                <button
                                    onClick={() => setSelectedOrderDetails(null)}
                                    className="bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 transition px-6 py-2.5 rounded-2xl text-xs font-bold"
                                >
                                    إغلاق
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* EDIT PRODUCT MODAL (نافذة تعديل بيانات المنتج) */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {editingProduct && editForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#F0DFCD] text-[#800020] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#800020]/20 p-5 sm:p-7 space-y-6 my-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-[#800020]/15 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center shadow-sm">
                                        <Edit3 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-mono font-bold text-[#800020]/60">إدارة وتعديل المخزون</span>
                                        <h3 className="text-xl sm:text-2xl font-black text-[#800020]">
                                            تعديل: {editForm.name || 'منتج'}
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseEditModal}
                                    className="w-9 h-9 rounded-full bg-[#800020]/10 hover:bg-[#800020] hover:text-[#F0DFCD] transition flex items-center justify-center cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form & Live Preview Grid */}
                            <form onSubmit={handleSaveEditProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                {/* Left / Secondary: Live Preview Card (5 cols on lg) */}
                                <div className="lg:col-span-5 space-y-4">
                                    <div className="text-xs font-bold text-[#800020]/70 flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-[#800020]" />
                                        <span>معاينة البطاقة في المتجر</span>
                                    </div>

                                    <div className="bg-white/25 rounded-2xl p-4 border border-[#800020]/15 shadow-sm space-y-3">
                                        {/* Preview Image Container */}
                                        <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-[#e8d5c0]/40 flex items-center justify-center">
                                            {(() => {
                                                const isRingPreview = String(editForm.category || '').includes('خاتم') || String(editForm.category || '').includes('خواتم') || String(editForm.name || '').includes('خاتم') || String(editForm.name || '').includes('خواتم');
                                                const isWatchPreview = String(editForm.category || '').includes('ساعة') || String(editForm.category || '').includes('ساعات') || String(editForm.name || '').includes('ساعة') || String(editForm.name || '').includes('ساعات');
                                                return (
                                                    <img
                                                        src={editForm.image}
                                                        alt={editForm.name}
                                                        className={`${isRingPreview ? 'max-h-[58%] max-w-[58%]' : (isWatchPreview ? 'max-h-[70%] max-w-[70%]' : 'w-full h-full p-2')} object-contain`}
                                                        onError={(e) => { e.target.src = '/images/coat_transparent.png'; }}
                                                    />
                                                );
                                            })()}
                                            {editForm.badge && (
                                                <span className="absolute top-3 right-3 bg-[#800020] text-[#F0DFCD] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                                                    {editForm.badge}
                                                </span>
                                            )}
                                            <span className={`absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${editForm.inStock && parseInt(editForm.stock) > 0
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                                }`}>
                                                {editForm.inStock && parseInt(editForm.stock) > 0 ? 'متوفر' : 'غير متوفر'}
                                            </span>
                                        </div>

                                        {/* Gallery thumbnails preview inside card */}
                                        {editForm.images?.length > 1 && (
                                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                                                {editForm.images.map((img, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => setEditForm(prev => ({ ...prev, image: img }))}
                                                        className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition shrink-0 bg-white/60 p-0.5 cursor-pointer ${
                                                            editForm.image === img ? 'border-[#800020] ring-2 ring-[#800020]/30 shadow-xs' : 'border-black/10 opacity-60 hover:opacity-100'
                                                        }`}
                                                        title="انقر للمعاينة"
                                                    >
                                                        <img src={img} alt="" className="w-full h-full object-contain" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Preview Info */}
                                        <div className="space-y-1.5">
                                            <span className="text-[11px] font-bold text-[#800020]/60 block">{editForm.category}</span>
                                            <h4 className="font-black text-sm text-[#800020] truncate">{editForm.name || 'اسم المنتج'}</h4>

                                            {/* Price */}
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-base text-[#800020] flex items-center gap-1">
                                                    {parseFloat(editForm.price || 0).toFixed(2)}
                                                    <RiyalIcon size="0.85em" />
                                                </span>
                                                {editForm.originalPrice && parseFloat(editForm.originalPrice) > parseFloat(editForm.price || 0) && (
                                                    <span className="text-xs line-through text-[#800020]/40 flex items-center">
                                                        {parseFloat(editForm.originalPrice).toFixed(2)}
                                                        <RiyalIcon size="0.75em" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Colors preview with live click to preview color's image */}
                                            {editForm.colors?.length > 0 && (
                                                <div className="space-y-1 pt-1">
                                                    <span className="text-[10px] text-[#800020]/70 font-bold block">الألوان المتوفرة (انقر للمعاينة):</span>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {editForm.colors.map((c, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (c.image) {
                                                                        setEditForm(prev => ({ ...prev, image: c.image }));
                                                                        showToast(`معاينة صورة اللون: ${c.name}`, 'info');
                                                                    } else {
                                                                        showToast(`اللون "${c.name}" يستخدم الصورة الرئيسية لعدم تخصيص صورة له`, 'info');
                                                                    }
                                                                }}
                                                                className={`w-5 h-5 rounded-full border-2 shadow-xs relative flex items-center justify-center transition hover:scale-110 cursor-pointer ${
                                                                    editForm.image === c.image ? 'border-[#800020] ring-2 ring-[#800020]/40 scale-105' : 'border-black/20'
                                                                }`}
                                                                style={{ backgroundColor: c.hex }}
                                                                title={`${c.name} ${c.image ? '(له صورة خاصة - انقر للمعاينة)' : '(بدون صورة خاصة)'}`}
                                                            >
                                                                {c.image && (
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Sizes preview */}
                                            {editForm.sizes?.length > 0 && (
                                                <div className="flex items-center gap-1 flex-wrap pt-1 text-[10px] text-[#800020]/70">
                                                    <span>المقاسات:</span>
                                                    {editForm.sizes.map((s, i) => (
                                                        <span key={i} className="px-1.5 py-0.5 rounded bg-[#800020]/10 font-mono font-bold">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick image selection */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#800020]">اختر صورة سريعة من الكتالوج</label>
                                        <div className="grid grid-cols-6 gap-2">
                                            {storeQuickImages.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleSelectEditQuickImage(img.url)}
                                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition p-1 bg-white cursor-pointer ${editForm.image === img.url
                                                            ? 'border-[#800020] ring-2 ring-[#800020]/30 shadow-md'
                                                            : 'border-transparent hover:border-[#800020]/30 opacity-70 hover:opacity-100'
                                                        }`}
                                                    title={img.label}
                                                >
                                                    <img src={img.url} alt={img.label} className="w-full h-full object-contain" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right / Main: Inputs Form (7 cols on lg) */}
                                <div className="lg:col-span-7 space-y-4">

                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-bold mb-1.5 text-[#800020]">اسم المنتج *</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#800020]/25 text-sm font-bold text-[#800020] focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020]"
                                            placeholder="مثال: ثوب مغربي ملكي مطرز باليد"
                                        />
                                    </div>

                                    {/* Department (Main Category) Selector */}
                                    <div>
                                        <label className="block text-xs font-bold mb-1.5 text-[#800020]">
                                            القسم الرئيسي (الجمهور المستهدف) <span className="text-rose-600">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'men', label: 'رجالي' },
                                                { id: 'women', label: 'نسائي' },
                                                { id: 'unisex', label: 'إكسسوارات' }
                                            ].map(dept => {
                                                const isSelected = (editForm.gender || 'men') === dept.id;
                                                return (
                                                    <button
                                                        key={dept.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const newGender = dept.id;
                                                            const subCats = DEPARTMENT_CATEGORIES[newGender]?.categories || productCategoriesList;
                                                            const keepCat = subCats.includes(editForm.category) ? editForm.category : subCats[0];
                                                            setEditForm(prev => ({
                                                                ...prev,
                                                                gender: newGender,
                                                                category: keepCat
                                                            }));
                                                        }}
                                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                                                            isSelected
                                                                ? 'bg-[#800020] text-[#F0DFCD] border-[#800020] shadow-sm'
                                                                : 'bg-white/70 hover:bg-white text-[#800020] border-[#800020]/20'
                                                        }`}
                                                    >
                                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                                        <span>{dept.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Sub-Category & Badge */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold mb-1.5 text-[#800020]">
                                                التصنيف الخاص بـ ({editForm.gender === 'women' ? 'القسم النسائي' : editForm.gender === 'unisex' ? 'قسم الإكسسوارات' : 'القسم الرجالي'}) <span className="text-rose-600">*</span>
                                            </label>
                                            <CustomDropdown
                                                value={editForm.category}
                                                onChange={(val) => setEditForm(prev => ({ ...prev, category: val }))}
                                                options={DEPARTMENT_CATEGORIES[editForm.gender || 'men']?.categories || productCategoriesList}
                                                triggerClassName="!bg-white !rounded-xl !py-2.5 !px-3 !border-[#800020]/25 !text-xs font-bold"
                                                menuClassName="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1.5 text-[#800020]">الشارة الترويجية</label>
                                            <CustomDropdown
                                                value={editForm.badge || ''}
                                                onChange={(val) => setEditForm(prev => ({ ...prev, badge: val }))}
                                                options={badgeOptions}
                                                placeholder="بدون شارة"
                                                triggerClassName="!bg-white !rounded-xl !py-2.5 !px-3 !border-[#800020]/25 !text-xs font-bold"
                                                menuClassName="w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Price, Original Price, Stock Qty */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold mb-1.5 text-[#800020]">السعر الحالي (ر.س) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.price}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#800020]/25 text-xs font-black text-[#800020] text-center focus:outline-none focus:border-[#800020]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1.5 text-[#800020]">السعر الأصلي</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.originalPrice}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                                                placeholder="اختياري"
                                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#800020]/25 text-xs font-bold text-[#800020] text-center focus:outline-none focus:border-[#800020]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1.5 text-[#800020]">الكمية بالمخزن</label>
                                            <input
                                                type="number"
                                                value={editForm.stock}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, stock: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#800020]/25 text-xs font-bold text-[#800020] text-center focus:outline-none focus:border-[#800020]"
                                            />
                                        </div>
                                    </div>

                                    {/* In Stock Toggle */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/25 border border-[#800020]/15">
                                        <div>
                                            <div className="text-xs font-bold text-[#800020]">حالة التوفر للبيع</div>
                                            <div className="text-[11px] text-[#800020]/60">هل يمكن للعملاء شراء المنتج حالياً؟</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editForm.inStock}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, inStock: e.target.checked }))}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800020]"></div>
                                        </label>
                                    </div>

                                    {/* Multi-Image Gallery Manager */}
                                    <div className="space-y-3 p-3.5 bg-white/70 rounded-2xl border border-[#800020]/15">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Images className="w-4 h-4 text-[#800020]" />
                                                <label className="block text-xs font-bold text-[#800020]">
                                                    معرض صور المنتج (تحميل عدة صور للمنتج)
                                                </label>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#800020]/10 text-[#800020]">
                                                    {editForm.images?.length || 1} صور
                                                </span>
                                            </div>
                                            {isUploadingImage && (
                                                <span className="text-[11px] text-[#800020] font-bold animate-pulse">
                                                    جاري الرفع والمعالجة...
                                                </span>
                                            )}
                                        </div>

                                        {/* Action buttons: Multiple file upload from device, Store Gallery, AI removal */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Hidden Multiple File Input */}
                                            <input
                                                type="file"
                                                id="edit-multiple-gallery-input"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => handleImageFileUpload(e, 'edit-gallery')}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="edit-multiple-gallery-input"
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#800020] text-[#F0DFCD] text-xs font-bold hover:bg-[#66001a] transition cursor-pointer shadow-xs active:scale-95"
                                                title="يمكنك تحديد عدة صور دفعة واحدة من جهازك"
                                            >
                                                <UploadCloud className="w-3.5 h-3.5" />
                                                <span>+ رفع عدة صور من جهازك</span>
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setGalleryTarget('edit-gallery');
                                                    setIsGalleryModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#800020]/25 text-[#800020] text-xs font-bold hover:bg-[#800020]/5 transition cursor-pointer shadow-xs active:scale-95"
                                            >
                                                <ImageIcon className="w-3.5 h-3.5" />
                                                <span>معرض المتجر</span>
                                            </button>

                                            {editForm.image && (
                                                <button
                                                    type="button"
                                                    disabled={isRemovingBg || isUploadingImage}
                                                    onClick={() => handleManualRemoveBackground('edit')}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-[#800020] text-white text-xs font-bold hover:brightness-110 transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                                                    title="تفريغ خلفية الصورة الرئيسية الحالية بالذكاء الاصطناعي"
                                                >
                                                    <Wand2 className="w-3.5 h-3.5" />
                                                    <span>{isRemovingBg ? (bgRemovalProgress || 'جاري التفريغ...') : 'تفريغ الخلفية (AI)'}</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* AI Background Removal Toggle */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-[#800020]/5 rounded-xl border border-amber-500/20">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={autoRemoveBg}
                                                    onChange={(e) => setAutoRemoveBg(e.target.checked)}
                                                    className="w-4 h-4 accent-[#800020] rounded cursor-pointer"
                                                />
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                                    <span className="text-xs font-bold text-[#800020]">
                                                        حذف وتفريغ الخلفية تلقائياً بالذكاء الاصطناعي عند رفع الصور
                                                    </span>
                                                </div>
                                            </label>
                                            {isRemovingBg && (
                                                <span className="text-[11px] font-black text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-lg animate-pulse">
                                                    {bgRemovalProgress || 'جاري المعالجة...'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Gallery Grid displaying all uploaded product images */}
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-1">
                                             {(editForm.images || [editForm.image]).filter(Boolean).map((imgUrl, idx) => {
                                                 const isPrimary = editForm.image === imgUrl;
                                                 const assignedColors = (editForm.colors || []).filter(c => c.image === imgUrl);
                                                 return (
                                                     <div
                                                         key={idx}
                                                         className={`group relative aspect-square rounded-xl bg-white border-2 overflow-hidden flex items-center justify-center p-1.5 transition ${
                                                             isPrimary
                                                                 ? 'border-[#800020] ring-2 ring-[#800020]/25 shadow-sm'
                                                                 : 'border-[#800020]/20 hover:border-[#800020]/50'
                                                         }`}
                                                     >
                                                         <img src={imgUrl} alt="" className="w-full h-full object-contain" />

                                                         {/* Primary Badge */}
                                                         {isPrimary ? (
                                                             <span className="absolute top-1 right-1 bg-[#800020] text-[#F0DFCD] text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                                                                 ★ الرئيسية
                                                             </span>
                                                         ) : (
                                                             <button
                                                                 type="button"
                                                                 onClick={() => handleSetPrimaryEditImage(imgUrl)}
                                                                 className="absolute top-1 right-1 bg-white/95 hover:bg-[#800020] hover:text-white text-[#800020] text-[9px] font-bold px-1.5 py-0.5 rounded shadow opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition cursor-pointer"
                                                                 title="تعيين كصورة رئيسية للمنتج تظهر على بطاقة المتجر من الخارج"
                                                             >
                                                                 تعيين رئيسية
                                                             </button>
                                                         )}

                                                         {/* Assigned color dots */}
                                                         {assignedColors.length > 0 && (
                                                             <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-white/90 px-1 py-0.5 rounded-full shadow-2xs border border-black/10">
                                                                 {assignedColors.map((ac, cIdx) => (
                                                                     <span
                                                                         key={cIdx}
                                                                         className="w-2.5 h-2.5 rounded-full border border-black/20"
                                                                         style={{ backgroundColor: ac.hex }}
                                                                         title={`مرتبطة بلون: ${ac.name}`}
                                                                     />
                                                                 ))}
                                                             </div>
                                                         )}

                                                         {/* Delete image button */}
                                                         <button
                                                             type="button"
                                                             onClick={() => handleRemoveEditGalleryImage(imgUrl)}
                                                             className="absolute bottom-1 left-1 bg-white/90 hover:bg-rose-600 hover:text-white text-rose-600 p-1 rounded-md opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-xs"
                                                             title="حذف هذه الصورة من المعرض"
                                                         >
                                                             <Trash2 className="w-3 h-3" />
                                                         </button>
                                                     </div>
                                                 );
                                             })}
                                        </div>

                                        {/* URL addition */}
                                        <div className="flex items-center gap-2 pt-1">
                                             <input
                                                 type="text"
                                                 value={newGalleryImageUrl}
                                                 onChange={(e) => setNewGalleryImageUrl(e.target.value)}
                                                 placeholder="أو ألصق رابط صورة هنا (مثال: /images/example.png أو https://...)"
                                                 className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#800020]/25 text-xs text-[#800020] dir-ltr focus:outline-none focus:border-[#800020]"
                                                 onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEditGalleryImageUrl(); } }}
                                             />
                                             <button
                                                 type="button"
                                                 onClick={handleAddEditGalleryImageUrl}
                                                 className="px-3 py-1.5 bg-[#800020]/15 hover:bg-[#800020] hover:text-[#F0DFCD] text-[#800020] text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                                             >
                                                 + إضافة للمعرض
                                             </button>
                                        </div>
                                    </div>

                                    {/* Sizes Selection */}
                                    <div className="space-y-3 p-3.5 bg-white/70 rounded-2xl border border-[#800020]/15">
                                        {/* Header with counter & Clear All button */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <label className="block text-xs font-bold text-[#800020]">
                                                    المقاسات المحددة للمنتج حالياً
                                                </label>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#800020]/10 text-[#800020]">
                                                    {editForm.sizes.length} مقاسات
                                                </span>
                                            </div>
                                            {editForm.sizes.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearAllEditSizes}
                                                    className="text-[11px] text-rose-600 hover:text-rose-800 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                                    title="مسح جميع المقاسات المحددة للبدء من جديد"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    <span>مسح كل المقاسات</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Active Selected Sizes Pills with explicit (X) delete button */}
                                        <div className="p-2.5 bg-white rounded-xl border border-[#800020]/15 min-h-[46px] flex flex-wrap items-center gap-2">
                                            {editForm.sizes.length > 0 ? (
                                                editForm.sizes.map((sz, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#800020] text-[#F0DFCD] text-xs font-black shadow-xs group animate-fadeIn"
                                                    >
                                                        <span>{sz}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveEditSize(sz)}
                                                            className="w-4 h-4 rounded-full bg-white/20 hover:bg-rose-600 hover:text-white text-[#F0DFCD] transition flex items-center justify-center cursor-pointer"
                                                            title={`حذف مقاس (${sz}) نهائياً من هذا المنتج`}
                                                        >
                                                            <X className="w-3 h-3" strokeWidth={3} />
                                                        </button>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-[#800020]/50 italic">
                                                    لم يتم تحديد أي مقاسات بعد — انقر على المقاسات بالأسفل لإضافتها أو اكتب مقاساً مخصصاً.
                                                </span>
                                            )}
                                        </div>

                                        {/* Quick Presets Section */}
                                        <div className="space-y-2 pt-1 border-t border-[#800020]/10">
                                            <span className="text-[11px] font-bold text-[#800020]/70 block">
                                                إضافة / إزالة سريعة بنقرة واحدة:
                                            </span>

                                            {/* Abaya & Thobe Sizes */}
                                            <div>
                                                <span className="text-[10px] font-bold text-[#800020]/60 block mb-1">
                                                    مقاسات العبايات والثياب (الطول بالبوصة):
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {abayaThobeSizesList.map(sz => {
                                                        const isSelected = editForm.sizes.includes(sz);
                                                        return (
                                                            <button
                                                                key={sz}
                                                                type="button"
                                                                onClick={() => handleEditSizeToggle(sz)}
                                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                                                    isSelected
                                                                        ? 'bg-[#800020] text-[#F0DFCD] ring-2 ring-[#800020]/30 shadow-xs'
                                                                        : 'bg-white border border-[#800020]/20 text-[#800020] hover:bg-amber-50'
                                                                }`}
                                                            >
                                                                <span>{sz}</span>
                                                                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Clothing Sizes */}
                                            <div>
                                                <span className="text-[10px] font-bold text-[#800020]/60 block mb-1">
                                                    مقاسات الملابس العالمية:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {clothingSizesList.map(sz => {
                                                        const isSelected = editForm.sizes.includes(sz);
                                                        return (
                                                            <button
                                                                key={sz}
                                                                type="button"
                                                                onClick={() => handleEditSizeToggle(sz)}
                                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                                                    isSelected
                                                                        ? 'bg-[#800020] text-[#F0DFCD] ring-2 ring-[#800020]/30 shadow-xs'
                                                                        : 'bg-white border border-[#800020]/20 text-[#800020] hover:bg-amber-50'
                                                                }`}
                                                            >
                                                                <span>{sz}</span>
                                                                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Shoe Sizes & Free Size */}
                                            <div>
                                                <span className="text-[10px] font-bold text-[#800020]/60 block mb-1">
                                                    مقاسات الأحذية ومقاس موحد:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {shoeSizesList.map(sz => {
                                                        const isSelected = editForm.sizes.includes(sz);
                                                        return (
                                                            <button
                                                                key={sz}
                                                                type="button"
                                                                onClick={() => handleEditSizeToggle(sz)}
                                                                className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                                                    isSelected
                                                                        ? 'bg-[#800020] text-[#F0DFCD] ring-2 ring-[#800020]/30 shadow-xs'
                                                                        : 'bg-white border border-[#800020]/20 text-[#800020] hover:bg-amber-50'
                                                                }`}
                                                            >
                                                                <span>{sz}</span>
                                                                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                                                            </button>
                                                        );
                                                    })}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditSizeToggle('Free Size')}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                                            editForm.sizes.includes('Free Size')
                                                                ? 'bg-[#800020] text-[#F0DFCD] ring-2 ring-[#800020]/30 shadow-xs'
                                                                : 'bg-white border border-[#800020]/20 text-[#800020] hover:bg-amber-50'
                                                        }`}
                                                    >
                                                        <span>مقاس موحد (Free Size)</span>
                                                        {editForm.sizes.includes('Free Size') && <Check className="w-3 h-3" strokeWidth={3} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Add Custom Size */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-[#800020]/10">
                                            <input
                                                type="text"
                                                value={customEditSizeInput}
                                                onChange={(e) => setCustomEditSizeInput(e.target.value)}
                                                placeholder="مقاس مخصص آخر (مثال: 48، 54 خاص)..."
                                                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#800020]/25 text-xs font-bold text-[#800020] focus:outline-none"
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomEditSize(e); }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCustomEditSize}
                                                className="px-3.5 py-1.5 bg-[#800020]/15 hover:bg-[#800020] hover:text-[#F0DFCD] text-[#800020] text-xs font-bold rounded-lg transition cursor-pointer shrink-0"
                                            >
                                                + إضافة مقاس
                                            </button>
                                        </div>
                                    </div>

                                    {/* Colors Selection & Color Image Mapping */}
                                    <div className="space-y-2.5 p-3.5 bg-white/70 rounded-2xl border border-[#800020]/15">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-bold text-[#800020]">
                                                الألوان المتوفرة وربط كل لون بصورته (مثال: الأسود له صور والأبيض له صور)
                                            </label>
                                            <span className="text-[11px] text-[#800020]/70 font-bold">
                                                {editForm.colors.length} ألوان
                                            </span>
                                        </div>

                                        {/* List of colors */}
                                        <div className="space-y-2">
                                            {editForm.colors.map((c, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-[#800020]/20 shadow-2xs"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <span
                                                            className="w-6 h-6 rounded-full border border-black/20 shrink-0 shadow-inner"
                                                            style={{ backgroundColor: c.hex }}
                                                        />
                                                        <div className="min-w-0">
                                                            <span className="font-bold text-xs text-[#800020] block truncate">
                                                                {c.name}
                                                            </span>
                                                            <span className="text-[10px] text-[#800020]/50 font-mono block">
                                                                {c.hex}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {c.image ? (
                                                            <div className="flex items-center gap-1.5 bg-[#800020]/5 px-2 py-1 rounded-xl border border-[#800020]/15">
                                                                <img
                                                                    src={c.image}
                                                                    alt={c.name}
                                                                    className="w-8 h-8 rounded-lg object-contain bg-white border border-black/10 shrink-0"
                                                                    onError={(e) => { e.target.src = '/images/coat_transparent.png'; }}
                                                                />
                                                                <div className="text-[10px] text-[#800020] font-bold">
                                                                    <span>صورة مخصصة</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setActiveColorImagePicker(activeColorImagePicker === i ? null : i)}
                                                                    className="text-xs text-[#800020] hover:underline px-1 font-bold cursor-pointer"
                                                                >
                                                                    تغيير
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleClearColorImage(i)}
                                                                    className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
                                                                    title="إلغاء الصورة المخصصة لهذا اللون"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveColorImagePicker(activeColorImagePicker === i ? null : i)}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition cursor-pointer"
                                                            >
                                                                <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                                                                <span>+ تخصيص صورة لهذا اللون</span>
                                                            </button>
                                                        )}

                                                        {/* Set as Storefront Display Color */}
                                                        {(() => {
                                                            const isCurrentDisplayColor = editForm.displayColorName 
                                                                ? editForm.displayColorName === c.name 
                                                                : (c.image && c.image === editForm.image) || (i === 0 && !editForm.colors.some(col => col.image === editForm.image));
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSetDisplayColor(i)}
                                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                                                        isCurrentDisplayColor
                                                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                                            : 'bg-white hover:bg-[#800020]/10 text-[#800020] border-[#800020]/25'
                                                                    }`}
                                                                    title={isCurrentDisplayColor ? 'هذا هو لون العرض الأساسي للمنتج في المتجر' : 'تعيين هذا اللون ليكون لون العرض الأساسي للمنتج في المتجر'}
                                                                >
                                                                    {isCurrentDisplayColor ? (
                                                                        <>
                                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                                            <span>لون عرض المنتج</span>
                                                                        </>
                                                                    ) : (
                                                                        <span>تعيين كلون العرض</span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })()}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveEditColor(c.hex)}
                                                            className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                                            title="حذف هذا اللون"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Color Image Selector Popover / Drawer */}
                                        {activeColorImagePicker !== null && editForm.colors[activeColorImagePicker] && (
                                            <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-xl space-y-2.5 animate-fadeIn">
                                                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                                                    <span className="flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                                                        <span>اختر صورة لـ "{editForm.colors[activeColorImagePicker].name}":</span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveColorImagePicker(null)}
                                                        className="text-amber-900 hover:text-black p-0.5 cursor-pointer"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-amber-800/80 font-bold block">
                                                        1. اختر من صور المنتج المرفوعة:
                                                    </span>
                                                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                                                        {(editForm.images || [editForm.image]).filter(Boolean).map((imgUrl, gIdx) => (
                                                            <button
                                                                key={gIdx}
                                                                type="button"
                                                                onClick={() => handleSetColorImage(activeColorImagePicker, imgUrl)}
                                                                className={`aspect-square rounded-lg p-1 bg-white border-2 overflow-hidden transition cursor-pointer ${
                                                                    editForm.colors[activeColorImagePicker]?.image === imgUrl
                                                                        ? 'border-[#800020] ring-2 ring-[#800020]/30 shadow-xs'
                                                                        : 'border-transparent hover:border-amber-500'
                                                                }`}
                                                            >
                                                                <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-1 border-t border-amber-200">
                                                    <input
                                                        type="file"
                                                        id={`color-file-input-${activeColorImagePicker}`}
                                                        accept="image/*"
                                                        onChange={(e) => handleImageFileUpload(e, `edit-color-${activeColorImagePicker}`)}
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor={`color-file-input-${activeColorImagePicker}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#800020] text-[#F0DFCD] text-xs font-bold hover:bg-[#66001a] transition cursor-pointer"
                                                    >
                                                        <UploadCloud className="w-3.5 h-3.5" />
                                                        <span>رفع صورة جديدة خاصة بهذا اللون من جهازك</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {/* Add custom color */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-[#800020]/10">
                                            <input
                                                type="color"
                                                value={customEditColorHex}
                                                onChange={(e) => setCustomEditColorHex(e.target.value)}
                                                className="w-8 h-8 rounded-lg border border-[#800020]/30 cursor-pointer bg-white p-0.5 shrink-0"
                                                title="اختر درجة اللون"
                                            />
                                            <input
                                                type="text"
                                                value={customEditColorName}
                                                onChange={(e) => setCustomEditColorName(e.target.value)}
                                                placeholder="اسم اللون (مثال: أبيض ناصع)"
                                                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#800020]/25 text-xs font-bold text-[#800020] focus:outline-none"
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEditColor(); } }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddEditColor}
                                                className="px-3.5 py-1.5 bg-[#800020]/15 hover:bg-[#800020] hover:text-[#F0DFCD] text-[#800020] text-xs font-bold rounded-lg transition cursor-pointer shrink-0"
                                            >
                                                + إضافة لون
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-bold mb-1.5 text-[#800020]">وصف المنتج</label>
                                        <textarea
                                            rows={3}
                                            value={editForm.description}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#800020]/25 text-xs font-normal text-[#800020] focus:outline-none focus:border-[#800020]"
                                            placeholder="اكتب وصفاً جذاباً يوضح خامة القماش، دقة التطريز، وأسلوب الحياكة..."
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-xs font-bold mb-1.5 text-[#800020]">الكلمات الدلالية (مفصولة بفاصلة)</label>
                                        <input
                                            type="text"
                                            value={editForm.tags}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#800020]/25 text-xs text-[#800020] focus:outline-none focus:border-[#800020]"
                                            placeholder="مثال: فاخر, شتوي, تطريز يدوي"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#800020]/15">
                                        <button
                                            type="button"
                                            onClick={handleCloseEditModal}
                                            className="px-5 py-2.5 rounded-xl border border-[#800020]/30 text-[#800020] hover:bg-white text-xs font-bold transition cursor-pointer"
                                        >
                                            إلغاء التعديل
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSavingEdit}
                                            className="px-7 py-2.5 rounded-xl bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            {isSavingEdit ? (
                                                <span>جاري الحفظ والمزامنة...</span>
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    <span>حفظ التعديلات والتحديث الفوري</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                </div>

                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- STORE GALLERY MODAL --- */}
            <AnimatePresence>
                {isGalleryModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[#FAF7F2] rounded-3xl border border-[#800020]/20 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-[#800020]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-4 sm:p-6 border-b border-[#800020]/15 flex items-center justify-between bg-white/70">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center shadow-xs">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-[#800020]">
                                            معرض صور المتجر الفاخرة
                                        </h3>
                                        <p className="text-xs text-[#800020]/60">
                                            اختر أي صورة بجودة عالية وخلفية مفرغة، أو ارفع صورة جديدة من معرض جهازك
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsGalleryModalOpen(false)}
                                    className="w-9 h-9 rounded-xl bg-white border border-[#800020]/15 flex items-center justify-center text-[#800020] hover:bg-[#800020]/10 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search & Filter & Upload Bar */}
                            <div className="p-4 sm:px-6 bg-[#FAF7F2] border-b border-[#800020]/10 space-y-3">
                                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                                    {/* Search input */}
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#800020]/40" />
                                        <input
                                            type="text"
                                            value={gallerySearch}
                                            onChange={(e) => setGallerySearch(e.target.value)}
                                            placeholder="ابحث في المعرض بالاسم أو التصنيف..."
                                            className="w-full pl-3 pr-10 py-2 rounded-xl bg-white border border-[#800020]/20 text-xs sm:text-sm text-[#800020] placeholder-[#800020]/40 focus:outline-none focus:border-[#800020]"
                                        />
                                        {gallerySearch && (
                                            <button
                                                type="button"
                                                onClick={() => setGallerySearch('')}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Direct File Upload button inside modal too */}
                                    <div>
                                        <input
                                            type="file"
                                            id="modal-device-gallery-input"
                                            accept="image/*"
                                            onChange={(e) => {
                                                handleImageFileUpload(e, galleryTarget);
                                                setIsGalleryModalOpen(false);
                                            }}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="modal-device-gallery-input"
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#800020] text-[#F0DFCD] text-xs font-bold hover:bg-[#66001a] transition cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
                                        >
                                            <UploadCloud className="w-4 h-4" />
                                            <span>رفع من جهازك مباشرة</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Category tabs */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                                    {['الكل', ...categoryOptions].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setGalleryCategory(cat)}
                                            className={`px-3 py-1 rounded-lg font-bold shrink-0 transition ${galleryCategory === cat
                                                ? 'bg-[#800020] text-[#F0DFCD]'
                                                : 'bg-white/80 border border-[#800020]/15 text-[#800020] hover:bg-white'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Images Grid */}
                            <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[55vh]">
                                {filteredGalleryImages.length === 0 ? (
                                    <div className="py-12 text-center text-[#800020]/60">
                                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm font-bold">لا توجد صور مطابقة لبحثك في المعرض</p>
                                        <p className="text-xs mt-1">يمكنك رفع صورة جديدة من جهازك عبر الزر في الأعلى</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                                        {filteredGalleryImages.map((img, idx) => {
                                            const currentSelectedUrl = galleryTarget === 'edit' ? editForm?.image : productForm.image;
                                            const isSelected = currentSelectedUrl === img.url;

                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleSelectFromGalleryModal(img.url)}
                                                    className={`group rounded-2xl p-2.5 bg-white border-2 flex flex-col items-center justify-between transition-all hover:shadow-md cursor-pointer relative ${isSelected
                                                        ? 'border-[#800020] ring-2 ring-[#800020]/20'
                                                        : 'border-[#800020]/15 hover:border-[#800020]/40'
                                                        }`}
                                                >
                                                    <div className="w-full aspect-square flex items-center justify-center p-1 overflow-hidden">
                                                        <img
                                                            src={img.url}
                                                            alt={img.name}
                                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                            onError={(e) => { e.target.src = '/images/coat_transparent.png'; }}
                                                        />
                                                    </div>
                                                    <div className="w-full pt-2 border-t border-[#800020]/10 text-center">
                                                        <p className="text-xs font-bold text-[#800020] truncate w-full" title={img.name}>
                                                            {img.name}
                                                        </p>
                                                        {img.category && (
                                                            <span className="text-[10px] text-[#800020]/60 block truncate">
                                                                {img.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 bg-[#800020] text-[#F0DFCD] rounded-full p-1 shadow-sm">
                                                            <Check className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 sm:p-4 bg-white/70 border-t border-[#800020]/15 flex items-center justify-between text-xs text-[#800020]/70">
                                <span>عدد الصور المتاحة: {filteredGalleryImages.length}</span>
                                <button
                                    type="button"
                                    onClick={() => setIsGalleryModalOpen(false)}
                                    className="px-4 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
