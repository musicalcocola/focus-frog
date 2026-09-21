import { test, expect } from '@playwright/test';

test('full English flow: setup, distraction, reload, expiry, extension, finish', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.getByLabel('One tiny goal').fill('Read a page');
  await page.getByRole('button', { name: 'Let’s start' }).click();
  await expect(page.getByRole('button', { name: 'I’m ready' })).toBeDisabled();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'I’m ready' }).click();
  await expect(page.getByRole('timer')).toHaveText('05:00');
  await page.getByRole('button', { name: 'I wandered off' }).click();
  await expect(page.getByRole('dialog')).toContainText('Read a page');
  await page.getByRole('button', { name: 'Back to it' }).click();
  await page.clock.fastForward(61000);
  await expect(page.getByRole('timer')).toHaveText('03:59');
  await page.reload();
  await expect(page.getByRole('timer')).toHaveText('03:59');
  await page.clock.fastForward(240000);
  await expect(page.getByRole('heading', { name: 'Look at you. You started.' })).toBeVisible();
  await page.clock.fastForward(120000);
  await page.getByRole('button', { name: '+ 5 minutes', exact: true }).click();
  await expect(page.getByRole('timer')).toHaveText('05:00');
  await page.clock.fastForward(300000);
  await page.getByRole('button', { name: 'I’m done for now' }).click();
  await expect(page.locator('.stats')).toContainText('10:00');
  await expect(page.locator('.stats')).toContainText('1');
  await page.getByRole('button', { name: 'Another small start' }).click();
  await expect(page.getByRole('button', { name: 'Let’s start' })).toBeVisible();
});

test('Chinese interface persists and allows empty goal', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to Simplified Chinese' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await page.getByRole('radio', { name: '10 分钟', exact: true }).check();
  await page.getByRole('button', { name: '开始吧' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: '我准备好了' }).click();
  await expect(page.getByRole('timer')).toHaveText('10:00');
  await page.getByRole('button', { name: '我刚才走神了' }).click();
  await page.getByRole('button', { name: '继续这一小步' }).click();
  await page.getByRole('button', { name: '结束本次专注' }).click();
  await expect(page.getByRole('heading', { name: '小小的时间，也有意义。' })).toBeVisible();
});

test('storage unavailable still permits a session', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } }); });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Browser storage is unavailable');
  await page.getByRole('button', { name: 'Let’s start' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'I’m ready' }).click();
  await expect(page.getByRole('timer')).toBeVisible();
});

test('expired saved session opens time-up screen', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('focus-frog.session.v1', JSON.stringify({ version: 1, stage: 'desk', goal: '', startedAt: 0, endAt: 300000, durationMs: 300000, returns: 0, wandering: false })));
  await page.goto('/');
  await expect(page.getByRole('button', { name: '+ 10 minutes' })).toBeVisible();
});

test('recovery dialog keeps keyboard focus inside and returns it on close', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s start' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'I’m ready' }).click();
  await page.getByRole('button', { name: 'I wandered off' }).click();
  await expect(page.getByRole('button', { name: 'Back to it' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Back to it' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'One thing at a time.' })).toBeFocused();
});

test('unsupported fullscreen shows a localized fallback without interrupting timer', async ({ page }) => {
  await page.addInitScript(() => { Element.prototype.requestFullscreen = undefined; });
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s start' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'I’m ready' }).click();
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Full screen isn’t available');
  await expect(page.getByRole('timer')).toBeVisible();
});

for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['landscape', 844, 390]]) {
  test(`${name}: no horizontal overflow in either language, home or desk`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    for (const language of ['en', 'zh']) {
      if (language === 'zh') await page.getByRole('button', { name: 'Switch to Simplified Chinese' }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.screenshot({ path: `test-results/${name}-home.png`, fullPage: true });
    await page.getByRole('button', { name: '开始吧' }).click();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: '我准备好了' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/${name}-desk.png`, fullPage: true });
  });
}
