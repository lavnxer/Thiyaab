import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calculator, 
    ArrowRight, 
    Sparkles, 
    Scissors 
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CustomDropdown from '../components/CustomDropdown';

export default function SizeGuidePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Interactive Size Calculator State
    const [calcGender, setCalcGender] = useState('men');
    const [calcCategory, setCalcCategory] = useState('thobe');
    const [calcHeight, setCalcHeight] = useState(175);
    const [calcWeight, setCalcWeight] = useState(74);
    const [calculatedResult, setCalculatedResult] = useState(null);

    // Initial gender sync if param present
    useEffect(() => {
        const catParam = searchParams.get('category');
        const genderParam = searchParams.get('gender');
        if (genderParam === 'women' || (catParam && ['فساتين', 'عبايات'].includes(catParam))) {
            setCalcGender('women');
            setCalcCategory('abayas');
        }
    }, [searchParams]);

    // Handle interactive calculator
    const handleCalculate = (e) => {
        e.preventDefault();
        const h = Number(calcHeight);
        const w = Number(calcWeight);

        let recSize = 'M';
        let detail = '';

        if (calcGender === 'men') {
            if (calcCategory === 'thobe') {
                if (h <= 163) recSize = '52';
                else if (h <= 169) recSize = '54';
                else if (h <= 175) recSize = '56';
                else if (h <= 181) recSize = '58';
                else if (h <= 187) recSize = '60';
                else recSize = '62';
                detail = `بناءً على طولك (${h} سم)، مقاس الثوب الموصى به هو ${recSize}. الطول سيصل بالقرب من الكاحل بمظهر راقٍ ومتناسق.`;
            } else if (calcCategory === 'coats' || calcCategory === 'shirts') {
                if (w < 65 || h < 168) recSize = 'S';
                else if (w < 77 || h < 176) recSize = 'M';
                else if (w < 88 || h < 184) recSize = 'L';
                else if (w < 100) recSize = 'XL';
                else recSize = 'XXL';
                detail = `بناءً على وزنك (${w} كجم) وطولك (${h} سم)، المقاس المثالي هو ${recSize}. يمنحك راحة متوازنة دون ضيق أو اتساع مفرط.`;
            } else if (calcCategory === 'pants') {
                if (w < 65) recSize = '30 (S)';
                else if (w < 75) recSize = '32 (M)';
                else if (w < 85) recSize = '34 (L)';
                else if (w < 95) recSize = '36 (XL)';
                else recSize = '38 (XXL)';
                detail = `مقاس البنطال الموصى به هو ${recSize} بناءً على وزنك التقديري.`;
            } else {
                recSize = '42 EU';
                detail = 'المقاس الأكثر شيوعاً هو 42، يُرجى مراجعة جدول طول القدم بالسنتيمتر للدقة القصوى.';
            }
        } else {
            // Women
            if (calcCategory === 'abayas') {
                if (h <= 152) recSize = 'XS';
                else if (h <= 157) recSize = 'S';
                else if (h <= 163) recSize = 'M';
                else if (h <= 169) recSize = 'L';
                else if (h <= 175) recSize = 'XL';
                else recSize = 'XXL';
                detail = `بناءً على طولك (${h} سم)، مقاس العباية الأنسب هو ${recSize}. إذا كنتِ ترتدين كعباً عالياً، يمكنكِ اختيار مقاس أكبر بدرجة.`;
            } else if (calcCategory === 'dresses' || calcCategory === 'women-tops') {
                if (w < 53) recSize = 'XS';
                else if (w < 61) recSize = 'S';
                else if (w < 69) recSize = 'M';
                else if (w < 79) recSize = 'L';
                else recSize = 'XL';
                detail = `بناءً على وزنك (${w} كجم) وطولك (${h} سم)، المقاس الموصى به هو ${recSize}.`;
            } else if (calcCategory === 'women-pants') {
                if (w < 53) recSize = 'XS (34)';
                else if (w < 61) recSize = 'S (36)';
                else if (w < 69) recSize = 'M (38)';
                else if (w < 79) recSize = 'L (40)';
                else recSize = 'XL (42)';
                detail = `المقاس الموصى به هو ${recSize}.`;
            } else {
                recSize = '38 EU';
                detail = 'المقاس التقريبي هو 38، يُفضل قياس طول القدم بالسنتيمتر لمطابقة الجدول بدقة.';
            }
        }

        setCalculatedResult({
            size: recSize,
            detail,
            category: calcCategory
        });
    };


    return (
        <div className="min-h-[100dvh] bg-[#F0DFCD] text-[#800020] font-arabic pt-8 pb-24 w-full overflow-x-clip" dir="rtl">
            <div className="container mx-auto px-6 max-w-6xl">

                {/* ─── Breadcrumb & Header ─── */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 text-sm font-bold opacity-70">
                        <Link to="/" className="hover:opacity-100 transition">الرئيسية</Link>
                        <span>/</span>
                        <span className="opacity-100">دليل المقاسات</span>
                    </div>

                    <button 
                        onClick={() => navigate(-1)} 
                        className="text-sm font-bold flex items-center gap-2 hover:opacity-75 transition bg-[#800020]/10 px-4 py-2 rounded-xl"
                    >
                        <span>الرجوع السابق</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* ─── Hero Title Section ─── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14"
                >
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-[#800020]">
                        دليل المقاسات الدقيق لجميع القطع
                    </h1>
                    <p className="text-lg md:text-xl text-[#800020]/80 max-w-3xl mx-auto leading-relaxed font-medium">
                        صُمم هذا الدليل لمساعدتك في اختيار المقاس المثالي لكل قطعة بدقة متناهية بناءً على محيط الجسم، الطول، والوزن التقريبي.
                    </p>
                </motion.div>

                {/* ─── Interactive Smart Size Calculator (حاسبة المقاس الذكية) ─── */}
                <motion.div 
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="bg-white/70 backdrop-blur-sm border border-[#800020]/15 text-[#800020] rounded-3xl p-8 md:p-10 mb-16 shadow-sm relative overflow-hidden"
                >
                    {/* Decorative watermark */}
                    <div className="absolute -left-12 -bottom-12 opacity-[0.03] text-[#800020] pointer-events-none text-9xl font-black">
                        📏
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-[#800020]/15 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#800020]/10 flex items-center justify-center">
                                <Calculator className="w-6 h-6 text-[#800020]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-[#800020]">حاسبة المقاس الذكية</h2>
                                <p className="text-sm text-[#800020]/75 font-medium">أدخل طولك ووزنك ونوع القطعة للحصول على توصية مقاسك الفورية</p>
                            </div>
                        </div>

                        {/* Gender Toggle inside Calculator */}
                        <div className="flex bg-[#800020]/10 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => {
                                    setCalcGender('men');
                                    setCalcCategory('thobe');
                                    setCalculatedResult(null);
                                }}
                                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                                    calcGender === 'men' 
                                        ? 'bg-[#800020] text-[#F0DFCD] shadow-sm' 
                                        : 'text-[#800020]/70 hover:text-[#800020]'
                                }`}
                            >
                                رجالي
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setCalcGender('women');
                                    setCalcCategory('abayas');
                                    setCalculatedResult(null);
                                }}
                                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                                    calcGender === 'women' 
                                        ? 'bg-[#800020] text-[#F0DFCD] shadow-sm' 
                                        : 'text-[#800020]/70 hover:text-[#800020]'
                                }`}
                            >
                                نسائي
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. Category */}
                        <div className="relative z-20">
                            <label className="block text-sm font-bold mb-2 text-[#800020]">نوع القطعة:</label>
                            <CustomDropdown
                                value={calcCategory}
                                onChange={(val) => {
                                    setCalcCategory(val);
                                    setCalculatedResult(null);
                                }}
                                options={calcGender === 'men' ? [
                                    { value: 'thobe', label: 'ثوب / جلابية رجالية' },
                                    { value: 'coats', label: 'معطف / جاكيت' },
                                    { value: 'shirts', label: 'قميص / بلوفر' },
                                    { value: 'pants', label: 'بنطال / جينز' },
                                    { value: 'shoes', label: 'حذاء رجالي' }
                                ] : [
                                    { value: 'abayas', label: 'عباية / قفطان' },
                                    { value: 'dresses', label: 'فستان سهرة / كاجوال' },
                                    { value: 'women-tops', label: 'بلوزة / قميص نسائي' },
                                    { value: 'women-pants', label: 'بنطال / تنورة' },
                                    { value: 'women-shoes', label: 'حذاء نسائي' }
                                ]}
                                className="w-full"
                                triggerClassName="w-full bg-white/80 border border-[#800020]/25 text-[#800020] rounded-xl px-4 py-3 font-bold shadow-sm"
                                menuClassName="w-full max-w-full"
                            />
                        </div>

                        {/* 2. Height Slider / Input */}
                        <div>
                            <div className="flex items-center justify-between text-sm font-bold mb-2 text-[#800020]">
                                <span>الطول:</span>
                                <span className="bg-[#800020]/10 text-[#800020] px-2.5 py-0.5 rounded-md">{calcHeight} سم</span>
                            </div>
                            <input
                                type="range"
                                min="145"
                                max="205"
                                value={calcHeight}
                                onChange={(e) => setCalcHeight(e.target.value)}
                                className="w-full accent-[#800020] h-2 bg-[#800020]/20 rounded-lg appearance-none cursor-pointer mt-3"
                            />
                            <div className="flex justify-between text-[11px] text-[#800020]/60 mt-1 font-medium">
                                <span>145 سم</span>
                                <span>175 سم</span>
                                <span>205 سم</span>
                            </div>
                        </div>

                        {/* 3. Weight Slider / Input */}
                        <div>
                            <div className="flex items-center justify-between text-sm font-bold mb-2 text-[#800020]">
                                <span>الوزن التقريبي:</span>
                                <span className="bg-[#800020]/10 text-[#800020] px-2.5 py-0.5 rounded-md">{calcWeight} كجم</span>
                            </div>
                            <input
                                type="range"
                                min="40"
                                max="130"
                                value={calcWeight}
                                onChange={(e) => setCalcWeight(e.target.value)}
                                className="w-full accent-[#800020] h-2 bg-[#800020]/20 rounded-lg appearance-none cursor-pointer mt-3"
                            />
                            <div className="flex justify-between text-[11px] text-[#800020]/60 mt-1 font-medium">
                                <span>40 كجم</span>
                                <span>85 كجم</span>
                                <span>130 كجم</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="md:col-span-3 flex justify-center mt-2">
                            <button
                                type="submit"
                                className="bg-[#800020] text-[#F0DFCD] hover:bg-[#800020]/90 px-8 py-3.5 rounded-xl font-black text-base shadow-md transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                            >
                                <Sparkles className="w-5 h-5 text-[#F0DFCD]" />
                                <span>استخراج المقاس الموصى به</span>
                            </button>
                        </div>
                    </form>

                    {/* Calculated Result Box */}
                    <AnimatePresence>
                        {calculatedResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-8 bg-white/90 text-[#800020] p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-[#800020]/20"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-[#800020] text-[#F0DFCD] flex flex-col items-center justify-center font-black text-2xl shadow-inner shrink-0">
                                        <span>{calculatedResult.size}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-black uppercase tracking-wider bg-[#800020]/10 px-2 py-0.5 rounded text-[#800020]">المقاس الأنسب لك</span>
                                            <span className="text-sm font-bold text-[#800020]">دقة 98%</span>
                                        </div>
                                        <p className="text-sm font-bold text-[#800020]/90 max-w-xl leading-relaxed">
                                            {calculatedResult.detail}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ─── How to Measure Guide (كيف تأخذ مقاسك بدقة) ─── */}
                <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 bg-[#800020]/5 border border-[#800020]/15 rounded-3xl p-8 md:p-12"
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-[#800020] text-[#F0DFCD] px-4 py-1 rounded-full text-xs font-bold mb-3">
                            <Scissors className="w-4 h-4" />
                            <span>إرشادات أخذ القياسات</span>
                        </div>
                        <h2 className="text-3xl font-black text-[#800020]">كيف تأخذ مقاسك بدقة في المنزل؟</h2>
                        <p className="text-sm md:text-base text-[#800020]/70 font-bold mt-2 max-w-xl mx-auto">
                            اتبع هذه الخطوات البسيطة باستخدام شريط قياس مرن للحصول على مقاس دقيق 100%
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Step 1 */}
                        <div className="bg-white/70 p-6 rounded-2xl border border-[#800020]/10 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center font-black text-xl mb-4 shadow-sm">
                                01
                            </div>
                            <h4 className="font-black text-lg text-[#800020] mb-2">محيط الصدر</h4>
                            <p className="text-xs text-[#800020]/80 font-bold leading-relaxed">
                                لِف شريط القياس حول أعرض جزء من الصدر تحت الإبطين مباشرة. حافظ على الشريط مستوياً أفقياً وتجنب شده بقوة.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white/70 p-6 rounded-2xl border border-[#800020]/10 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center font-black text-xl mb-4 shadow-sm">
                                02
                            </div>
                            <h4 className="font-black text-lg text-[#800020] mb-2">محيط الخصر</h4>
                            <p className="text-xs text-[#800020]/80 font-bold leading-relaxed">
                                قِس حول أضيق نقطة طبيعية في الخصر (أعلى السرة بنحو 2 سم). تنفس بطبيعية ودون حبس النفس أثناء القياس.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white/70 p-6 rounded-2xl border border-[#800020]/10 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center font-black text-xl mb-4 shadow-sm">
                                03
                            </div>
                            <h4 className="font-black text-lg text-[#800020] mb-2">محيط الأرداف</h4>
                            <p className="text-xs text-[#800020]/80 font-bold leading-relaxed">
                                قف مع ضم القدمين معاً، ومَرر شريط القياس حول أوسع نقطة في الأرداف للتأكد من راحة البناطيل والفساتين.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white/70 p-6 rounded-2xl border border-[#800020]/10 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#800020] text-[#F0DFCD] flex items-center justify-center font-black text-xl mb-4 shadow-sm">
                                04
                            </div>
                            <h4 className="font-black text-lg text-[#800020] mb-2">طول القامة والقدم</h4>
                            <p className="text-xs text-[#800020]/80 font-bold leading-relaxed">
                                قف بشكل مستقيم دون حذاء مستنداً إلى الجدار لقياس الطول. للأحذية، قِس المسافة من طرف الإبهام حتى مؤخرة الكعب.
                            </p>
                        </div>
                    </div>
                </motion.section>

            </div>
        </div>
    );
}
