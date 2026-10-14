# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\cart-checkout.spec.js >> Cart and Checkout End-to-End Tests >> Positive: Selecting color and size allows adding product to cart and updates cart badge
- Location: tests\e2e\cart-checkout.spec.js:43:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("أضف للسلة"), button:has-text("أضف إلى السلة")').first()

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - navigation [ref=f1e4]:
      - link "الرجال" [ref=f1e5] [cursor=pointer]:
        - /url: /men
      - link "النساء" [ref=f1e6] [cursor=pointer]:
        - /url: /women
      - link "الإكسسوارات" [ref=f1e7] [cursor=pointer]:
        - /url: /accessories
    - link "ثــيــاب" [ref=f1e8] [cursor=pointer]:
      - /url: /
    - generic [ref=f1e9]:
      - link "المفضلة" [ref=f1e10] [cursor=pointer]:
        - /url: /wishlist
      - link "السلة" [ref=f1e15] [cursor=pointer]:
        - /url: /cart
      - link "دخول" [ref=f1e21] [cursor=pointer]:
        - /url: /login
  - generic [ref=f1e27]:
    - heading "المنتج غير موجود" [level=2] [ref=f1e28]
    - button "العودة للمتجر" [ref=f1e29] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Cart and Checkout End-to-End Tests', () => {
  4   | 
  5   |     test.beforeEach(async ({ page }) => {
  6   |         // Clear localStorage before each test for clean deterministic state
  7   |         await page.goto('/');
  8   |         await page.evaluate(() => {
  9   |             localStorage.clear();
  10  |         });
  11  |     });
  12  | 
  13  |     test('Negative: Cannot add product to cart without selecting color and size', async ({ page }) => {
  14  |         await page.goto('/men');
  15  |         await page.waitForLoadState('networkidle');
  16  | 
  17  |         // Click on the first product card
  18  |         const firstProductCard = page.locator('div:has(> a[href^="/product/"]) a[href^="/product/"]').first();
  19  |         if (await firstProductCard.isVisible()) {
  20  |             await firstProductCard.click();
  21  |         } else {
  22  |             // Direct navigation fallback to standard product
  23  |             await page.goto('/product/1fe2999b-3b5f-4e89-a994-f6b5fb9ea961');
  24  |         }
  25  | 
  26  |         await page.waitForLoadState('networkidle');
  27  | 
  28  |         // Attempt to click "أضف للسلة" directly without picking color or size
  29  |         const addToCartBtn = page.locator('button:has-text("أضف للسلة"), button:has-text("أضف إلى السلة")');
  30  |         await expect(addToCartBtn).toBeVisible();
  31  |         await addToCartBtn.click();
  32  | 
  33  |         // Expect toast error notification to appear
  34  |         const toastError = page.locator('.toast, [role="status"], div:has-text("يرجى اختيار")');
  35  |         await expect(toastError.first()).toBeVisible();
  36  | 
  37  |         // Cart count in header should remain 0 / badge hidden
  38  |         const cartBadge = page.locator('header a[href="/cart"] div.relative span');
  39  |         const badgeCount = await cartBadge.count();
  40  |         expect(badgeCount).toBe(0);
  41  |     });
  42  | 
  43  |     test('Positive: Selecting color and size allows adding product to cart and updates cart badge', async ({ page }) => {
  44  |         await page.goto('/product/1fe2999b-3b5f-4e89-a994-f6b5fb9ea961');
  45  |         await page.waitForLoadState('networkidle');
  46  | 
  47  |         // Select a color option
  48  |         const colorOption = page.locator('button:has(span[style*="background-color"])').first();
  49  |         if (await colorOption.isVisible()) {
  50  |             await colorOption.click();
  51  |         }
  52  | 
  53  |         // Select a size option (e.g. M, L, S)
  54  |         const sizeOption = page.locator('button:has(span)').filter({ hasText: /^(M|L|XL|S)$/ }).first();
  55  |         if (await sizeOption.isVisible()) {
  56  |             await sizeOption.click();
  57  |         }
  58  | 
  59  |         // Click "أضف للسلة"
  60  |         const addToCartBtn = page.locator('button:has-text("أضف للسلة"), button:has-text("أضف إلى السلة")').first();
> 61  |         await addToCartBtn.click();
      |                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
  62  | 
  63  |         // Verify toast success
  64  |         await expect(page.locator('div:has-text("تمت إضافة")').first()).toBeVisible({ timeout: 5000 });
  65  | 
  66  |         // Verify cart badge in header now displays at least 1
  67  |         const cartBadge = page.locator('header a[href="/cart"] div.relative span');
  68  |         await expect(cartBadge).toBeVisible();
  69  | 
  70  |         await page.goto('/cart');
  71  |         await expect(page).toHaveURL(/\/cart/);
  72  |         await expect(page.locator('button:has-text("إتمام الشراء")')).toBeVisible();
  73  |     });
  74  | 
  75  |     test('Functional: Cart page allows updating quantities and recalculating subtotal and total', async ({ page }) => {
  76  |         // Pre-populate cart with 2 items in localStorage
  77  |         await page.goto('/');
  78  |         await page.evaluate(() => {
  79  |             const mockCart = [
  80  |                 {
  81  |                     id: 'cart-item-1',
  82  |                     productId: '1fe2999b-3b5f-4e89-a994-f6b5fb9ea961',
  83  |                     name: 'معطف جوخ مزدوج الصدر بحزام',
  84  |                     price: 850,
  85  |                     qty: 1,
  86  |                     size: 'L',
  87  |                     color: 'أسود ملكي',
  88  |                     img: '/images/coat_transparent.png'
  89  |                 },
  90  |                 {
  91  |                     id: 'cart-item-2',
  92  |                     productId: '1f0f07fe-e66d-44b1-98eb-006b9ce3c3d7',
  93  |                     name: 'حذاء جلدي فاخر',
  94  |                     price: 450,
  95  |                     qty: 1,
  96  |                     size: '42',
  97  |                     color: 'أسود',
  98  |                     img: '/images/leather_shoes_transparent.png'
  99  |                 }
  100 |             ];
  101 |             localStorage.setItem('thyiaab_cart_items', JSON.stringify(mockCart));
  102 |         });
  103 | 
  104 |         await page.goto('/cart');
  105 |         await page.waitForLoadState('networkidle');
  106 | 
  107 |         // Initial total should be 850 + 450 = 1300
  108 |         const totalElement = page.locator('div:has-text("الإجمالي") span:has-text("1300")');
  109 |         await expect(totalElement.first()).toBeVisible();
  110 | 
  111 |         // Increase quantity of second item by clicking '+'
  112 |         const plusButtons = page.locator('button:text-is("+")');
  113 |         await plusButtons.nth(1).click();
  114 | 
  115 |         // Updated total should be 850 + (450 * 2) = 1750
  116 |         await expect(page.locator('div:has-text("الإجمالي") span:has-text("1750")').first()).toBeVisible();
  117 | 
  118 |         // Decrease quantity back by clicking '-'
  119 |         const minusButtons = page.locator('button:text-is("-")');
  120 |         await minusButtons.nth(1).click();
  121 |         await expect(page.locator('div:has-text("الإجمالي") span:has-text("1300")').first()).toBeVisible();
  122 |     });
  123 | 
  124 |     test('Negative & Positive Validation on Checkout Page: Coupons, Luhn Card, and Order Confirmation', async ({ page }) => {
  125 |         // Populate cart and navigate to checkout
  126 |         await page.goto('/');
  127 |         await page.evaluate(() => {
  128 |             const mockCart = [
  129 |                 {
  130 |                     id: 'cart-test-1',
  131 |                     productId: '1fe2999b-3b5f-4e89-a994-f6b5fb9ea961',
  132 |                     name: 'معطف جوخ فاخر',
  133 |                     price: 1000,
  134 |                     qty: 1,
  135 |                     size: 'L',
  136 |                     color: 'أسود',
  137 |                     img: '/images/coat_transparent.png'
  138 |                 }
  139 |             ];
  140 |             localStorage.setItem('thyiaab_cart_items', JSON.stringify(mockCart));
  141 |         });
  142 | 
  143 |         await page.goto('/checkout');
  144 |         await page.waitForLoadState('networkidle');
  145 | 
  146 |         // 1. Negative Test: Apply invalid coupon code
  147 |         const couponInput = page.locator('input[placeholder*="كود"], input[placeholder*="خصم"]');
  148 |         await couponInput.fill('FAKECOUPON');
  149 |         await page.locator('button:has-text("تطبيق")').click();
  150 |         await expect(page.locator('div:has-text("غير صالح")').first()).toBeVisible();
  151 | 
  152 |         // 2. Positive Test: Apply valid 10% coupon code
  153 |         await couponInput.fill('THYIAAB10');
  154 |         await page.locator('button:has-text("تطبيق")').click();
  155 |         await expect(page.locator('div:has-text("تم تطبيق")').first()).toBeVisible();
  156 | 
  157 |         // Total should now reflect 10% discount: 1000 - 100 = 900
  158 |         await expect(page.locator('span:text-is("900")').first()).toBeVisible();
  159 | 
  160 |         // 3. Positive Test: Click "تأكيد الشراء" with saved valid address and card
  161 |         const confirmBtn = page.locator('button:has-text("تأكيد الشراء")');
```