import { test, expect } from '@playwright/test';

test.describe('Authentication & Admin Access Control Tests', () => {

    test('Negative: Non-admin or unauthenticated visitor is blocked from Admin Dashboard with 403 screen', async ({ page }) => {
        // Go to admin dashboard
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');

        // Should render 403 Forbidden Access screen
        await expect(page.locator('text=خطأ 403 • محظور الوصول')).toBeVisible();
        await expect(page.locator('h3:has-text("منطقة إدارية مقيدة"), h2:has-text("صلاحيات"), span:has-text("محظور الوصول")').first()).toBeVisible();

        // Return to store button is functional
        const returnBtn = page.locator('a:has-text("العودة للمتجر")').first();
        await expect(returnBtn).toBeVisible();
        await returnBtn.click();
        await expect(page).toHaveURL(/http:\/\/127\.0\.0\.1:5173\/?$/);
    });

    test('Negative: Direct URL sub-route access to admin tabs (/admin/orders, /admin/products) is also protected', async ({ page }) => {
        await page.goto('/admin/orders');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=خطأ 403 • محظور الوصول')).toBeVisible();

        await page.goto('/admin/products');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=خطأ 403 • محظور الوصول')).toBeVisible();
    });

    test('Functional: Login page toggles between Login and Register modes', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('h2')).toContainText('أهلاً بعودتك');

        // Click "إنشاء حساب" toggle
        await page.locator('button:text-is("إنشاء حساب")').click();
        await expect(page.locator('h2')).toContainText('إنشاء حساب');
        await expect(page.locator('label:has-text("الاسم الكامل")')).toBeVisible();

        // Toggle back to "تسجيل الدخول"
        await page.locator('button:text-is("تسجيل الدخول")').click();
        await expect(page.locator('h2')).toContainText('أهلاً بعودتك');
    });

    test('Negative: Submitting empty or invalid credentials displays error gracefully', async ({ page }) => {
        await page.goto('/login');

        // Fill invalid credentials
        await page.fill('input[type="email"]', 'nonexistent_user@thyiaab.test');
        await page.fill('input[type="password"]', 'wrongpassword123');
        await page.click('button[type="submit"]');

        // Error message should appear without crashing
        await expect(page.locator('div.bg-red-50, div.text-red-700')).toBeVisible({ timeout: 7000 });
    });

    test('Positive: Registering a new account establishes session and shows user in navbar', async ({ page }) => {
        await page.goto('/login');
        await page.locator('button:text-is("إنشاء حساب")').click();

        const uniqueEmail = `testuser_${Date.now()}@gmail.com`;
        await page.fill('input[type="text"]', 'عبدالله أحمد');
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'password123456');

        await page.click('button[type="submit"]');

        // Should redirect to home and user account button is visible in header
        await page.waitForURL('**/', { timeout: 10000 });
        await expect(page.locator('header a[href="/account"]')).toBeVisible({ timeout: 10000 });
    });
});
