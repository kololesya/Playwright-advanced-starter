import { expect, test } from '@playwright/test';
import { PageFactory } from '../module2/pages/Pages.js';

test.describe('Stock trading', () => {
    test('Buying shares updates the cash balance and portfolio', async ({ page }) => {
        const { stockTradingPage } = new PageFactory(page);
        await stockTradingPage.goto();

        await stockTradingPage.selectTicker('MSFT');
        const marketPrice = await stockTradingPage.getCurrentPrice();
        const quantity = 2;

        await stockTradingPage.enterPrice(marketPrice.toString());
        await stockTradingPage.enterQuantity(quantity.toString());
        await stockTradingPage.clickBuy();

        const expectedCash = (10_000 - marketPrice * quantity).toFixed(2);

        await expect(
            stockTradingPage.cashBalance(),
            'Cash should decrease by the total value of the purchase',
        ).toHaveText(expectedCash);

        const portfolioRows = stockTradingPage.portfolioRows();

        await expect(
            portfolioRows,
            'The purchased stock should appear in the portfolio',
        ).toHaveCount(1);

        const stockRow = portfolioRows.first();

        await expect(stockRow.getByRole('cell').nth(0)).toHaveText('MSFT');
        await expect(stockRow.getByRole('cell').nth(1)).toHaveText('2');
    });

    test('Selling part of a position updates its quantity and cash balance', async ({ page }) => {
        const { stockTradingPage } = new PageFactory(page);
        await stockTradingPage.goto();

        await stockTradingPage.selectTicker('MSFT');
        const marketPrice = await stockTradingPage.getCurrentPrice();

        await stockTradingPage.enterPrice(marketPrice.toString());
        await stockTradingPage.enterQuantity('2');
        await stockTradingPage.clickBuy();

        await stockTradingPage.selectTicker('MSFT');
        await stockTradingPage.enterPrice(marketPrice.toString());
        await stockTradingPage.enterQuantity('1');
        await stockTradingPage.clickSell();

        const expectedCash = (10_000 - marketPrice).toFixed(2);

        await expect(
            stockTradingPage.cashBalance(),
            'Selling one of two shares should return the value of one share to cash',
        ).toHaveText(expectedCash);

        const stockRow = stockTradingPage.portfolioRows().filter({ hasText: 'MSFT' });

        await expect(stockRow).toHaveCount(1);
        await expect(stockRow.getByRole('cell').nth(1)).toHaveText('1');
    });

    test('A fractional quantity is rejected with a validation message', async ({ page }) => {
        const { stockTradingPage } = new PageFactory(page);
        await stockTradingPage.goto();

        await stockTradingPage.selectTicker('MSFT');
        await stockTradingPage.enterQuantity('1.5');
        await stockTradingPage.clickBuy();

        await expect(
            stockTradingPage.quantityError(),
            'The form should explain that quantity must be a whole number',
        ).toHaveText('Quantity must be a whole number');
    });
});
