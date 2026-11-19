/**
 * =========================================================================
 * ثياب - قواميس ومتغيرات الحركات والتفاعلات للأزرار (Button Interactions)
 * =========================================================================
 * هذا الملف يحتوي على المتغيرات الاسمية الرسمية للحركات التفاعلية للأزرار
 * كما تم تصنيفها في متجر ثياب:
 * 1. "تغيّر لون بزاوية 45" (زر المفضلة والسلة)
 * 2. "تغيير نص ولون بزاوية 45" (زر تسوق الآن في الهيرو)
 * 3. "تغيّر في خلفية ذات اللون" (زر تصفح الكل في قسم الأكثر مبيعاً)
 * 4. "لمعة متحركة" (زر تتبع الطلب وأزرار إتمام الشراء)
 */

/**
 * 1. تفاعلية زر المفضلة والسلة:
 * انزلاق لون الخلفية بزاوية مائلة (45 درجة) مع تحول لون الأيقونة ونبض اهتزازي
 */
export const تغيّر_لون_بزاوية_45 = {
    id: 'color-sweep-45',
    name: 'تغيّر لون بزاوية 45',
    target: 'زر المفضلة وزر السلة (ProductCard ToggleIcon)',
    description: 'انزلاق لوح لوني بزاوية 45 درجة ليكسو الخلفية مع تغيير لون الأيقونة بسلاسة وحركة اهتزازية متفاعلة.',
    baseClass: 'relative overflow-hidden group/icon cursor-pointer transition-colors duration-500 rounded-xl',
    sweepClass: 'absolute inset-y-0 -left-[50%] w-[200%] bg-[#800020] skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] z-0',
    iconWrapperClass: 'relative z-10 w-full h-full flex items-center justify-center transition-colors duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
    states: {
        activeSweep: 'translate-x-0',
        inactiveSweep: '-translate-x-full group-hover/icon:translate-x-0',
        activeText: 'text-[#F0DFCD]',
        inactiveText: 'text-[#800020] group-hover/icon:text-[#F0DFCD]'
    }
};

/**
 * 2. تفاعلية زر تسوق الآن:
 * انزلاق خلفية جديدة مائلة بزاوية مع صعود النص القديم للأعلى وهبوط النص الجديد باللون المعاكس
 */
export const تغيير_نص_ولون_بزاوية_45 = {
    id: 'text-and-color-sweep-45',
    name: 'تغيير نص ولون بزاوية 45',
    target: 'زر تسوق الآن (Hero Section - InteractiveButton)',
    description: 'انزلاق لوح لوني بزاوية مائلة يغطي الزر بالكامل بالتزامن مع تدحرج النص للأعلى ودخول النص واللون المعاكس من الأسفل، مع دوران السهم 45 درجة.',
    wrapperClass: 'relative inline-flex items-center justify-center overflow-hidden rounded-sm bg-[#800020] text-[#F0DFCD] shadow-md hover:shadow-xl active:scale-95 transition-all duration-300 group cursor-pointer',
    sweepSheetClass: 'absolute -inset-x-24 -inset-y-16 bg-[#F0DFCD] -translate-x-[160%] skew-x-[35deg] sm:skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0 pointer-events-none z-0',
    baseTextLayerClass: 'relative z-10 flex items-center justify-center gap-2 font-bold w-full h-full whitespace-nowrap text-[#F0DFCD] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[150%] group-hover:opacity-0',
    hoverTextLayerClass: 'absolute inset-0 z-20 flex items-center justify-center gap-2 font-bold w-full h-full whitespace-nowrap pointer-events-none text-[#800020] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100',
    iconHoverEffect: 'group-hover:rotate-45 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]'
};

/**
 * 3. تفاعلية زر تصفح الكل:
 * تفاعل لوني متناسق مع الخلفية العنابية الحاضنة (Inverse) مع توهج مشع (Glow)
 */
