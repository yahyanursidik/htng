import {test, expect} from "@playwright/test";

async function checkContrast(page: import('@playwright/test').Page) {
  const ratios = await page.locator('.calculator label,.calculator legend,.calculator button,.calculator input,.calculator select,.calculator h2,.calculator h3,.calculator h4,.calculator p,.calculator strong,.calculator a').evaluateAll(elements => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', {willReadFrequently: true})!;
    const rgb = (color: string) => {context.clearRect(0,0,1,1); context.fillStyle = color; context.fillRect(0,0,1,1); return [...context.getImageData(0,0,1,1).data];};
    const luminance = (values: number[]) => values.slice(0,3).map(v => v/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4).reduce((total,v,i) => total + v*([.2126,.7152,.0722][i] ?? 0),0);
    return elements.filter(el => el.getBoundingClientRect().height > 0).map(el => {
      let node: Element | null = el, background = [255,255,255,255];
      while (node) {const color = rgb(getComputedStyle(node).backgroundColor); if (color[3] === 255) {background = color; break;} node = node.parentElement;}
      const a = luminance(rgb(getComputedStyle(el).color)), b = luminance(background);
      return {label: el.textContent, ratio: (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
    });
  });
  for (const {label,ratio} of ratios) expect(ratio, label ?? 'calculator control').toBeGreaterThanOrEqual(4.5);
}

test('calculator text and control contrast remain readable in default, hover, error and success states', async ({page}) => {
  await page.goto('/kalkulator');
  await expect(page.getByRole('button', {name: 'Hitung', exact: true})).toBeEnabled();
  await checkContrast(page);
  await page.getByRole('button', {name: 'Hitung', exact: true}).hover(); await checkContrast(page);
  await page.getByRole('button', {name: '17 ÷ 4', exact: true}).hover(); await checkContrast(page);
  await page.getByRole('button', {name: 'Hitung', exact: true}).click();
  await expect(page.getByRole('alert')).toContainText('Isi bilangan'); await checkContrast(page);
  await page.getByRole('button', {name: '28 + 17', exact: true}).click();
  await page.getByRole('button', {name: 'Hitung', exact: true}).click();
  await expect(page.getByTestId('calculator-result')).toContainText('45'); await checkContrast(page);
});

test("calculator is discoverable and explains a keyboard calculation without account writes", async ({page}) => {
  const writes: string[] = [];
  page.on('request', request => {if (request.method() !== 'GET') writes.push(request.url());});
  await page.goto('/belajar/kelas-3');
  await page.getByRole('navigation', {name: 'Navigasi utama'}).getByRole('link', {name: 'Kalkulator', exact: true}).press('Enter');
  await expect(page).toHaveURL(/\/kalkulator\/?$/);
  await expect(page).toHaveTitle('Kalkulator penjelas · PahamHitung');
  await expect(page.getByRole('button', {name: 'Hitung'})).toBeEnabled();
  await page.getByLabel('Bilangan pertama').fill('28');
  await page.getByLabel('Operasi', {exact: true}).selectOption('add');
  await page.getByLabel('Bilangan kedua').fill('17');
  await page.getByLabel('Bilangan kedua').press('Enter');
  await expect(page.getByTestId('calculator-result')).toHaveText('28 + 17 = 45');
  await expect(page.getByRole('heading', {name: 'Hasil dan cara menghitung'})).toBeFocused();
  await expect(page.getByText(/15 satuan = 1 puluhan dan 5 satuan/)).toBeVisible();
  await expect(page.getByText(/45 − 17 = 28/)).toBeVisible();
  await page.getByLabel('Bilangan kedua').fill('18');
  await expect(page.getByTestId('calculator-result')).toHaveCount(0);
  expect(writes).toEqual([]);
  await page.getByRole('button', {name: 'Hitung'}).press('Enter');
  await expect(page.getByTestId('calculator-result')).toContainText('46');
  await page.getByRole('link', {name: 'Latih konsep ini →'}).press('Enter');
  await expect(page).toHaveURL(/\/belajar\/menjumlah\/?$/);
});

test("calculator explains zero errors, exact repeating fractions, decimals and signed results", async ({page}) => {
  await page.goto('/kalkulator');
  await expect(page.getByRole('button', {name: 'Hitung'})).toBeEnabled();
  await page.getByRole('button', {name: '17 ÷ 4', exact: true}).click();
  await expect(page.getByTestId('calculator-result')).toHaveCount(0);
  await page.getByLabel('Bilangan kedua').fill('0');
  await page.getByRole('button', {name: 'Hitung'}).click();
  await expect(page.getByRole('alert')).toContainText('Tidak dapat membagi 17 dengan nol');
  await expect(page.getByLabel('Bilangan kedua')).toBeFocused();
  await page.getByLabel('Bilangan pertama').fill('1');
  await page.getByLabel('Bilangan kedua').fill('3');
  await page.getByRole('button', {name: 'Hitung'}).click();
  await expect(page.getByTestId('calculator-result')).toHaveText('1 ÷ 3 = 1/3');
  await expect(page.getByText(/≈ 0,333333. Pecahan di atas/)).toBeVisible();
  await page.getByRole('button', {name: '1,25 + 0,75', exact: true}).click();
  await page.getByRole('button', {name: 'Hitung'}).click();
  await expect(page.getByTestId('calculator-result')).toHaveText('1,25 + 0,75 = 2');
  await page.getByLabel('Bilangan pertama').fill('-5');
  await page.getByLabel('Operasi', {exact: true}).selectOption('subtract');
  await page.getByLabel('Bilangan kedua').fill('-8');
  await page.getByLabel('Bilangan kedua').press('Enter');
  await expect(page.getByTestId('calculator-result')).toHaveText('(−5) − (−8) = 3');
  await expect(page.getByRole('heading', {name: 'Kurang berarti tambah lawannya'})).toBeVisible();
  await page.getByRole('button', {name: 'Kosongkan'}).press('Enter');
  await expect(page.getByLabel('Bilangan pertama')).toHaveValue('');
  await expect(page.getByLabel('Bilangan pertama')).toBeFocused();
});

test("calculator and added navigation remain responsive with reduced motion and resized text", async ({page}) => {
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion: 'reduce'});
  for (const width of [320, 375, 414, 768, 1024, 1440]) {
    await page.setViewportSize({width, height: 900});
    for (const route of ['/belajar/kelas-3', '/belajar/perkalian', '/lab/ten-frame', '/kalkulator']) {
      await page.goto(route);
      await expect(page.getByRole('link', {name: 'Kalkulator', exact: true})).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}`).toBe(true);
    }
    await expect(page.getByRole('button', {name: 'Hitung'})).toBeEnabled();
    await page.getByRole('button', {name: '52 − 28', exact: true}).click();
    const submit = page.getByRole('button', {name: 'Hitung'});
    await submit.focus(); await expect(submit).toHaveCSS('outline-width', '3px');
    await expect(submit).toHaveCSS('transition-duration', '0s');
    await submit.press('Enter'); await expect(page.getByTestId('calculator-result')).toContainText('24');
    const targets = page.locator('.calculator button, .calculator input, .calculator select');
    for (const box of await targets.evaluateAll(elements => elements.map(el => ({width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height})))) {
      expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path: `test-results/calculator-${width}.png`, fullPage: true});
  }
  await page.setViewportSize({width: 375, height: 900});
  await page.addStyleTag({content: 'html {font-size: 200%}'});
  await expect(page.getByLabel('Bilangan pertama')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
