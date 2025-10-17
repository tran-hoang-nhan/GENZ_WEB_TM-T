import { test, expect } from '@playwright/test';

const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGVmZGZhNDY2YjkwNTA1NDM4YzdiNmIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjA1NTI3MzIsImV4cCI6MTc2MTE1NzUzMn0.Qsn94qtvxNjBe_WRo36riDoBkCGXTcZzOokceJmRZs4';
const BASE_URL = 'http://localhost:3000';

test('Admin UI should show admin features', async ({ page }) => {
  // Ensure token and user are present before any navigation so app boots as authenticated
  const adminUser = {
    id: 'admin-001',
    email: 'admin@local',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
  await page.context().addInitScript(([token, user]) => {
    localStorage.setItem('genz_token', token);
    localStorage.setItem('genz_user', JSON.stringify(user));
  }, [ADMIN_TOKEN, adminUser]);
  await page.goto(BASE_URL);
    // Use mobile viewport so mobile menu flow is available
    await page.setViewportSize({ width: 375, height: 800 });
    // Open mobile main menu
    await expect(page.locator('button[class*="lg:hidden"]')).toBeVisible({ timeout: 10000 });
    await page.click('button[class*="lg:hidden"]');
    // Click mobile menu item 'Quản trị Admin'
    await page.click('text=Quản trị Admin');
    // Admin view should render; check for 'Thống Kê' heading
    await expect(page.getByRole('heading', { name: 'Thống Kê' })).toBeVisible({ timeout: 10000 });
  // Wait for the sidebar menu button 'Đơn Hàng' to appear
  await expect(page.locator('button:has-text("Đơn Hàng")')).toBeVisible({ timeout: 10000 });
  // Open Orders view via sidebar button labeled 'Đơn Hàng'
  await page.click('button:has-text("Đơn Hàng")');
  // AdminOrders component uses heading "Quản Lý Đơn Hàng"
  await expect(page.locator('text=Quản Lý Đơn Hàng')).toBeVisible({ timeout: 10000 });
  // Switch to Products
  await page.click('button:has-text("Sản Phẩm")');
  // AdminProducts should render; check for heading label in top bar
  await expect(page.locator('text=Sản Phẩm')).toBeVisible({ timeout: 10000 });
});
