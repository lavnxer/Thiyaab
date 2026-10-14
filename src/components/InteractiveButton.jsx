import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function InteractiveButton({
    children,
    className = '',
    onClick,
    href,
    to,
    variant = 'hero', // 'hero' | 'outline-to-burgundy'
    inverse = false,
    glow = false,
    icon,
    iconPosition,
    rounded = 'rounded-sm',
    padding = 'px-6 py-3',
    border = '',
    bg = '',
    title,
    type = 'button',
}) {
    const Tag = to ? Link : href ? 'a' : 'button';
    const tagProps = to ? { to } : href ? { href } : { type };

    const isDefaultIcon = icon === undefined;
    const finalIconPosition = iconPosition || (isDefaultIcon ? 'end' : 'start');

    const renderIcon = () => {
        if (icon === null) return null;
        if (icon) return icon;
        return (
            <ArrowUpRight className="w-5 h-5 transition-transform duration-[800ms] ease-in-out group-hover:rotate-45" />
        );
    };

    if (variant === 'outline-to-burgundy') {
        const finalBorder = border || 'border border-[#800020]/25';
        const finalBg = bg || (className.includes('bg-') ? '' : 'bg-white/25 backdrop-blur-xs');

        return (
            <Tag
                {...tagProps}
                onClick={onClick}
                className={`relative inline-flex items-center justify-center overflow-hidden ${rounded} ${finalBorder} ${finalBg} group cursor-pointer transition-all duration-300 ${className}`}
            >
                <div className={`relative flex items-center justify-center ${padding} w-full h-full`}>
                    {/* 1. Base State: Burgundy Text & Icon on background matching surroundings */}
                    <div className="flex items-center justify-center gap-2 text-[#800020] transition-opacity duration-300 group-hover:opacity-0 z-0">
                        {finalIconPosition === 'start' && renderIcon()}
                        {children && <span className="font-bold">{children}</span>}
                        {finalIconPosition === 'end' && renderIcon()}
                    </div>

                    {/* 2. Sliding Burgundy Sheet: sweeps across at skew to fill button with solid burgundy */}
                    <span className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                        <span className="absolute -inset-x-8 -inset-y-4 bg-[#800020] -translate-x-[140%] skew-x-[35deg] transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
                    </span>

                    {/* 3. Hover State: Cream Text & Icon on Burgundy background */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-[#F0DFCD] z-20 pointer-events-none transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100">
                        {finalIconPosition === 'start' && renderIcon()}
                        {children && <span className="font-bold">{children}</span>}
                        {finalIconPosition === 'end' && renderIcon()}
                    </div>
                </div>
            </Tag>
        );
    }

    // Default 'hero' variant
    const baseBg = inverse ? 'bg-[#800020]' : 'bg-[#F0DFCD]';
    const revealedText = inverse 
        ? (glow ? 'text-[#F0DFCD] group-hover:animate-beige-glow' : 'text-[#F0DFCD]')
        : (glow ? 'text-[#800020] group-hover:animate-beige-glow' : 'text-[#800020]');
    const coverBg = inverse ? 'bg-[#F0DFCD]' : 'bg-[#800020]';
    const coverText = inverse ? 'text-[#800020]' : 'text-[#F0DFCD]';

    const renderHeroContent = (textColor, isSpacer = false) => (
        <div className={`flex items-center justify-center gap-2 ${textColor} ${isSpacer ? 'opacity-0 pointer-events-none' : ''}`}>
            {finalIconPosition === 'start' && renderIcon()}
            {children && <span className="font-bold">{children}</span>}
            {finalIconPosition === 'end' && renderIcon()}
        </div>
    );

    return (
        <Tag
            {...tagProps}
            onClick={onClick}
            className={`relative inline-flex items-center justify-center overflow-hidden ${rounded} ${border} ${baseBg} group cursor-pointer ${className}`}
        >
            <div className={`relative flex items-center justify-center ${padding} w-full h-full`}>
                {/* 1. Revealed Text - Sits underneath, revealed as the cover slides */}
                <div className="absolute inset-0 flex items-center justify-center z-0">
                    {renderHeroContent(revealedText)}
                </div>

                {/* 2. Cover Background - Slides away to the right gradually */}
                <div className={`absolute inset-y-0 -left-[100%] w-[300%] ${coverBg} skew-x-[45deg] transition-transform duration-[800ms] ease-in-out group-hover:translate-x-[100%] z-10 pointer-events-none`}></div>

                {/* 3. Cover Text - Slides away perfectly glued to the Cover */}
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-[800ms] ease-in-out group-hover:translate-x-[300%] z-20 pointer-events-none">
                    {renderHeroContent(coverText)}
                </div>

                {/* 4. Optional luxury sweep shine */}
                {glow && <span className="shine-effect z-30" />}

                {/* Invisible spacer to maintain correct button dimensions */}
                {renderHeroContent('', true)}
            </div>
        </Tag>
    );
}
