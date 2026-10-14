import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Helper functions mirroring and testing core checkout and store algorithms

// 1. Luhn Algorithm
function isValidLuhn(numStr) {
    const clean = (numStr || '').replace(/\D/g, '');
    if (clean.length < 15 || clean.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
        let digit = parseInt(clean.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}

// 2. Expiry Date Validator
function validateExpiryDate(expiryStr, referenceDate = new Date()) {
    if (!expiryStr || expiryStr.length < 5) {
        return { valid: false, error: 'تاريخ غير مكتمل (MM/YY)' };
    }
    const [mStr, yStr] = expiryStr.split('/');
    const month = parseInt(mStr, 10);
    const year = parseInt(yStr, 10);
    if (isNaN(month) || month < 1 || month > 12) {
        return { valid: false, error: 'الشهر غير صحيح (يجب أن يكون بين 01 و 12)' };
    }
    if (isNaN(year)) {
        return { valid: false, error: 'سنة غير صحيحة' };
    }
    const currentYear = referenceDate.getFullYear() % 100;
    const currentMonth = referenceDate.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return { valid: false, error: 'البطاقة منتهية الصلاحية' };
    }
    if (year > currentYear + 15) {
        return { valid: false, error: 'سنة الانتهاء غير منطقية' };
    }
    return { valid: true, error: null };
}

// 3. Coupon Calculator
function calculateCouponDiscount(code, subtotal) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode || subtotal <= 0) return { discount: 0, valid: false };

    if (cleanCode === 'THYIAAB10' || cleanCode === 'WELCOME10' || cleanCode === 'FAV10') {
        return { discount: Math.round(subtotal * 0.10), valid: true, rate: 0.10 };
    }
    if (cleanCode === 'VIP20') {
        return { discount: Math.round(subtotal * 0.20), valid: true, rate: 0.20 };
    }
    return { discount: 0, valid: false };
}

// 4. Cart Subtotal and Total Calculator
function calculateCartTotals(items, appliedDiscount = 0, shippingCost = 0) {
    if (!Array.isArray(items)) return { subtotal: 0, total: 0, count: 0 };
    const subtotal = items.reduce((sum, item) => {
        const price = Math.max(0, Number(item.price) || 0);
        const qty = Math.max(0, Number(item.qty) || 0);
        return sum + (price * qty);
    }, 0);
    const count = items.reduce((sum, item) => sum + (Math.max(0, Number(item.qty) || 0)), 0);
    const safeDiscount = Math.min(subtotal, Math.max(0, Number(appliedDiscount) || 0));
    const total = Math.max(0, subtotal - safeDiscount + shippingCost);
    return { subtotal, total, count, discount: safeDiscount };
}

// 5. Size Recommendation Calculator
function calculateRecommendedSize({ gender, category, height, weight }) {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;

    if (gender === 'men') {
        if (category === 'thobe') {
            if (h <= 163) return '52';
            if (h <= 169) return '54';
            if (h <= 175) return '56';
            if (h <= 181) return '58';
            if (h <= 187) return '60';
            return '62';
        }
        if (w < 65) return 'S';
        if (w < 78) return 'M';
        if (w < 90) return 'L';
        if (w < 105) return 'XL';
        return 'XXL';
    }

    if (gender === 'women') {
        if (category === 'abayas') {
            if (h <= 153) return '50';
            if (h <= 158) return '52';
            if (h <= 163) return '54';
            if (h <= 168) return '56';
            if (h <= 173) return '58';
            return '60';
        }
        if (w < 55) return 'S';
        if (w < 68) return 'M';
        if (w < 80) return 'L';
        return 'XL';
    }

    return 'M';
}

describe('1. Luhn Payment Card Validation', () => {
    test('Valid Luhn 16-digit cards pass validation', () => {
        // Standard test card numbers known to pass Luhn
        assert.equal(isValidLuhn('4532015112830366'), true);
        assert.equal(isValidLuhn('4532 0151 1283 0366'), true);
        assert.equal(isValidLuhn('5555555555554444'), true);
    });

    test('Invalid Luhn checksum cards fail validation', () => {
        assert.equal(isValidLuhn('4532015112830367'), false);
        assert.equal(isValidLuhn('1234567812345671'), false);
        assert.equal(isValidLuhn('9999999999999999'), false);
    });

    test('Length boundary conditions (< 15 digits or > 19 digits) fail', () => {
        assert.equal(isValidLuhn('4532'), false);
        assert.equal(isValidLuhn(''), false);
        assert.equal(isValidLuhn(null), false);
        assert.equal(isValidLuhn('123456789012345678901'), false);
    });
});

