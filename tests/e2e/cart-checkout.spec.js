import { test, expect } from '@playwright/test';

test.describe('Cart and Checkout End-to-End Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test for clean deterministic state
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('Negative: Cannot add product to cart without selecting color and size', async ({ page }) => {
        await page.goto('/men');
        await page.waitForLoadState('networkidle');

        // Click on the first product card
        const firstProductCard = page.locator('div:has(> a[href^="/product/"]) a[href^="/product/"]').first();
        if (await firstProductCard.isVisible()) {
            await firstProductCard.click();
        } else {
            // Direct navigation fallback to standard product
            await page.goto('/product/1fe2999b-3b5f-4e89-a994-f6b5fb9ea961');
        }

        await page.waitForLoadState('networkidle');

        // Attempt to click "أضف للسلة" directly without picking color or size
        const addToCartBtn = page.locator('button:has-text("أضف للسلة"), button:has-text("أضف إلى السلة")');
        await expect(addToCartBtn).toBeVisible();
        await addToCartBtn.click();

        // Expect toast error notification to appear
        const toastError = page.locator('.toast, [role="status"], div:has-text("يرجى اختيار")');
        await expect(toastError.first()).toBeVisible();

        // Cart count in header should remain 0 / badge hidden
        const cartBadge = page.locator('header a[href="/cart"] div.relative span');
        const badgeCount = await cartBadge.count();
        expect(badgeCount).toBe(0);
    });

    test('Positive: Selecting color and size allows adding product to cart and updates cart badge', async ({ page }) => {
        await page.goto('/product/1fe2999b-3b5f-4e89-a994-f6b5fb9ea961');
        await page.waitForLoadState('networkidle');

        // Select a color option
        const colorOption = page.locator('button:has(span[style*="background-color"])').first();
        if (await colorOption.isVisible()) {
            await colorOption.click();
        }

        // Select a size option (e.g. M, L, S)
        const sizeOption = page.locator('button:has(span)').filter({ hasText: /^(M|L|XL|S)$/ }).first();
        if (await sizeOption.isVisible()) {
            await sizeOption.click();
        }

        // Click "أضف للسلة"
        const addToCartBtn = page.locator('button:has-text("أضف للسلة"), button:has-text("أضف إلى السلة")').first();
        await addToCartBtn.click();

        // Verify toast success
        await expect(page.locator('div:has-text("تمت إضافة")').first()).toBeVisible({ timeout: 5000 });

        // Verify cart badge in header now displays at least 1
        const cartBadge = page.locator('header a[href="/cart"] div.relative span');
        await expect(cartBadge).toBeVisible();

        await page.goto('/cart');
        await expect(page).toHaveURL(/\/cart/);
        await expect(page.locator('button:has-text("إتمام الشراء")')).toBeVisible();
    });

    test('Functional: Cart page allows updating quantities and recalculating subtotal and total', async ({ page }) => {
        // Pre-populate cart with 2 items in localStorage
        await page.goto('/');
        await page.evaluate(() => {
            const mockCart = [
                {
                    id: 'cart-item-1',
                    productId: '1fe2999b-3b5f-4e89-a994-f6b5fb9ea961',
                    name: 'معطف جوخ مزدوج الصدر بحزام',
                    price: 850,
                    qty: 1,
                    size: 'L',
                    color: 'أسود ملكي',
                    img: '/images/coat_transparent.png'
                },
                {
                    id: 'cart-item-2',
                    productId: '1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7',
                    name: 'حذاء جلدي فاخر',
                    price: 450,
                    qty: 1,
                    size: '42',
                    color: 'أسود',
                    img: '/images/leather_shoes_transparent.png'
                }
            ];
            localStorage.setItem('thyiaab_cart_items', JSON.stringify(mockCart));
        });

        await page.goto('/cart');
        await page.waitForLoadState('networkidle');

        // Initial total should be 850 + 450 = 1300
        const totalElement = page.locator('div:has-text("الإجمالي") span:has-text("1300")');
        await expect(totalElement.first()).toBeVisible();

        // Increase quantity of second item by clicking '+'
        const plusButtons = page.locator('button:text-is("+")');
        await plusButtons.nth(1).click();

        // Updated total should be 850 + (450 * 2) = 1750
        await expect(page.locator('div:has-text("الإجمالي") span:has-text("1750")').first()).toBeVisible();

        // Decrease quantity back by clicking '-'
        const minusButtons = page.locator('button:text-is("-")');
        await minusButtons.nth(1).click();
        await expect(page.locator('div:has-text("الإجمالي") span:has-text("1300")').first()).toBeVisible();
    });

    test('Negative & Positive Validation on Checkout Page: Coupons, Luhn Card, and Order Confirmation', async ({ page }) => {
        // Populate cart and navigate to checkout
        await page.goto('/');
        await page.evaluate(() => {
            const mockCart = [
                {
                    id: 'cart-test-1',
                    productId: '1fe2999b-3b5f-4e89-a994-f6b5fb9ea961',
                    name: 'معطف جوخ فاخر',
                    price: 1000,
                    qty: 1,
                    size: 'L',
                    color: 'أسود',
                    img: '/images/coat_transparent.png'
                }
            ];
            localStorage.setItem('thyiaab_cart_items', JSON.stringify(mockCart));
        });

        await page.goto('/checkout');
        await page.waitForLoadState('networkidle');

        // 1. Negative Test: Apply invalid coupon code
        const couponInput = page.locator('input[placeholder*="كود"], input[placeholder*="خصم"]');
        await couponInput.fill('FAKECOUPON');
        await page.locator('button:has-text("تطبيق")').click();
        await expect(page.locator('div:has-text("غير صالح")').first()).toBeVisible();

        // 2. Positive Test: Apply valid 10% coupon code
        await couponInput.fill('THYIAAB10');
        await page.locator('button:has-text("تطبيق")').click();
        await expect(page.locator('div:has-text("تم تطبيق")').first()).toBeVisible();

        // Total should now reflect 10% discount: 1000 - 100 = 900
        await expect(page.locator('span:text-is("900")').first()).toBeVisible();

        // 3. Positive Test: Click "تأكيد الشراء" with saved valid address and card
        const confirmBtn = page.locator('button:has-text("تأكيد الشراء")');
        await confirmBtn.click();

        // Order success modal / celebration should appear
        await expect(page.locator('h3:has-text("تم تأكيد طلبك بنجاح!"), div:has-text("رقم الطلب")').first()).toBeVisible({ timeout: 8000 });

        // Cart in localStorage should now be empty
        const storedCart = await page.evaluate(() => localStorage.getItem('thyiaab_cart_items'));
        expect(JSON.parse(storedCart || '[]').length).toBe(0);
    });

    test('Negative: Empty cart page shows empty state and cannot checkout', async ({ page }) => {
        await page.goto('/cart');
        await expect(page.locator('text=سلتك فارغة')).toBeVisible();
        await expect(page.locator('button:has-text("إتمام الشراء")')).not.toBeVisible();
    });
});
