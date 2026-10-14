# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\responsive-ui.spec.js >> Responsive Layout, Viewports & Zero-Overflow UI Tests >> Verify no critical console errors across key user journeys
- Location: tests\e2e\responsive-ui.spec.js:51:5

# Error details

```
Error: Unexpected console errors found: Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 33

- Array []
+ Array [
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+   "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+ ]
```

# Page snapshot

```yaml
- generic [ref=f4e3]:
  - generic [ref=f4e7]:
    - heading "ثياب" [level=1] [ref=f4e8]
    - paragraph [ref=f4e9]: أناقتك هويتك — اكتشف تشكيلات حصرية لا تُضاهى
    - img "مودل" [ref=f4e10]
  - generic [ref=f4e12]:
    - link "العودة للرئيسية" [ref=f4e13] [cursor=pointer]:
      - /url: /
    - heading "أهلاً بعودتك" [level=2] [ref=f4e16]
    - paragraph [ref=f4e17]: سجّل دخولك للمتابعة
    - generic [ref=f4e18]:
      - button "تسجيل الدخول" [ref=f4e19] [cursor=pointer]
      - button "إنشاء حساب" [ref=f4e20] [cursor=pointer]
    - generic [ref=f4e21]:
      - generic [ref=f4e22]:
        - generic [ref=f4e23]: البريد الإلكتروني
        - textbox "example@email.com" [ref=f4e24]
      - generic [ref=f4e25]:
        - generic [ref=f4e26]:
          - generic [ref=f4e27]: كلمة المرور
          - link "نسيت كلمة المرور؟" [ref=f4e28] [cursor=pointer]:
            - /url: "#"
        - generic [ref=f4e29]:
          - textbox "••••••••" [ref=f4e30]
          - button [ref=f4e31] [cursor=pointer]
      - button "تسجيل الدخول" [ref=f4e35] [cursor=pointer]
    - generic [ref=f4e36]: أو تابع بـ
    - generic [ref=f4e40]:
      - button "Google" [ref=f4e41] [cursor=pointer]
      - button "Apple" [ref=f4e42] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Responsive Layout, Viewports & Zero-Overflow UI Tests', () => {
  4  | 
  5  |     const viewports = [
  6  |         { name: 'Desktop (1440px)', width: 1440, height: 900 },
  7  |         { name: 'Tablet (768px)', width: 768, height: 1024 },
  8  |         { name: 'Mobile (390px)', width: 390, height: 844 },
  9  |     ];
  10 | 
  11 |     const criticalRoutes = [
  12 |         '/',
  13 |         '/men',
  14 |         '/women',
  15 |         '/accessories',
  16 |         '/cart',
  17 |         '/checkout',
  18 |         '/wishlist',
  19 |         '/login',
  20 |         '/size-guide',
  21 |         '/track-order',
  22 |     ];
  23 | 
  24 |     for (const vp of viewports) {
  25 |         test(`Verify zero horizontal overflow on ${vp.name} across critical routes`, async ({ page }) => {
  26 |             test.setTimeout(60000);
  27 |             await page.setViewportSize({ width: vp.width, height: vp.height });
  28 | 
  29 |             for (const route of criticalRoutes) {
  30 |                 await page.goto(route);
  31 |                 await page.waitForLoadState('networkidle');
  32 | 
  33 |                 const overflowData = await page.evaluate(() => {
  34 |                     const scrollW = document.body.scrollWidth;
  35 |                     const innerW = window.innerWidth;
  36 |                     return {
  37 |                         scrollWidth: scrollW,
  38 |                         innerWidth: innerW,
  39 |                         hasOverflow: scrollW > innerW + 2 // allow 2px tolerance for subpixel rounding
  40 |                     };
  41 |                 });
  42 | 
  43 |                 expect(
  44 |                     overflowData.hasOverflow,
  45 |                     `Horizontal overflow detected on ${route} at ${vp.name}: body scrollWidth (${overflowData.scrollWidth}px) exceeds viewport innerWidth (${overflowData.innerWidth}px)`
  46 |                 ).toBe(false);
  47 |             }
  48 |         });
  49 |     }
  50 | 
  51 |     test('Verify no critical console errors across key user journeys', async ({ page }) => {
  52 |         const consoleErrors = [];
  53 |         page.on('console', msg => {
  54 |             if (msg.type() === 'error') {
  55 |                 const text = msg.text();
  56 |                 // Filter out non-breaking noise like missing optional favicon
  57 |                 if (!text.includes('favicon.ico')) {
  58 |                     consoleErrors.push(text);
  59 |                 }
  60 |             }
  61 |         });
  62 | 
  63 |         await page.goto('/');
  64 |         await page.waitForLoadState('networkidle');
  65 | 
  66 |         await page.goto('/men');
  67 |         await page.waitForLoadState('networkidle');
  68 | 
  69 |         await page.goto('/cart');
  70 |         await page.waitForLoadState('networkidle');
  71 | 
  72 |         await page.goto('/wishlist');
  73 |         await page.waitForLoadState('networkidle');
  74 | 
  75 |         await page.goto('/login');
  76 |         await page.waitForLoadState('networkidle');
  77 | 
> 78 |         expect(consoleErrors, `Unexpected console errors found: ${consoleErrors.join(', ')}`).toEqual([]);
     |                                                                                               ^ Error: Unexpected console errors found: Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED, Failed to load resource: net::ERR_NAME_NOT_RESOLVED
  79 |     });
  80 | });
  81 | 
```