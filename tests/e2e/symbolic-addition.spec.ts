import { expect, test } from "@playwright/test";

test("child completes a visible-bridge symbolic addition activity with the keyboard", async ({ page }) => {
  await page.goto("/lab/symbolic-addition");
  await expect(page.getByRole("img", { name: /ditambah.*sama dengan kosong/ })).toBeVisible();
  await expect(page.getByRole("img", { name: /Garis bilangan: mulai dari/ })).toBeVisible();

  const prompt = await page.getByRole("heading", { level: 1 }).textContent();
  const matches = prompt?.match(/menunjukkan (\d+) mulai lalu (\d+) lompatan/);
  if (!matches?.[1] || !matches[2]) throw new Error("Could not read SymbolicAddition addends from the prompt.");
  const total = Number(matches[1]) + Number(matches[2]);
  await page.locator(`input[name="symbolic-addition-result"][value="${total}"]`).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Cek jawaban" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("sama dengan");

  const attempts = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("mathyahya.symbolic-addition.attempts.v1") ?? "[]"),
  );
  expect(attempts).toHaveLength(1);
  expect(attempts[0]).toMatchObject({
    correct: true,
    bridgeVisible: true,
    representationUsed: "equation",
    masteryEvidence: "developing",
  });
});

test("symbolic addition remains responsive with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 375, 414, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/lab/symbolic-addition");
    await expect(page.getByRole("img", { name: /ditambah.*sama dengan kosong/ })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
  }
});
