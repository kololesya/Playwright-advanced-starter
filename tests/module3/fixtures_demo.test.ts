import { test, expect } from '../module2/pages/fixtures/base.js';

test('Stock page fixture provides the StockTradingPage object', async ({ stockPage }) => {
    await stockPage.goto();
    await stockPage.selectTicker('MSFT');

    await expect(stockPage.currentPrice()).toBeVisible();
});

test('Analytics page fixture provides the AnalyticsPage object', async ({ analyticsPage }) => {

    await analyticsPage.open();
});