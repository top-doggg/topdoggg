import { test, expect } from '@playwright/test';

const mainRoutes = [
  ['/', /Art, memory, place/i],
  ['/shop', /Art from the block/i],
  ['/work', /Work that keeps a record/i],
  ['/process', /process|work|portfolio/i],
  ['/about', /Jorge S\. Ruiz/i],
  ['/journal', /The archive while it is still happening/i],
  ['/partners', /Back the story/i],
  ['/open-thread', /Every place leaves a mark/i],
  ['/fulfillment-policy', /shipping|returns|fulfillment/i],
];

for (const [route, title] of mainRoutes) {
  test(`public route ${route} hydrates without JavaScript errors`, async ({ page }) => {
    const jsErrors = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response.status(), `HTTP response for ${route}`).toBe(200);
    await expect(page.locator('main').first()).toBeVisible();
    await expect(page.locator('h1').first()).toContainText(title);
    expect(jsErrors).toEqual([]);
  });
}

test('homepage Explore the work preserves real navigation rather than only its appearance', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: /explore the work/i }).first();
  await expect(link).toHaveAttribute('href', '/work');
  await link.click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.getByRole('heading', { name: /Work that keeps a record/i })).toBeVisible();
});

test('mobile menu opens, exposes navigation and closes after route selection', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.locator('.site-shell-menu');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: /primary navigation/i }).getByRole('link', { name: /^shop$/i })).toBeVisible();
  await page.getByRole('navigation', { name: /primary navigation/i }).getByRole('link', { name: /^shop$/i }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('skip link moves focus to the primary content anchor', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.locator('.site-shell-skip');
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute('href', '#home-main');
  await skip.press('Enter');
  await expect(page).toHaveURL(/#home-main$/);
});

test('shop product quick view switches front/back, changes size and dismisses with Escape', async ({ page }) => {
  await page.goto('/shop');
  const open = page.getByRole('button', { name: /View De Los Cielos Tee/i });
  await expect(open).toBeVisible();
  await open.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const image = dialog.locator('.product-gallery > img').first();
  await dialog.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(image).toHaveAttribute('alt', /back view/i);
  await dialog.getByRole('button', { name: 'Front', exact: true }).click();
  await expect(image).toHaveAttribute('alt', /front view/i);
  await dialog.locator('.size-picker').getByRole('button', { name: 'XL', exact: true }).click();
  await expect(dialog.locator('.size-picker button.active')).toContainText('XL');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('product detail retains Printify outbound link and fulfillment link', async ({ page }) => {
  await page.goto('/shop/de-los-cielos');
  await expect(page.getByRole('heading', { name: /De Los Cielos Tee/i })).toBeVisible();
  const store = page.getByRole('link', { name: /View in secure store/i });
  await expect(store).toHaveAttribute('href', /https:\/\//);
  await expect(store).toHaveAttribute('target', '_blank');
  await expect(page.getByRole('link', { name: /Shipping & returns policy/i })).toHaveAttribute('href', '/fulfillment-policy');
});

test('deep work, journal and community routes resolve in React', async ({ page }) => {
  for (const route of [
    '/work/west-of-the-tracks',
    '/journal/coming-back-home',
    '/open-thread/santa-ana',
    '/open-thread/san-juan-capistrano',
  ]) {
    const response = await page.goto(route);
    expect(response.status(), route).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('main').first()).toBeVisible();
  }
});

test('home dispatch subscribe sends correct payload (mocked; no real subscriber created)', async ({ page }) => {
  let data;
  await page.route('**/api/subscribe', async route => {
    if (route.request().method() === 'POST') {
      data = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });
  await page.goto('/');
  const form = page.locator('.cover-dispatch form');
  await form.locator('input[type="email"]').fill('browser-review@example.test');
  await form.getByRole('button', { name: /Join Dispatch/i }).click();
  await expect(form.getByRole('status')).toContainText(/on the list/i);
  expect(data?.email).toBe('browser-review@example.test');
  expect(data?.source).toBe('home-cover');
});

test('mobile public routes avoid document horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 340, height: 740 });
  for (const route of ['/', '/shop', '/work', '/process', '/about', '/partners', '/open-thread']) {
    await page.goto(route);
    await expect(page.locator('main').first()).toBeVisible();
    const metrics = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(metrics.content, `${route} overflow: ${JSON.stringify(metrics)}`).toBeLessThanOrEqual(metrics.viewport + 1);
  }
});
