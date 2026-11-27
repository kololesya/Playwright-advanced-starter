import type { Page } from '@playwright/test';

/**
 * Simulates slow hydration: the HTML is rendered and the `load` event fires,
 * but app.js attaches its event handlers and renders data only after `delayMs`.
 * This is how SPAs (React, Angular, Vue) behave on a slow device or network.
 */
export async function simulateSlowHydration(page: Page, delayMs = 1500): Promise<void> {
    await page.route('**/app.js', async (route) => {
        const response = await route.fetch();
        const script = await response.text();

        await route.fulfill({
            response,
            body: `setTimeout(() => {\n${script}\n}, ${delayMs});`,
        });
    });
}
