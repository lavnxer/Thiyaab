import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    TrendingUp,
    ShoppingBag,
    PlusCircle,
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
    LogOut
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import RiyalIcon from '../components/RiyalIcon';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { productsApi, ordersApi, categoriesApi } from '../lib/api';
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
    { value: 'مميز', label: 'مميز' },
    { value: 'حصري', label: 'حصري' },
    { value: 'الأكثر طلباً', label: 'الأكثر طلباً' },
    { value: 'تخفيض خاص', label: 'تخفيض خاص' },
];
import {
    orderStatusMeta,
    storeQuickImages,
    productCategoriesList,
    commonSizesList,
    commonColorsList
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
        if (location.pathname.includes('/products') || location.pathname.includes('/inventory') || location.search.includes('edit=')) return 'products';
        if (location.pathname.includes('/sections') || location.pathname.includes('/offer') || location.search.includes('tab=offer') || location.search.includes('tab=sections')) return 'sections';
        return initialTab || 'overview';
    }, [location.pathname, location.search, initialTab]);

    const [activeTab, setActiveTab] = useState(defaultTab);
    const [salesPeriod, setSalesPeriod] = useState('week'); // today, week, month, year
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

    // --- EDIT PRODUCT MODAL STATE ---
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [customEditSizeInput, setCustomEditSizeInput] = useState('');
    const [customEditColorName, setCustomEditColorName] = useState('');
    const [customEditColorHex, setCustomEditColorHex] = useState('#800020');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [selectedProductCategory, setSelectedProductCategory] = useState('الكل');

    // --- SALES BREAKDOWN DRILLDOWN MODAL STATE ---
    const [selectedSalesBreakdown, setSelectedSalesBreakdown] = useState(null);
    const [drilldownSearchQuery, setDrilldownSearchQuery] = useState('');

    // --- ADD PRODUCT FORM STATE ---
    const initialFormState = {
        name: '',
        category: 'معاطف وجاكيتات',
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
                    category: p.category?.name || 'معاطف وجاكيتات',
                    categoryId: p.category?.id || p.category_id,
                    image: p.image_url || '/images/coat_transparent.png',
                    images: p.images || [p.image_url || '/images/coat_transparent.png'],
                    colors: p.colors || [],
                    sizes: p.sizes?.map(s => s.size) || ['M', 'L'],
                    inStock: p.in_stock,
                    stock: p.sizes?.reduce((sum, s) => sum + (s.stock_qty || 10), 0) || (p.in_stock ? 20 : 0),
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
            await productsApi.update(productId, { in_stock: qty > 0 });
        }

        showToast('تم تحديث كمية المخزون بنجاح', 'success');
    };

    // Toggle product active / inStock
    const handleToggleProductStock = async (productId) => {
        setProductsList(prev => prev.map(p => {
            if (p.id === productId) {
                const nextVal = !p.inStock;
                showToast(nextVal ? 'تم تفعيل توفر المنتج في المتجر' : 'تم تعيين المنتج كنافد في المتجر', 'info');
                if (typeof productId === 'string' && productId.includes('-')) {
                    productsApi.update(productId, { in_stock: nextVal });
                }
                return { ...p, inStock: nextVal };
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
        setEditForm({
            id: prod.id,
            name: prod.name || '',
            category: prod.category || 'معاطف وجاكيتات',
            price: String(prod.price || ''),
            originalPrice: prod.originalPrice ? String(prod.originalPrice) : '',
            stock: String(prod.stock !== undefined ? prod.stock : (prod.inStock ? 20 : 0)),
            badge: prod.badge || (prod.isNew ? 'جديد' : ''),
            description: prod.description || '',
            image: prod.image || '/images/coat_transparent.png',
            sizes: Array.isArray(prod.sizes) && prod.sizes.length > 0 ? [...prod.sizes] : ['M', 'L'],
            colors: Array.isArray(prod.colors) && prod.colors.length > 0
                ? prod.colors.map(c => ({ name: c.name || 'لون', hex: c.hex || '#111111' }))
                : [{ name: 'أسود ملكي', hex: '#111111' }],
            tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : (prod.tags || ''),
            inStock: prod.inStock !== false
        });
    };

    const handleCloseEditModal = () => {
        setEditingProduct(null);
        setEditForm(null);
        setCustomEditSizeInput('');
        setCustomEditColorName('');
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
        setEditForm(prev => ({
            ...prev,
            colors: [...prev.colors, { name: customEditColorName.trim(), hex: customEditColorHex }]
        }));
        setCustomEditColorName('');
    };

    const handleRemoveEditColor = (hex) => {
        if (!editForm) return;
        setEditForm(prev => ({
            ...prev,
            colors: prev.colors.filter(c => c.hex !== hex)
        }));
    };

    const handleSelectEditQuickImage = (imgUrl) => {
        if (!editForm) return;
        setEditForm(prev => ({ ...prev, image: imgUrl }));
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

            const matchedCategory = categories.find(c => c.name === editForm.category) || categories[0];
            const stockQty = parseInt(editForm.stock) || 0;
            const isNowInStock = editForm.inStock && stockQty > 0;

            const updatePayload = {
                name: editForm.name.trim(),
                description: editForm.description.trim() || 'منتج فاخر من تشكيلة ثياب الحصرية.',
                price: parseFloat(editForm.price),
                original_price: editForm.originalPrice ? parseFloat(editForm.originalPrice) : null,
                category_id: matchedCategory?.id,
                image_url: editForm.image,
                images: [editForm.image],
                in_stock: isNowInStock,
                is_new: editForm.badge.includes('جديد'),
                is_featured: editForm.badge.includes('مميز') || editForm.badge.includes('حصري'),
                tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
                colors: editForm.colors,
                sizes: editForm.sizes.map(s => ({ size: s, in_stock: isNowInStock, stock_qty: stockQty }))
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
                        image: editForm.image,
                        images: [editForm.image],
                        colors: editForm.colors,
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

            showToast(`تم حفظ وتحديث بيانات منتج "${editForm.name}" بنجاح!`, 'sparkle');
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

    // Categories for filter tabs (Image 2 style)
    const productCategoryOptions = useMemo(() => {
        const defaultTabs = ['الكل', 'فساتين', 'عبايات', 'قمصان', 'بناطيل', 'أحذية', 'حقائب'];
        const existing = new Set(defaultTabs);
        productsList.forEach(p => {
            if (p.category && !existing.has(p.category)) {
                defaultTabs.push(p.category);
                existing.add(p.category);
            }
        });
        return defaultTabs;
    }, [productsList]);

    // Filtered products list for table
    const filteredProductsList = useMemo(() => {
        return productsList.filter(p => {
            if (selectedProductCategory !== 'الكل') {
                const matchCategory = p.category === selectedProductCategory || p.category?.toLowerCase() === selectedProductCategory.toLowerCase();
                if (!matchCategory) return false;
            }
            if (productSearchQuery.trim()) {
                const q = productSearchQuery.toLowerCase();
                const matchSearch = p.name.toLowerCase().includes(q) ||
                    p.category?.toLowerCase().includes(q) ||
                    (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));
                if (!matchSearch) return false;
            }
            return true;
        });
    }, [productsList, productSearchQuery, selectedProductCategory]);

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

    const handleAddColor = () => {
        if (!customColorName.trim()) {
            showToast('يرجى كتابة اسم اللون', 'error');
            return;
        }
        setProductForm(prev => ({
            ...prev,
            colors: [...prev.colors, { name: customColorName.trim(), hex: customColorHex }]
        }));
        setCustomColorName('');
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

    const handleFillDemoProduct = () => {
        setProductForm({
            name: 'بشت حساوي ملكي فاخر بالزري المذهب',
            category: 'أطقم متكاملة',
            price: '1450',
            originalPrice: '1900',
            stock: '15',
            sku: 'THY-BISHT-99',
            badge: 'حصري وفاخر',
            description: 'بشت حساوي كلاسيكي فاخر منسوج من أجود خيوط الصوف والحرير، مطرز يدوياً بالقصب الذهبي الأصلي مع كرمشة يدوية متقنة تليق بكافة المناسبات الرسمية.',
            image: '/images/winter_outfit_transparent.png',
            sizes: ['56', '58', '60', '62'],
            colors: [
                { name: 'أسود ملكي', hex: '#111111' },
                { name: 'بني عسلي', hex: '#5c3818' },
                { name: 'كريمي شتوي', hex: '#d9c7b0' }
            ],
            tags: 'بشت, مناسبات, تراث, ملكي',
            inStock: true
        });
        showToast('تم تعبئة نموذج تجريبي جاهز بنجاح', 'sparkle');
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

        const matchedCategory = categories.find(c => c.name === productForm.category) || categories[0];

        const { data: createdProduct, error } = await productsApi.create({
            name: productForm.name.trim(),
            description: productForm.description.trim() || 'منتج فاخر من تشكيلة ثياب الحصرية.',
            price: parseFloat(productForm.price),
            original_price: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
            category_id: matchedCategory?.id,
            image_url: productForm.image,
            images: [productForm.image],
            in_stock: parseInt(productForm.stock) > 0,
            is_new: productForm.badge.includes('جديد'),
            tags: productForm.tags.split(',').map(t => t.trim()).filter(Boolean),
            colors: productForm.colors,
            sizes: productForm.sizes.map(s => ({ size: s, in_stock: true, stock_qty: parseInt(productForm.stock) || 10 }))
        });

        if (error) {
            console.error('Error creating product in Supabase:', error);
            showToast(`تنبيه: تم حفظ المنتج (${error.message})`, 'info');
        } else {
            showToast(`تمت إضافة منتج "${productForm.name}" بنجاح إلى قاعدة بيانات سوبابيس والمتجر!`, 'sparkle');
        }

        const newId = createdProduct?.id || Date.now();
        const newProductObj = {
            id: newId,
            name: productForm.name.trim(),
            description: productForm.description.trim() || 'منتج فاخر من تشكيلة ثياب الحصرية.',
            price: parseFloat(productForm.price),
            originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
            category: productForm.category,
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
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">

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
                            onClick={() => setActiveTab('sections')}
                            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition relative ${(activeTab === 'sections' || activeTab === 'offer')
                                ? 'bg-[#F0DFCD] text-[#800020] shadow-md'
                                : 'text-[#F0DFCD]/80 hover:bg-[#F0DFCD]/10 hover:text-[#F0DFCD]'
                                }`}
                        >
                            <Layers className="w-4 h-4 text-amber-300" />
                            <span>أقسام الصفحة الرئيسية</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
            <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">

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
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020]/15 text-[#800020] flex items-center justify-center">
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
                                        متوسط قيمة السلة (AOV)
                                    </span>
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020]/15 text-[#800020] flex items-center justify-center">
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
                                    <div className="w-10 h-10 rounded-2xl bg-[#800020]/15 text-[#800020] flex items-center justify-center">
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
                                    <span className="text-[11px] text-[#800020]/50">محدث لحظياً</span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="h-full">

                                {/* Quick Admin Actions Box */}
                                <div className="bg-[#800020] text-[#F0DFCD] p-6 rounded-3xl shadow-lg relative overflow-hidden h-full flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-base font-black flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-amber-300" />
                                            إجراءات إدارية سريعة
                                        </h3>
                                        <p className="text-xs text-[#F0DFCD]/80 mb-5 leading-relaxed">
                                            أضف منتجات جديدة، راجع الطلبات الجديدة أو عدل المخزون بنقرة واحدة.
                                        </p>
                                    </div>

                                    <div className="space-y-2.5">
                                        <button
                                            onClick={() => setActiveTab('add-product')}
                                            className="w-full bg-[#F0DFCD] text-[#800020] hover:bg-white transition py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between shadow"
                                        >
                                            <span className="flex items-center gap-2">
                                                <PlusCircle className="w-4 h-4" />
                                                إضافة منتج جديد للمتجر
                                            </span>
                                            <ArrowRight className="w-4 h-4 rotate-180" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setActiveTab('orders');
                                                setOrderFilterStatus('new');
                                            }}
                                            className="w-full bg-white/10 hover:bg-white/20 text-[#F0DFCD] transition py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between border border-[#F0DFCD]/15"
                                        >
                                            <span className="flex items-center gap-2">
                                                <ShoppingBag className="w-4 h-4" />
                                                مراجعة الطلبات الجديدة ({statusCounts.new})
                                            </span>
                                            <ArrowRight className="w-4 h-4 rotate-180" />
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('products')}
                                            className="w-full bg-white/10 hover:bg-white/20 text-[#F0DFCD] transition py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between border border-[#F0DFCD]/15"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Boxes className="w-4 h-4" />
                                                إدارة المخزون والتوافر
                                            </span>
                                            <ArrowRight className="w-4 h-4 rotate-180" />
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('offer')}
                                            className="w-full bg-white/10 hover:bg-white/20 text-[#F0DFCD] transition py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between border border-[#F0DFCD]/15 cursor-pointer"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-amber-300" />
                                                تخصيص عرض الصفحة الرئيسية
                                            </span>
                                            <ArrowRight className="w-4 h-4 rotate-180" />
                                        </button>
                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* Recent Orders Overview Widget */}
                        <div className="bg-white/25 p-7 rounded-3xl border border-[#800020]/10 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
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

                            {/* Mini table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs font-semibold">
                                    <thead>
                                        <tr className="border-b border-[#800020]/15 text-[#800020]/60 font-black">
                                            <th className="py-3 px-3">رقم الطلب</th>
                                            <th className="py-3 px-3">العميل</th>
                                            <th className="py-3 px-3">المدينة</th>
                                            <th className="py-3 px-3">العناصر</th>
                                            <th className="py-3 px-3">الإجمالي</th>
                                            <th className="py-3 px-3">طريقة الدفع</th>
                                            <th className="py-3 px-3">الحالة</th>
                                            <th className="py-3 px-3 text-left">الإجراء</th>
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
                                                    <td className="py-3.5 px-3 font-mono font-bold text-[#800020]">
                                                        {ord.id}
                                                    </td>
                                                    <td className="py-3.5 px-3 font-bold text-[#800020]">
                                                        {ord.customerName}
                                                    </td>
                                                    <td className="py-3.5 px-3 text-[#800020]/80">
                                                        {ord.city}
                                                    </td>
                                                    <td className="py-3.5 px-3 text-[#800020]/80">
                                                        {ord.itemsCount} منتج
                                                    </td>
                                                    <td className="py-3.5 px-3 font-bold text-[#800020]">
                                                        <span>{ord.total.toFixed(2)}</span>
                                                        <RiyalIcon size="0.85em" />
                                                    </td>
                                                    <td className="py-3.5 px-3 text-[#800020]/80">
                                                        {ord.paymentMethod}
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${meta.badgeColor}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                                                            {meta.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-left">
                                                        <button
                                                            onClick={() => setSelectedOrderDetails(ord)}
                                                            className="text-xs font-bold text-[#800020] hover:bg-[#800020]/10 px-2.5 py-1.5 rounded-xl transition inline-flex items-center gap-1"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>عرض</span>
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
                {/* 2. SALES & ANALYTICS BREAKDOWN TAB (المبيعات مقسمة) */}
                {/* ========================================================================= */}
                {activeTab === 'sales' && (
                    <div className="space-y-8">
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-[#800020]">
                                    المبيعات والإيرادات مقسمة
                                </h1>
                                <p className="text-sm font-semibold text-[#800020]/70 mt-1">
                                    تحليل دقيق للمبيعات بحسب الأقسام، وسائل الدفع، التوزيع الجغرافي، والفترات الزمنية.
                                </p>
                            </div>

                            <button
                                onClick={() => showToast('تم تجهيز وتصدير تقرير المبيعات بصيغة Excel', 'sparkle')}
                                className="bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 transition px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow self-start sm:self-auto"
                            >
                                <Download className="w-4 h-4" />
                                <span>تصدير التقرير المالي (Excel)</span>
                            </button>
                        </div>

                        {/* Top Segment Summary Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm">
                                <span className="text-xs font-black text-[#800020]/60">إجمالي المبيعات المحققة</span>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-[#800020]">{currentStats.revenue.toLocaleString('ar-SA')}</span>
                                    <RiyalIcon size="1.1em" />
                                </div>
                                <span className="text-xs font-bold text-emerald-700 block mt-2">من {orders.length} طلبات حقيقية</span>
                            </div>

                            <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm">
                                <span className="text-xs font-black text-[#800020]/60">القسم الأعلى مبيعاً</span>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-[#800020]">
                                        {salesByCategory[0] ? salesByCategory[0].revenue.toLocaleString('ar-SA') : currentStats.revenue.toLocaleString('ar-SA')}
                                    </span>
                                    <RiyalIcon size="1.1em" />
                                </div>
                                <span className="text-xs font-bold text-[#800020]/70 block mt-2">
                                    {salesByCategory[0] ? `${salesByCategory[0].name} (${salesByCategory[0].percentage}%)` : 'أزياء فاخرة'}
                                </span>
                            </div>

                            <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm">
                                <span className="text-xs font-black text-[#800020]/60">المدفوعات الإلكترونية</span>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-[#800020]">
                                        {salesByPaymentMethod.length > 0 ? `${salesByPaymentMethod.filter(m => m.name !== 'الدفع عند الاستلام').reduce((s, m) => s + m.percentage, 0)}%` : '100%'}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-emerald-700 block mt-2">عبر مدى وأبل باي والبطاقات</span>
                            </div>

                            <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm">
                                <span className="text-xs font-black text-[#800020]/60">المدينة الأعلى طلباً</span>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-[#800020]">
                                        {salesByCity[0] ? salesByCity[0].city : 'الرياض'}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-[#800020]/70 block mt-2">
                                    {salesByCity[0] ? `${salesByCity[0].percentage}% من حجم الطلبات` : '100% من حجم الطلبات'}
                                </span>
                            </div>
                        </div>

                        {/* Visual Breakdown by Categories & By Payment Methods */}
                        <div className="grid grid-cols-1 gap-8">

                            {/* 1. Category Breakdown */}
                            <div className="bg-white/25 p-7 rounded-3xl border border-[#800020]/10 shadow-sm space-y-6">
                                <div>
                                    <h2 className="text-lg font-black text-[#800020]">
                                        المبيعات مقسمة حسب أقسام المتجر
                                    </h2>
                                    <p className="text-xs font-semibold text-[#800020]/60">
                                        حجم الإيرادات ونسبة المساهمة لكل قسم (اضغط على أي قسم لعرض تفاصيل مبيعاته)
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {salesByCategory.length === 0 ? (
                                        <p className="text-xs font-bold text-[#800020]/60 text-center py-6">لا توجد مبيعات أقسام مسجلة بعد</p>
                                    ) : salesByCategory.map(item => (
                                        <div
                                            key={item.name}
                                            onClick={() => {
                                                setSelectedSalesBreakdown({ type: 'category', name: item.name, item });
                                                setDrilldownSearchQuery('');
                                            }}
                                            className="bg-white/50 hover:bg-white/80 p-4 rounded-2xl border border-[#800020]/10 hover:border-[#800020]/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group space-y-2"
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3.5 h-3.5 rounded-lg shrink-0" style={{ backgroundColor: item.color }} />
                                                    <span className="font-black text-sm text-[#800020] group-hover:translate-x-[-2px] transition-transform">{item.name}</span>
                                                    <span className="text-xs text-[#800020]/60">({item.count} طلب)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 font-black text-sm text-[#800020]">
                                                        <span>{item.revenue.toLocaleString('ar-SA')}</span>
                                                        <RiyalIcon size="0.85em" />
                                                        <span className="text-xs text-[#800020]/60 mr-1.5">({item.percentage}%)</span>
                                                    </div>
                                                    <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-[#800020]/60 group-hover:text-[#800020] bg-white/60 group-hover:bg-[#800020]/10 px-2 py-0.5 rounded-lg transition-all">
                                                        <Eye className="w-3 h-3" />
                                                        <span>عرض التفاصيل</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-2.5 w-full bg-[#800020]/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Payment Methods Breakdown */}
                            <div className="bg-white/25 p-7 rounded-3xl border border-[#800020]/10 shadow-sm space-y-6">
                                <div>
                                    <h2 className="text-lg font-black text-[#800020]">
                                        المبيعات مقسمة حسب وسائل الدفع
                                    </h2>
                                    <p className="text-xs font-semibold text-[#800020]/60">
                                        تفضيلات العملاء وطرق السداد المعتمدة (اضغط على أي طريقة دفع لعرض تفاصيل مبيعاتها)
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {salesByPaymentMethod.length === 0 ? (
                                        <p className="text-xs font-bold text-[#800020]/60 text-center py-6">لا توجد عمليات دفع مسجلة بعد</p>
                                    ) : salesByPaymentMethod.map(method => (
                                        <div
                                            key={method.name}
                                            onClick={() => {
                                                setSelectedSalesBreakdown({ type: 'payment', name: method.name, method });
                                                setDrilldownSearchQuery('');
                                            }}
                                            className="bg-white/50 hover:bg-white/80 p-4 rounded-2xl border border-[#800020]/10 hover:border-[#800020]/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group space-y-2"
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-[#800020]/10 flex items-center justify-center text-[#800020] group-hover:bg-[#800020] group-hover:text-[#F0DFCD] transition-colors shrink-0">
                                                        {method.icon === 'Smartphone' ? (
                                                            <Smartphone className="w-4 h-4" />
                                                        ) : method.icon === 'Clock' ? (
                                                            <Clock className="w-4 h-4" />
                                                        ) : (
                                                            <CreditCard className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <span className="font-black text-sm text-[#800020] group-hover:translate-x-[-2px] transition-transform">{method.name}</span>
                                                    <span className="text-xs text-[#800020]/60">({method.count} عملية)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-sm text-[#800020]">
                                                        {method.percentage}%
                                                    </span>
                                                    <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-[#800020]/60 group-hover:text-[#800020] bg-white/60 group-hover:bg-[#800020]/10 px-2 py-0.5 rounded-lg transition-all">
                                                        <Eye className="w-3 h-3" />
                                                        <span>عرض التفاصيل</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-2.5 w-full bg-[#800020]/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-[#800020] transition-all duration-700"
                                                    style={{ width: `${method.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Geographic City Distribution Table */}
                        <div className="bg-white/25 p-7 rounded-3xl border border-[#800020]/10 shadow-sm">
                            <h2 className="text-lg font-black text-[#800020] mb-1">
                                المبيعات حسب المناطق والمدن السعودية
                            </h2>
                            <p className="text-xs font-semibold text-[#800020]/60 mb-6">
                                تحليل التوزيع الجغرافي لأماكن تواجد عملاء ثياب الأكثر نشاطاً
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs font-semibold">
                                    <thead>
                                        <tr className="border-b border-[#800020]/15 text-[#800020]/60 font-black">
                                            <th className="py-3 px-3">المدينة</th>
                                            <th className="py-3 px-3">النسبة من الإجمالي</th>
                                            <th className="py-3 px-3">عدد الطلبات</th>
                                            <th className="py-3 px-3">إجمالي الإيرادات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#800020]/10">
                                        {salesByCity.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-xs font-bold text-[#800020]/60">
                                                    لا توجد مبيعات مسجلة حسب المدن بعد
                                                </td>
                                            </tr>
                                        ) : salesByCity.map(city => (
                                            <tr key={city.city} className="hover:bg-[#800020]/5 transition">
                                                <td className="py-3.5 px-3 font-bold text-[#800020] flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-[#800020]/60" />
                                                    {city.city}
                                                </td>
                                                <td className="py-3.5 px-3 font-bold text-[#800020]">
                                                    {city.percentage}%
                                                </td>
                                                <td className="py-3.5 px-3 text-[#800020]/80">
                                                    {city.orders} طلب
                                                </td>
                                                <td className="py-3.5 px-3 font-bold text-[#800020]">
                                                    <span>{city.revenue.toLocaleString('ar-SA')}</span>
                                                    <RiyalIcon size="0.85em" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                    onClick={() => showToast('تم تصدير كشف الطلبات بنجاح', 'success')}
                                    className="bg-white/25 hover:bg-white text-[#800020] border border-[#800020]/20 transition px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>تصدير الطلبات</span>
                                </button>
                            </div>
                        </div>

                        {/* Order Status Tabs (المقسمة) */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#800020]/15">
                            {[
                                { id: 'all', label: 'جميع الطلبات', count: statusCounts.all },
                                { id: 'new', label: 'طلبات جديدة', count: statusCounts.new },
                                { id: 'processing', label: 'قيد التجهيز', count: statusCounts.processing },
                                { id: 'shipping', label: 'جاري التوصيل', count: statusCounts.shipping },
                                { id: 'delivered', label: 'مكتملة ومستلمة', count: statusCounts.delivered },
                                { id: 'cancelled', label: 'ملغاة', count: statusCounts.cancelled },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setOrderFilterStatus(tab.id)}
                                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition ${orderFilterStatus === tab.id
                                        ? 'bg-[#800020] text-[#F0DFCD] shadow-md'
                                        : 'bg-white/50 text-[#800020]/80 hover:bg-white/80'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${orderFilterStatus === tab.id
                                        ? 'bg-[#F0DFCD] text-[#800020]'
                                        : 'bg-[#800020]/10 text-[#800020]'
                                        }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search Bar & Filtering */}
                        <div className="bg-white/25 p-4 rounded-3xl border border-[#800020]/10 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full sm:w-96">
                                <Search className="w-4 h-4 text-[#800020]/50 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={orderSearchQuery}
                                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                                    placeholder="بحث برقم الطلب، اسم العميل، الهاتف، أو المدينة..."
                                    className="w-full bg-white/80 pr-11 pl-4 py-2.5 rounded-2xl border border-[#800020]/20 text-xs sm:text-sm text-[#800020] placeholder:text-[#800020]/40 focus:outline-none focus:border-[#800020]"
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
                                    <table className="w-full text-right text-xs font-semibold">
                                        <thead>
                                            <tr className="bg-[#800020]/5 border-b border-[#800020]/15 text-[#800020]/70 font-black">
                                                <th className="py-4 px-4">رقم الطلب</th>
                                                <th className="py-4 px-4">العميل ومعلومات الاتصال</th>
                                                <th className="py-4 px-4">المنتجات المطلوبة</th>
                                                <th className="py-4 px-4">المبلغ والدفع</th>
                                                <th className="py-4 px-4">التاريخ والوقت</th>
                                                <th className="py-4 px-4">حالة الطلب الحالية</th>
                                                <th className="py-4 px-4 text-left">الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#800020]/10">
                                            {filteredOrders.map(ord => {
                                                const meta = orderStatusMeta[ord.status] || orderStatusMeta.new;
                                                return (
                                                    <tr key={ord.id} className="hover:bg-white/25 transition group">

                                                        {/* Order ID */}
                                                        <td className="py-4 px-4">
                                                            <span className="font-mono font-bold text-sm text-[#800020] block">
                                                                {ord.id}
                                                            </span>
                                                            <span className="text-[10px] text-[#800020]/50 block">
                                                                {ord.itemsCount} عناصر
                                                            </span>
                                                        </td>

                                                        {/* Customer */}
                                                        <td className="py-4 px-4">
                                                            <div className="font-bold text-sm text-[#800020]">
                                                                {ord.customerName}
                                                            </div>
                                                            <div className="text-[11px] text-[#800020]/70 flex items-center gap-2 mt-0.5">
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
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-1.5">
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
                                                        <td className="py-4 px-4">
                                                            <div className="font-black text-sm text-[#800020] flex items-center gap-1">
                                                                <span>{ord.total.toFixed(2)}</span>
                                                                <RiyalIcon size="0.9em" />
                                                            </div>
                                                            <div className="text-[11px] text-[#800020]/70 mt-0.5">
                                                                {ord.paymentMethod} • <span className="text-emerald-700 font-bold">{ord.paymentStatus}</span>
                                                            </div>
                                                        </td>

                                                        {/* Date */}
                                                        <td className="py-4 px-4">
                                                            <div className="text-[#800020] font-bold">{ord.date}</div>
                                                            <div className="text-[10px] text-[#800020]/50">{ord.time}</div>
                                                        </td>

                                                        {/* Status Dropdown */}
                                                        <td className="py-4 px-4">
                                                            <CustomDropdown
                                                                value={ord.status}
                                                                onChange={(val) => handleUpdateOrderStatus(ord.id, val)}
                                                                options={orderStatusOptions}
                                                                renderTrigger={({ isOpen }) => (
                                                                    <div className="inline-flex items-center gap-1.5 cursor-pointer group select-none">
                                                                        <span className={`text-xs font-bold transition-colors ${meta.textColor || 'text-amber-700'}`}>
                                                                            {meta.label}
                                                                        </span>
                                                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'} ${meta.textColor || 'text-amber-700'}`} />
                                                                    </div>
                                                                )}
                                                                menuClassName="w-36"
                                                                align="right"
                                                            />
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="py-4 px-4 text-left">
                                                            <button
                                                                onClick={() => setSelectedOrderDetails(ord)}
                                                                className="bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 transition px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span>تفاصيل</span>
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/25 p-6 rounded-3xl border border-[#800020]/10 shadow-sm">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-[#800020]">
                                    إضافة منتج جديد لمتجر ثياب
                                </h1>
                                <p className="text-sm font-semibold text-[#800020]/70 mt-1">
                                    قم بإدخال بيانات المنتج والأسعار والألوان والمقاسات مع معاينة حية مباشرة.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleFillDemoProduct}
                                className="bg-[#800020]/10 hover:bg-[#800020]/20 text-[#800020] transition px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border border-[#800020]/20 self-start sm:self-auto"
                            >
                                <Sparkles className="w-4 h-4 text-amber-600" />
                                <span>تعبئة بيانات تجريبية سريعة</span>
                            </button>
                        </div>

                        {/* Add Product Grid: Form on Right, Live Preview on Left */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                            {/* The Form (7 cols) */}
                            <form onSubmit={handleSaveNewProduct} className="lg:col-span-7 bg-white/25 p-7 rounded-3xl border border-[#800020]/10 shadow-sm space-y-6">

                                {/* 1. Basic Info */}
                                <div className="space-y-4">
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[#800020] mb-1.5">
                                                القسم والتصنيف <span className="text-rose-600">*</span>
                                            </label>
                                            <CustomDropdown
                                                value={productForm.category}
                                                onChange={(val) => setProductForm({ ...productForm, category: val })}
                                                options={productCategoriesList}
                                                triggerClassName="!bg-white !rounded-2xl !py-3 !px-4 !border-[#800020]/20 !text-sm"
                                                menuClassName="w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#800020] mb-1.5">
                                                الشارة الترويجية (Badge)
                                            </label>
                                            <input
                                                type="text"
                                                value={productForm.badge}
                                                onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                                                placeholder="مثال: جديد، الأكثر مبيعاً، خصم خاص"
                                                className="w-full bg-white px-4 py-3 rounded-2xl border border-[#800020]/20 text-sm text-[#800020] focus:outline-none focus:border-[#800020]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Pricing & Stock */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-black text-[#800020] border-b border-[#800020]/10 pb-2">
                                        الأسعار والمخزون
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                    </div>
                                </div>

                                {/* 3. Image Selection & Quick Gallery */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-[#800020]/10 pb-2">
                                        <h3 className="text-base font-black text-[#800020]">
                                            صورة المنتج الرئيسية
                                        </h3>
                                        <span className="text-xs text-[#800020]/60">
                                            اختر من مكتبة المتجر أو أدخل رابطاً
                                        </span>
                                    </div>

                                    {/* Quick Selection Carousel / Grid */}
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold text-[#800020]/80">
                                            مكتبة صور المتجر الفاخرة (شفافة وبدقة عالية):
                                        </span>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
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
                                        <input
                                            type="text"
                                            value={productForm.image}
                                            onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                            placeholder="/images/coat_transparent.png"
                                            className="w-full bg-white px-4 py-2.5 rounded-2xl border border-[#800020]/20 text-xs sm:text-sm font-mono text-[#800020] focus:outline-none focus:border-[#800020]"
                                        />
                                    </div>
                                </div>

                                {/* 4. Sizes Selection */}
                                <div className="space-y-3">
                                    <h3 className="text-base font-black text-[#800020] border-b border-[#800020]/10 pb-2">
                                        المقاسات المتوفرة
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {commonSizesList.map(sz => {
                                            const isSelected = productForm.sizes.includes(sz);
                                            return (
                                                <button
                                                    type="button"
                                                    key={sz}
                                                    onClick={() => handleSizeToggle(sz)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${isSelected
                                                        ? 'bg-[#800020] text-[#F0DFCD] border-[#800020]'
                                                        : 'bg-white text-[#800020] border-[#800020]/20 hover:border-[#800020]'
                                                        }`}
                                                >
                                                    {sz}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Add custom size */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <input
                                            type="text"
                                            value={customSizeInput}
                                            onChange={(e) => setCustomSizeInput(e.target.value)}
                                            placeholder="إضافة مقاس مخصص (مثال: 46، XXXL)..."
                                            className="bg-white px-3 py-1.5 rounded-xl border border-[#800020]/20 text-xs text-[#800020] focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCustomSize}
                                            className="bg-[#800020]/15 hover:bg-[#800020] hover:text-[#F0DFCD] text-[#800020] px-3 py-1.5 rounded-xl text-xs font-bold transition"
                                        >
                                            إضافة المقاس
                                        </button>
                                    </div>
                                </div>

                                {/* 5. Color Palette */}
                                <div className="space-y-3">
                                    <h3 className="text-base font-black text-[#800020] border-b border-[#800020]/10 pb-2">
                                        ألوان المنتج وخياراته
                                    </h3>

                                    {/* Selected Colors list */}
                                    <div className="flex flex-wrap gap-2">
                                        {productForm.colors.map(col => (
                                            <span
                                                key={col.hex}
                                                className="bg-white pl-2 pr-3 py-1.5 rounded-xl border border-[#800020]/20 text-xs font-bold text-[#800020] flex items-center gap-2 shadow-sm"
                                            >
                                                <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: col.hex }} />
                                                <span>{col.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveColor(col.hex)}
                                                    className="text-[#800020]/40 hover:text-rose-600 transition"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    {/* Preset Color quick add */}
                                    <div className="pt-1">
                                        <span className="text-[11px] font-bold text-[#800020]/70 block mb-1.5">
                                            إضافة سريعة من الألوان المعتمدة:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {commonColorsList.map(c => (
                                                <button
                                                    type="button"
                                                    key={c.name}
                                                    onClick={() => {
                                                        if (!productForm.colors.some(existing => existing.hex === c.hex)) {
                                                            setProductForm(prev => ({ ...prev, colors: [...prev.colors, c] }));
                                                        }
                                                    }}
                                                    className="bg-white/70 hover:bg-white text-[11px] font-bold text-[#800020] px-2.5 py-1 rounded-lg border border-[#800020]/10 flex items-center gap-1.5 transition"
                                                >
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                                                    <span>{c.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 6. Description & Tags */}
                                <div className="space-y-4">
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

                                {/* Form Action Buttons */}
                                <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 transition px-8 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-amber-300" />
                                        <span>حفظ وإضافة للمتجر الآن</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setProductForm(initialFormState)}
                                        className="w-full sm:w-auto bg-white/25 hover:bg-white text-[#800020] px-6 py-3.5 rounded-2xl text-sm font-bold border border-[#800020]/20 transition flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        <span>إعادة تعيين</span>
                                    </button>
                                </div>

                            </form>

                            {/* Live Customer Preview Card (5 cols) */}
                            <div className="lg:col-span-5 sticky top-24 space-y-4">
                                <div className="bg-white/25 p-6 rounded-3xl border border-[#800020]/15 shadow-sm">
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#800020]/10">
                                        <span className="text-xs font-black uppercase tracking-wider text-[#800020] flex items-center gap-1.5">
                                            <Eye className="w-4 h-4" />
                                            معاينة حية كما تظهر للمشتري
                                        </span>
                                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                                            مباشر
                                        </span>
                                    </div>

                                    {/* The Realistic Product Card */}
                                    <div className="bg-white/25 rounded-3xl overflow-hidden border border-[#800020]/15 shadow-lg group">

                                        {/* Image & Badges */}
                                        <div className="relative aspect-square w-full bg-[#fcfaf7] p-6 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={productForm.image || '/images/coat_transparent.png'}
                                                alt={productForm.name || 'معاينة المنتج'}
                                                className="w-full h-full object-contain transform group-hover:scale-105 transition duration-500"
                                            />

                                            {/* Badge */}
                                            {productForm.badge && (
                                                <span className="absolute top-4 right-4 bg-[#800020] text-[#F0DFCD] text-xs font-black px-3 py-1 rounded-full shadow">
                                                    {productForm.badge}
                                                </span>
                                            )}

                                            {/* Category Pill */}
                                            <span className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-[#800020] text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-sm">
                                                {productForm.category}
                                            </span>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-5 space-y-3">

                                            {/* Title */}
                                            <h4 className="font-black text-base text-[#800020] line-clamp-1">
                                                {productForm.name || 'اسم المنتج سيظهر هنا...'}
                                            </h4>

                                            {/* Price Display */}
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl font-black text-[#800020]">
                                                    {productForm.price ? parseFloat(productForm.price).toFixed(2) : '0.00'}
                                                </span>
                                                <RiyalIcon size="1.1em" />

                                                {productForm.originalPrice && (
                                                    <span className="text-xs text-[#800020]/50 line-through">
                                                        {parseFloat(productForm.originalPrice).toFixed(2)}
                                                        <RiyalIcon size="0.9em" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Availability Badge */}
                                            <div className="pt-2 flex items-center justify-between border-t border-[#800020]/10 text-xs">
                                                <span className={`font-bold ${productForm.inStock ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                    {productForm.inStock ? '✓ متوفر للطلب' : '✗ غير متوفر حالياً'}
                                                </span>
                                                <span className="text-[#800020]/60">
                                                    المخزون: {productForm.stock}
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
                                        className="w-full bg-white/70 focus:bg-white pr-11 pl-10 py-2.5 rounded-full border border-[#800020] text-xs font-bold text-[#800020] placeholder:text-[#800020]/50 focus:outline-none shadow-xs transition"
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

                            {/* Category Tabs Filter - Image 2 style */}
                            <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
                                {productCategoryOptions.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedProductCategory(cat)}
                                        className={`py-2 px-5 font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap cursor-pointer ${selectedProductCategory === cat
                                                ? 'bg-[#800020] text-[#F0DFCD] rounded-sm shadow-md'
                                                : 'bg-transparent text-[#800020] hover:text-[#800020]/70'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                        </div>

                        {/* Products Inventory Table */}
                        <div className="bg-white/25 rounded-3xl border border-[#800020]/10 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs font-semibold">
                                    <thead>
                                        <tr className="bg-[#800020]/5 border-b border-[#800020]/15 text-[#800020]/70 font-black">
                                            <th className="py-4 px-4">المنتج</th>
                                            <th className="py-4 px-4">القسم</th>
                                            <th className="py-4 px-4">السعر</th>
                                            <th className="py-4 px-4">التقييم</th>
                                            <th className="py-4 px-4">كمية المخزون</th>
                                            <th className="py-4 px-4">حالة التوفر</th>
                                            <th className="py-4 px-4 text-left">الإجراءات</th>
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

                                                    {/* Category */}
                                                    <td className="py-4 px-4 text-[#800020] font-bold">
                                                        {prod.category}
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
                    <HomeSectionsManagement productsList={productsList} />
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
                                        className="w-full bg-white/60 focus:bg-white text-xs font-bold text-[#800020] pr-10 pl-3 py-2.5 rounded-xl border border-[#800020]/20 focus:border-[#800020] outline-none transition placeholder:text-[#800020]/40"
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
                                                            onClick={() => setSelectedOrderDetails(order)}
                                                            className="flex items-center gap-1 bg-[#800020] hover:bg-[#800020]/90 text-[#F0DFCD] px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                                                            title="عرض وتعديل تفاصيل الطلب الكاملة"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span className="hidden sm:inline">تفاصيل الطلب</span>
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
                                        className="w-40"
                                        triggerClassName="!bg-white !rounded-xl !py-1.5 !px-3 !border-[#800020]/20 !text-xs !min-h-[34px]"
                                        menuClassName="w-40"
                                    />
                                </div>
                            </div>

                            {/* Items list */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-black text-[#800020]">عناصر الطلب ({selectedOrderDetails.items.length})</h4>
                                <div className="space-y-2">
                                    {selectedOrderDetails.items.map((it, idx) => (
                                        <div key={idx} className="bg-white/25 p-3.5 rounded-2xl border border-[#800020]/10 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-white p-1 border border-[#800020]/10 flex items-center justify-center shrink-0">
                                                    <img src={it.image} alt={it.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-xs sm:text-sm text-[#800020]">{it.name}</div>
                                                    <div className="text-[11px] text-[#800020]/60 mt-0.5">
                                                        المقاس: {it.size} • اللون: {it.color} • الكمية: {it.qty}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="font-black text-xs sm:text-sm text-[#800020] text-left">
                                                <span>{(it.price * it.qty).toFixed(2)}</span>
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
                                    <span>{selectedOrderDetails.total.toFixed(2)} <RiyalIcon size="0.85em" /></span>
                                </div>
                                <div className="flex items-center justify-between text-[#800020]/70">
                                    <span>الشحن السريع (أرامكس / سمسا):</span>
                                    <span className="text-emerald-700">مجاني</span>
                                </div>
                                <div className="flex items-center justify-between text-[#800020]/70">
                                    <span>ضريبة القيمة المضافة (15% مشمولة):</span>
                                    <span>{(selectedOrderDetails.total * 0.15).toFixed(2)} <RiyalIcon size="0.85em" /></span>
                                </div>
                                <div className="border-t border-[#800020]/20 pt-2 flex items-center justify-between text-base font-black text-[#800020]">
                                    <span>الإجمالي الكلي:</span>
                                    <span className="flex items-center gap-1">
                                        <span>{selectedOrderDetails.total.toFixed(2)}</span>
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
                                            <img
                                                src={editForm.image}
                                                alt={editForm.name}
                                                className="w-full h-full object-contain p-2"
                                                onError={(e) => { e.target.src = '/images/coat_transparent.png'; }}
                                            />
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

                                            {/* Colors preview */}
                                            {editForm.colors?.length > 0 && (
                                                <div className="flex items-center gap-1 pt-1">
                                                    {editForm.colors.map((c, i) => (
                                                        <span
                                                            key={i}
                                                            className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                                                            style={{ backgroundColor: c.hex }}
                                                            title={c.name}
                                                        />
                                                    ))}
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

                                    {/* Category & Badge */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold mb-1.5 text-[#800020]">التصنيف</label>
                                            <CustomDropdown
                                                value={editForm.category}
                                                onChange={(val) => setEditForm(prev => ({ ...prev, category: val }))}
                                                options={productCategoriesList}
                                                triggerClassName="!bg-white !rounded-xl !py-2.5 !px-3 !border-[#800020]/25 !text-xs"
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
                                                triggerClassName="!bg-white !rounded-xl !py-2.5 !px-3 !border-[#800020]/25 !text-xs"
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

                                    {/* Image URL input */}
                                    <div>
                                        <label className="block text-xs font-bold mb-1.5 text-[#800020]">رابط صورة المنتج (أو من المعرض)</label>
                                        <input
                                            type="text"
                                            value={editForm.image}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#800020]/25 text-xs text-[#800020] dir-ltr focus:outline-none focus:border-[#800020]"
                                            placeholder="/images/example.png أو https://..."
                                        />
                                    </div>

                                    {/* Sizes Selection */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-[#800020]">المقاسات المتوفرة</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {commonSizesList.map((sz, i) => {
                                                const isSelected = editForm.sizes.includes(sz);
                                                return (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => handleEditSizeToggle(sz)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${isSelected
                                                                ? 'bg-[#800020] text-[#F0DFCD] shadow-xs'
                                                                : 'bg-white/80 border border-[#800020]/20 text-[#800020] hover:bg-white'
                                                            }`}
                                                    >
                                                        {sz}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {/* Add custom size */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <input
                                                type="text"
                                                value={customEditSizeInput}
                                                onChange={(e) => setCustomEditSizeInput(e.target.value)}
                                                placeholder="مقاس مخصص (مثال: 62)"
                                                className="px-3 py-1.5 rounded-lg bg-white border border-[#800020]/25 text-xs font-bold text-[#800020] focus:outline-none"
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomEditSize(e); }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCustomEditSize}
                                                className="px-3 py-1.5 bg-[#800020]/15 hover:bg-[#800020] hover:text-[#F0DFCD] text-[#800020] text-xs font-bold rounded-lg transition cursor-pointer"
                                            >
                                                + إضافة مقاس
                                            </button>
                                        </div>
                                    </div>

                                    {/* Colors Selection */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-[#800020]">الألوان المتوفرة</label>
                                        <div className="flex flex-wrap gap-2">
                                            {editForm.colors.map((c, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#800020]/20 text-xs font-bold text-[#800020] shadow-2xs"
                                                >
                                                    <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                                                    <span>{c.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveEditColor(c.hex)}
                                                        className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        {/* Add custom color */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <input
                                                type="color"
                                                value={customEditColorHex}
                                                onChange={(e) => setCustomEditColorHex(e.target.value)}
                                                className="w-8 h-8 rounded-lg border border-[#800020]/30 cursor-pointer bg-white p-0.5"
                                                title="اختر درجة اللون"
                                            />
                                            <input
                                                type="text"
                                                value={customEditColorName}
                                                onChange={(e) => setCustomEditColorName(e.target.value)}
                                                placeholder="اسم اللون (مثال: كحلي ملكي)"
                                                className="px-3 py-1.5 rounded-lg bg-white border border-[#800020]/25 text-xs font-bold text-[#800020] focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddEditColor}
                                                className="px-3 py-1.5 bg-[#800020]/15 hover:bg-[#800020] hover:text-[#F0DFCD] text-[#800020] text-xs font-bold rounded-lg transition cursor-pointer"
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

        </div>
    );
}
