import { test, expect } from '@playwright/test';

test.describe('Tracking, Reviews & Size Guide Functional Tests', () => {

    test('Functional: Track Order displays carrier, tracking code, steps and copy action', async ({ page }) => {
        await page.goto('/track-order/73262');
        await page.waitForLoadState('networkidle');

        // Verify order number and title
        await expect(page.locator('h1')).toContainText('تتبع الطلب #73262');

        // Carrier details
        await expect(page.locator('text=أرامكس (Aramex Express)')).toBeVisible();
        await expect(page.locator('text=ARX-994820194SA')).toBeVisible();

        // Delivery steps
        await expect(page.locator('text=تم تأكيد الطلب').first()).toBeVisible();
        await expect(page.locator('text=تجهيز الشحنة').first()).toBeVisible();
        await expect(page.locator('text=في الطريق').first()).toBeVisible();

        // Copy tracking button
        const copyBtn = page.locator('button[aria-label="نسخ رقم الشحنة"], button:has(svg.lucide-copy)').first();
        if (await copyBtn.isVisible()) {
            await copyBtn.click();
            await expect(page.locator('div:has-text("تم نسخ رقم التتبع")').first()).toBeVisible();
        }
    });

    test('Functional: Size Guide calculator updates recommendation on input change', async ({ page }) => {
        await page.goto('/size-guide');
        await page.waitForLoadState('networkidle');

        // Default calculator state should produce a recommendation
        const calcBtn = page.locator('button:has-text("احسب المقاس المناسب"), button[type="submit"]').first();
        if (await calcBtn.isVisible()) {
            await calcBtn.click();
            await expect(page.locator('text=المقاس الموصى به')).toBeVisible();
        }

        // Change height to 185
        const heightInput = page.locator('input[type="number"], input[type="range"]').first();
        if (await heightInput.isVisible()) {
            await heightInput.fill('185');
            if (await calcBtn.isVisible()) await calcBtn.click();
            await expect(page.locator('text=المقاس الموصى به')).toBeVisible();
        }
    });

    test('Functional: Reviews page loads product rating, stars and write review modal trigger', async ({ page }) => {
        await page.goto('/reviews');
        await page.waitForLoadState('networkidle');

        // Page title
        await expect(page.locator('h1, h2').first()).toBeVisible();

        // Filter / sort controls and action button
        const writeReviewBtn = page.locator('button:has-text("كتابة مراجعة")');
        await expect(writeReviewBtn).toBeVisible();

        const filterControls = page.locator('button:has-text("جميع النجوم")');
        await expect(filterControls).toBeVisible();
    });
});
