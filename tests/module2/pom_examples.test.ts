import { expect, test } from '@playwright/test';
import type { Order } from './pages/types/Order.js';
import { PageFactory } from './pages/Pages.js';

test('POM Level 1 - An order exceeding the cash balance is rejected', async ({ page }) => {
    const { stockTradingPage } = new PageFactory(page);

    await stockTradingPage.goto();
    await stockTradingPage.tickerItem('MSFT').click();

    const marketPrice = Number(await stockTradingPage.currentPrice().textContent());
    const cashBalance = Number(await stockTradingPage.cashBalance().textContent());
    const quantityOverBudget = Math.floor(cashBalance / marketPrice) + 1;

    await stockTradingPage.limitPriceInput().fill(marketPrice.toString());
    await stockTradingPage.quantityInput().fill(quantityOverBudget.toString());
    await stockTradingPage.buyButton().click();

    await expect(
        stockTradingPage.actionError(),
        'The app should reject an order that costs more than the available cash',
    ).toHaveText('Insufficient cash');

    await expect(stockTradingPage.cashBalance()).toHaveText(cashBalance.toFixed(2));
    await expect(stockTradingPage.portfolioRows()).toHaveCount(0);
});

test('POM Level 2 - An order exceeding the cash balance is rejected', async ({ page }) => {
    const { stockTradingPage } = new PageFactory(page);

    await stockTradingPage.goto();
    await stockTradingPage.selectTicker('MSFT');

    const marketPrice = await stockTradingPage.getCurrentPrice();
    const cashBalance = await stockTradingPage.getCashBalance();
    const quantityOverBudget = Math.floor(cashBalance / marketPrice) + 1;

    const order: Order = {
        price: marketPrice.toString(),
        quantity: quantityOverBudget.toString(),
        side: 'Buy',
    };

    await stockTradingPage.createOrder(order);

    await expect(
        stockTradingPage.actionError(),
        'The app should reject a buy order that exceeds the cash balance',
    ).toHaveText('Insufficient cash');

    expect(await stockTradingPage.getCashBalance()).toBe(cashBalance);
    await expect(stockTradingPage.portfolioRows()).toHaveCount(0);
});

test('Navigation opens Analytics and returns to Trade', async ({ page }) => {
    const { stockTradingPage, analyticsPage } = new PageFactory(page);

    await stockTradingPage.goto();
    await stockTradingPage.navigation.clickAnalyticsLink();

    expect(await analyticsPage.getHeadingText()).toBe('Portfolio');

    await analyticsPage.navigation.clickTradeLink();
    await expect(stockTradingPage.tickerItem('MSFT')).toBeVisible();
});

test('Order value is recalculated when price and quantity are entered', async ({ page }) => {
    const { stockTradingPage } = new PageFactory(page);

    await stockTradingPage.goto();
    await stockTradingPage.selectTicker('MSFT');
    await stockTradingPage.enterPrice('100');
    await stockTradingPage.enterQuantity('2');

    expect(Number(await stockTradingPage.getOrderValue())).toBe(200);
});

test('A successful buy updates the cash balance and portfolio', async ({ page }) => {
    const { stockTradingPage } = new PageFactory(page);

    await stockTradingPage.goto();
    await stockTradingPage.selectTicker('MSFT');

    const marketPrice = await stockTradingPage.getCurrentPrice();
    const cashBalanceBefore = await stockTradingPage.getCashBalance();

    const order: Order = {
        price: marketPrice.toString(),
        quantity: '1',
        side: 'Buy',
    };

    await stockTradingPage.createOrder(order);

    expect(await stockTradingPage.getCashBalance())
        .toBeCloseTo(cashBalanceBefore - marketPrice, 2);
    await expect(stockTradingPage.portfolioRows()).toHaveCount(1);
});

test('Buying without a quantity displays a validation message', async ({ page }) => {
    const { stockTradingPage } = new PageFactory(page);

    await stockTradingPage.goto();
    await stockTradingPage.selectTicker('MSFT');

    const marketPrice = await stockTradingPage.getCurrentPrice();
    await stockTradingPage.enterPrice(marketPrice.toString());
    await stockTradingPage.clickBuy();

    await expect(stockTradingPage.quantityError()).toBeVisible();
});

test('An order with a price below the allowed range is rejected', async ({ page }) => {
    const { stockTradingPage } = new PageFactory(page);

    await stockTradingPage.goto();
    await stockTradingPage.selectTicker('MSFT');

    const marketPrice = await stockTradingPage.getCurrentPrice();
    const cashBalanceBefore = await stockTradingPage.getCashBalance();

    const order: Order = {
        price: Math.floor(marketPrice / 2).toString(),
        quantity: '1',
        side: 'Buy',
    };

    await stockTradingPage.createOrder(order);

    await expect(stockTradingPage.priceError()).toBeVisible();
    expect(await stockTradingPage.getCashBalance()).toBe(cashBalanceBefore);
    await expect(stockTradingPage.portfolioRows()).toHaveCount(0);
});