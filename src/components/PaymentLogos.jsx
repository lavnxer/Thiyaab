import React from 'react';
import { CreditCard } from 'lucide-react';

/**
 * Authentic Saudi Mada Vector Logo
 */
export const MadaBadge = ({ className = "h-5 w-auto" }) => (
    <svg className={className} viewBox="0 0 88 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(1, 1)">
            {/* Top Blue Ribbon */}
            <path
                d="M5.5 17.5C2.8 15.5 1 12.3 1 8.8C1 3.9 5 0 9.8 0C13.2 0 16.1 1.9 17.6 4.7C16.4 5.6 15.5 6.9 14.9 8.3C13.8 6.6 11.9 5.4 9.8 5.4C7.9 5.4 6.4 6.9 6.4 8.8C6.4 10.1 7.1 11.3 8.2 12L5.5 17.5Z"
                fill="#005B94"
            />
            {/* Bottom Green Ribbon */}
            <path
                d="M15.1 6.5C17.8 8.5 19.6 11.7 19.6 15.2C19.6 20.1 15.6 24 10.8 24C7.4 24 4.5 22.1 3 19.3C4.2 18.4 5.1 17.1 5.7 15.7C6.8 17.4 8.7 18.6 10.8 18.6C12.7 18.6 14.2 17.1 14.2 15.2C14.2 13.9 13.5 12.7 12.4 12L15.1 6.5Z"
                fill="#00A651"
            />
        </g>
        {/* mada logotype */}
        <text x="26" y="17.5" fill="#005B94" fontSize="13" fontWeight="900" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" letterSpacing="-0.3">mada</text>
        {/* مدى arabic logotype */}
        <text x="64" y="17" fill="#00A651" fontSize="12" fontWeight="bold" fontFamily="sans-serif">مدى</text>
    </svg>
);

/**
 * Authentic Visa Vector Logo
 */
export const VisaBadge = ({ className = "h-4 w-auto" }) => (
    <svg className={className} viewBox="0 0 52 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.7 16.5H16.8L18.6 0.8H21.5L19.7 16.5Z" fill="#1A1F71" />
        <path d="M30.3 1.1C29.7 0.9 28.7 0.6 27.5 0.6C24.2 0.6 21.9 2.2 21.9 4.8C21.9 6.5 23.5 7.5 24.8 8.1C26 8.7 26.5 9.1 26.5 9.7C26.5 10.6 25.4 11 24.4 11C23.1 11 22.3 10.8 21.3 10.3L20.8 10.1L20.4 13C21.3 13.4 22.8 13.7 24.3 13.7C27.8 13.7 30.1 12 30.1 9.4C30.1 7.9 29.1 6.7 27.1 5.8C25.9 5.2 25.1 4.7 25.1 4.2C25.1 3.5 25.8 3 27.3 3C28.3 3 29.2 3.2 29.9 3.5L30.2 3.6L30.3 1.1Z" fill="#1A1F71" />
        <path d="M35.2 10.7C35.5 9.8 36.5 7 36.5 7C36.5 7 36.7 6.4 36.9 5.9L37.1 6.8C37.1 6.8 37.8 10.5 38 11.2H35.2ZM40.3 0.8H37.7C36.9 0.8 36.3 1.1 35.9 1.9L30.2 16.5H33.7L34.4 14.6H38.9L39.4 16.5H42.4L40.3 0.8Z" fill="#1A1F71" />
        <path d="M13.8 0.8L11 11.8L10.7 10.2C10.1 8 8.2 5.7 6.1 4.5L9 16.5H12.5L17.7 0.8H13.8Z" fill="#1A1F71" />
        <path d="M8.4 0.8H2.7L2.6 1C6.3 2.1 9.4 4.6 10.4 7.7L9.4 2.7C9.2 1.5 8.6 0.8 8.4 0.8Z" fill="#F7B600" />
    </svg>
);

/**
 * Authentic Mastercard Interlocking Circles Logo
 */