describe('2. Credit Card Expiry Date Validation', () => {
    const fixedNow = new Date('2026-10-14T12:00:00Z');

    test('Valid future expiry dates pass', () => {
        const res = validateExpiryDate('12/28', fixedNow);
        assert.equal(res.valid, true);
        assert.equal(res.error, null);

        const currentMonthRes = validateExpiryDate('10/26', fixedNow);
        assert.equal(currentMonthRes.valid, true);
    });

    test('Expired dates fail validation', () => {
        const pastYear = validateExpiryDate('08/24', fixedNow);
        assert.equal(pastYear.valid, false);
        assert.equal(pastYear.error, 'البطاقة منتهية الصلاحية');

        const pastMonth = validateExpiryDate('09/26', fixedNow);
        assert.equal(pastMonth.valid, false);
        assert.equal(pastMonth.error, 'البطاقة منتهية الصلاحية');
    });

    test('Invalid months (< 1 or > 12) fail validation', () => {
        const month13 = validateExpiryDate('13/28', fixedNow);
        assert.equal(month13.valid, false);

        const month00 = validateExpiryDate('00/28', fixedNow);
        assert.equal(month00.valid, false);
    });

    test('Malformed and incomplete expiry inputs fail', () => {
        assert.equal(validateExpiryDate('').valid, false);
        assert.equal(validateExpiryDate('1/2').valid, false);
        assert.equal(validateExpiryDate('ab/cd').valid, false);
    });

    test('Unreasonably far future (> 15 years) fails validation', () => {
        const farFuture = validateExpiryDate('12/99', fixedNow);
        assert.equal(farFuture.valid, false);
        assert.equal(farFuture.error, 'سنة الانتهاء غير منطقية');
    });
});

describe('3. Coupon & Discount Logic', () => {
    test('Valid 10% coupon codes calculate accurate discount', () => {
        assert.deepEqual(calculateCouponDiscount('THYIAAB10', 1000), { discount: 100, valid: true, rate: 0.10 });
        assert.deepEqual(calculateCouponDiscount('thyiaab10', 500), { discount: 50, valid: true, rate: 0.10 });
        assert.deepEqual(calculateCouponDiscount('WELCOME10', 450), { discount: 45, valid: true, rate: 0.10 });
        assert.deepEqual(calculateCouponDiscount('FAV10', 250), { discount: 25, valid: true, rate: 0.10 });
    });

    test('Valid 20% VIP coupon code calculates accurate discount', () => {
        assert.deepEqual(calculateCouponDiscount('VIP20', 1000), { discount: 200, valid: true, rate: 0.20 });
        assert.deepEqual(calculateCouponDiscount('vip20', 350), { discount: 70, valid: true, rate: 0.20 });
    });

    test('Invalid, empty, and expired coupon codes return zero discount', () => {
        assert.deepEqual(calculateCouponDiscount('INVALID99', 1000), { discount: 0, valid: false });
        assert.deepEqual(calculateCouponDiscount('', 1000), { discount: 0, valid: false });
        assert.deepEqual(calculateCouponDiscount(null, 1000), { discount: 0, valid: false });
    });
});

describe('4. Cart Calculations & Safe Boundaries', () => {
    test('Calculates accurate subtotal, item count and grand total', () => {
        const items = [
            { price: 450, qty: 2 },
            { price: 190, qty: 1 }
        ];
        const res = calculateCartTotals(items, 100, 0);
        assert.equal(res.subtotal, 1090);
        assert.equal(res.count, 3);
        assert.equal(res.discount, 100);
        assert.equal(res.total, 990);
    });

    test('Handles empty and malformed cart items without crashing', () => {
        assert.deepEqual(calculateCartTotals([]), { subtotal: 0, total: 0, count: 0, discount: 0 });
        assert.deepEqual(calculateCartTotals(null), { subtotal: 0, total: 0, count: 0 });

        const malformed = [{ price: 'abc', qty: 'none' }, { price: -50, qty: -2 }];
        const res = calculateCartTotals(malformed);
        assert.equal(res.subtotal, 0);
        assert.equal(res.total, 0);
    });

    test('Discount cannot exceed subtotal (never produces negative grand total)', () => {
        const items = [{ price: 100, qty: 1 }];
        const res = calculateCartTotals(items, 500); // 500 discount on 100 cart
        assert.equal(res.subtotal, 100);
        assert.equal(res.discount, 100);
        assert.equal(res.total, 0);
    });
});

describe('5. Size Guide Recommendation Logic', () => {
    test('Men thobe size accurately mapped from height', () => {
        assert.equal(calculateRecommendedSize({ gender: 'men', category: 'thobe', height: 160, weight: 70 }), '52');
        assert.equal(calculateRecommendedSize({ gender: 'men', category: 'thobe', height: 172, weight: 75 }), '56');
        assert.equal(calculateRecommendedSize({ gender: 'men', category: 'thobe', height: 185, weight: 80 }), '60');
        assert.equal(calculateRecommendedSize({ gender: 'men', category: 'thobe', height: 195, weight: 90 }), '62');
    });

    test('Women abaya size accurately mapped from height', () => {
        assert.equal(calculateRecommendedSize({ gender: 'women', category: 'abayas', height: 152, weight: 55 }), '50');
        assert.equal(calculateRecommendedSize({ gender: 'women', category: 'abayas', height: 165, weight: 60 }), '56');
        assert.equal(calculateRecommendedSize({ gender: 'women', category: 'abayas', height: 175, weight: 70 }), '60');
    });

    test('Invalid or zero height/weight gracefully handled', () => {
        assert.equal(calculateRecommendedSize({ gender: 'men', category: 'thobe', height: 0, weight: 70 }), null);
        assert.equal(calculateRecommendedSize({ gender: 'men', category: 'thobe', height: -170, weight: -70 }), null);
    });
});
