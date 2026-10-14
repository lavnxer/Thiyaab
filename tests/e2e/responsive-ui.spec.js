import { test, expect } from '@playwright/test';

test.describe('Responsive Layout, Viewports & Zero-Overflow UI Tests', () => {

    const viewports = [
        { name: 'Desktop (1440px)', width: 1440, height: 900 },
        { name: 'Tablet (768px)', width: 768, height: 1024 },
        { name: 'Mobile (390px)', width: 390, height: 844 },
    ];

    const criticalRoutes = [
        '/',
        '/men',
        '/women',
        '/accessories',
        '/cart',
        '/checkout',
        '/wishlist',
        '/login',
        '/size-guide',
        '/track-order',
    ];

    for (const vp of viewports) {
        test(`Verify zero horizontal overflow on ${vp.name} across critical routes`, async ({ page }) => {
            test.setTimeout(60000);
            await page.setViewportSize({ width: vp.width, height: vp.height });

            for (const route of criticalRoutes) {
                await page.goto(route);
                await page.waitForLoadState('networkidle');

                const overflowData = await page.evaluate(() => {
                    const scrollW = document.body.scrollWidth;
                    const innerW = window.innerWidth;
                    return {
                        scrollWidth: scrollW,
                        innerWidth: innerW,
                        hasOverflow: scrollW > innerW + 2 // allow 2px tolerance for subpixel rounding
                    };
                });

                expect(
                    overflowData.hasOverflow,
                    `Horizontal overflow detected on ${route} at ${vp.name}: body scrollWidth (${overflowData.scrollWidth}px) exceeds viewport innerWidth (${overflowData.innerWidth}px)`
                ).toBe(false);
            }
        });
    }

    test('Verify no critical console errors across key user journeys', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                // Filter out non-breaking noise like missing optional favicon
                if (!text.includes('favicon.ico')) {
                    consoleErrors.push(text);
                }
            }
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.goto('/men');
        await page.waitForLoadState('networkidle');

        await page.goto('/cart');
        await page.waitForLoadState('networkidle');

        await page.goto('/wishlist');
        await page.waitForLoadState('networkidle');

        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        expect(consoleErrors, `Unexpected console errors found: ${consoleErrors.join(', ')}`).toEqual([]);
    });
});