export const MastercardBadge = ({ className = "h-5 w-auto" }) => (
    <svg className={className} viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="13" cy="12" r="11" fill="#EB001B" />
        <circle cx="25" cy="12" r="11" fill="#F79E1B" fillOpacity="0.95" />
        <path d="M19 4.4C21.6 6.4 23.3 9.5 23.3 12C23.3 14.5 21.6 17.6 19 19.6C16.4 17.6 14.7 14.5 14.7 12C14.7 9.5 16.4 6.4 19 4.4Z" fill="#FF5F00" />
    </svg>
);

/**
 * Authentic American Express Logo
 */
export const AmexBadge = ({ className = "h-5 w-auto" }) => (
    <svg className={className} viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="38" height="24" rx="3.5" fill="#1C3F60" />
        <text x="50%" y="54%" dominantBaseline="central" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.8">AMEX</text>
    </svg>
);

/**
 * Photorealistic Precision Metallic EMV Chip
 */
export const RealisticEmvChip = ({ className = "w-8.5 h-6" }) => (
    <div className={`${className} relative rounded-md overflow-hidden p-px shrink-0 shadow-xs border border-[#C59B27]/60 bg-gradient-to-br from-[#FFE79A] via-[#D4AF37] to-[#996515]`}>
        <div className="w-full h-full rounded-[3px] bg-gradient-to-tr from-[#D4AF37] via-[#FFF3B0] to-[#AA771C] p-0.5 relative">
            <svg className="w-full h-full" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="31" height="21" rx="2" stroke="#664606" strokeWidth="0.5" strokeOpacity="0.4" fill="none" />
                {/* Circuit Isolation Lines */}
                <line x1="0" y1="7.5" x2="10" y2="7.5" stroke="#5E4106" strokeWidth="0.75" />
                <line x1="22" y1="7.5" x2="32" y2="7.5" stroke="#5E4106" strokeWidth="0.75" />
                <line x1="0" y1="14.5" x2="10" y2="14.5" stroke="#5E4106" strokeWidth="0.75" />
                <line x1="22" y1="14.5" x2="32" y2="14.5" stroke="#5E4106" strokeWidth="0.75" />
                <line x1="10" y1="0" x2="10" y2="22" stroke="#5E4106" strokeWidth="0.75" />
                <line x1="22" y1="0" x2="22" y2="22" stroke="#5E4106" strokeWidth="0.75" />
                {/* Center Core Microchip */}
                <rect x="10" y="7.5" width="12" height="7" rx="1.5" fill="#FFE27A" stroke="#5E4106" strokeWidth="0.75" />
                <circle cx="16" cy="11" r="1.5" fill="#B38728" fillOpacity="0.6" />
            </svg>
        </div>
    </div>
);

/**
 * Contactless NFC Payment Waves
 */
export const ContactlessWaves = ({ className = "w-4 h-4 text-white/80" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M8.5 16.5a5 5 0 0 1 0-9" />
        <path d="M12 19.5a8.5 8.5 0 0 1 0-15" />
        <path d="M15.5 22.5a12 12 0 0 1 0-21" />
    </svg>
);

/**
 * Crisp White Card Emblem Container
 */
export const CardBrandBadge = ({ brand = 'default', className = "h-8 px-2.5" }) => {
    const b = (brand || '').toLowerCase();
    return (
        <div className={`${className} rounded-lg bg-white shadow-xs border border-white/70 flex items-center justify-center shrink-0`}>
            {b.includes('mada') && <MadaBadge className="h-4.5 sm:h-5 w-auto" />}
            {b.includes('visa') && <VisaBadge className="h-3.5 sm:h-4 w-auto" />}
            {b.includes('master') && <MastercardBadge className="h-4.5 sm:h-5 w-auto" />}
            {b.includes('amex') && <AmexBadge className="h-4 sm:h-4.5 w-auto" />}
            {!b.includes('mada') && !b.includes('visa') && !b.includes('master') && !b.includes('amex') && (
                <CreditCard className="w-4 h-4 text-[#800020]" />
            )}
        </div>
    );
};