export const تغيّر_في_خلفية_ذات_اللون = {
    id: 'same-bg-glow-sweep',
    name: 'تغيّر في خلفية ذات اللون',
    target: 'زر تصفح الكل (Best Sellers - InteractiveButton with inverse & glow)',
    description: 'خلفية بلون بيج فاتح تعكس ألوان السيكشن الحاضن (#800020)، مع انزلاق لون الخلفية العنابي ذاته على الزر عند التحويم، مدعوماً بهالة ضوئية مشعة (Glow) تتسع وتتوهج عند التمرير.',
    wrapperClass: 'relative inline-flex items-center justify-center overflow-hidden rounded-sm bg-[#F0DFCD] text-[#800020] shadow-[0_0_25px_rgba(240,223,205,0.45)] hover:shadow-[0_0_35px_rgba(240,223,205,0.7)] active:scale-95 transition-all duration-300 group cursor-pointer',
    sweepSheetClass: 'absolute -inset-x-24 -inset-y-16 bg-[#800020] -translate-x-[160%] skew-x-[35deg] sm:skew-x-[45deg] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0 pointer-events-none z-0',
    baseTextLayerClass: 'relative z-10 flex items-center justify-center gap-2 font-bold w-full h-full whitespace-nowrap text-[#800020] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[150%] group-hover:opacity-0',
    hoverTextLayerClass: 'absolute inset-0 z-20 flex items-center justify-center gap-2 font-bold w-full h-full whitespace-nowrap pointer-events-none text-[#F0DFCD] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100',
    glowEffect: 'shadow-[0_0_25px_rgba(240,223,205,0.45)] hover:shadow-[0_0_35px_rgba(240,223,205,0.7)]'
};

/**
 * 4. تفاعلية زر تتبع الطلب والأزرار الرئيسية:
 * لمعة ضوئية بيضاء متحركة (Shine Sweep) تعبر سطح الزر بانسيابية
 */
export const لمعة_متحركة = {
    id: 'moving-shine-sweep',
    name: 'لمعة متحركة',
    target: 'زر تتبع الطلب وأزرار إتمام الشراء والإجراءات (shine-button)',
    description: 'شريط ضوئي أبيض شفاف فائق النقاء يقطع سطح الزر أفقياً بزاوية انكسار ديناميكية وبسرعة انسيابية، مع حركة نقر تصغير تفاعلية (active:scale-95).',
    buttonClass: 'shine-button relative overflow-hidden bg-[#800020] text-[#F0DFCD] shadow-sm hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer',
    shineOverlayClass: 'shine-effect',
    animationKeyframes: 'shineSweep 1.25s cubic-bezier(0.4, 0, 0.2, 1) infinite'
};

/**
 * 5. تفاعلية عناصر وقوائم المنتجات:
 * خلفية عنابية خافتة تكسو العنصر عند التحويم (Subtle Burgundy Hover Background)
 */
export const خلفية_عنابية_خافتة_للتمرير = {
    id: 'subtle-burgundy-hover-bg',
    name: 'خلفية عنابية خافتة للتمرير',
    target: 'قوائم وبطاقات المنتجات الأكثر مبيعاً في لوحة التحكم والتحليلات',
    description: 'إعطاء خلفية عنابية راقية وخافتة (subtle burgundy tint) للعنصر عند التمرير مع تعزيز الحدود اللطيفة وانتقال سلس.',
    className: 'hover:bg-[#800020]/[0.07] hover:border-[#800020]/25 transition-all duration-300 cursor-pointer'
};

/**
 * قاموس جامع للمتغيرات الاسمية التفاعلية بالأسماء العربية الرسمية:
 */
export const buttonInteractions = {
    'تغيّر لون بزاوية 45': تغيّر_لون_بزاوية_45,
    'تغيير نص ولون بزاوية 45': تغيير_نص_ولون_بزاوية_45,
    'تغيّر في خلفية ذات اللون': تغيّر_في_خلفية_ذات_اللون,
    'لمعة متحركة': لمعة_متحركة,
    'خلفية عنابية خافتة للتمرير': خلفية_عنابية_خافتة_للتمرير
};

export default buttonInteractions;
