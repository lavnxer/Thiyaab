# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\admin-auth.spec.js >> Authentication & Admin Access Control Tests >> Positive: Registering a new account establishes session and shows user in navbar
- Location: tests\e2e\admin-auth.spec.js:57:5

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e7]:
    - heading "ثياب" [level=1] [ref=e8]
    - paragraph [ref=e9]: أناقتك هويتك — اكتشف تشكيلات حصرية لا تُضاهى
    - img "مودل" [ref=e10]
  - generic [ref=e12]:
    - link "العودة للرئيسية" [ref=e13] [cursor=pointer]:
      - /url: /
    - heading "إنشاء حساب" [level=2] [ref=e16]
    - paragraph [ref=e17]: انضم إلى عائلة ثياب اليوم
    - generic [ref=e18]: Failed to fetch
    - generic [ref=e19]:
      - button "تسجيل الدخول" [ref=e20] [cursor=pointer]
      - button "إنشاء حساب" [ref=e21] [cursor=pointer]
    - generic [ref=e22]:
      - generic [ref=e23]:
        - generic [ref=e24]: الاسم الكامل
        - textbox "محمد عبدالله" [ref=e25]: عبدالله أحمد
      - generic [ref=e26]:
        - generic [ref=e27]: البريد الإلكتروني
        - textbox "example@email.com" [ref=e28]: testuser_1792001738691@gmail.com
      - generic [ref=e29]:
        - generic [ref=e30]: كلمة المرور
        - generic [ref=e32]:
          - textbox "••••••••" [ref=e33]: password123456
          - button [ref=e34] [cursor=pointer]
      - button "إنشاء حساب" [active] [ref=e38] [cursor=pointer]
    - generic [ref=e39]: أو تابع بـ
    - generic [ref=e43]:
      - button "Google" [ref=e44] [cursor=pointer]
      - button "Apple" [ref=e45] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication & Admin Access Control Tests', () => {
  4  | 
  5  |     test('Negative: Non-admin or unauthenticated visitor is blocked from Admin Dashboard with 403 screen', async ({ page }) => {
  6  |         // Go to admin dashboard
  7  |         await page.goto('/admin');
  8  |         await page.waitForLoadState('networkidle');
  9  | 
  10 |         // Should render 403 Forbidden Access screen
  11 |         await expect(page.locator('text=خطأ 403 • محظور الوصول')).toBeVisible();
  12 |         await expect(page.locator('h3:has-text("منطقة إدارية مقيدة"), h2:has-text("صلاحيات"), span:has-text("محظور الوصول")').first()).toBeVisible();
  13 | 
  14 |         // Return to store button is functional
  15 |         const returnBtn = page.locator('a:has-text("العودة للمتجر")').first();
  16 |         await expect(returnBtn).toBeVisible();
  17 |         await returnBtn.click();
  18 |         await expect(page).toHaveURL(/http:\/\/127\.0\.0\.1:5173\/?$/);
  19 |     });
  20 | 
  21 |     test('Negative: Direct URL sub-route access to admin tabs (/admin/orders, /admin/products) is also protected', async ({ page }) => {
  22 |         await page.goto('/admin/orders');
  23 |         await page.waitForLoadState('networkidle');
  24 |         await expect(page.locator('text=خطأ 403 • محظور الوصول')).toBeVisible();
  25 | 
  26 |         await page.goto('/admin/products');
  27 |         await page.waitForLoadState('networkidle');
  28 |         await expect(page.locator('text=خطأ 403 • محظور الوصول')).toBeVisible();
  29 |     });
  30 | 
  31 |     test('Functional: Login page toggles between Login and Register modes', async ({ page }) => {
  32 |         await page.goto('/login');
  33 |         await expect(page.locator('h2')).toContainText('أهلاً بعودتك');
  34 | 
  35 |         // Click "إنشاء حساب" toggle
  36 |         await page.locator('button:text-is("إنشاء حساب")').click();
  37 |         await expect(page.locator('h2')).toContainText('إنشاء حساب');
  38 |         await expect(page.locator('label:has-text("الاسم الكامل")')).toBeVisible();
  39 | 
  40 |         // Toggle back to "تسجيل الدخول"
  41 |         await page.locator('button:text-is("تسجيل الدخول")').click();
  42 |         await expect(page.locator('h2')).toContainText('أهلاً بعودتك');
  43 |     });
  44 | 
  45 |     test('Negative: Submitting empty or invalid credentials displays error gracefully', async ({ page }) => {
  46 |         await page.goto('/login');
  47 | 
  48 |         // Fill invalid credentials
  49 |         await page.fill('input[type="email"]', 'nonexistent_user@thyiaab.test');
  50 |         await page.fill('input[type="password"]', 'wrongpassword123');
  51 |         await page.click('button[type="submit"]');
  52 | 
  53 |         // Error message should appear without crashing
  54 |         await expect(page.locator('div.bg-red-50, div.text-red-700')).toBeVisible({ timeout: 7000 });
  55 |     });
  56 | 
  57 |     test('Positive: Registering a new account establishes session and shows user in navbar', async ({ page }) => {
  58 |         await page.goto('/login');
  59 |         await page.locator('button:text-is("إنشاء حساب")').click();
  60 | 
  61 |         const uniqueEmail = `testuser_${Date.now()}@gmail.com`;
  62 |         await page.fill('input[type="text"]', 'عبدالله أحمد');
  63 |         await page.fill('input[type="email"]', uniqueEmail);
  64 |         await page.fill('input[type="password"]', 'password123456');
  65 | 
  66 |         await page.click('button[type="submit"]');
  67 | 
  68 |         // Should redirect to home and user account button is visible in header
> 69 |         await page.waitForURL('**/', { timeout: 10000 });
     |                    ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  70 |         await expect(page.locator('header a[href="/account"]')).toBeVisible({ timeout: 10000 });
  71 |     });
  72 | });
  73 | 
```