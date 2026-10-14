import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'thyiaab_image_settings';

export const IMAGE_PRESETS = {
    balanced: {
        name: 'الضبط المتوازن الذكي (موصى به)',
        description: 'توازن مثالي يضمن ظهور الصور بحجم واضح وبارز دون أن تخرج أبداً من إطاراتها.',
        settings: {
            outfitScale: 1.0,
            outfitMaxHeight: 480,
            outfitFit: 'contain',
            bannerOfferScale: 1.0,
            bannerOfferMaxHeight: 250,
            bannerOfferStrictBounds: true,
            cardScale: 1.0,
            cardPadding: 20,
            cardFit: 'contain',
            categoryScale: 1.0,
            categoryMaxHeight: 480,
            detailScale: 1.0,
            detailMaxHeight: 520,
        }
    },
    strict: {
        name: 'حصر تام وآمن داخل الحدود',
        description: 'أقصى درجات الأمان لمنع أي صورة عريضة أو طويلة من تجاوز الإطار نهائياً.',
        settings: {
            outfitScale: 0.9,
            outfitMaxHeight: 430,
            outfitFit: 'contain',
            bannerOfferScale: 0.88,
            bannerOfferMaxHeight: 220,
            bannerOfferStrictBounds: true,
            cardScale: 0.92,
            cardPadding: 26,
            cardFit: 'contain',
            categoryScale: 0.92,
            categoryMaxHeight: 430,
            detailScale: 0.92,
            detailMaxHeight: 460,
        }
    },
    prominent: {
        name: 'عرض بارز ومكبر',
        description: 'تكبير ناعم للصور لإبراز تفاصيل الأقمشة والتطريز مع حماية حواف العناصر.',
        settings: {
            outfitScale: 1.12,
            outfitMaxHeight: 540,
            outfitFit: 'contain',
            bannerOfferScale: 1.15,
            bannerOfferMaxHeight: 280,
            bannerOfferStrictBounds: false,
            cardScale: 1.08,
            cardPadding: 14,
            cardFit: 'contain',
            categoryScale: 1.08,
            categoryMaxHeight: 540,
            detailScale: 1.1,
            detailMaxHeight: 580,
        }
    }
};

const DEFAULT_SETTINGS = {
    ...IMAGE_PRESETS.balanced.settings,
    activePreset: 'balanced'
};

const ImageSettingsContext = createContext(null);

export function ImageSettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...DEFAULT_SETTINGS, ...parsed };
            }
        } catch (e) {
            console.error('Error loading image settings from localStorage:', e);
        }
        return DEFAULT_SETTINGS;
    });

    // Sync CSS Custom Variables on :root for global CSS access
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--thy-outfit-scale', String(settings.outfitScale));
        root.style.setProperty('--thy-outfit-max-h', `${settings.outfitMaxHeight}px`);
        root.style.setProperty('--thy-outfit-fit', settings.outfitFit);
        root.style.setProperty('--thy-banner-scale', String(settings.bannerOfferScale));
        root.style.setProperty('--thy-banner-max-h', `${settings.bannerOfferMaxHeight}px`);
        root.style.setProperty('--thy-card-scale', String(settings.cardScale));
        root.style.setProperty('--thy-card-padding', `${settings.cardPadding}px`);
        root.style.setProperty('--thy-card-fit', settings.cardFit);
        root.style.setProperty('--thy-category-scale', String(settings.categoryScale));
        root.style.setProperty('--thy-category-max-h', `${settings.categoryMaxHeight}px`);
        root.style.setProperty('--thy-detail-scale', String(settings.detailScale));
        root.style.setProperty('--thy-detail-max-h', `${settings.detailMaxHeight}px`);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Error saving image settings to localStorage:', e);
        }
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value,
            activePreset: 'custom'
        }));
    };

    const updateSettings = (partial) => {
        setSettings(prev => ({
            ...prev,
            ...partial,
            activePreset: 'custom'
        }));
    };

    const applyPreset = (presetKey) => {
        if (IMAGE_PRESETS[presetKey]) {
            setSettings({
                ...IMAGE_PRESETS[presetKey].settings,
                activePreset: presetKey
            });
        }
    };

    const resetToDefault = () => {
        applyPreset('balanced');
    };

    return (
        <ImageSettingsContext.Provider value={{
            settings,
            updateSetting,
            updateSettings,
            applyPreset,
            resetToDefault,
            presets: IMAGE_PRESETS
        }}>
            {children}
        </ImageSettingsContext.Provider>
    );
}

export function useImageSettings() {
    const context = useContext(ImageSettingsContext);
    if (!context) {
        throw new Error('useImageSettings must be used within an ImageSettingsProvider');
    }
    return context;
}
