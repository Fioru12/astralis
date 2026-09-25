import { expect, test } from '@playwright/test';

// NOTE: gira con playwright.offline.config.js contro `vite preview`
// (build di produzione). Non parte con `npm run test:e2e`.
test('la app si avvia offline dopo una visita online (PWA)', async ({ page, context }) => {
  await page.addInitScript(() => {
    localStorage.setItem('solar-system.onboarded', '1');
  });
  await page.goto('/?lang=it&theme=dark');
  await expect(page.locator('canvas[data-engine^="three.js"]')).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => navigator.serviceWorker.ready);

  // Attende il precache completo (chunk + texture) prima di staccare la rete.
  await expect
    .poll(
      async () =>
        page.evaluate(async () => {
          const cache = await caches.open('astralis-v2.0.0');
          return (await cache.keys()).length;
        }),
      { timeout: 60_000 }
    )
    .toBeGreaterThanOrEqual(20);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('canvas[data-engine^="three.js"]')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('#loadingText')).toContainText(/Pronto|Ready/, { timeout: 30_000 });
});
