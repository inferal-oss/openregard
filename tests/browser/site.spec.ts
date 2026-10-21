import { test, expect } from "@playwright/test";
for (const width of [320, 1280])
  test(`integrated website and sponsor reflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/.pages/");
    await expect(
      page.getByRole("heading", {
        name: "Display settings. That stay in sync.",
      }),
    ).toBeVisible();
    const first = page.getByRole("combobox").first();
    await first.selectOption("strong");
    await expect(page.getByRole("combobox").last()).toHaveValue("strong");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.addStyleTag({ content: ":root {font-size:200% !important}" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const sponsor = page.locator(".footer-sponsor a");
    await expect(sponsor).toHaveAttribute("href", "https://inferal.com/");
    await expect(sponsor).toContainText("Inferal");
    expect(
      await sponsor
        .locator("img")
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    ).toBe(true);
    await page
      .getByRole("link", { name: "Read the adoption contract" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Adoption contract", exact: true }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute(
      "data-regard-profile",
      "strong",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
for (const width of [320, 1280])
  test(`documentation is formatted and integrated at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/.pages/");
    await page
      .getByRole("link", { name: "Documentation", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/docs\/$/);
    await expect(
      page.getByRole("heading", { name: "Documentation", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Documentation sections" }),
    ).toBeVisible();
    await expect(
      page.locator(".docs-content .hljs-keyword").first(),
    ).toBeVisible();
    await page.getByRole("combobox").selectOption("strong");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.addStyleTag({ content: ":root{font-size:200% !important}" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator(".contract-number")).toHaveCount(0);
  });
