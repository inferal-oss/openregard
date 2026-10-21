import { test, expect } from "@playwright/test";
for (const path of [
  "/examples/",
  "/examples/docs.html",
  "/examples/react.html",
])
  test(`source viewer highlights real files and supports keyboard tabs: ${path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 850 });
    await page.goto(path);
    const viewer = page.getByRole("region", { name: "Example source code" });
    await expect(viewer).toBeVisible();
    await expect(
      viewer.getByRole("tablist", { name: "Source files" }),
    ).toBeVisible();
    const tabs = viewer.getByRole("tab");
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
    await expect(
      viewer.locator('.hljs [class^="hljs-"]').first(),
    ).toBeVisible();
    await tabs.first().focus();
    await page.keyboard.press("End");
    await expect(tabs.last()).toBeFocused();
    await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
    await expect(viewer.getByRole("tabpanel")).toHaveCount(1);
    await expect(viewer.getByRole("tabpanel")).toContainText(":root");
    await page.keyboard.press("Home");
    await expect(tabs.first()).toBeFocused();
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
    await expect(viewer.getByRole("tabpanel")).toHaveCount(1);
    await page.getByRole("combobox").first().selectOption("strong");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
