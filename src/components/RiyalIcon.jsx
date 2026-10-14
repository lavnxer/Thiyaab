import React from 'react';

/**
 * RiyalIcon: Smart Saudi Riyal Symbol component.
 * Uses /Saudi_Riyal_Symbol.png and dynamically scales with the font-size of adjacent price text using `em` units.
 * Inherits the parent text color automatically via `currentColor`.
 */
const RiyalIcon = ({ className = "", style = {}, size = "0.95em" }) => {
    return (
        <span 
            className={`inline-block shrink-0 mx-0.5 select-none ${className}`} 
            style={{
                width: size,
                height: `calc(${size} * 1.12)`,
                backgroundColor: 'currentColor',
                WebkitMaskImage: 'url(/Saudi_Riyal_Symbol.png)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/Saudi_Riyal_Symbol.png)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                verticalAlign: '-0.12em',
                ...style
            }} 
            aria-label="ريال سعودي"
        >
            {/* SEO and fallback */}
            <img 
                src="/Saudi_Riyal_Symbol.png" 
                alt="ر.س" 
                className="w-full h-full object-contain opacity-0 pointer-events-none" 
            />
        </span>
    );
};

export default RiyalIcon;
