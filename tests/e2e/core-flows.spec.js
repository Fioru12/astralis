import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('astralis-settings', JSON.stringify({ reduceMotion: true }));
    localStorage.setItem('solar-system.lang', 'it');
    localStorage.setItem('solar-system.onboarded', '1');
  });
  await page.goto('/?lang=it&theme=dark');
  await expect(page.locator('canvas[data-engine^="three.js"]')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('combobox', { name: 'Cerca oggetti celesti' })).toBeVisible();
});

test('avvia la scena e seleziona un corpo dalla ricerca usando la tastiera', async ({ page }) => {
  const search = page.getByRole('combobox', { name: 'Cerca oggetti celesti' });
  await search.fill('Saturno');

  const result = page.locator('#searchResults').getByRole('option', { name: /Saturno/ });
  await expect(result).toBeVisible();
  await search.press('ArrowDown');
  await result.press('Enter');

  const infoPanel = page.locator('#infoPanel');
  await expect(infoPanel).toHaveClass(/visible/);
  await expect(infoPanel.getByRole('heading')).toContainText('Saturno');
  await expect(search).toHaveValue('');
});

test('apre e chiude le impostazioni ripristinando correttamente il focus', async ({ page }) => {
  const settingsButton = page.getByRole('button', { name: 'Apri impostazioni' });
  await settingsButton.click();

  const dialog = page.getByRole('dialog', { name: /Impostazioni/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('combobox', { name: 'Lingua interfaccia' })).toHaveValue('it');

  await dialog.getByRole('button', { name: 'Chiudi impostazioni' }).click();
  await expect(dialog).toBeHidden();
  await expect(settingsButton).toBeFocused();
});

test('mantiene accessibili i controlli principali su una viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  await expect(page.getByRole('button', { name: 'Apri impostazioni' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Cerca oggetti celesti' })).toBeVisible();
  await expect(page.getByRole('tablist', { name: 'Pannelli di controllo' })).toBeVisible();
});

test('apre e chiude la mappa galattica interattiva', async ({ page }) => {
  await page.getByRole('tab', { name: /Esplora/ }).click();
  await page.locator('#galaxyMapBtn').click();

  const modal = page.locator('#galaxyInteractiveModal');
  await expect(modal).toBeVisible({ timeout: 20_000 });

  await modal.locator('#galaxyModalClose').click();
  await expect(modal).toBeHidden();
});

test('la vista galaxy da URL attiva guida e minimappa', async ({ page }) => {
  await page.goto('/?lang=it&theme=dark&view=galaxy');
  await expect(page.locator('canvas[data-engine^="three.js"]')).toBeVisible({ timeout: 20_000 });

  await expect(page.locator('#galaxyMapBtn')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#galaxyGuide')).toHaveClass(/open/);
  await expect(page.locator('#minimapContainer')).toBeVisible();
});

test('confronta due pianeti e chiude il dialogo', async ({ page }) => {
  await page.getByRole('tab', { name: /Esplora/ }).click();
  await page.locator('#compareBtn').click();

  const dialog = page.getByRole('dialog', { name: /Confronta Pianeti/ });
  await expect(dialog).toBeVisible();
  await dialog.locator('#cmpBody1').selectOption('Earth');
  await dialog.locator('#cmpBody2').selectOption('Mars');
  await expect(dialog.locator('#cmpResult')).toContainText('Terra');
  await expect(dialog.locator('#cmpResult')).toContainText('Marte');

  await dialog.locator('#cmpClose').click();
  await expect(dialog).toBeHidden();
});

test('attiva e disattiva la modalità osservatorio sul corpo selezionato', async ({ page }) => {
  const search = page.getByRole('combobox', { name: 'Cerca oggetti celesti' });
  await search.fill('Terra');
  const earthResult = page.locator('#searchResults').getByRole('option', { name: /Terra/ });
  await earthResult.press('Enter');

  await page.getByRole('tab', { name: /Esplora/ }).click();
  const observatoryButton = page.locator('#observatoryBtn');
  await observatoryButton.click();
  await expect(observatoryButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#toastContainer')).toContainText('Sei su Terra');

  await observatoryButton.click();
  await expect(observatoryButton).toHaveAttribute('aria-pressed', 'false');
});

test('rende scopribili e utilizzabili Quiz e Viaggio nel tempo', async ({ page }) => {
  await page.getByRole('tab', { name: /Esplora/ }).click();

  await page.locator('#quizBtn').click();
  const quiz = page.locator('#quizPanel');
  await expect(quiz).toHaveAttribute('role', 'dialog');
  await expect(quiz.locator('#qOpts button')).toHaveCount(4);
  await quiz.locator('#qOpts button').first().click();
  await expect(quiz.locator('#qExplain')).toBeVisible();
  await quiz.locator('#qClose').click();
  await expect(quiz).toBeHidden();

  await page.locator('#timeTravelBtn').click();
  const timeTravel = page.locator('#timeTravelPanel');
  await expect(timeTravel).toHaveAttribute('role', 'dialog');
  await expect(timeTravel.locator('[data-tt-event]')).toHaveCount(8);
  await timeTravel.locator('[data-tt-event="apollo11"]').click();
  await timeTravel.locator('#ttClose').click();
  await expect(timeTravel).toBeHidden();
});
