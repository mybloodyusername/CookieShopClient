import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function accessible(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.locator('.mat-mdc-snack-bar-container [aria-hidden="true"] button'),
  ).toHaveCount(0);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

test('live storefront, categories, product galleries, and all public routes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('sori-cookie-card')).toHaveCount(4);
  await expect(page.locator('mat-icon:not(:has(svg))')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await accessible(page);
  await page.screenshot({
    path: `test-results/home-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.goto('/shop');
  await expect(page.locator('sori-cookie-card')).toHaveCount(12);
  await accessible(page);
  await page.locator('sori-cookie-card h3 a').first().click();
  await expect(page.locator('.product-detail')).toBeVisible();
  await expect(page.locator('.gallery button')).toHaveCount(2);
  await page.locator('.gallery button').last().click();
  await accessible(page);
  for (const path of ['/account', '/cart', '/checkout', '/orders', '/about', '/missing-page']) {
    await page.goto(path);
    await expect(page.locator('main h1, main h2').first()).toBeVisible();
    await accessible(page);
  }
  expect(errors).toEqual([]);
});

test('search, pagination, filter, empty results and failure retry', async ({ page }) => {
  await page.goto('/shop');
  await expect(page.locator('sori-cookie-card')).toHaveCount(12);
  await page.getByRole('button', { name: 'صفحه بعد', exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator('sori-cookie-card')).toHaveCount(11);
  await page.getByLabel('جست‌وجوی کوکی').fill('براونی');
  await page.getByRole('button', { name: 'جست‌وجو', exact: true }).click();
  await expect(page.locator('sori-cookie-card')).toHaveCount(2);
  await page.getByLabel('جست‌وجوی کوکی').fill('ناموجودغیرواقعی');
  await page.getByRole('button', { name: 'جست‌وجو', exact: true }).click();
  await expect(page.getByText('هنوز کوکی‌ای با این مشخصات نداریم.')).toBeVisible();
  await page.route('**/api/Product?*', (r) => r.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/shop');
  await expect(page.getByRole('heading', { name: 'دریافت محصولات ممکن نشد' })).toBeVisible();
  await accessible(page);
  await page.unroute('**/api/Product?*');
  await page.getByRole('button', { name: 'تلاش دوباره' }).click();
  await expect(page.locator('sori-cookie-card')).toHaveCount(12);
});

test('authenticated cart refresh, CSRF, address, checkout, and cancellation', async ({ page }) => {
  const product = {
    id: 'product-1',
    name: 'کوکی شکلاتی تست',
    description: 'توضیحات محصول',
    price: 125000,
    isOnSale: false,
    salePrice: null,
    imageUrl: '/cookie-placeholder.svg',
    stockQuantity: 10,
    isAvailable: true,
    categoryId: 'category-1',
  };
  const user = { id: 'user-1', fullName: 'دوست ثوری', role: 'Customer' };
  let quantity = 1;
  let placed = false;
  let cancelled = false;
  let addressSaved = false;
  const address = {
    id: 'address-1',
    title: 'خانه',
    addressLine1: 'تهران، خیابان نمونه، پلاک ۱',
    addressLine2: 'واحد ۲',
    phoneNumber: '09123456789',
    userId: 'user-1',
  };
  const cart = () => ({
    id: 'cart-1',
    items: quantity
      ? [
          {
            productId: product.id,
            productName: product.name,
            imageUrl: '/cookie-placeholder.svg',
            quantity,
            unitPrice: 125000,
            originalPrice: 125000,
            lineTotal: quantity * 125000,
          },
        ]
      : [],
    totalAmount: quantity * 125000,
    currency: 'IRT',
  });
  const order = () => ({
    id: 'order-123456',
    userId: 'user-1',
    status: cancelled ? 'Cancelled' : 'Pending',
    totalAmount: 250000,
    note: null,
    createdAt: '2026-10-23T12:00:00Z',
    updatedAt: '2026-10-23T12:00:00Z',
    currency: 'IRT',
  });
  await page.route('http://localhost:5265/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    let body: unknown = {};
    const path = url.pathname;
    if (!['GET', 'OPTIONS'].includes(req.method()))
      expect(req.headers()['x-csrf-token']).toBe('test-csrf');
    if (path === '/api/Auth/Csrf') body = { token: 'test-csrf' };
    else if (path === '/api/User/Me') body = user;
    else if (path === '/api/Product')
      body = { items: [product], totalCount: 1, page: 1, pageSize: 12 };
    else if (path === '/api/Category') body = [];
    else if (path === '/api/Cart') body = cart();
    else if (path === '/api/Cart/UpdateItem') {
      quantity = Number(req.postDataJSON().quantity);
      body = cart();
    } else if (path === '/api/Address') body = addressSaved ? [address] : [];
    else if (path === '/api/Address/Create') {
      addressSaved = true;
      body = address;
    } else if (path === '/api/Order/Create') {
      expect(req.postDataJSON().addressId).toBe(address.id);
      placed = true;
      quantity = 0;
      body = { ...order(), address, items: [] };
    } else if (path.startsWith('/api/Order/Cancel/')) {
      cancelled = true;
      body = order();
    } else if (path.startsWith('/api/Order/GetById/'))
      body = {
        ...order(),
        address,
        items: [
          {
            productId: product.id,
            productName: product.name,
            quantity: 2,
            unitPrice: 125000,
            lineTotal: 250000,
          },
        ],
      };
    else if (path === '/api/Order') body = placed ? [order()] : [];
    await route.fulfill({ json: body });
  });
  await page.goto('/cart');
  await expect(page.locator('.cart-item')).toHaveCount(1);
  await page.getByRole('button', { name: 'افزایش تعداد ' + product.name }).click();
  await expect(page.locator('.quantity > span')).toHaveText('۲');
  await accessible(page);
  await page.getByRole('link', { name: 'ادامه و انتخاب نشانی' }).click();
  await expect(page.getByRole('heading', { name: 'نهایی کردن سفارش' })).toBeVisible();
  await page.getByRole('button', { name: '+ نشانی جدید' }).click();
  await page.getByLabel('عنوان نشانی').fill('خانه');
  await page.getByLabel('نشانی کامل').fill(address.addressLine1);
  await page.getByLabel('شماره موبایل گیرنده').fill(address.phoneNumber);
  await accessible(page);
  await page.getByRole('button', { name: 'ذخیره نشانی' }).click();
  await expect(page.getByRole('radio')).toBeChecked();
  await accessible(page);
  await page.getByRole('button', { name: 'ثبت سفارش', exact: true }).click();
  await expect(page).toHaveURL(/\/orders$/);
  await expect(page.locator('.order-card')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.order-card')).toHaveCount(1);
  await accessible(page);
  await page.getByRole('button', { name: 'جزئیات سفارش' }).click();
  await expect(page.locator('.order-details')).toBeVisible();
  await accessible(page);
  await page.getByRole('button', { name: 'لغو سفارش', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'تأیید لغو سفارش' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'خیر', exact: true })).toBeFocused();
  await accessible(page);
  await page.getByRole('button', { name: 'بله، لغو شود' }).click();
  await expect(page.locator('.status-tag')).toHaveText('لغوشده');
});

test('registration, login validation, fresh CSRF after login, and logout', async ({ page }) => {
  let loggedIn = false;
  let registered = false;
  let tokenNumber = 0;
  const user = { id: 'user-1', fullName: 'دوست ثوری', role: 'Customer' };
  await page.route('http://localhost:5265/api/**', async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    if (path === '/api/Auth/Csrf') {
      tokenNumber++;
      await route.fulfill({ json: { token: `token-${tokenNumber}` } });
      return;
    }
    if (path === '/api/User/Me') {
      await route.fulfill(loggedIn ? { json: user } : { status: 401, json: {} });
      return;
    }
    if (path === '/api/Cart') {
      await route.fulfill({ json: { id: 'cart-1', items: [], totalAmount: 0 } });
      return;
    }
    if (req.method() === 'POST') expect(req.headers()['x-csrf-token']).toBe(`token-${tokenNumber}`);
    if (path === '/api/Auth/Register') {
      registered = true;
      expect(req.postDataJSON().email).toBe('test@example.com');
      await route.fulfill({ json: { isSuccess: true } });
      return;
    }
    if (path === '/api/Auth/Login') {
      expect(registered).toBe(true);
      loggedIn = true;
      await route.fulfill({ json: user });
      return;
    }
    if (path === '/api/Auth/Logout') {
      expect(tokenNumber).toBe(3);
      loggedIn = false;
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fulfill({ json: [] });
  });
  await page.goto('/account');
  await page.getByRole('tab', { name: 'ثبت‌نام', exact: true }).click();
  await page.getByLabel('شماره موبایل', { exact: true }).fill('123');
  await page.getByLabel('ایمیل', { exact: true }).fill('test@example.com');
  await page.getByLabel('رمز عبور', { exact: true }).fill('StrongPassword123');
  await page.getByRole('button', { name: 'ساخت حساب', exact: true }).click();
  await expect(page.getByText('شماره موبایل معتبر با ارقام انگلیسی وارد کنید.')).toBeVisible();
  expect(registered).toBe(false);
  await accessible(page);
  await page.getByLabel('شماره موبایل', { exact: true }).fill('09123456789');
  await page.getByRole('button', { name: 'ساخت حساب', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'خوش برگشتید!' })).toBeVisible();
  await page.getByLabel('رمز عبور', { exact: true }).fill('StrongPassword123');
  await page.getByRole('button', { name: 'ورود به ثوری', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'سلام دوست ثوری!' })).toBeVisible();
  await accessible(page);
  await page.getByRole('button', { name: 'خروج از حساب', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'خوش برگشتید!' })).toBeVisible();
});

test('small mobile and tablet layouts have no overflow or axe violations', async ({ page }) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(page.locator('sori-cookie-card')).toHaveCount(4);
    await expect(page.locator('mat-icon:not(:has(svg))')).toHaveCount(0);
    await accessible(page);
  }
});
