import { test, expect } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

async function ready(page) {
  await page.goto('./');
  await expect(page.getByText('Ready for offline use.', { exact: true })).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })); });
}
async function start(page) {
  await page.getByRole('button', { name: 'Let’s start' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'I’m ready' }).click();
}
async function newVersion(page, name) {
  const original = await readFile('dist/sw.js', 'utf8');
  await writeFile('dist/sw.js', original.replace(/const VERSION = "[^"]+";/, `const VERSION = "test-${name}";`));
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration.update(); });
  await expect(page.getByText('A new version is ready.', { exact: false })).toBeVisible();
  return original;
}

test('production app reloads offline with language and running session preserved', async ({ page, context }) => {
  await ready(page);
  await page.getByLabel('One tiny goal').fill('Offline reading');
  await start(page);
  await page.getByRole('button', { name: 'Switch to Simplified Chinese' }).click();
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('focus-frog.session.v1')));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('timer')).toBeVisible();
  await expect(page.getByText('Offline reading', { exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByText(/你已离线/)).toBeVisible();
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('focus-frog.session.v1')));
  expect(after.endAt).toBe(before.endAt);
  await page.getByRole('button', { name: '结束本次专注' }).click();
  await expect(page.getByRole('heading', { name: '小小的时间，也有意义。' })).toBeVisible();
});

test('waiting update does not reload an active session and applies explicitly after finish', async ({ page }) => {
  await ready(page);
  await start(page);
  const original = await newVersion(page, 'deferred');
  try {
    await expect(page.getByRole('button', { name: 'Update and reload' })).toBeDisabled();
    await expect(page.getByRole('timer')).toBeVisible();
    await page.getByRole('button', { name: 'Finish session', exact: true }).click();
    await page.getByRole('button', { name: 'Update and reload' }).click();
    await expect(page.getByRole('heading', { name: 'A little time, well spent.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Update and reload' })).toHaveCount(0);
    await expect.poll(() => page.evaluate(async () => (await caches.keys()).some(key => key.endsWith('test-deferred')))).toBe(true);
  } finally { await writeFile('dist/sw.js', original); }
});

test('update checks other open tabs before activation', async ({ page, context }) => {
  await ready(page);
  const second = await context.newPage();
  await second.goto('./');
  await start(second);
  const original = await newVersion(page, 'other-tab');
  try {
    await page.getByRole('button', { name: 'Update and reload' }).click();
    await expect(page.getByText(/Another tab is focusing/)).toBeVisible();
    await expect(second.getByRole('timer')).toBeVisible();
    await second.getByRole('button', { name: 'Finish session', exact: true }).click();
    await page.getByRole('button', { name: 'Update and reload' }).click();
    await expect(page.getByRole('button', { name: 'Update and reload' })).toHaveCount(0);
  } finally { await writeFile('dist/sw.js', original); }
});
