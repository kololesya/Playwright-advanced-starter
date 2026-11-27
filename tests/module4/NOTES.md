# Module 4 — Avoiding common anti-patterns

Each test file has a `BAD:` and a `GOOD:` version of the same idea.
`test.fail(...)` marks a test that is **expected** to fail: it demonstrates the anti-pattern and keeps the suite green.

| Lecture | Anti-pattern (BAD) | Fix (GOOD) | File |
|---|---|---|---|
| Remember awaits | `expect(locator).toHaveText(...)` without `await` | `await expect(...)` | `01_awaits.test.ts` |
| | `array.forEach(async ...)`: **false green**, checks nothing | `for (const x of array) { await ... }` | |
| Use better locators | `.btn-success`, `li:nth-child(1)`, `//div/div[1]/input` | `getByRole` > `getByLabel`/`getByText` > `getByTestId` | `02_locators.test.ts` |
| Avoid bad waiting | `expect(await locator.textContent()).toBe(...)` | `await expect(locator).toHaveText(...)` | `03_waiting.test.ts` |
| | `expect(await locator.isVisible()).toBe(true)` | `await expect(locator).toBeVisible()` | |
| | `page.waitForTimeout(2000)` | web-first assertion, or `expect.poll(() => ...)` for non-locator values | |
| Waiting for hydration | click right after `goto`, before JS attached handlers: the click is lost | wait for an app-ready signal, or `expect(async () => { click; check }).toPass()` | `04_hydration.test.ts` |

## Rules to remember

1. **`await` before every Playwright call.** No `await` means the step may never run. Tooling: `@typescript-eslint/no-floating-promises` (Biome does not catch this case).
2. **Assert on the locator, not on a value you read.** `await expect(locator).toX()` retries; `expect(await locator.x())` checks once.
3. **No sleeps.** `waitForTimeout` is always too long locally and sometimes too short on CI.
4. **Locators describe what the user sees**, not how the DOM is built.
5. **Visible ≠ ready.** On SPAs, the HTML appears before the JS that makes it work.

## How hydration is simulated here

The demo app is plain jQuery and hydrates instantly. `helpers/slowHydration.ts` intercepts `app.js` with `page.route` and wraps it in `setTimeout(..., 1500)`, so the page loads but handlers attach 1.5 s later, like a slow SPA.

## Self-check

1. Why does `forEach(async ...)` give a green test instead of a red one?
2. What is the difference between `isVisible()` and `toBeVisible()`?
3. In `04_hydration`, why can't Playwright's auto-waiting save the BAD test?
4. When would you use `expect.poll` instead of `expect(locator)`?
