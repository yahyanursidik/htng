import { expect, test } from "@playwright/test";

test("child completes a counting-on number line activity with the keyboard", async ({ page }) => {
  await page.goto("/lab/number-line");
  await expect(page.getByRole("img", { name: /Garis bilangan dari 0 sampai 10/ })).toBeVisible();

  const start = page.getByRole("radio", { name: /Mulai dari \d/ });
  await start.focus();
  await page.keyboard.press("Space");

  const jump = page.getByRole("button", { name: "Lompat maju satu" });
  while ((await jump.count()) > 0) {
    await jump.focus();
    await page.keyboard.press("Enter");
  }

  const prompt = await page.getByRole("heading", { level: 1 }).textContent();
  const matches = prompt?.match(/Mulai dari (\d+)\. Lompat maju (\d+) kali/);
  if (!matches?.[1] || !matches[2]) throw new Error("Could not read NumberLine addends from the prompt.");
  const total = Number(matches[1]) + Number(matches[2]);
  await page.locator(`input[name="number-line-total"][value="${total}"]`).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Cek jawaban" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("tiba di");

  const attempts = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("mathyahya.number-line.attempts.v1") ?? "[]"),
  );
  expect(attempts).toHaveLength(1);
  expect(attempts[0]).toMatchObject({
    correct: true,
    representationUsed: "number-line",
    strategyObserved: "count-on",
    masteryEvidence: "independent",
  });
});

test("number line stays responsive with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 375, 414, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/lab/number-line");
    await expect(page.getByRole("img", { name: /Garis bilangan dari 0 sampai 10/ })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
  }
});
