import { test, expect } from '@playwright/test';

test.describe('Frontend Performance Tests', () => {
  test('Homepage should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:5173');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
    console.log(`✅ Homepage loaded in ${loadTime}ms`);
  });

  test('Dashboard should load within 2 seconds (with auth)', async ({ page }) => {
    // Mock login
    await page.goto('http://localhost:5173/login');

    // Simulate login (adjust selectors as needed)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    const startTime = Date.now();
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
    console.log(`✅ Dashboard loaded in ${loadTime}ms`);
  });

  test('Page navigation should be instant', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const startTime = Date.now();
    await page.click('a:has-text("Clientes")');
    const navigationTime = Date.now() - startTime;

    expect(navigationTime).toBeLessThan(1000);
    console.log(`✅ Navigation took ${navigationTime}ms`);
  });

  test('API calls should complete within 500ms', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');

    // Monitor network requests
    let slowRequests = 0;

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        const timing = response.timing();
        if (timing.responseEnd - timing.requestStart > 500) {
          slowRequests++;
          console.log(`⚠️ Slow API call: ${response.url()} took ${timing.responseEnd - timing.requestStart}ms`);
        }
      }
    });

    await page.waitForTimeout(5000);
    expect(slowRequests).toBeLessThan(3);
  });

  test('Component rendering performance', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');

    // Measure time to interactive
    const tti = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            resolve(entries[entries.length - 1].startTime);
          }).observe({ entryTypes: ['longtask'] });

          setTimeout(() => resolve(performance.timing.loadEventEnd - performance.timing.navigationStart), 5000);
        } else {
          resolve(performance.timing.loadEventEnd - performance.timing.navigationStart);
        }
      });
    });

    expect(tti).toBeLessThan(3000);
    console.log(`✅ Time to Interactive: ${tti}ms`);
  });
});
