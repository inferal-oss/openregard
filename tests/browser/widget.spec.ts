import { test, expect } from "@playwright/test";
test("native keyboard, focus, descriptions, persistence and tabs", async ({
  page,
  context,
}) => {
  await page.goto("/examples/");
  const select = page.getByRole("combobox").first();
  await expect(select).toHaveAccessibleName("Reading and display preferences");
  // Native type-to-select works across platforms, including macOS headless popup handling.
  await select.focus();
  await page.keyboard.press("r");
  await page.keyboard.press("Enter");
  await expect(select).toHaveValue("roomy");
  await expect(select).toBeFocused();
  await expect(page.getByRole("combobox").last()).toHaveValue("roomy");
  const second = await context.newPage();
  await second.goto("/examples/docs.html");
  await expect(second.getByRole("combobox")).toHaveValue("roomy");
  await second.getByRole("combobox").selectOption("strong");
  await expect(select).toHaveValue("strong");
  await page.reload();
  await expect(select).toHaveValue("strong");
  await page.getByRole("button", { name: "Reset preferences" }).click();
  await expect(second.getByRole("combobox")).toHaveValue("standard");
});
for (const path of [
  "/examples/",
  "/examples/docs.html",
  "/examples/react.html",
])
  test(`reflows with enlarged long-label profile at 320px: ${path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 850 });
    await page.goto(path);
    await page.getByRole("combobox").first().selectOption("strong");
    await expect(page.locator("html")).toHaveAttribute(
      "data-regard-profile",
      "strong",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator(".openregard-description").first()).toContainText(
      "Larger type with stronger contrast and generous spacing",
    );
    await expect(page.locator(".openregard-description").first()).toBeVisible();
    // Additional browser font enlargement on top of the profile.
    await page.addStyleTag({ content: ":root {font-size:200% !important}" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const select = page.getByRole("combobox").first();
    await select.focus();
    await expect(select).toBeFocused();
    expect(
      await select.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).not.toBe("none");
  });
test("React and vanilla stay in sync", async ({ page }) => {
  await page.goto("/examples/react.html");
  await expect(page.getByRole("combobox")).toHaveCount(2);
  await page.getByRole("combobox").first().selectOption("roomy");
  await expect(page.getByRole("combobox").last()).toHaveValue("roomy");
});

test("applies saved profile before body parsing and resets on actual storage clear", async ({
  page,
  context,
}) => {
  await page.goto("/examples/");
  await page.getByRole("combobox").first().selectOption("roomy");
  await page.route("**/examples/docs.html", async (route) => {
    const response = await route.fetch();
    const html = await response.text();
    await route.fulfill({
      response,
      body: html.replace(
        "<body>",
        '<body><script>window.profileAtBodyStart=document.documentElement.getAttribute("data-regard-profile")</script>',
      ),
    });
  });
  await page.goto("/examples/docs.html");
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { profileAtBodyStart: string })
          .profileAtBodyStart,
    ),
  ).toBe("roomy");
  const second = await context.newPage();
  await second.goto("/examples/");
  await second.evaluate(() => localStorage.clear());
  await expect(page.getByRole("combobox")).toHaveValue("standard");
});
