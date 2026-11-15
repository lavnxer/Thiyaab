import { test, expect } from '@playwright/test';

test.describe('Navigation & Route Functional Tests', () => {

    test('Home page loads with correct branding and hero content', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/ثياب/);
        
        // Brand logo in header
        const logo = page.locator('header a:has-text("ثــيــاب"), header a:has-text("ثياب")');
        await expect(logo.first()).toBeVisible();

        // Main navigation links visible
        await expect(page.locator('header nav a:has-text("الرجال")')).toBeVisible();
        await expect(page.locator('header nav a:has-text("النساء")')).toBeVisible();
        await expect(page.locator('header nav a:has-text("الإكسسوارات")')).toBeVisible();
    });

    test('Header navigation links navigate to appropriate store sections', async ({ page }) => {
        await page.goto('/');

        // Click Men
        await page.click('header nav a:has-text("الرجال")');
        await expect(page).toHaveURL(/\/men/);
        await expect(page.locator('h1')).toContainText('الرجال');

        // Click Women
        await page.click('header nav a:has-text("النساء")');
        await expect(page).toHaveURL(/\/women/);
        await expect(page.locator('h1')).toContainText('النساء');

        // Click Accessories
        await page.click('header nav a:has-text("الإكسسوارات")');
        await expect(page).toHaveURL(/\/accessories/);
        await expect(page.locator('h1')).toContainText('الإكسسوارات');
    });

    test('Category redirect routes work properly', async ({ page }) => {
        // /shoes should redirect to /men?category=أحذية
        await page.goto('/shoes');
        await expect(page).toHaveURL(/\/men\?category=/);

        // /fashion should redirect to /men
        await page.goto('/fashion');
        await expect(page).toHaveURL(/\/men/);
    });

    test('Men category filters update product display and active state', async ({ page }) => {
        await page.goto('/men');
        await page.waitForLoadState('networkidle');

        // Click "معاطف" filter
        const coatFilterBtn = page.locator('button:has-text("معاطف")').first();
        if (await coatFilterBtn.isVisible()) {
            await coatFilterBtn.click();
            await expect(coatFilterBtn).toHaveClass(/bg-\[#800020\]/);
        }

        // Click "الكل" to reset
        const allFilterBtn = page.locator('button:has-text("الكل")').first();
        await allFilterBtn.click();
        await expect(allFilterBtn).toHaveClass(/bg-\[#800020\]/);
    });

    test('Quick utility pages load successfully (Size Guide, Track Order)', async ({ page }) => {
        await page.goto('/size-guide');
        await expect(page.locator('h1, h2:has-text("دليل المقاسات")').first()).toBeVisible();

        await page.goto('/track-order');
        await expect(page.locator('h1:has-text("تتبع الطلب")')).toBeVisible();
    });
});
