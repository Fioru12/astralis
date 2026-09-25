import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('astralis-settings', JSON.stringify({ reduceMotion: true }));
    localStorage.setItem('solar-system.lang', 'it');
    localStorage.setItem('solar-system.onboarded', '1');
  });
  await page.goto('/?lang=it&theme=dark');
  await expect(page.locator('canvas[data-engine^="three.js"]')).toBeVisible({ timeout: 20_000 });
});

test('apre e chiude le missioni astronautiche (gamification)', async ({ page }) => {
  await page.getByRole('tab', { name: /Esplora/ }).click();
  await page.locator('#missionsBtn').click();

  const panel = page.locator('#gamificationPanel');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Missioni Astronautiche');
  await expect(panel.locator('#missionCards > div')).toHaveCount(6);

  await panel.locator('#closeGamification').click();
  await expect(panel).toBeHidden();
});

test('apre e chiude le missioni spaziali reali', async ({ page }) => {
  await page.getByRole('tab', { name: /Esplora/ }).click();
  await page.locator('#spaceMissionsBtn').click();

  const panel = page.locator('#missionsPanel');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Missioni Spaziali');
  await expect(panel.locator('#missionsList > div').first()).toBeVisible();

  await panel.locator('#closeMissions').click();
  await expect(panel).toBeHidden();
});

test('apre la palette comandi e naviga a un pianeta', async ({ page }) => {
  await page.locator('#cmdPaletteQuickBtn').click();

  const palette = page.locator('#commandPalette');
  await expect(palette).toBeVisible();
  const input = palette.locator('#cmdInput');
  await input.fill('Giove');
  const firstResult = palette.locator('[data-cmd-item]').first();
  await expect(firstResult).toBeVisible();
  await firstResult.click();

  const infoPanel = page.locator('#infoPanel');
  await expect(infoPanel).toHaveClass(/visible/);
  await expect(infoPanel.getByRole('heading')).toContainText('Giove');
});

test('apre e chiude l’esploratore di sistemi stellari', async ({ page }) => {
  await page.getByRole('tab', { name: /Esplora/ }).click();
  await page.locator('#systemsBtn').click();

  const modal = page.locator('#systemsExplorerModal');
  await expect(modal).toBeVisible();
  await expect(modal).toHaveAttribute('role', 'dialog');

  await modal.locator('#systemsCloseBtn').click();
  await expect(modal).toBeHidden();
});

test('apre sandbox e bookmark da tastiera', async ({ page }) => {
  await page.keyboard.press('g');
  const sandbox = page.locator('#sandboxPanel');
  await expect(sandbox).toBeVisible();
  await sandbox.locator('#sbClose').click();
  await expect(sandbox).toBeHidden();

  await page.keyboard.press('b');
  const bookmarks = page.locator('#bookmarksPanel');
  await expect(bookmarks).toBeVisible();
  await bookmarks.locator('#bmkClose').click();
  await expect(bookmarks).toBeHidden();
});

test('attiva e disattiva la bolla locale', async ({ page }) => {
  await page.getByRole('tab', { name: /Esplora/ }).click();
  const bubbleBtn = page.locator('#localBubbleBtn');
  await bubbleBtn.click();
  await expect(bubbleBtn).toHaveText('Torna al Sistema Solare');
  await bubbleBtn.click();
  await expect(bubbleBtn).toHaveText('Local Bubble');
});

test('apre i credits e li chiude', async ({ page }) => {
  await page.getByRole('tab', { name: /Esplora/ }).click();
  await page.locator('#creditsBtn').click();

  const panel = page.locator('#creditsPanel');
  await expect(panel).toBeVisible();
  await panel.locator('#creditsClose').click();
  await expect(panel).toBeHidden();
});

test('avvia un volo spaziale e lo interrompe dal cockpit', async ({ page }) => {
  await page.locator('#spaceTravelQuickBtn').click();
  const modal = page.locator('#spaceTravelModal');
  await expect(modal).toBeVisible();

  await modal.locator('#stLaunchBtn').click();
  const cockpit = page.locator('#flightCockpitOverlay');
  await expect(cockpit).toBeVisible({ timeout: 15000 });
  await cockpit.locator('#cockpitAbortBtn').click();
  await expect(cockpit).toBeHidden();
});

test('apre preset viste, shortcut e cambia tema da tastiera', async ({ page }) => {
  await page.keyboard.press('v');
  await expect(page.locator('#viewPresetsPanel')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.keyboard.press('h');
  await expect(page.locator('#shortcutsPanel')).toBeVisible();
  await page.keyboard.press('Escape');

  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  await page.keyboard.press('t');
  await expect(html).not.toHaveAttribute('data-theme', before || 'dark');
});

test('mostra il pulsante VR solo con sessione immersive-vr supportata', async ({ page }) => {
  // navigator.xr esiste anche senza visore: conta solo isSessionSupported.
  const supported = await page.evaluate(async () => {
    try {
      if (!('xr' in navigator) || !navigator.xr?.isSessionSupported) return false;
      return await navigator.xr.isSessionSupported('immersive-vr');
    } catch {
      return false;
    }
  });
  await expect(page.locator('#xrButton')).toHaveCount(supported ? 1 : 0);
});

test('cerca in inglese e mostra la scheda localizzata', async ({ page }) => {
  await page.goto('/?lang=en&theme=dark');
  await expect(page.locator('canvas[data-engine^="three.js"]')).toBeVisible({ timeout: 20_000 });

  const search = page.getByRole('combobox', { name: 'Search celestial bodies' });
  await expect(search).toBeVisible();
  await search.fill('Earth');

  const result = page.locator('#searchResults').getByRole('option', { name: /Earth/ });
  await expect(result.first()).toBeVisible();
  await result.first().press('Enter');

  const infoPanel = page.locator('#infoPanel');
  await expect(infoPanel).toHaveClass(/visible/);
  await expect(infoPanel.getByRole('heading')).toContainText('Earth');
});
