import { expect, test } from "@playwright/test";
test("child completes an add-to story problem with the keyboard", async ({ page }) => {
  await page.goto("/lab/story-problem"); await expect(page.getByRole("article", { name: "Cerita soal" })).toBeVisible();
  await page.getByRole("radio", { name: "Bertambah" }).focus(); await page.keyboard.press("Space");
  const text = await page.getByRole("article", { name: "Cerita soal" }).textContent(); const values = text?.match(/(\d+).*?(\d+)/)?.slice(1).map(Number); if (!values?.[0] || !values[1]) throw new Error("Could not read story addends.");
  await page.locator(`input[name="story-total"][value="${values[0] + values[1]}"]`).focus(); await page.keyboard.press("Space"); await page.getByRole("button", { name: "Cek jawaban" }).focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("ditambah");
});
test("story problem stays responsive with reduced motion", async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); for (const width of [320, 375, 414, 768]) { await page.setViewportSize({ width, height: 900 }); await page.goto("/lab/story-problem"); const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); expect(overflow).toBeLessThanOrEqual(0); } });
