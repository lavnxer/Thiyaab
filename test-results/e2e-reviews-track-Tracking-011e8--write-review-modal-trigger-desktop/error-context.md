# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\reviews-track.spec.js >> Tracking, Reviews & Size Guide Functional Tests >> Functional: Reviews page loads product rating, stars and write review modal trigger
- Location: tests\e2e\reviews-track.spec.js:49:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1, h2').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('h1, h2').first() with timeout 5000ms
  - waiting for locator('h1, h2').first()

```

```yaml
- banner:
  - navigation:
    - link "الرجال":
      - /url: /men
    - link "النساء":
      - /url: /women
    - link "الإكسسوارات":
      - /url: /accessories
  - link "ثــيــاب":
    - /url: /
  - link "المفضلة":
    - /url: /wishlist
  - link "السلة":
    - /url: /cart
  - link "دخول":
    - /url: /login
- paragraph: جاري تحميل بيانات المنتج والمراجعات...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Tracking, Reviews & Size Guide Functional Tests', () => {
  4  | 
  5  |     test('Functional: Track Order displays carrier, tracking code, steps and copy action', async ({ page }) => {
  6  |         await page.goto('/track-order/73262');
  7  |         await page.waitForLoadState('networkidle');
  8  | 
  9  |         // Verify order number and title
  10 |         await expect(page.locator('h1')).toContainText('تتبع الطلب #73262');
  11 | 
  12 |         // Carrier details
  13 |         await expect(page.locator('text=أرامكس (Aramex Express)')).toBeVisible();
  14 |         await expect(page.locator('text=ARX-994820194SA')).toBeVisible();
  15 | 
  16 |         // Delivery steps
  17 |         await expect(page.locator('text=تم تأكيد الطلب').first()).toBeVisible();
  18 |         await expect(page.locator('text=تجهيز الشحنة').first()).toBeVisible();
  19 |         await expect(page.locator('text=في الطريق').first()).toBeVisible();
  20 | 
  21 |         // Copy tracking button
  22 |         const copyBtn = page.locator('button[aria-label="نسخ رقم الشحنة"], button:has(svg.lucide-copy)').first();
  23 |         if (await copyBtn.isVisible()) {
  24 |             await copyBtn.click();
  25 |             await expect(page.locator('div:has-text("تم نسخ رقم التتبع")').first()).toBeVisible();
  26 |         }
  27 |     });
  28 | 
  29 |     test('Functional: Size Guide calculator updates recommendation on input change', async ({ page }) => {
  30 |         await page.goto('/size-guide');
  31 |         await page.waitForLoadState('networkidle');
  32 | 
  33 |         // Default calculator state should produce a recommendation
  34 |         const calcBtn = page.locator('button:has-text("احسب المقاس المناسب"), button[type="submit"]').first();
  35 |         if (await calcBtn.isVisible()) {
  36 |             await calcBtn.click();
  37 |             await expect(page.locator('text=المقاس الموصى به')).toBeVisible();
  38 |         }
  39 | 
  40 |         // Change height to 185
  41 |         const heightInput = page.locator('input[type="number"], input[type="range"]').first();
  42 |         if (await heightInput.isVisible()) {
  43 |             await heightInput.fill('185');
  44 |             if (await calcBtn.isVisible()) await calcBtn.click();
  45 |             await expect(page.locator('text=المقاس الموصى به')).toBeVisible();
  46 |         }
  47 |     });
  48 | 
  49 |     test('Functional: Reviews page loads product rating, stars and write review modal trigger', async ({ page }) => {
  50 |         await page.goto('/reviews');
  51 |         await page.waitForLoadState('networkidle');
  52 | 
  53 |         // Page title
> 54 |         await expect(page.locator('h1, h2').first()).toBeVisible();
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  55 | 
  56 |         // Filter / sort controls and action button
  57 |         const writeReviewBtn = page.locator('button:has-text("كتابة مراجعة")');
  58 |         await expect(writeReviewBtn).toBeVisible();
  59 | 
  60 |         const filterControls = page.locator('button:has-text("جميع النجوم")');
  61 |         await expect(filterControls).toBeVisible();
  62 |     });
  63 | });
  64 | 
```