# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\navigation.spec.js >> Navigation & Route Functional Tests >> Quick utility pages load successfully (Size Guide, Track Order, Reviews)
- Location: tests\e2e\navigation.spec.js:65:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1, h2:has-text("تقييمات")').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('h1, h2:has-text("تقييمات")').first() with timeout 5000ms
  - waiting for locator('h1, h2:has-text("تقييمات")').first()

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
  3  | test.describe('Navigation & Route Functional Tests', () => {
  4  | 
  5  |     test('Home page loads with correct branding and hero content', async ({ page }) => {
  6  |         await page.goto('/');
  7  |         await expect(page).toHaveTitle(/ثياب/);
  8  |         
  9  |         // Brand logo in header
  10 |         const logo = page.locator('header a:has-text("ثــيــاب"), header a:has-text("ثياب")');
  11 |         await expect(logo.first()).toBeVisible();
  12 | 
  13 |         // Main navigation links visible
  14 |         await expect(page.locator('header nav a:has-text("الرجال")')).toBeVisible();
  15 |         await expect(page.locator('header nav a:has-text("النساء")')).toBeVisible();
  16 |         await expect(page.locator('header nav a:has-text("الإكسسوارات")')).toBeVisible();
  17 |     });
  18 | 
  19 |     test('Header navigation links navigate to appropriate store sections', async ({ page }) => {
  20 |         await page.goto('/');
  21 | 
  22 |         // Click Men
  23 |         await page.click('header nav a:has-text("الرجال")');
  24 |         await expect(page).toHaveURL(/\/men/);
  25 |         await expect(page.locator('h1')).toContainText('الرجال');
  26 | 
  27 |         // Click Women
  28 |         await page.click('header nav a:has-text("النساء")');
  29 |         await expect(page).toHaveURL(/\/women/);
  30 |         await expect(page.locator('h1')).toContainText('النساء');
  31 | 
  32 |         // Click Accessories
  33 |         await page.click('header nav a:has-text("الإكسسوارات")');
  34 |         await expect(page).toHaveURL(/\/accessories/);
  35 |         await expect(page.locator('h1')).toContainText('الإكسسوارات');
  36 |     });
  37 | 
  38 |     test('Category redirect routes work properly', async ({ page }) => {
  39 |         // /shoes should redirect to /men?category=أحذية
  40 |         await page.goto('/shoes');
  41 |         await expect(page).toHaveURL(/\/men\?category=/);
  42 | 
  43 |         // /fashion should redirect to /men
  44 |         await page.goto('/fashion');
  45 |         await expect(page).toHaveURL(/\/men/);
  46 |     });
  47 | 
  48 |     test('Men category filters update product display and active state', async ({ page }) => {
  49 |         await page.goto('/men');
  50 |         await page.waitForLoadState('networkidle');
  51 | 
  52 |         // Click "معاطف" filter
  53 |         const coatFilterBtn = page.locator('button:has-text("معاطف")').first();
  54 |         if (await coatFilterBtn.isVisible()) {
  55 |             await coatFilterBtn.click();
  56 |             await expect(coatFilterBtn).toHaveClass(/bg-\[#800020\]/);
  57 |         }
  58 | 
  59 |         // Click "الكل" to reset
  60 |         const allFilterBtn = page.locator('button:has-text("الكل")').first();
  61 |         await allFilterBtn.click();
  62 |         await expect(allFilterBtn).toHaveClass(/bg-\[#800020\]/);
  63 |     });
  64 | 
  65 |     test('Quick utility pages load successfully (Size Guide, Track Order, Reviews)', async ({ page }) => {
  66 |         await page.goto('/size-guide');
  67 |         await expect(page.locator('h1, h2:has-text("دليل المقاسات")').first()).toBeVisible();
  68 | 
  69 |         await page.goto('/track-order');
  70 |         await expect(page.locator('h1:has-text("تتبع الطلب")')).toBeVisible();
  71 | 
  72 |         await page.goto('/reviews');
> 73 |         await expect(page.locator('h1, h2:has-text("تقييمات")').first()).toBeVisible();
     |                                                                          ^ Error: expect(locator).toBeVisible() failed
  74 |     });
  75 | });
  76 | 
```