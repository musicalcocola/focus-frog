import { test, expect } from '@playwright/test';

async function start(page, goal = 'Read a page') {
  await page.getByLabel('One tiny goal').fill(goal);
  await page.getByRole('button', { name: 'Let’s start' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'I’m ready' }).click();
}
async function shared(page) { return page.evaluate(() => JSON.parse(localStorage.getItem('focus-frog.session.v1'))); }

test('other tab start is visible and resume preserves deadline, goal, and returns', async ({ page, context }) => {
  await page.goto('/');
  const second = await context.newPage();
  await second.goto('/');
  await start(page);
  await expect(second.getByRole('heading', { name: 'Another tab updated your session.' })).toBeVisible();
  await page.getByRole('button', { name: 'I wandered off' }).click();
  await page.getByRole('button', { name: 'Back to it' }).click();
  await expect.poll(async () => (await shared(page)).returns).toBe(1);
  const first = await shared(page);
  await second.getByRole('button', { name: 'Resume shared session' }).click();
  await expect(second.getByRole('timer')).toBeVisible();
  expect((await shared(second)).endAt).toBe(first.endAt);
  await second.getByRole('button', { name: 'Finish session', exact: true }).click();
  await expect(second.locator('.stats')).toContainText('1');
  await expect(page.getByRole('heading', { name: 'Another tab updated your session.' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume shared session' }).click();
  await expect(page.getByRole('heading', { name: 'A little time, well spent.' })).toBeVisible();
});

test('keeping a local session never overwrites shared progress, including after reload', async ({ page, context }) => {
  await page.goto('/');
  await start(page, 'First goal');
  await expect.poll(async () => (await shared(page))?.goal).toBe('First goal');
  const second = await context.newPage();
  await second.goto('/');
  await page.getByRole('button', { name: 'Finish session', exact: true }).click();
  await expect(second.getByRole('heading', { name: 'Another tab updated your session.' })).toBeVisible();
  await second.getByRole('button', { name: 'Keep this tab’s session' }).click();
  await second.getByRole('button', { name: 'I wandered off' }).click();
  await second.getByRole('button', { name: 'Back to it' }).click();
  await second.reload();
  await expect(second.getByRole('timer')).toBeVisible();
  await expect(second.getByText(/This tab has its own session/)).toBeVisible();
  await second.getByRole('button', { name: 'Finish session', exact: true }).click();
  await expect(second.locator('.stats')).toContainText('1');
  expect((await shared(second)).stage).toBe('complete');
  expect((await shared(second)).returns).toBe(0);
  await second.getByRole('button', { name: 'Resume shared session' }).click();
  await expect(second.locator('.stats')).toContainText('0');
});

test('concurrent changes are serialized and stale tab must choose instead of overwriting', async ({ page, context }) => {
  await page.goto('/');
  await start(page);
  await expect.poll(async () => (await shared(page))?.stage).toBe('desk');
  const second = await context.newPage();
  await second.goto('/');
  // Trigger both React actions in the same browser turn; Web Locks serialize writes.
  await Promise.all([page, second].map(tab => tab.evaluate(() => {
    [...document.querySelectorAll('button')].find(button => button.textContent === 'Finish session').click();
  })));
  await expect.poll(async () => (await shared(page)).stage).toBe('complete');
  await expect.poll(async () => (await page.getByRole('heading', { name: 'Another tab updated your session.' }).count()) + (await second.getByRole('heading', { name: 'Another tab updated your session.' }).count())).toBe(1);
});

test('extensions propagate through an explicit choice without resetting the deadline', async ({ page, context }) => {
  await page.addInitScript(() => localStorage.setItem('focus-frog.session.v1', JSON.stringify({ version: 1, stage: 'timesup', goal: 'Continue reading', startedAt: 0, endAt: 300000, durationMs: 300000, returns: 2, wandering: false })));
  await page.goto('/');
  const second = await context.newPage();
  await second.goto('/');
  await page.getByRole('button', { name: '+ 10 minutes', exact: true }).click();
  await expect(second.getByRole('heading', { name: 'Another tab updated your session.' })).toBeVisible();
  const saved = await shared(page);
  await second.getByRole('button', { name: 'Switch to Simplified Chinese' }).click();
  await second.getByRole('button', { name: '恢复共享进度' }).click();
  await expect(second.getByRole('timer')).toBeVisible();
  expect((await shared(second)).endAt).toBe(saved.endAt);
  expect((await shared(second)).durationMs).toBe(900000);
  expect((await shared(second)).returns).toBe(2);
});

test('without Web Locks each tab uses isolated storage instead of unsafe shared writes', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'locks', { value: undefined }));
  await page.goto('/');
  await expect(page.getByText(/Session sharing is unavailable/)).toBeVisible();
  await start(page, 'Separate session');
  expect(await shared(page)).toBeNull();
  await page.reload();
  await expect(page.getByRole('timer')).toBeVisible();
  await expect(page.getByText('Separate session', { exact: true })).toBeVisible();
});
