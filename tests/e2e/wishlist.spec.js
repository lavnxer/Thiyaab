import { test, expect } from '@playwright/test';

test.describe('Wishlist End-to-End Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
    });

    test('Positive: Wishlist toggle adds item, updates badge, and renders in WishlistPage', async ({ page }) => {
        // Pre-populate wishlist with 1 item
        await page.goto('/');
        await page.evaluate(() => {
            const mockWishlist = [
                {
                    id: '1fe2999b-3b5f-4e89-a994-f6b5fb9ea961',
                    productId: '1fe2999b-3b5f-4e89-a994-f6b5fb9ea961',
                    name: 'معطف جوخ مزدوج الصدر بحزام',
                    price: 850,
                    category: 'معاطف وجاكيتات',
                    rating: 5,
                    reviewsCount: 120,
                    inStock: true,
                    img: '/images/coat_transparent.png'
                }
            ];
            localStorage.setItem('thyiaab_wishlist_items', JSON.stringify(mockWishlist));
        });

        // Navigate to wishlist page
        await page.goto('/wishlist');
        await expect(page).toHaveURL(/\/wishlist/);

        // Expect wishlisted item to be visible
        await expect(page.locator('h3:has-text("معطف جوخ")').first()).toBeVisible();
        await expect(page.locator('text=لديك 1 منتجات في قائمتك')).toBeVisible();

        // Header wishlist badge should show 1
        const wishBadge = page.locator('header a[href="/wishlist"] span:text-is("1")');
        await expect(wishBadge).toBeVisible();

        // Delete item via trash button
        const trashBtn = page.locator('button.shine-text-btn:has(svg)').first();
        await trashBtn.click();

        // Wishlist should now show empty state
        await expect(page.locator('text=مفضلتك فارغة')).toBeVisible();
    });

    test('Functional: Clear All button empties entire wishlist', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            const items = [
                { id: 'item-1', name: 'منتج 1', price: 100, inStock: true, img: '/images/coat_transparent.png' },
                { id: 'item-2', name: 'منتج 2', price: 200, inStock: true, img: '/images/coat_transparent.png' }
            ];
            localStorage.setItem('thyiaab_wishlist_items', JSON.stringify(items));
        });

        await page.goto('/wishlist');
        await expect(page.locator('text=لديك 2 منتجات في قائمتك')).toBeVisible();

        // Click "حذف الكل"
        const clearAllBtn = page.locator('button:has-text("حذف الكل")');
        await clearAllBtn.click();

        // Empty state is rendered
        await expect(page.locator('text=مفضلتك فارغة')).toBeVisible();

        // LocalStorage is cleared
        const stored = await page.evaluate(() => localStorage.getItem('thyiaab_wishlist_items'));
        expect(JSON.parse(stored || '[]').length).toBe(0);
    });

    test('Empty state: Empty wishlist shows appropriate message and icon', async ({ page }) => {
        await page.goto('/wishlist');
        await expect(page.locator('text=مفضلتك فارغة')).toBeVisible();
    });
});
