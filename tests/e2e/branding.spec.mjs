import {test, expect} from "@playwright/test";
import {readFile, readdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {join} from "node:path";

test("every built page carries the new identity and the original logo asset", async ({request}) => {
  async function pages(directory) {
    const entries = await readdir(directory, {withFileTypes: true});
    const nested = await Promise.all(entries.map(entry => entry.isDirectory()
      ? pages(join(directory, entry.name))
      : Promise.resolve(entry.name.endsWith('.html') ? [join(directory, entry.name)] : [])));
    return nested.flat();
  }
  const htmlFiles = await pages('dist');
  expect(htmlFiles.length).toBeGreaterThan(60);
  for (const path of htmlFiles) {
    const html = await readFile(path, 'utf8');
    expect(html, path).toMatch(/<title>[^<]* · PahamHitung<\/title>/);
    expect(html, path).toContain('name="application-name" content="PahamHitung"');
    expect(html, path).toContain('/brand/pahamhitung-icon.svg');
    expect(html, path).toContain('/brand/pahamhitung-logo.png');
    expect(html, path).not.toMatch(/Mathyahya|Mathematics Understanding Lab/);
  }
  const response = await request.get('/brand/pahamhitung-logo.png');
  expect(response.ok()).toBe(true);
  expect(createHash('sha256').update(await response.body()).digest('hex')).toBe(
    '407341e7e70aab89fd6e5b3ff7f8caa832cf07e8f7ef1ff961cded4efb693103');
  const icon = await request.get('/brand/pahamhitung-icon.svg');
  expect(icon.ok()).toBe(true);
  expect(icon.headers()['content-type']).toContain('image/svg+xml');
});

test("logo remains readable, keyboard-operable and responsive across page families", async ({page}) => {
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion: 'reduce'});
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({width, height: 900});
    for (const route of ['/', '/masuk', '/daftar', '/belajar', '/cpa/senilai', '/lab/ten-frame']) {
      await page.goto(route);
      await expect(page).toHaveTitle(/ · PahamHitung$/);
      const brand = page.getByRole('link', {name: 'PahamHitung — Beranda', exact: true});
      await expect(brand).toBeVisible();
      await expect(brand).toHaveAttribute('href', '/');
      const logo = brand.getByRole('img', {name: 'PahamHitung', exact: true});
      await expect(logo).toBeVisible();
      await expect.poll(() => logo.evaluate(img => img.complete && img.naturalWidth === 1254)).toBe(true);
      const art = brand.locator('.brand__art');
      const box = await art.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(144);
      expect(box.height).toBeGreaterThanOrEqual(70);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} at ${width}`).toBe(true);
      await brand.focus();
      await expect(brand).toHaveCSS('outline-style', 'solid');
      await expect(brand).toHaveCSS('outline-width', '3px');
    }
  }
  await page.getByRole('link', {name: 'PahamHitung — Beranda', exact: true}).press('Enter');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.site-footer__brand')).toHaveText('PahamHitung');
});
