import { test as base, expect } from '@playwright/test';
import { StockTradingPage } from '../StockTradingPage2.js';
import { AnalyticsPage } from '../AnalyticsPage.js';

export type PageFixtures = {
    stockPage: StockTradingPage;
    analyticsPage: AnalyticsPage;
};

export type ConfigOptions = {
    failOnJSError: boolean;
    failOnNetworkError: boolean;
};

const test = base.extend<PageFixtures & ConfigOptions>({
    stockPage: async ({ page }, use) => {
        const stockPage = new StockTradingPage(page);

        console.log('do stuff before');
        await use(stockPage);
        console.log('do stuff after');
    },

    analyticsPage: async ({ page }, use) => {
        const analyticsPage = new AnalyticsPage(page);
        await use(analyticsPage);
    },

    failOnJSError: [true, { option: true }],
    failOnNetworkError: [true, {
        option : true,
        timeout: 5000,
        title: 'as seen in reports and elsewhere',
        box: 'self'
    }],

    page: async ({page, failOnJSError, failOnNetworkError}, use) => {
       const errors: Array<Error> = [];
       page.on("pageerror", error => {
           errors.push(error);
       });

       if(failOnNetworkError) {
           page.on("response", response => {
               expect.soft(response.status(),
                   `Response with status ${response.status()} for URL: ${response.url()}`).toBeLessThan(400);
           })
       }
        await use(page);

        if(failOnJSError) {
            expect(errors).toHaveLength(0);
        }

    }
});

export { test, expect };