import type { Locator, Page } from '@playwright/test';
import { NavigationSection } from './NavigationSection.js';

export class AnalyticsPage {
    readonly page: Page;
    readonly navigation: NavigationSection;

    constructor(page: Page) {
        this.page = page;
        this.navigation = new NavigationSection(page);
    }

    // Locators

    portfolioHeading(): Locator {
        return this.page.getByRole('heading', {
            name: 'Portfolio',
            exact: true,
        });
    }

    // Page methods

    async open(): Promise<void> {
        await this.page.goto('index.html');
        await this.navigation.clickAnalyticsLink();
    }

    async getHeadingText(): Promise<string> {
        const heading = this.portfolioHeading();
        await heading.waitFor({ state: 'visible' });
        return (await heading.innerText()).trim();
    }
}