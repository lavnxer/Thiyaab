import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-full bg-[#800020] text-white pt-[clamp(2rem,6vw,5rem)] pb-[clamp(1.5rem,4vw,3rem)] px-3 min-[390px]:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative overflow-hidden mt-12 sm:mt-16 border-t border-[#800020]/20"
            style={{ boxShadow: '-4px 0 0 0 #800020, 4px 0 0 0 #800020' }}
            dir="rtl"
        >
            {/* Main Columns Grid: Identical 4-column single-row layout across Phones, iPad, and Laptop */}
            <div className="w-full max-w-[1800px] mx-auto grid grid-cols-[1.35fr_0.85fr_1.2fr_0.9fr] sm:grid-cols-[1.35fr_0.9fr_1.25fr_0.95fr] md:grid-cols-4 lg:grid-cols-4 gap-2 min-[360px]:gap-2.5 min-[390px]:gap-3 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 items-start leading-normal sm:leading-loose">
                
                {/* 1. Brand Info */}
                <div className="col-span-1 min-w-0">
                    <Link to="/" className="inline-block group">
                        <h2 className="text-[clamp(0.95rem,2.5vw,2.25rem)] font-black mb-1 sm:mb-2 md:mb-3 text-white tracking-tight group-hover:opacity-90 transition-opacity">
                            ثياب
                        </h2>
                    </Link>
                    <p className="text-white/90 leading-tight sm:leading-relaxed mb-2 sm:mb-4 md:mb-6 font-medium text-[7.5px] min-[360px]:text-[8px] min-[390px]:text-[8.5px] sm:text-xs md:text-sm">
                        علامة تجارية رائدة في صناعة الأزياء الراقية للرجال. نبتكر تصاميم عصرية بجودة عالية لتناسب أسلوب حياتك.
                    </p>
                    <div className="flex gap-1.5 min-[390px]:gap-2 sm:gap-3 md:gap-4 items-center">
                        <a 
                            href="https://twitter.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            aria-label="Twitter" 
                            className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white/10 hover:bg-[#F0DFCD] hover:text-[#800020] flex items-center justify-center text-white transition-all duration-300 shrink-0"
                        >
                            <svg className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                            </svg>
                        </a>
                        <a 
                            href="https://instagram.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            aria-label="Instagram" 
                            className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white/10 hover:bg-[#F0DFCD] hover:text-[#800020] flex items-center justify-center text-white transition-all duration-300 shrink-0"
                        >
                            <svg className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* 2. Services */}
                <div className="col-span-1 min-w-0">
                    <h3 className="font-bold text-[8.5px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-sm md:text-base lg:text-lg mb-1.5 sm:mb-2 md:mb-4 text-white">الخدمات</h3>
                    <ul className="flex flex-col gap-1 sm:gap-2 md:gap-3 text-[7.5px] min-[360px]:text-[8px] min-[390px]:text-[8.5px] sm:text-xs md:text-sm leading-tight sm:leading-normal">
                        <li>
                            <Link to="/men" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">ملابس رجالية</Link>
                        </li>
                        <li>
                            <Link to="/women" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">نسائية</Link>
                        </li>
                        <li>
                            <Link to="/accessories" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">اكسسوارات</Link>
                        </li>
                    </ul>
                </div>

                {/* 3. Legal */}
                <div className="col-span-1 min-w-0">
                    <Link to="/legal" className="block mb-1.5 sm:mb-2 md:mb-4 group">
                        <h3 className="font-bold text-[8.5px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-sm md:text-base lg:text-lg text-white group-hover:text-[#F0DFCD] transition-colors leading-tight">
                            الشؤون القانونية
                        </h3>
                    </Link>
                    <ul className="flex flex-col gap-1 sm:gap-2 md:gap-3 text-[7.5px] min-[360px]:text-[8px] min-[390px]:text-[8.5px] sm:text-xs md:text-sm leading-tight sm:leading-normal">
                        <li>
                            <Link to="/legal?section=terms" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">الشروط</Link>
                        </li>
                        <li>
                            <Link to="/legal?section=conditions" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">الأحكام</Link>
                        </li>
                        <li>
                            <Link to="/legal?section=privacy" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">السياسة</Link>
                        </li>
                    </ul>
                </div>

                {/* 4. Contact */}
                <div className="col-span-1 min-w-0">
                    <h3 className="font-bold text-[8.5px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-sm md:text-base lg:text-lg mb-1.5 sm:mb-2 md:mb-4 text-white">اتصل بنا</h3>
                    <ul className="flex flex-col gap-1 sm:gap-2 md:gap-3 text-[7.5px] min-[360px]:text-[8px] min-[390px]:text-[8.5px] sm:text-xs md:text-sm leading-tight sm:leading-normal">
                        <li>
                            <a href="mailto:SilvxerBusiness@gmail.com" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">
                                البريد الإلكتروني
                            </a>
                        </li>
                        <li>
                            <a href="tel:920000000" className="text-white hover:text-[#F0DFCD] transition-colors duration-200">
                                الهاتف
                            </a>
                        </li>
                    </ul>
                </div>

            </div>

            {/* Bottom Copyright: Single row across all screen sizes (Phones, iPad, Laptop) */}
            <div className="w-full max-w-[1800px] mx-auto mt-6 sm:mt-10 md:mt-14 lg:mt-16 pt-4 sm:pt-6 md:pt-8 border-t border-white/10 flex flex-row items-center justify-between text-[7px] min-[360px]:text-[8px] min-[390px]:text-[8.5px] sm:text-xs md:text-sm text-white/70 gap-2 sm:gap-4">
                <p className="truncate">© {new Date().getFullYear()} ثياب (Thyiaab). جميع الحقوق محفوظة.</p>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <span>صُنِع بشغف وإتقان في المملكة العربية السعودية</span>
                </div>
            </div>
        </motion.footer>
    );
}
