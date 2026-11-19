import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const COLOR_MAP = {
    'أسود': '#000000',
    'رمادي': '#6b7280',
    'رمادي غامق': '#4b5563',
    'بيج': '#e5e0d8',
    'كحلي': '#1e3a8a',
    'عنابي': '#800020',
    'أبيض': '#ffffff',
    'بني': '#78350f',
    'زيتي': '#3f4f2e',
};

export default function CustomDropdown({
    value,
    onChange,
    options = [],
    placeholder = 'اختر...',
    className = '',
    triggerClassName = '',
    menuClassName = '',
    align = 'right',
    maxHeight = 'max-h-60',
    disabled = false,
    renderTrigger,
    usePortal = false,
    direction = 'auto', // 'auto' | 'down' | 'up'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const [coords, setCoords] = useState(null);
    const containerRef = useRef(null);
    const menuRef = useRef(null);

    // Normalize options into { value, label, colorHex }
    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'string' || typeof opt === 'number') {
            const strVal = String(opt);
            return {
                value: opt,
                label: strVal,
                colorHex: COLOR_MAP[strVal] || null
            };
        }
        return {
            ...opt,
            colorHex: opt.colorHex || COLOR_MAP[opt.label] || COLOR_MAP[opt.value] || null
        };
    });

    const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;
    const selectedColor = selectedOption?.colorHex;

    const updateCoords = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        let isUp = false;
        if (direction === 'up') {
            isUp = true;
        } else if (direction === 'down') {
            isUp = false;
        } else {
            isUp = spaceBelow < 220 && spaceAbove > spaceBelow;
        }

        setOpenUpwards(isUp);

        if (usePortal) {
            let leftVal = undefined;
            let rightVal = undefined;

            if (align === 'center') {
                const triggerCenter = rect.left + rect.width / 2;
                const estHalfWidth = (menuRef.current?.offsetWidth || 190) / 2;
                leftVal = Math.max(8 + estHalfWidth, Math.min(window.innerWidth - 8 - estHalfWidth, triggerCenter));
            } else if (align === 'left') {
                leftVal = Math.max(8, rect.left);
            } else {
                rightVal = Math.max(8, window.innerWidth - rect.right);
            }

            setCoords({
                top: isUp ? undefined : rect.bottom + 6,
                bottom: isUp ? (window.innerHeight - rect.top + 6) : undefined,
                left: leftVal,
                right: rightVal,
                minWidth: rect.width,
                maxHeight: Math.max(140, Math.min(280, isUp ? (spaceAbove - 16) : (spaceBelow - 16)))
            });
        }
    };

    const toggleDropdown = (e) => {
        if (disabled) return;
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
        if (!isOpen) {
            updateCoords();
        }
        setIsOpen(prev => !prev);
    };

    useEffect(() => {
        if (!isOpen) return;

        updateCoords();

        const handleScrollOrResize = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) {
                setIsOpen(false);
                return;
            }
            updateCoords();
        };

        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [isOpen, direction, usePortal, align]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current && !containerRef.current.contains(e.target) &&
                (!menuRef.current || !menuRef.current.contains(e.target))
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    const isCenter = align === 'center';

    const menuContent = (
        <AnimatePresence>
            {isOpen && (!usePortal || coords) && (
                <motion.div
                    ref={menuRef}
                    initial={{
                        opacity: 0,
                        y: openUpwards ? 6 : -6,
                        scale: 0.98,
                        x: isCenter ? '-50%' : 0
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        x: isCenter ? '-50%' : 0
                    }}
                    exit={{
                        opacity: 0,
                        y: openUpwards ? 6 : -6,
                        scale: 0.98,
                        x: isCenter ? '-50%' : 0
                    }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className={`${
                        usePortal
                            ? 'fixed z-[99999]'
                            : `absolute ${openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} ${
                                isCenter ? 'left-1/2' : align === 'left' ? 'left-0' : 'right-0'
                            } z-50 min-w-full`
                    } bg-[#F0DFCD] border border-[#800020]/20 rounded-2xl shadow-2xl py-2 ${maxHeight} overflow-y-auto select-none ${menuClassName || 'w-max max-w-[280px]'}`}
                    style={{
                        ...(usePortal && coords ? {
                            top: coords.top,
                            bottom: coords.bottom,
                            left: coords.left,
                            right: coords.right,
                            minWidth: coords.minWidth,
                            maxHeight: coords.maxHeight ? `${coords.maxHeight}px` : undefined,
                        } : {}),
                        boxShadow: '0 20px 40px -15px rgba(128, 0, 32, 0.25), 0 0 15px 0 rgba(128, 0, 32, 0.08)'
                    }}
                >
                    {normalizedOptions.map((opt) => {
                        const isSelected = String(opt.value) === String(value);
                        const optColor = opt.colorHex;

                        return (
                            <div
                                key={String(opt.value)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange?.(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-2 hover:bg-[#800020]/10 cursor-pointer text-xs sm:text-sm font-bold flex items-center justify-between gap-3 transition-colors text-[#800020] ${
                                    isSelected ? 'bg-[#800020]/15 font-black' : ''
                                }`}
                            >
                                <div className="flex items-center gap-2.5 whitespace-nowrap">
                                    {optColor && (
                                        <div
                                            className="w-3.5 h-3.5 rounded-full border border-[#800020]/20 shrink-0"
                                            style={{ backgroundColor: optColor }}
                                        />
                                    )}
                                    <span className="whitespace-nowrap">{opt.label}</span>
                                </div>
                                {isSelected && !optColor && (
                                    <Check className="w-3.5 h-3.5 text-[#800020] shrink-0" strokeWidth={2.5} />
                                )}
                            </div>
                        );
                    })}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div ref={containerRef} className={`relative ${className || (renderTrigger ? 'inline-block' : 'w-full')}`}>
            {/* Trigger Button or Custom Render Trigger */}
            {renderTrigger ? (
                <div
                    onClick={toggleDropdown}
                    className="cursor-pointer select-none"
                >
                    {renderTrigger({ isOpen, selectedOption, displayLabel, selectedColor })}
                </div>
            ) : (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={toggleDropdown}
                    className={`w-full min-h-[38px] px-3.5 py-2.5 bg-white/25 hover:bg-white/40 border border-[#800020]/25 hover:border-[#800020]/50 text-[#800020] rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer outline-none focus:border-[#800020] shadow-xs select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${triggerClassName}`}
                >
                    <div className="flex items-center gap-2.5 truncate">
                        {selectedColor && (
                            <span
                                className="w-3.5 h-3.5 rounded-full border border-[#800020]/20 shrink-0"
                                style={{ backgroundColor: selectedColor }}
                            />
                        )}
                        <span className={`text-xs sm:text-sm font-bold truncate ${selectedOption ? 'text-[#800020]' : 'text-[#800020]/50'}`}>
                            {displayLabel}
                        </span>
                    </div>
                    <ChevronDown
                        className={`w-3.5 h-3.5 text-[#800020]/75 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        strokeWidth={2.5}
                    />
                </button>
            )}

            {/* Dropdown Menu Popup (Portal or Local) */}
            {usePortal && typeof document !== 'undefined'
                ? createPortal(menuContent, document.body)
                : menuContent}
        </div>
    );
}
