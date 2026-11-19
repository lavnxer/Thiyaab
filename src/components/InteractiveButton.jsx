import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function InteractiveButton({
    children,
    className = '',
    onClick,
    href,
    to,
    variant = 'hero', // 'hero' | 'outline-to-burgundy' | 'shine'
    interaction, // 'تغيير نص ولون بزاوية 45' | 'تغيّر في خلفية ذات اللون' | 'لمعة متحركة'
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
    // Resolve interaction aliases
    let resolvedInverse = inverse;
    let resolvedGlow = glow;
    let resolvedVariant = variant;

    if (interaction === 'تغيّر في خلفية ذات اللون') {
        resolvedInverse = true;
        resolvedGlow = true;
    } else if (interaction === 'تغيير نص ولون بزاوية 45') {
        resolvedVariant = 'hero';
    } else if (interaction === 'لمعة متحركة') {
        resolvedVariant = 'shine';
    }
    const Tag = to ? Link : href ? 'a' : 'button';
    const tagProps = to ? { to } : href ? { href } : { type };

    const isDefaultIcon = icon === undefined;
    const finalIconPosition = iconPosition || (isDefaultIcon ? 'end' : 'start');

    const renderIcon = (isHoverState = false) => {
        if (icon === null) return null;
        if (icon) {
            return React.isValidElement(icon)
                ? React.cloneElement(icon, {
                    className: `${icon.props.className || ''} transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:rotate-45 group-hover:-translate-y-0.5 group-hover:translate-x-0.5`
                })
                : icon;
        }
        return (
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:rotate-45 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 shrink-0" />
        );
    };

    const hasCustomPadding = className.includes('py-') || className.includes('p-') || className.includes('px-');
    const finalPadding = hasCustomPadding ? '' : padding;

    if (resolvedVariant === 'outline-to-burgundy') {
        const finalBorder = border || 'border border-[#800020]/25';
        const finalBg = bg || (className.includes('bg-') ? '' : 'bg-white/25 backdrop-blur-xs');

        return (
            <Tag
                {...tagProps}
                onClick={onClick}
                className={`relative inline-flex items-center justify-center overflow-hidden ${rounded} ${finalBorder} ${finalBg} ${finalPadding} group cursor-pointer transition-all duration-300 ${className}`}
            >
                {/* 1. Full-Button Sliding Burgundy Sheet: Covers 100% of button area including padding */}
                <span className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <span className="absolute -inset-x-24 -inset-y-16 bg-[#800020] -translate-x-[160%] skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0" />
                </span>

                {/* 2. Base State: Burgundy Text & Icon */}
                <span className="relative z-10 flex items-center justify-center gap-2 text-[#800020] font-bold w-full h-full whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[150%] group-hover:opacity-0">
                    {finalIconPosition === 'start' && renderIcon(false)}
                    {children && <span>{children}</span>}
                    {finalIconPosition === 'end' && renderIcon(false)}
                </span>

                {/* 3. Hover State: Cream Text & Icon in identical padded layout */}
                <span className={`absolute inset-0 z-20 flex items-center justify-center gap-2 text-[#F0DFCD] font-bold w-full h-full whitespace-nowrap pointer-events-none ${finalPadding} transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100`}>
                    {finalIconPosition === 'start' && renderIcon(true)}
                    {children && <span>{children}</span>}
                    {finalIconPosition === 'end' && renderIcon(true)}
                </span>

                {/* Subtle luxury shine overlay */}
                <span className="shine-effect z-30" />
            </Tag>
        );
    }

    if (resolvedVariant === 'shine') {
        const finalBg = bg || 'bg-[#800020]';
        const finalColor = resolvedInverse ? 'text-[#800020]' : 'text-[#F0DFCD]';
        return (
            <Tag
                {...tagProps}
                onClick={onClick}
                title={title}
                className={`shine-button relative overflow-hidden inline-flex items-center justify-center gap-2 font-bold ${rounded} ${border} ${finalBg} ${finalColor} shadow-md hover:shadow-xl active:scale-95 transition-all duration-300 group cursor-pointer ${finalPadding} ${className}`}
            >
                <span className="shine-effect z-20" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                    {finalIconPosition === 'start' && renderIcon(false)}
                    {children && <span>{children}</span>}
                    {finalIconPosition === 'end' && renderIcon(false)}
                </span>
            </Tag>
        );
    }

    // Default 'hero' / solid interactive variant (تغيير نص ولون بزاوية 45 / تغيّر في خلفية ذات اللون):
    const resolvedBg = bg
        ? bg
        : resolvedInverse
            ? 'bg-[#F0DFCD]'
            : 'bg-[#800020]';

    const sweepBg = resolvedInverse
        ? 'bg-[#800020]'
        : 'bg-[#F0DFCD]';

    const resolvedBaseText = resolvedInverse
        ? 'text-[#800020]'
        : 'text-[#F0DFCD]';

    const resolvedHoverText = resolvedInverse
        ? 'text-[#F0DFCD]'
        : 'text-[#800020]';

    const resolvedShadow = resolvedGlow
        ? (resolvedInverse
            ? 'shadow-[0_0_25px_rgba(240,223,205,0.45)] hover:shadow-[0_0_35px_rgba(240,223,205,0.7)]'
            : 'shadow-[0_0_25px_rgba(128,0,32,0.45)] hover:shadow-[0_0_35px_rgba(128,0,32,0.7)]')
        : 'shadow-md hover:shadow-xl';

    return (
        <Tag
            {...tagProps}
            onClick={onClick}
            title={title}
            className={`relative inline-flex items-center justify-center overflow-hidden ${rounded} ${border} ${resolvedBg} ${resolvedShadow} active:scale-95 transition-all duration-300 group cursor-pointer ${finalPadding} ${className}`}
        >
            {/* 1. Full-Button Sliding Sweep Sheet: Co-extensive with 100% of the button, covering all edges and padding */}
            <span className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <span className={`absolute -inset-x-24 -inset-y-16 ${sweepBg} -translate-x-[160%] skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0`} />
            </span>

            {/* 2. Base Layer: Natural flow, establishes button size */}
            <span className={`relative z-10 flex items-center justify-center gap-2 font-bold w-full h-full whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[150%] group-hover:opacity-0 ${resolvedBaseText}`}>
                {finalIconPosition === 'start' && renderIcon(false)}
                {children && <span>{children}</span>}
                {finalIconPosition === 'end' && renderIcon(false)}
            </span>

            {/* 3. Hover Layer: Exact same padding & alignment, rolls in from bottom */}
            <span className={`absolute inset-0 z-20 flex items-center justify-center gap-2 font-bold w-full h-full whitespace-nowrap pointer-events-none ${finalPadding} transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${resolvedHoverText}`}>
                {finalIconPosition === 'start' && renderIcon(true)}
                {children && <span>{children}</span>}
                {finalIconPosition === 'end' && renderIcon(true)}
            </span>

            {/* Subtle luxury shine overlay */}
            <span className="shine-effect z-30" />
        </Tag>
    );
}
