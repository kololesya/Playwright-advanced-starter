import type { Locator, Page } from '@playwright/test';
import { NavigationSection } from './NavigationSection.js';
import type { Order } from './types/Order.js';

export class StockTradingPage {
    readonly page: Page;
    readonly navigation: NavigationSection;

    constructor(page: Page) {
        this.page = page;
        this.navigation = new NavigationSection(page);
    }

    // Locators

    tickerItem(ticker: string): Locator {
        return this.page
            .getByTestId('stock-list')
            .getByRole('listitem')
            .filter({ hasText: ticker });
    }

    currentPrice(): Locator {
        return this.page.getByTestId('stock-price');
    }

    limitPriceInput(): Locator {
        return this.page.getByLabel('Limit Price');
    }

    quantityInput(): Locator {
        return this.page.getByLabel('Quantity');
    }

    orderValueInput(): Locator {
        return this.page.getByLabel('Value');
    }

    buyButton(): Locator {
        return this.page.getByRole('button', { name: 'Buy', exact: true });
    }

    sellButton(): Locator {
        return this.page.getByRole('button', { name: 'Sell', exact: true });
    }

    cashBalance(): Locator {
        return this.page.getByTestId('cash');
    }

    priceError(): Locator {
        return this.page.getByTestId('price-error');
    }

    quantityError(): Locator {
        return this.page.getByTestId('qty-error');
    }

    actionError(): Locator {
        return this.page.getByTestId('action-error');
    }

    portfolioRows(): Locator {
        return this.page
            .getByTestId('portfolio-table')
            .locator('tbody tr');
    }

    // Page methods

    async goto(): Promise<void> {
        await this.page.goto('index.html');
    }

    async selectTicker(ticker: string): Promise<void> {
        await this.tickerItem(ticker).click();
    }

    async getCurrentPrice(): Promise<number> {
        const priceText = await this.currentPrice().innerText();
        const price = Number(priceText);

        if (priceText.trim() === '' || !Number.isFinite(price)) {
            throw new Error(`The stock price is missing or invalid: "${priceText}".`);
        }

        return price;
    }

    async enterPrice(price: string): Promise<void> {
        await this.limitPriceInput().fill(price);
    }

    async enterQuantity(quantity: string): Promise<void> {
        await this.quantityInput().fill(quantity);
    }

    async getOrderValue(): Promise<string> {
        return this.orderValueInput().inputValue();
    }

    async clickBuy(): Promise<void> {
        await this.buyButton().click();
    }

    async clickSell(): Promise<void> {
        await this.sellButton().click();
    }

    async getCashBalance(): Promise<number> {
        const balanceText = await this.cashBalance().innerText();
        const balance = Number(balanceText);

        if (balanceText.trim() === '' || !Number.isFinite(balance)) {
            throw new Error(`The cash balance is missing or invalid: "${balanceText}".`);
        }

        return balance;
    }

    async createOrder(order: Order): Promise<void> {
        await this.enterPrice(String(order.price));
        await this.enterQuantity(String(order.quantity));

        if (order.side === 'Buy') {
            await this.clickBuy();
        } else {
            await this.clickSell();
        }
    }
}