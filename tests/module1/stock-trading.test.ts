import { expect, test } from '@playwright/test';
import { StockPage } from '../module2/pages/StockPage.js';

test.describe('Stock trading', () => {
    test('Buying shares updates the cash balance and portfolio', async ({ page }) => {
        const stockPage = new StockPage(page);
        await stockPage.goto();

        await stockPage.selectTicker('MSFT').click();
        const marketPrice = Number(await stockPage.currentPrice().textContent());
        const quantity = 2;

        await stockPage.limitPriceInput().fill(marketPrice.toString());
        await stockPage.quantityInput().fill(quantity.toString());
        await stockPage.buyButton().click();

        const expectedCash = (10_000 - marketPrice * quantity).toFixed(2);

        await expect(
            stockPage.cashBalance(),
            'Cash should decrease by the total value of the purchase',
        ).toHaveText(expectedCash);

        const portfolioRows = stockPage.portfolio().locator('tbody tr');

        await expect(
            portfolioRows,
            'The purchased stock should appear in the portfolio',
        ).toHaveCount(1);

        const stockRow = portfolioRows.first();

        await expect(stockRow.getByRole('cell').nth(0)).toHaveText('MSFT');
        await expect(stockRow.getByRole('cell').nth(1)).toHaveText('2');
    });

    test('Selling part of a position updates its quantity and cash balance', async ({ page }) => {
        const stockPage = new StockPage(page);
        await stockPage.goto();

        await stockPage.selectTicker('MSFT').click();
        const marketPrice = Number(await stockPage.currentPrice().textContent());

        await stockPage.limitPriceInput().fill(marketPrice.toString());
        await stockPage.quantityInput().fill('2');
        await stockPage.buyButton().click();

        await stockPage.selectTicker('MSFT').click();
        await stockPage.limitPriceInput().fill(marketPrice.toString());
        await stockPage.quantityInput().fill('1');
        await stockPage.sellButton().click();

        const expectedCash = (10_000 - marketPrice).toFixed(2);

        await expect(
            stockPage.cashBalance(),
            'Selling one of two shares should return the value of one share to cash',
        ).toHaveText(expectedCash);

        const stockRow = stockPage
            .portfolio()
            .locator('tbody tr')
            .filter({ hasText: 'MSFT' });

        await expect(stockRow).toHaveCount(1);
        await expect(stockRow.getByRole('cell').nth(1)).toHaveText('1');
    });

    test('A fractional quantity is rejected with a validation message', async ({ page }) => {
        const stockPage = new StockPage(page);
        await stockPage.goto();

        await stockPage.selectTicker('MSFT').click();
        await stockPage.quantityInput().fill('1.5');
        await stockPage.buyButton().click();

        await expect(
            stockPage.qtyError(),
            'The form should explain that quantity must be a whole number',
        ).toHaveText('Quantity must be a whole number');
    });
});