import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPass, setShowPass] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const cleanEmail = form.email.trim();
        const cleanPassword = form.password;
        const cleanName = form.name.trim();

        // 1. Email validation (max 60, valid email format)
        if (!cleanEmail) {
            setError('يرجى إدخال البريد الإلكتروني');
            return;
        }
        if (cleanEmail.length > 60) {
            setError('البريد الإلكتروني يجب ألا يتجاوز 60 خانة');
            return;
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(cleanEmail)) {
            setError('يرجى إدخال بريد إلكتروني صالح (مثال: name@domain.com)');
            return;
        }

        // 2. Password validation (max 60, standard ascii printable password characters only, no decoration/arabic/emojis)
        if (!cleanPassword) {
            setError('يرجى إدخال كلمة المرور');
            return;
        }
        if (cleanPassword.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 خانات على الأقل');
            return;
        }
        if (cleanPassword.length > 60) {
            setError('كلمة المرور يجب ألا تتجاوز 60 خانة');
            return;
        }
        const standardPasswordRegex = /^[\x20-\x7E]{6,60}$/;
        if (!standardPasswordRegex.test(cleanPassword)) {
            setError('كلمة المرور يجب أن تحتوي فقط على أحرف إنجليزية وأرقام ورموز قياسية وبدون زخرفة');
            return;
        }

        // 3. Name validation for signup (max 60, Arabic, English, digits, spaces only)
        if (!isLogin) {
            if (!cleanName) {
                setError('يرجى إدخال الاسم الكامل');
                return;
            }
            if (cleanName.length > 60) {
                setError('الاسم الكامل يجب ألا يتجاوز 60 حرفاً');
                return;
            }
            const nameRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\u0660-\u0669\s]{2,60}$/;
            if (!nameRegex.test(cleanName)) {
                setError('الاسم يجب أن يحتوي فقط على أحرف عربية أو إنجليزية وأرقام ومسافات وبدون رموز أو زخرفة (بحد أقصى 60 حرفاً)');
                return;
            }
        }

        setLoading(true);

        try {
            if (isLogin) {
                const { error: authError } = await signIn(cleanEmail, cleanPassword);
                if (authError) {
                    if (authError.message.includes('Invalid login')) {
                        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
                    } else {
                        setError(authError.message);
                    }
                    return;
                }
            } else {
                const { error: authError } = await signUp(cleanEmail, cleanPassword, cleanName);
                if (authError) {
                    if (authError.message.includes('already registered')) {
                        setError('هذا البريد مسجل مسبقاً، يرجى تسجيل الدخول');
                    } else if (authError.message.includes('Password should be')) {
                        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
                    } else if (authError.message.includes('rate limit')) {
                        setError('تم تجاوز الحد المسموح به مؤقتاً، يرجى المحاولة بعد قليل');
                    } else if (authError.message.includes('invalid') || authError.message.includes('valid email')) {
                        setError('يرجى إدخال بريد إلكتروني صحيح');
                    } else {
                        setError(authError.message);
                    }
                    return;
                }
            }
            const searchParams = new URLSearchParams(location.search);
            const redirectUrl = searchParams.get('redirect') || '/';
            navigate(redirectUrl);
        } catch (err) {
            setError('حدث خطأ غير متوقع، حاول مرة أخرى');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#F0DFCD] flex" dir="rtl">
            {/* Left: Decorative Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#800020] relative overflow-hidden flex-col items-center justify-center p-16">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, #F0DFCD 0px, #F0DFCD 1px, transparent 1px, transparent 80px)' }} />
                <div className="absolute top-0 left-0 w-full h-full"
                    style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(240,223,205,0.08) 0%, transparent 60%)' }} />

                <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} transition={{duration:0.8, delay:0.2}}
                    className="relative z-10 text-center flex flex-col items-center gap-8">
                    <h1 className="text-8xl font-black text-[#F0DFCD] tracking-tighter">ثياب</h1>
                    <p className="text-[#F0DFCD]/70 text-xl leading-relaxed max-w-xs text-center">
                        أناقتك هويتك — اكتشف تشكيلات حصرية لا تُضاهى
                    </p>
                    <img src="/images/hero_model_transparent_v2.png" alt="مودل"
                        className="h-[50vh] object-contain drop-shadow-2xl" />
                </motion.div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16">
                <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration:0.5}}
                    className="w-full max-w-md">

                    <Link to="/" className="inline-flex items-center gap-2 text-[#800020]/60 hover:text-[#800020] transition mb-10 font-bold text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        العودة للرئيسية
                    </Link>

                    <h2 className="text-4xl font-black text-[#800020] mb-2">
                        {isLogin ? 'أهلاً بعودتك' : 'إنشاء حساب'}
                    </h2>
                    <p className="text-[#800020]/60 mb-10">
                        {isLogin ? 'سجّل دخولك للمتابعة' : 'انضم إلى عائلة ثياب اليوم'}
                    </p>

                    {/* Error message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm mb-6 text-sm font-medium"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Toggle */}
                    <div className="flex rounded-sm mb-8 border border-[#800020]/20">
                        {['تسجيل الدخول', 'إنشاء حساب'].map((t, idx) => (
                            <button key={t} onClick={() => { setIsLogin(idx === 0); setError(''); }}
                                className={`flex-1 py-2.5 text-sm font-bold transition-all duration-300 ${
                                    isLogin === (idx === 0)
                                        ? 'bg-[#800020] text-[#F0DFCD]'
                                        : 'text-[#800020]/70 hover:text-[#800020] bg-transparent'
                                }`}>
                                {t}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {!isLogin && (
                            <motion.div key="name" initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} transition={{duration:0.3}}>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-[#800020] font-bold text-sm">الاسم الكامل</label>
                                    <span className="text-[11px] text-[#800020]/50 font-mono">
                                        {form.name.length}/60
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="محمد عبدالله"
                                    maxLength={60}
                                    value={form.name}
                                    onChange={e => {
                                        const filtered = e.target.value
                                            .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\u0660-\u0669\s]/g, '')
                                            .slice(0, 60);
                                        setForm(f => ({...f, name: filtered}));
                                    }}
                                    className="w-full bg-[#800020]/5 border border-[#800020]/20 rounded-sm px-4 py-3.5 text-[#800020] placeholder-[#800020]/40 focus:outline-none focus:border-[#800020] focus:bg-[#800020]/10 transition font-medium"
                                />
                            </motion.div>
                        )}

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[#800020] font-bold text-sm">البريد الإلكتروني</label>
                                <span className="text-[11px] text-[#800020]/50 font-mono">
                                    {form.email.length}/60
                                </span>
                            </div>
                            <input
                                type="email"
                                placeholder="example@email.com"
                                maxLength={60}
                                value={form.email}
                                onChange={e => {
                                    const filtered = e.target.value.replace(/\s/g, '').slice(0, 60);
                                    setForm(f => ({...f, email: filtered}));
                                }}
                                className="w-full bg-[#800020]/5 border border-[#800020]/20 rounded-sm px-4 py-3.5 text-[#800020] placeholder-[#800020]/40 focus:outline-none focus:border-[#800020] focus:bg-[#800020]/10 transition font-medium"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[#800020] font-bold text-sm">كلمة المرور</label>
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] text-[#800020]/50 font-mono">
                                        {form.password.length}/60
                                    </span>
                                    {isLogin && (
                                        <a href="#" className="text-[#800020]/60 hover:text-[#800020] text-sm font-medium transition">
                                            نسيت كلمة المرور؟
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    maxLength={60}
                                    value={form.password}
                                    onChange={e => {
                                        const filtered = e.target.value.replace(/[^\x20-\x7E]/g, '').slice(0, 60);
                                        setForm(f => ({...f, password: filtered}));
                                    }}
                                    className="w-full bg-[#800020]/5 border border-[#800020]/20 rounded-sm px-4 py-3.5 text-[#800020] placeholder-[#800020]/40 focus:outline-none focus:border-[#800020] focus:bg-[#800020]/10 transition font-medium pl-12"
                                    required
                                    minLength={6}
                                />
                                <button type="button" onClick={() => setShowPass(s => !s)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#800020]/40 hover:text-[#800020] transition">
                                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full bg-[#800020] text-[#F0DFCD] font-black py-4 rounded-sm hover:bg-[#600018] transition-all duration-300 text-lg mt-2 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>جاري المعالجة...</span>
                                </>
                            ) : (
                                isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'
                            )}
                        </button>
                    </form>


                </motion.div>
            </div>
        </div>
    );
}
