import { test as base, expect } from '@playwright/test';
import { StockTradingPage } from '../StockTradingPage2.js';
import { AnalyticsPage } from '../AnalyticsPage.js';

export type PageFixtures = {
    stockPage: StockTradingPage;
    analyticsPage: AnalyticsPage;
};
export const test = base.extend<PageFixtures>({
    stockPage: async ({page}, use) => {
        const stockPage = new StockTradingPage(page);
        await use(stockPage);
    },

    analyticsPage: async ({page}, use) => {
        const analyticsPage = new AnalyticsPage(page);
        await use(analyticsPage);
    }
});

export const strictTest = test.extend({
    page: async ({page}, use) => {
        page.on("pageerror", error => {
            console.log(`Found an error: ${error.name}, ${error.message}`)
            expect.soft(error.name).not.toEqual("Error");
        });

        page.on("response", (response) => {
            expect.soft(response.status(), `Response with status ${response.status()} for URL ${response.url()}`).toBeLessThan(400);
        });

        await  use(page);
    }
});
