import React from 'react';

export default function InteractiveIconButton({ Icon, className, sweepClassName, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`relative inline-flex items-center justify-center overflow-hidden rounded-sm transition-colors duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] icon-group ${className}`}
        >
            <div className="relative z-10 flex items-center justify-center pointer-events-none transition-colors duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]">
                <div className="relative w-5 h-5 overflow-hidden flex items-center justify-center transition-transform duration-500">
                    <Icon className="w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] icon-group-hover:-translate-y-[150%]" />
                    <Icon className="w-4 h-4 absolute inset-0 translate-y-[150%] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] icon-group-hover:translate-y-0" />
                </div>
            </div>
            
            <div className={`absolute -inset-1 translate-y-[100%] rounded-[50%_50%_0_0] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] icon-group-hover:translate-y-0 icon-group-hover:rounded-none z-0 ${sweepClassName}`}></div>
        </button>
    );
}
