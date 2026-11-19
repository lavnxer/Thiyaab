import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { 
    Scale, 
    FileText, 
    ShieldCheck, 
    ChevronLeft, 
    CheckCircle2, 
    HelpCircle, 
    Mail, 
    Phone, 
    Printer, 
    Search, 
    X, 
    ArrowLeft,
    AlertCircle,
    Lock,
    Truck,
    RotateCcw
} from 'lucide-react';
import Footer from '../components/Footer';

export default function LegalPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // Available tabs: 'terms' | 'conditions' | 'privacy'
    const sectionParam = searchParams.get('section') || location.hash.replace('#', '') || 'terms';
    const [activeSection, setActiveSection] = useState(
        ['terms', 'conditions', 'privacy'].includes(sectionParam) ? sectionParam : 'terms'
    );
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const param = searchParams.get('section') || location.hash.replace('#', '');
        if (param && ['terms', 'conditions', 'privacy'].includes(param)) {
            setActiveSection(param);
            const el = document.getElementById(param);
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [searchParams, location.hash]);

    const handleSectionChange = (sec) => {
        setActiveSection(sec);
        setSearchParams({ section: sec });
        const el = document.getElementById(sec);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#F0DFCD] text-[#800020] font-arabic selection:bg-[#800020] selection:text-[#F0DFCD]" dir="rtl">
            {/* Breadcrumb Header */}
            <div className="bg-[#800020]/5 border-b border-[#800020]/10 py-4 px-6 sm:px-12">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#800020]/70">
                        <Link to="/" className="hover:text-[#800020] transition-colors">الرئيسية</Link>
                        <ChevronLeft className="w-4 h-4 opacity-50" />
                        <span className="opacity-70">الشؤون القانونية</span>
                        <ChevronLeft className="w-4 h-4 opacity-50" />
                        <span className="text-[#800020] font-black">
                            {activeSection === 'terms' ? 'الشروط' : activeSection === 'conditions' ? 'الأحكام' : 'السياسة'}
                        </span>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#800020]/80 hover:text-[#800020] bg-white/60 hover:bg-white px-3 py-1.5 rounded-lg border border-[#800020]/15 transition-all cursor-pointer"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة النسخة القانونية</span>
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <section className="pt-10 pb-12 px-6 sm:px-12 border-b border-[#800020]/10 bg-white/40">
                <div className="container mx-auto max-w-5xl text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#800020]/10 border border-[#800020]/20 text-[#800020] text-xs sm:text-sm font-black mb-4">
                        <Scale className="w-4 h-4 text-[#800020]" />
                        <span>الوثيقة النظامية المعتمدة • دار ثياب للأزياء الراقية</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-[#800020] mb-4 tracking-tight">
                        الشؤون القانونية
                    </h1>
                    <p className="text-xs sm:text-base text-[#800020]/80 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
                        توضح هذه الوثيقة الشروط، الأحكام، وسياسات الخصوصية والتعامل التجاري لدار ثياب، بما يتوافق تماماً مع الأنظمة واللوائح المعمول بها في المملكة العربية السعودية لحفظ حقوقك وضمان تجربة تسوق آمنة وموثوقة.
                    </p>

                    {/* Navigation Tabs */}
                    <div className="inline-flex p-1.5 rounded-2xl bg-white border border-[#800020]/15 shadow-sm max-w-xl w-full">
                        <button
                            onClick={() => handleSectionChange('terms')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                activeSection === 'terms'
                                    ? 'bg-[#800020] text-[#F0DFCD] shadow-md'
                                    : 'text-[#800020]/80 hover:text-[#800020] hover:bg-[#800020]/5'
                            }`}
                        >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span>الشروط</span>
                        </button>

                        <button
                            onClick={() => handleSectionChange('conditions')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                activeSection === 'conditions'
                                    ? 'bg-[#800020] text-[#F0DFCD] shadow-md'
                                    : 'text-[#800020]/80 hover:text-[#800020] hover:bg-[#800020]/5'
                            }`}
                        >
                            <Scale className="w-4 h-4 shrink-0" />
                            <span>الأحكام</span>
                        </button>

                        <button
                            onClick={() => handleSectionChange('privacy')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                activeSection === 'privacy'
                                    ? 'bg-[#800020] text-[#F0DFCD] shadow-md'
                                    : 'text-[#800020]/80 hover:text-[#800020] hover:bg-[#800020]/5'
                            }`}
                        >
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <span>السياسة</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <div className="container mx-auto px-6 sm:px-12 max-w-5xl py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Sticky Sidebar Navigation on Large Screens */}
                    <div className="lg:col-span-4 sticky top-24 hidden lg:flex flex-col gap-4">
                        <div className="bg-white/80 p-6 rounded-3xl border border-[#800020]/15 shadow-sm">
                            <h3 className="font-black text-sm text-[#800020] mb-4 pb-2 border-b border-[#800020]/10">
                                فهرس الوثيقة القانونية
                            </h3>
                            <nav className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleSectionChange('terms')}
                                    className={`text-right px-4 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center justify-between cursor-pointer ${
                                        activeSection === 'terms'
                                            ? 'bg-[#800020] text-[#F0DFCD]'
                                            : 'text-[#800020]/80 hover:bg-[#800020]/5'
                                    }`}
                                >
                                    <span>1. الشروط (شروط الاستخدام)</span>
                                    {activeSection === 'terms' && <ChevronLeft className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleSectionChange('conditions')}
                                    className={`text-right px-4 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center justify-between cursor-pointer ${
                                        activeSection === 'conditions'
                                            ? 'bg-[#800020] text-[#F0DFCD]'
                                            : 'text-[#800020]/80 hover:bg-[#800020]/5'
                                    }`}
                                >
                                    <span>2. الأحكام (الطلبات والتعاقد)</span>
                                    {activeSection === 'conditions' && <ChevronLeft className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleSectionChange('privacy')}
                                    className={`text-right px-4 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center justify-between cursor-pointer ${
                                        activeSection === 'privacy'
                                            ? 'bg-[#800020] text-[#F0DFCD]'
                                            : 'text-[#800020]/80 hover:bg-[#800020]/5'
                                    }`}
                                >
                                    <span>3. السياسة (الخصوصية والضمان)</span>
                                    {activeSection === 'privacy' && <ChevronLeft className="w-4 h-4" />}
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content Columns */}
                    <div className="lg:col-span-8 flex flex-col gap-12">
                        {/* 1. قسم الشروط */}
                        <section 
                            id="terms" 
                            className={`scroll-mt-24 transition-all duration-300 p-6 sm:p-10 rounded-3xl border ${
                                activeSection === 'terms'
                                    ? 'bg-white shadow-lg border-[#800020]/30 ring-2 ring-[#800020]/10'
                                    : 'bg-white/80 border-[#800020]/10 hover:border-[#800020]/20'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#800020]/10">
                                <div className="w-12 h-12 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center font-bold">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-[#800020]/60 uppercase tracking-wider">القسم الأول</span>
                                    <h2 className="text-xl sm:text-2xl font-black text-[#800020]">
                                        الشروط (شروط الاستخدام والخدمة)
                                    </h2>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 text-xs sm:text-sm text-[#800020]/85 font-medium leading-relaxed">
                                <div>
                                    <h3 className="font-black text-base text-[#800020] mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                        1.1 قبول شروط الاستخدام
                                    </h3>
                                    <p>
                                        يُعد وصولك واستخدامك لمنصة وتطبيق <strong>دار ثياب</strong> موافقة قانونية صريحة وكاملة على الالتزام بجميع بنود هذه الشروط. إذا كنت لا توافق على أي بند، فيرجى التوقف عن استخدام المنصة فوراً.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-black text-base text-[#800020] mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                        1.2 الأهلية القانونية والحساب
                                    </h3>
                                    <p>
                                        يشترط لإتمام عمليات الشراء أن يبلغ المستخدم السن القانونية (18 عاماً) أو بموافقة ولي الأمر. يلتزم المستخدم بتقديم بيانات صحيحة ودقيقة عند إنشاء الحساب وتحمل المسؤولية الكاملة عن سرية بيانات تسجيل الدخول وكلمة المرور.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-black text-base text-[#800020] mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                        1.3 الملكية الفكرية وحقوق العلامة التجارية
                                    </h3>
                                    <p>
                                        كافة محتويات المنصة بما في ذلك الشعار، التصاميم، الصور، مقاطع الفيديو، النصوص، والبرمجيات هي ملكية فكرية حصرية لـ <strong>دار ثياب</strong>، ومحمية بموجب أنظمة حماية حقوق المؤلف والعلامات التجارية في المملكة العربية السعودية والمعاهدات الدولية. يُحظر نسخ أو إعادة إنتاج أي جزء دون إذن كتابي مسبق.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-black text-base text-[#800020] mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                        1.4 الاستخدام المشروع للموقع
                                    </h3>
                                    <p>
                                        يحظر استخدام الموقع لأي أغراض غير قانونية أو احتيالية أو محاولة اختراق الخوادم أو جمع البيانات بطرق غير مصرح بها. يحق لإدارة دار ثياب تعليق أو حظر أي حساب يخالف هذه الضوابط دون إشعار مسبق.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 2. قسم الأحكام */}
                        <section 
                            id="conditions" 
                            className={`scroll-mt-24 transition-all duration-300 p-6 sm:p-10 rounded-3xl border ${
                                activeSection === 'conditions'
                                    ? 'bg-white shadow-lg border-[#800020]/30 ring-2 ring-[#800020]/10'
                                    : 'bg-white/80 border-[#800020]/10 hover:border-[#800020]/20'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#800020]/10">
                                <div className="w-12 h-12 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center font-bold">
                                    <Scale className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-[#800020]/60 uppercase tracking-wider">القسم الثاني</span>
                                    <h2 className="text-xl sm:text-2xl font-black text-[#800020]">
                                        الأحكام (أحكام الطلبات، التعاقد، والأسعار)
                                    </h2>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 text-xs sm:text-sm text-[#800020]/85 font-medium leading-relaxed">
                                <div>
                                    <h3 className="font-black text-base text-[#800020] mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                        2.1 تأكيد الطلبات وإبرام العقد
                                    </h3>
                                    <p>
                                        يُعد إرسال الطلب عبر المنصة بمثابة إيجاب من العميل، وينعقد العقد التجاري النهائي عند إرسال رسالة تأكيد الطلب وتجهيز الشحنة عبر البريد الإلكتروني أو الرسائل النصية القصيرة (SMS).
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-black text-base text-[#800020] mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                        2.2 الأسعار والضرائب
                                    </h3>
                                    <p>
                                        جميع الأسعار المعروضة بالريال السعودي (SAR) وتشمل ضريبة القيمة المضافة (VAT) المقررة بنسبة 15%. نحتفظ بالحق في تحديث الأسعار أو إطلاق عروض ترويجية محددة بوقت، ولا تسري التعديلات على الطلبات التي تم تأكيدها مسبقاً.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-black text-base text-[#800020] mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                        2.3 الشحن والتسليم
                                    </h3>
                                    <p>
                                        نلتزم بتسليم المنتجات عبر شركات شحن معتمدة وموثوقة خلال المدة الموضحة عند الدفع (عادة من 1 إلى 4 أيام عمل داخل المملكة). يتحمل العميل مسؤولية تزويدنا بعنوان دقيق ورقم هاتف فعال لضمان وصول الشحنة دون تأخير.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-black text-base text-[#800020] mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                        2.4 الدفع والمعاملات الآمنة
                                    </h3>
                                    <p>
                                        نوفر وسائل دفع متعددة ومشفرة وفق أعلى معايير الأمان المالي (مدى، فيزا، ماستركارد، أبل باي، وتمارا / تابي للتقسيط بدون فوائد). لا نقوم بتخزين تفاصيل بطاقاتك الائتمانية في خوادمنا على الإطلاق.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 3. قسم السياسة */}
                        <section 
                            id="privacy" 
                            className={`scroll-mt-24 transition-all duration-300 p-6 sm:p-10 rounded-3xl border ${
                                activeSection === 'privacy'
                                    ? 'bg-white shadow-lg border-[#800020]/30 ring-2 ring-[#800020]/10'
                                    : 'bg-white/80 border-[#800020]/10 hover:border-[#800020]/20'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#800020]/10">
                                <div className="w-12 h-12 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center font-bold">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-[#800020]/60 uppercase tracking-wider">القسم الثالث</span>
                                    <h2 className="text-xl sm:text-2xl font-black text-[#800020]">
                                        السياسة (سياسة الخصوصية، سرية البيانات، والاسترجاع)
                                    </h2>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 text-xs sm:text-sm text-[#800020]/85 font-medium leading-relaxed">
                                <div>
                                    <h3 className="font-black text-base text-[#800020] mb-2 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-[#800020]" />
                                        3.1 حماية البيانات والخصوصية
                                    </h3>
                                    <p>
                                        نولي خصوصيتك أقصى درجات العناية. يتم جمع بيانات العميل (كالاسم، رقم الهاتف، العنوان، والبريد) حصرياً لمعالجة الطلبات وتوصيلها وتخصيص تجربتك، وفقاً لنظام حماية البيانات الشخصية الصادر في المملكة العربية السعودية. لا نقوم ببيع أو تأجير أي بيانات لطرف ثالث.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-black text-base text-[#800020] mb-2 flex items-center gap-2">
                                        <RotateCcw className="w-4 h-4 text-[#800020]" />
                                        3.2 سياسة الاستبدال والاسترجاع والضمان الذهبي
                                    </h3>
                                    <p>
                                        يحق للعميل استبدال أو استرجاع المنتجات الجاهزة خلال <strong>14 يوماً</strong> من تاريخ الاستلام، بشرط أن تكون القطعة بحالتها الأصلية غير مستعملة وتحمل كافة العلامات التجارية والملصقات مع التغليف الأصلي. نتحمل تكلفة الاسترجاع في حال وجود أي عيب مصنعي أو خطأ في المقاس من طرفنا.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-black text-base text-[#800020] mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-[#800020]" />
                                        3.3 استثناءات الاسترجاع
                                    </h3>
                                    <p>
                                        حفاظاً على الصحة العامة، لا يمكن استرجاع المنتجات التي تم تفصيلها خصيصاً بمقاسات استثنائية بناءً على طلب العميل إلا في حال وجود عيب في الصنع، بالإضافة إلى الملابس الداخلية بعد فتح غلافها الصحي.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-black text-base text-[#800020] mb-2 flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-[#800020]" />
                                        3.4 سياسة رد المبالغ المالية
                                    </h3>
                                    <p>
                                        عند قبول الاسترجاع، يتم فحص المنتج خلال 48 ساعة، وتُعاد الأموال تلقائياً إلى وسيلة الدفع الأصلية خلال مدة تتراوح بين 3 إلى 7 أيام عمل بحسب سياسة البنك المصدر للبطاقة.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Brand Footer */}
            <Footer />
        </div>
    );
}
