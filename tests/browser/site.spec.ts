import { test, expect } from "@playwright/test";
for (const width of [320, 1280])
  test(`integrated website and sponsor reflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/.pages/");
    await expect(
      page.getByRole("heading", {
        name: "Accessibility tools. Starting with Display.",
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

test("publishes llms.txt and Markdown docs", async ({ request }) => {
  const index = await request.get("/.pages/llms.txt");
  expect(index.ok()).toBe(true);
  expect(await index.text()).toContain(
    "https://openregard.org/docs/display.md",
  );
  const docs = await request.get("/.pages/docs/display.md");
  expect(docs.ok()).toBe(true);
  expect(await docs.text()).toContain("## Style the widget");
});

test("homepage switches between module-based vanilla and configurable React examples", async ({
  page,
}) => {
  await page.goto("/.pages/");
  const picker = page.getByRole("combobox", { name: "Example", exact: true });
  await expect(page.locator('[data-quickstart-panel="vanilla"]')).toBeVisible();
  await expect(page.locator('[data-quickstart-panel="vanilla"]')).toContainText(
    "openregard/display",
  );
  await picker.selectOption("react");
  await expect(page.locator('[data-quickstart-panel="react"]')).toBeVisible();
  await expect(page.locator('[data-quickstart-panel="react"]')).toContainText(
    "<DisplayWidget config={config} />",
  );
  await expect(page.locator('[data-quickstart-panel="vanilla"]')).toBeHidden();
  await page
    .getByRole("link", { name: "Presets", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Display presets", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "WCAG visual recipes", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "WHATWG native HTML recipe",
      exact: true,
    }),
  ).toBeVisible();
});

test("custom control reuses the headless controller, syncs and preserves keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/.pages/custom-widgets/");
  const group = page
    .locator("#custom-display-demo")
    .getByRole("group", { name: "Reading and display preferences" });
  const vision = group.getByRole("button", { name: "Vision", exact: true });
  await vision.focus();
  await page.keyboard.press("Enter");
  await expect(vision).toHaveAttribute("aria-pressed", "true");
  await expect(vision).toBeFocused();
  await expect(page.getByRole("combobox")).toHaveValue("roomy");
  await page.getByRole("combobox").selectOption("strong");
  await expect(
    group.getByRole("button", { name: "Max Contrast", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(vision).toHaveAttribute("aria-pressed", "false");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await expect(page.getByRole("combobox")).toHaveValue("strong");
  await expect(
    group.getByRole("button", { name: "Max Contrast", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".docs-content")).toContainText(
    "useDisplayProfile",
  );
});
