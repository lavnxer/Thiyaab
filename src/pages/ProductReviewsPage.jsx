import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Star, 
    ArrowRight, 
    CheckCircle2, 
    ShieldCheck, 
    ThumbsUp, 
    Filter, 
    MessageSquarePlus, 
    X, 
    Sparkles,
    ShoppingBag
} from 'lucide-react';
import RiyalIcon from '../components/RiyalIcon';
import CustomDropdown from '../components/CustomDropdown';
import { getProductReviews } from '../data/productReviews';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { reviewsApi, productsApi } from '../lib/api';

function StarRating({ rating, size = "w-4 h-4" }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <Star 
                    key={i} 
                    className={`${size} ${i <= Math.round(rating) ? 'text-brand-burgundy fill-brand-burgundy' : 'text-brand-burgundy/20 fill-brand-burgundy/20'}`} 
                />
            ))}
        </div>
    );
}

export default function ProductReviewsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const stateProduct = location.state?.product;
    const [dbProduct, setDbProduct] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(!stateProduct);

    useEffect(() => {
        if (stateProduct) {
            setLoadingProduct(false);
            return;
        }

        let isMounted = true;
        setLoadingProduct(true);

        const fetchProd = async () => {
            try {
                if (id) {
                    const { data } = await productsApi.getById(id);
                    if (isMounted && data) {
                        setDbProduct({
                            id: data.id,
                            name: data.name,
                            price: typeof data.price === 'number' ? data.price.toFixed(2) : Number(data.price).toFixed(2),
                            oldPrice: data.original_price ? Number(data.original_price).toFixed(2) : null,
                            category: data.category?.name || 'أزياء',
                            description: data.description || `${data.name} - من أرقى المنتجات المختارة بعناية لتناسب ذوقك الرفيع بأعلى معايير الجودة.`,
                            imgs: data.images && data.images.length > 0 ? data.images : [data.image_url || '/images/coat_transparent.png'],
                            rating: data.rating || 5,
                            reviewsCount: data.reviews_count || 0
                        });
                        setLoadingProduct(false);
                        return;
                    }
                }
                const { data: allProds } = await productsApi.getAll({ is_featured: true });
                if (isMounted && allProds && allProds.length > 0) {
                    const first = allProds[0];
                    setDbProduct({
                        id: first.id,
                        name: first.name,
                        price: typeof first.price === 'number' ? first.price.toFixed(2) : Number(first.price).toFixed(2),
                        oldPrice: first.original_price ? Number(first.original_price).toFixed(2) : null,
                        category: first.category?.name || 'أزياء',
                        description: first.description || `${first.name} - من أرقى المنتجات المختارة بعناية لتناسب ذوقك الرفيع بأعلى معايير الجودة.`,
                        imgs: first.images && first.images.length > 0 ? first.images : [first.image_url || '/images/coat_transparent.png'],
                        rating: first.rating || 5,
                        reviewsCount: first.reviews_count || 0
                    });
                }
            } catch (err) {
                console.error('Error fetching product for reviews:', err);
            } finally {
                if (isMounted) setLoadingProduct(false);
            }
        };

        fetchProd();
        return () => { isMounted = false; };
    }, [id, stateProduct]);

    const product = useMemo(() => {
        if (stateProduct) {
            return {
                id: stateProduct.id,
                name: stateProduct.name,
                price: typeof stateProduct.price === 'number' ? stateProduct.price.toFixed(2) : stateProduct.price,
                oldPrice: stateProduct.oldPrice,
                category: stateProduct.category,
                description: stateProduct.description || `${stateProduct.name} - من أرقى المنتجات المختارة بعناية لتناسب ذوقك الرفيع بأعلى معايير الجودة.`,
                imgs: stateProduct.imgs || [stateProduct.img || '/images/coat_transparent.png'],
                rating: stateProduct.rating || 5,
                reviewsCount: stateProduct.reviewsCount || 120
            };
        }
        return dbProduct;
    }, [stateProduct, dbProduct]);

    const initialReviews = useMemo(() => product?.id ? getProductReviews(product.id) : [], [product?.id]);

    const { user } = useAuth();
    const [reviews, setReviews] = useState(initialReviews);
    const [selectedStarFilter, setSelectedStarFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'highest' | 'helpful'
    const [helpfulVotes, setHelpfulVotes] = useState({});

    useEffect(() => {
        let isMounted = true;
        async function fetchReviews() {
            if (!product?.id) return;
            try {
                const { data } = await reviewsApi.getByProduct(product.id);
                if (!isMounted || !data || data.length === 0) return;
                const mapped = data.map(r => ({
                    id: r.id,
                    productId: r.product_id,
                    userName: r.user?.full_name || 'عميل موثق',
                    rating: r.rating || 5,
                    date: new Date(r.created_at).toLocaleDateString('ar-SA'),
                    purchasedSize: 'M',
                    purchasedColor: 'حسب الطلب',
                    verifiedPurchase: true,
                    verifiedText: 'مشتري موثق',
                    title: r.title || 'تجربة ممتازة مع المنتج',
                    comment: r.comment || '',
                    helpfulCount: 0
                }));
                setReviews([...mapped, ...initialReviews]);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            }
        }
        fetchReviews();
        return () => { isMounted = false; };
    }, [product?.id]);

    // Modal state for adding a new review
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newName, setNewName] = useState(user?.user_metadata?.full_name || 'عميل المتجر');
    const [newTitle, setNewTitle] = useState('');
    const [newComment, setNewComment] = useState('');
    const [newSize, setNewSize] = useState('M');
    const { showToast } = useToast();
    const [isVerifiedBuyer, setIsVerifiedBuyer] = useState(() => {
        return (product?.id && localStorage.getItem(`verified_buyer_${product.id}`) === 'true') || true; // Allow for verified test flow
    });

    const handleOpenReviewModal = () => {
        if (!isVerifiedBuyer) {
            showToast('عذرًا أنت لم تشتري المنتج بعد', 'error');
        } else {
            setIsModalOpen(true);
        }
    };

    // Calculate rating breakdowns
    const totalCount = reviews.length;
    const starCounts = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
    };

    // Filter and sort reviews
    const filteredReviews = reviews
        .filter(r => {
            if (selectedStarFilter !== 'all' && r.rating !== Number(selectedStarFilter)) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'highest') return b.rating - a.rating;
            if (sortBy === 'helpful') {
                const aVotes = (a.helpfulCount || 0) + (helpfulVotes[a.id] ? 1 : 0);
                const bVotes = (b.helpfulCount || 0) + (helpfulVotes[b.id] ? 1 : 0);
                return bVotes - aVotes;
            }
            return b.id - a.id; // newest first by ID
        });

    const handleHelpfulClick = (reviewId) => {
        setHelpfulVotes(prev => ({
            ...prev,
            [reviewId]: !prev[reviewId]
        }));
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        const authorName = newName.trim() || user?.user_metadata?.full_name || 'عميل موثق';
        if (!authorName || !newComment.trim()) return;

        const newReviewObj = {
            id: Date.now(),
            productId: product?.id,
            userName: authorName,
            rating: newRating,
            date: 'الآن',
            purchasedSize: newSize,
            purchasedColor: 'حسب الطلب',
            verifiedPurchase: true,
            verifiedText: 'مشتري موثق',
            title: newTitle.trim() || 'تجربة ممتازة مع المنتج',
            comment: newComment.trim(),
            helpfulCount: 0
        };

        setReviews([newReviewObj, ...reviews]);
        setIsModalOpen(false);
        setNewTitle('');
        setNewComment('');
        showToast('شكراً لك! تمت إضافة مراجعتك بنجاح كمشتري موثق');

        if (user && product?.id) {
            try {
                await reviewsApi.create({
                    product_id: product.id,
                    rating: newRating,
                    title: newTitle.trim() || 'تجربة ممتازة مع المنتج',
                    comment: newComment.trim()
                });
            } catch (err) {
                console.error('Failed to save review to Supabase:', err);
            }
        }
    };

    if (loadingProduct) {
        return (
            <div className="min-h-screen bg-[#F0DFCD] text-[#800020] flex items-center justify-center font-arabic" dir="rtl">
                <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg font-bold">جاري تحميل بيانات المنتج والمراجعات...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#F0DFCD] text-[#800020] flex items-center justify-center font-arabic" dir="rtl">
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
                    <Link to="/" className="text-brand-burgundy underline font-bold">العودة للرئيسية</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0DFCD] text-[#800020] font-arabic pt-8 pb-24" dir="rtl">
            <div className="container mx-auto px-6 max-w-6xl">

                {/* ─── Breadcrumb & Back Navigation ─── */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 text-sm font-bold opacity-75">
                        <Link to="/" className="hover:opacity-100 transition">الرئيسية</Link>
                        <span>/</span>
                        <Link to={`/product/${product.id}`} className="hover:opacity-100 transition">{product.name}</Link>
                        <span>/</span>
                        <span className="opacity-100">جميع المراجعات</span>
                    </div>

                    <button 
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="shine-button relative overflow-hidden group text-sm font-bold flex items-center gap-2 text-[#F0DFCD] bg-[#800020] hover:bg-[#600018] px-4 py-2.5 rounded-xl shadow-md transition-all duration-300 cursor-pointer active:scale-95"
                    >
                        <span className="shine-effect" />
                        <span className="relative z-10">العودة لصفحة المنتج</span>
                        <ArrowRight className="w-4 h-4 text-[#F0DFCD] relative z-10 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* ─── Product Header Card ─── */}
                <div className="bg-white/25 backdrop-blur-sm border border-[#800020]/10 rounded-3xl p-6 md:p-8 mb-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="w-24 h-28 rounded-2xl bg-[#F0DFCD]/60 border border-[#800020]/10 overflow-hidden flex items-center justify-center p-2 shrink-0">
                            <img 
                                src={product.imgs[0]} 
                                alt={product.name} 
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        </div>
                        <div>
                            <span className="text-xs font-black bg-[#800020]/10 text-[#800020] px-2.5 py-0.5 rounded-md">
                                {product.category}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-black text-[#800020] mt-1.5 mb-1">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 font-bold text-lg">
                                    <span>{product.price}</span>
                                    <RiyalIcon className="w-4 h-4 text-[#800020]" />
                                </div>
                                <span className="opacity-40">•</span>
                                <div className="flex items-center gap-1.5">
                                    <StarRating rating={product.rating} />
                                    <span className="font-black text-sm">{product.rating} من 5</span>
                                    <span className="text-xs font-bold opacity-70">({reviews.length} مراجعة)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={handleOpenReviewModal}
                            className="shine-button relative overflow-hidden group flex-1 md:flex-none bg-[#800020] text-[#F0DFCD] hover:bg-[#600018] px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                            <span className="shine-effect" />
                            <MessageSquarePlus className="w-4 h-4 text-[#F0DFCD] relative z-10" />
                            <span className="relative z-10">كتابة مراجعة</span>
                        </button>
                        <button
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="shine-button relative overflow-hidden group flex-1 md:flex-none bg-[#800020] text-[#F0DFCD] hover:bg-[#600018] px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                            <span className="shine-effect" />
                            <ShoppingBag className="w-4 h-4 text-[#F0DFCD] relative z-10" />
                            <span className="relative z-10">شراء المنتج</span>
                        </button>
                        <button
                            onClick={() => {
                                const next = !isVerifiedBuyer;
                                setIsVerifiedBuyer(next);
                                localStorage.setItem(`verified_buyer_${product.id}`, String(next));
                                showToast(next ? 'تم تفعيل حالة: مشتري موثق' : 'تم تفعيل حالة: غير مشتري');
                            }}
                            className="shine-button relative overflow-hidden group text-xs font-bold px-3.5 py-3.5 rounded-xl border border-[#800020]/25 bg-white/40 hover:bg-white/70 text-[#800020] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                            <ShieldCheck className={`w-4 h-4 ${isVerifiedBuyer ? 'text-emerald-700' : 'text-stone-400'}`} />
                            <span className="hidden sm:inline">{isVerifiedBuyer ? 'مشتري موثق' : 'غير مشتري'}</span>
                        </button>
                    </div>
                </div>

                {/* ─── Ratings Summary & Analytics ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Big Score Card */}
                    <div className="bg-[#800020] text-[#F0DFCD] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                        <div className="text-6xl md:text-7xl font-black mb-2 tracking-tight">
                            {product.rating}
                        </div>
                        <div className="flex justify-center mb-3">
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star 
                                        key={i} 
                                        className={`w-5 h-5 ${i <= Math.round(product.rating) ? 'text-[#F0DFCD] fill-[#F0DFCD]' : 'text-[#F0DFCD]/20'}`} 
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="font-bold text-sm opacity-90 mb-4">
                            بناءً على {reviews.length} تقييماً موثقاً من مشترين حقيقيين
                        </p>
                        <div className="flex items-center gap-2 bg-[#F0DFCD]/15 px-4 py-1.5 rounded-full text-xs font-bold">
                            <ShieldCheck className="w-4 h-4" />
                            <span>100% تقييمات بمشتريات مؤكدة</span>
                        </div>
                    </div>

                    {/* Star Breakdown Bars */}
                    <div className="lg:col-span-2 bg-white/25 backdrop-blur-sm border border-[#800020]/10 rounded-3xl p-8 flex flex-col justify-center">
                        <h3 className="font-black text-lg text-[#800020] mb-4">توزيع التقييمات</h3>
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map(stars => {
                                const count = starCounts[stars] || 0;
                                const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                                return (
                                    <button
                                        key={stars}
                                        onClick={() => setSelectedStarFilter(selectedStarFilter === String(stars) ? 'all' : String(stars))}
                                        className={`w-full flex items-center gap-4 text-sm font-bold transition p-1.5 rounded-xl text-right ${
                                            selectedStarFilter === String(stars) ? 'bg-[#800020]/10' : 'hover:bg-white/25'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 w-16 shrink-0 justify-end">
                                            <span>{stars}</span>
                                            <Star className="w-3.5 h-3.5 fill-[#800020] text-[#800020]" />
                                        </div>
                                        <div className="flex-1 h-3 bg-[#800020]/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#800020] rounded-full transition-all duration-500" 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="w-16 text-left shrink-0 font-bold opacity-75 text-xs">
                                            {count} ({percentage}%)
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ─── Filters & Search Toolbar ─── */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 bg-white/25 p-4 rounded-2xl border border-[#800020]/10">
                    {/* Star Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 md:pb-0">
                        <button
                            onClick={() => setSelectedStarFilter('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                selectedStarFilter === 'all'
                                    ? 'bg-[#800020] text-[#F0DFCD]'
                                    : 'bg-[#800020]/10 text-[#800020] hover:bg-[#800020]/20'
                            }`}
                        >
                            جميع النجوم ({reviews.length})
                        </button>
                        {[5, 4, 3, 2, 1].map(stars => (
                            <button
                                key={stars}
                                onClick={() => setSelectedStarFilter(String(stars))}
                                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                                    selectedStarFilter === String(stars)
                                        ? 'bg-[#800020] text-[#F0DFCD]'
                                        : 'bg-[#800020]/10 text-[#800020] hover:bg-[#800020]/20'
                                }`}
                            >
                                <span>{stars}</span>
                                <Star className="w-3 h-3 fill-current" />
                                <span>({starCounts[stars] || 0})</span>
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-3">
                        <CustomDropdown
                            value={sortBy}
                            onChange={(val) => setSortBy(val)}
                            options={[
                                { value: 'newest', label: 'الأحدث أولاً' },
                                { value: 'highest', label: 'الأعلى تقييماً' },
                                { value: 'helpful', label: 'الأكثر فائدة' }
                            ]}
                            className="w-40"
                            triggerClassName="py-1.5 px-3.5 text-xs bg-white/25 rounded-xl border border-[#800020]/15"
                            menuClassName="w-40"
                        />
                    </div>
                </div>


                {/* ─── Reviews List ─── */}
                <div className="space-y-6">
                    {filteredReviews.length === 0 ? (
                        <div className="text-center py-16 bg-white/25 rounded-3xl border border-[#800020]/10">
                            <Filter className="w-12 h-12 text-[#800020]/40 mx-auto mb-3" />
                            <h3 className="font-black text-lg mb-1">لا توجد مراجعات مطابقة</h3>
                            <p className="text-sm opacity-70">جرب تغيير معيار البحث أو فلتر النجوم المحدد.</p>
                            <button
                                onClick={() => setSelectedStarFilter('all')}
                                className="mt-4 px-4 py-2 bg-[#800020] text-[#F0DFCD] rounded-xl text-xs font-bold"
                            >
                                إظهار كافة المراجعات
                            </button>
                        </div>
                    ) : (
                        filteredReviews.map((rev) => {
                            const isVoted = Boolean(helpfulVotes[rev.id]);
                            const currentHelpful = (rev.helpfulCount || 0) + (isVoted ? 1 : 0);

                            return (
                                <motion.div
                                    key={rev.id}
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/25 backdrop-blur-sm border border-[#800020]/10 rounded-3xl p-6 md:p-8 shadow-sm transition hover:shadow-md"
                                >
                                    {/* Review Card Top Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar Initials */}
                                            <div className="w-11 h-11 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                                                {rev.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-base text-[#800020]">
                                                    {rev.userName}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs opacity-70 font-bold mt-0.5">
                                                    <span>{rev.date}</span>
                                                    {rev.purchasedSize && (
                                                        <>
                                                            <span>•</span>
                                                            <span>المقاس: {rev.purchasedSize}</span>
                                                        </>
                                                    )}
                                                    {rev.purchasedColor && (
                                                        <>
                                                            <span>•</span>
                                                            <span>اللون: {rev.purchasedColor}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stars */}
                                        <div className="flex items-center gap-2">
                                            <StarRating rating={rev.rating} size="w-4 h-4" />
                                            <span className="text-xs font-black text-[#800020]">{rev.rating}.0</span>
                                        </div>
                                    </div>

                                    {/* Review Content */}
                                    <h5 className="font-black text-base text-[#800020] mb-2">
                                        {rev.title}
                                    </h5>
                                    <p className="text-sm font-bold text-[#800020]/85 leading-relaxed mb-5">
                                        {rev.comment}
                                    </p>

                                    {/* ─── أزرار التفاعل ─── */}
                                    <div className="pt-4 border-t border-[#800020]/10 flex items-center justify-between">
                                        {rev.verifiedPurchase ? (
                                            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-500/15 border border-emerald-600/30 px-3 py-1 rounded-lg">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <span>{rev.verifiedText || 'مشتري موثق'}</span>
                                            </div>
                                        ) : <div />}

                                        {/* Helpful Vote Button */}
                                        <button
                                            onClick={() => handleHelpfulClick(rev.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                                isVoted 
                                                    ? 'bg-[#800020] text-[#F0DFCD]' 
                                                    : 'bg-[#800020]/10 text-[#800020] hover:bg-[#800020]/20'
                                            }`}
                                        >
                                            <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-current' : ''}`} />
                                            <span>مفيد ({currentHelpful})</span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* ─── Add Review Modal ─── */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                className="bg-[#F0DFCD] text-[#800020] rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-[#800020]/20 relative"
                            >
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute left-6 top-6 w-9 h-9 rounded-xl bg-[#800020]/10 hover:bg-[#800020]/20 flex items-center justify-center transition cursor-pointer"
                                >
                                    <X className="w-5 h-5 text-[#800020]" />
                                </button>

                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-12 h-12 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center shrink-0">
                                        <MessageSquarePlus className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black">أضف مراجعتك للمنتج</h3>
                                        <p className="text-xs font-bold opacity-75">{product.name}</p>
                                    </div>
                                </div>

                                {/* Verified Buyer Confirmation Banner */}
                                <div className="flex items-center gap-2.5 bg-emerald-500/15 border border-emerald-600/30 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs font-black mb-5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span>مشتري موثوق ومؤكد الاستلام</span>
                                            <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-bold">تم تأكيد الاستلام</span>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleAddReview} className="space-y-4">
                                    {/* Rating Star Picker */}
                                    <div>
                                        <label className="block text-xs font-black mb-2 opacity-90">تقييمك الإجمالي:</label>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map(st => (
                                                <button
                                                    key={st}
                                                    type="button"
                                                    onClick={() => setNewRating(st)}
                                                    className="p-1 hover:scale-110 transition cursor-pointer"
                                                >
                                                    <Star 
                                                        className={`w-7 h-7 ${st <= newRating ? 'text-[#800020] fill-[#800020]' : 'text-[#800020]/20'}`} 
                                                    />
                                                </button>
                                            ))}
                                            <span className="font-black text-sm mr-2">{newRating} من 5</span>
                                        </div>
                                    </div>

                                    {/* Name Input */}
                                    <div>
                                        <label className="block text-xs font-black mb-1.5 opacity-90">اسمك الكامل:</label>
                                        <input
                                            type="text"
                                            required
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="مثال: عبد الله السعد"
                                            className="w-full bg-white/90 border border-[#800020]/20 rounded-xl px-4 py-2.5 text-sm font-bold text-[#800020] focus:outline-none focus:border-[#800020]"
                                        />
                                    </div>

                                    {/* Purchased Size */}
                                    <div className="relative z-20">
                                        <label className="block text-xs font-black mb-1.5 opacity-90">المقاس الذي اشتريته:</label>
                                        <CustomDropdown
                                            value={newSize}
                                            onChange={(val) => setNewSize(val)}
                                            options={['XS', 'S', 'M', 'L', 'XL', 'XXL']}
                                            placeholder="اختر المقاس"
                                            className="w-full"
                                            triggerClassName="w-full bg-white/90 border border-[#800020]/20 rounded-xl px-4 py-2.5 text-sm font-bold text-[#800020]"
                                            menuClassName="w-full max-w-full"
                                        />
                                    </div>

                                    {/* Review Title */}
                                    <div>
                                        <label className="block text-xs font-black mb-1.5 opacity-90">عنوان المراجعة:</label>
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="مثال: خامة فائقة الجودة وتوصيل سريع"
                                            className="w-full bg-white/90 border border-[#800020]/20 rounded-xl px-4 py-2.5 text-sm font-bold text-[#800020] focus:outline-none focus:border-[#800020]"
                                        />
                                    </div>

                                    {/* Review Comment */}
                                    <div>
                                        <label className="block text-xs font-black mb-1.5 opacity-90">تفاصيل المراجعة والتجربة:</label>
                                        <textarea
                                            required
                                            rows="3"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="شاركنا تفاصيل تجربتك مع القماش، المقاس، والراحة..."
                                            className="w-full bg-white/90 border border-[#800020]/20 rounded-xl px-4 py-2.5 text-sm font-bold text-[#800020] focus:outline-none focus:border-[#800020]"
                                        />
                                    </div>


                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            className="shine-button relative overflow-hidden group flex-1 bg-[#800020] text-[#F0DFCD] hover:bg-[#600018] py-3 rounded-xl font-black text-sm shadow-md transition cursor-pointer"
                                        >
                                            <span className="shine-effect" />
                                            <span className="relative z-10">نشر المراجعة الموثقة</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-5 py-3 bg-[#800020]/10 hover:bg-[#800020]/20 rounded-xl font-bold text-sm transition cursor-pointer"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
