import { expect, test } from "@playwright/test";

test("child completes one make-ten activity and evidence is stored", async ({ page }) => {
  await page.goto("/lab/ten-frame");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Berapa semuanya?");
  await expect(page.getByRole("img", { name: /Bingkai sepuluh/ })).toBeVisible();

  const sourceCounters = page.getByRole("button", { name: /Tambahkan keping kuning/ });
  while ((await sourceCounters.count()) > 0) {
    await sourceCounters.first().focus();
    await page.keyboard.press("Enter");
  }

  await page.getByRole("radio", { name: "10" }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Cek jawaban" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText(/Ya\. \d dan \d menjadi 10\./);

  const attempts = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("mathyahya.ten-frame.attempts.v1") ?? "[]"),
  );
  expect(attempts).toHaveLength(1);
  expect(attempts[0]).toMatchObject({
    correct: true,
    total: 10,
    representationUsed: "ten-frame",
    masteryEvidence: "independent",
  });
});

test("workspace stays responsive with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 375, 414, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/lab/ten-frame");
    await expect(page.getByRole("img", { name: /Bingkai sepuluh/ })).toBeVisible();

    const animationDuration = await page
      .locator(".ten-frame__counter")
      .first()
      .evaluate((element) => getComputedStyle(element).animationDuration);
    expect(animationDuration).toBe("0.001s");

    const sourceCounters = page.getByRole("button", { name: /Tambahkan keping kuning/ });
    while ((await sourceCounters.count()) > 0) await sourceCounters.first().click();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
    await expect(page.getByRole("radiogroup", { name: "Berapa jumlah semuanya?" })).toBeVisible();
  }
});
