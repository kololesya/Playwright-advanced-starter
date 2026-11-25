import type { Page } from '@playwright/test';
import { AnalyticsPage } from './AnalyticsPage.js';
import { StockTradingPage } from './StockTradingPage2.js';

export class PageFactory {
    readonly stockTradingPage: StockTradingPage;
    readonly analyticsPage: AnalyticsPage;

    constructor(page: Page) {
        this.stockTradingPage = new StockTradingPage(page);
        this.analyticsPage = new AnalyticsPage(page);
    }
}