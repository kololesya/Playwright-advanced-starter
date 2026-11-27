import { strictTest, test } from '../module2/pages/fixtures/base2.js';

test.describe('two tests', () => {
    test("Test that focuses on the core func", async ({ stockPage }) => {
        await stockPage.goto();
    });

    strictTest("Capture console errors and networks", async ({stockPage}) => {
        await stockPage.goto();
    })
})