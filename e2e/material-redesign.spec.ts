import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function audit(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    );
  });
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function fixtures(page: Page, role = 'Admin') {
  let savedName = 'کوکی شکلاتی';
  let savedStatus = 'Pending';
  const product = () => ({
    id: 'product-1',
    name: savedName,
    price: 125000,
    description: 'کوکی شکلاتی با شکلات تلخ و کره',
    stockQuantity: 20,
    isAvailable: true,
    isOnSale: false,
    salePrice: null,
    categoryId: 'category-1',
    imageUrl: '/images/hero-cookies.jpg',
    images: [],
  });
  const order = () => ({
    id: 'order-12345678',
    userId: 'user-1',
    status: savedStatus,
    totalAmount: 125000,
    createdAt: '2026-10-24T10:00:00Z',
    updatedAt: '2026-10-24T10:00:00Z',
    note: null,
  });
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = [];
    if (path === '/api/Auth/Csrf') body = { token: 'fixture-csrf' };
    else if (path === '/api/User/Me') body = { id: 'user-1', fullName: 'مدیر ثوری', role };
    else if (path === '/api/Cart') body = { id: 'cart-1', items: [], totalAmount: 0 };
    else if (path === '/api/Category') body = [{ id: 'category-1', name: 'شکلاتی' }];
    else if (path === '/api/Product')
      body = { items: [product()], totalCount: 1, page: 1, pageSize: 12 };
    else if (path === '/api/Product/UpdateByAdmin') {
      expect(route.request().headers()['x-csrf-token']).toBe('fixture-csrf');
      savedName = route.request().postDataJSON().name;
      body = product();
    } else if (path === '/api/Product/product-1')
      body = { ...product(), category: { id: 'category-1', name: 'شکلاتی' } };
    else if (path === '/api/Order/GetAllByAdmin')
      body = { items: [order()], totalCount: 1, page: 1, pageSize: 12 };
    else if (path === '/api/Order') body = [order()];
    else if (path === '/api/Order/GetByIdByAdmin/order-12345678')
      body = {
        ...order(),
        items: [{ productId: 'product-1', productName: savedName, quantity: 1, lineTotal: 125000 }],
        address: {
          addressLine1: 'تهران، خیابان نمونه',
          addressLine2: 'پلاک ۱',
          phoneNumber: '09123456789',
        },
      };
    else if (path === '/api/Order/UpdateStatusByAdmin') {
      expect(route.request().headers()['x-csrf-token']).toBe('fixture-csrf');
      savedStatus = route.request().postDataJSON().status;
      body = order();
    }
    await route.fulfill({ json: body });
  });
}

test('Material storefront routes are accessible and responsive', async ({ page }) => {
  await fixtures(page, 'Customer');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of [
    '/',
    '/shop',
    '/shop/product-1',
    '/about',
    '/account',
    '/cart',
    '/checkout',
    '/orders',
    '/missing-page',
  ]) {
    await page.goto(path);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('mat-icon:not(:has(svg))')).toHaveCount(0);
    await audit(page);
  }
  await page.goto('/');
  await expect(page.locator('sori-cookie-card')).toHaveCount(1);
  await page.screenshot({
    path: `test-results/material-home-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test('admin navigation, product editing, and order updates', async ({ page }) => {
  await fixtures(page);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'نمای کلی', exact: true })).toBeVisible();
  await expect(page.getByText('سفارش order-12')).toBeVisible();
  await audit(page);
  await page.screenshot({
    path: `test-results/material-admin-${test.info().project.name}.png`,
    fullPage: true,
  });
  if (test.info().project.name === 'mobile') {
    await page.getByRole('button', { name: 'باز کردن منوی مدیریت' }).click();
    await expect(page.getByRole('navigation', { name: 'منوی مدیریت' })).toBeVisible();
    await audit(page);
  }
  await page
    .getByRole('navigation', { name: 'منوی مدیریت' })
    .getByRole('link', { name: 'محصولات', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'محصولات', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'ویرایش کوکی شکلاتی', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await audit(page);
  await page.getByLabel('نام محصول', { exact: true }).fill('کوکی شکلات تلخ');
  await page.getByRole('button', { name: 'ذخیره محصول', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'کوکی شکلات تلخ', exact: true })).toBeVisible();
  await page.goto('/admin?view=orders');
  await page.getByRole('button', { name: 'جزئیات سفارش order-12' }).click();
  await expect(page.getByText('تهران، خیابان نمونه پلاک ۱')).toBeVisible();
  await audit(page);
  await page.getByRole('combobox', { name: 'وضعیت سفارش', exact: true }).click();
  await page.getByRole('option', { name: 'پرداخت‌شده', exact: true }).click();
  await page.getByRole('button', { name: 'ذخیره وضعیت' }).click();
  await expect(page.locator('mat-chip').filter({ hasText: 'پرداخت‌شده' })).toBeVisible();
  await page.goto('/admin?view=categories');
  await expect(page.getByRole('heading', { name: 'شکلاتی', exact: true })).toBeVisible();
  await audit(page);
});

test('admin denies customer access and handles API failure', async ({ page }) => {
  await fixtures(page, 'Customer');
  let adminRequests = 0;
  page.on('request', (req) => {
    if (req.url().includes('ByAdmin')) adminRequests++;
  });
  await page.goto('/admin');
  await expect(page.getByText('این بخش فقط برای مدیر فروشگاه در دسترس است.')).toBeVisible();
  expect(adminRequests).toBe(0);
  await audit(page);
  await page.unrouteAll();
  await fixtures(page);
  await page.route('**/api/Order/GetAllByAdmin**', (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.reload();
  await expect(page.getByRole('heading', { name: 'دریافت اطلاعات ممکن نشد' })).toBeVisible();
  await audit(page);
  await page.unroute('**/api/Order/GetAllByAdmin**');
  await page.getByRole('button', { name: 'تلاش دوباره' }).click();
  await expect(page.getByText('سفارش order-12')).toBeVisible();
});

test('small screens, landscape, and reduced motion', async ({ page }) => {
  await fixtures(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 375, 768, 1024]) {
    await page.setViewportSize({ width, height: width === 768 ? 390 : 844 });
    for (const path of ['/', '/admin', '/admin?view=products']) {
      await page.goto(path);
      await expect(page.locator('main h1').first()).toBeVisible();
      await expect(page.locator('mat-spinner')).toHaveCount(0);
      await audit(page);
    }
  }
});
