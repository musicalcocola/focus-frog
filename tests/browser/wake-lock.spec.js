import { test, expect } from '@playwright/test';

async function start(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s start' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'I’m ready' }).click();
}
async function mock(page, mode = 'success') {
  await page.addInitScript(mode => {
    window.wakeRequests = 0;
    window.wakeReleases = 0;
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: mode === 'missing' ? undefined : {
      async request() {
        window.wakeRequests++;
        if (mode === 'rejected') throw new Error('Not allowed');
        if (mode === 'pending') await new Promise(resolve => { window.resolveWake = resolve; });
        const lock = new EventTarget();
        lock.released = false;
        lock.release = async () => { if (lock.released) return; lock.released = true; window.wakeReleases++; lock.dispatchEvent(new Event('release')); };
        window.currentWake = lock;
        return lock;
      },
    } });
  }, mode);
}

test('wake lock is opt-in, releases on finish, and does not persist into a new session', async ({ page }) => {
  await mock(page);
  await start(page);
  expect(await page.evaluate(() => window.wakeRequests)).toBe(0);
  await page.getByRole('button', { name: 'Keep screen awake' }).click();
  await expect(page.getByText('Screen wake lock is on.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Finish session', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.wakeReleases)).toBe(1);
  await page.getByRole('button', { name: 'Another small start' }).click();
  await page.getByRole('button', { name: 'Let’s start' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'I’m ready' }).click();
  await expect(page.getByRole('button', { name: 'Keep screen awake' })).toHaveAttribute('aria-pressed', 'false');
});

test('visibility return reacquires opted-in lock; timeout releases it', async ({ page }) => {
  await page.clock.install();
  await mock(page);
  await start(page);
  await page.getByRole('button', { name: 'Keep screen awake' }).click();
  await expect.poll(() => page.evaluate(() => window.wakeRequests)).toBe(1);
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(() => page.evaluate(() => window.wakeReleases)).toBe(1);
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(() => page.evaluate(() => window.wakeRequests)).toBe(2);
  await page.clock.fastForward(300001);
  await expect(page.getByRole('heading', { name: 'Look at you. You started.' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.wakeReleases)).toBe(2);
});

for (const mode of ['missing', 'rejected']) test(`${mode} API has a bilingual fallback without blocking the timer`, async ({ page }) => {
  await mock(page, mode);
  await start(page);
  if (mode === 'rejected') await page.getByRole('button', { name: 'Keep screen awake' }).click();
  else await expect(page.getByRole('button', { name: 'Keep screen awake' })).toBeDisabled();
  await expect(page.getByText(mode === 'missing' ? /not supported in this browser/ : /device declined/)).toBeVisible();
  await page.getByRole('button', { name: 'Switch to Simplified Chinese' }).click();
  await expect(page.getByText(mode === 'missing' ? /此浏览器不支持屏幕常亮/ : /设备未允许屏幕常亮/)).toBeVisible();
  await expect(page.getByRole('timer')).toBeVisible();
});

test('pending request is released if session finishes before acquisition', async ({ page }) => {
  await mock(page, 'pending');
  await start(page);
  await page.getByRole('button', { name: 'Keep screen awake' }).click();
  await expect.poll(() => page.evaluate(() => window.wakeRequests)).toBe(1);
  await page.getByRole('button', { name: 'Finish session', exact: true }).click();
  await page.evaluate(() => window.resolveWake());
  await expect.poll(() => page.evaluate(() => window.wakeReleases)).toBe(1);
});
