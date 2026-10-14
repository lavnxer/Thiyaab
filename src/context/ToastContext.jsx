import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, Sparkles } from 'lucide-react';

const ToastContext = createContext({
    showToast: (msg, type) => {}
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null); // { id, message, type }
    const timerRef = useRef(null);

    const showToast = useCallback((message, type = 'info') => {
        if (!message) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        const id = Date.now();
        setToast({ id, message, type });
        timerRef.current = setTimeout(() => {
            setToast((curr) => (curr?.id === id ? null : curr));
        }, 3500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-7 inset-x-0 z-[99999] pointer-events-none flex justify-center items-center px-4" dir="rtl">
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 35, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 25, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
                            className="pointer-events-auto cursor-pointer"
                            onClick={() => setToast(null)}
                        >
                            <div className="bg-[#800020] text-[#F0DFCD] px-6 py-3.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(240,223,205,0.2)] flex items-center gap-3 backdrop-blur-md max-w-[92vw] sm:max-w-md select-none">
                                <div className="w-6 h-6 rounded-full bg-[#F0DFCD]/20 flex items-center justify-center shrink-0">
                                    {toast.type === 'error' ? (
                                        <AlertCircle className="w-4 h-4 text-[#F0DFCD]" />
                                    ) : toast.type === 'sparkle' ? (
                                        <Sparkles className="w-4 h-4 text-[#F0DFCD]" />
                                    ) : (
                                        <Check className="w-4 h-4 text-[#F0DFCD]" />
                                    )}
                                </div>
                                <span className="font-bold text-sm tracking-wide leading-snug text-right">
                                    {toast.message}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export default ToastContext;
