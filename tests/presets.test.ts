import { it, expect } from "vitest";
import { wcagPresets, htmlPresets } from "../src/presets.js";
import { createRegard } from "../src/index.js";

function luminance(hex: string) {
  const rgb = hex
    .slice(1)
    .match(/../g)!
    .map((v) => {
      const s = parseInt(v, 16) / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
it.each([wcagPresets.contrastLight, wcagPresets.contrastDark])(
  "keeps supplied solid text pairs above 7:1 and borders above 3:1",
  (palette) => {
    expect(
      contrast(palette["--regard-page-ink"], palette["--regard-page-paper"]),
    ).toBeGreaterThanOrEqual(7);
    expect(
      contrast(palette["--regard-panel-ink"], palette["--regard-panel-paper"]),
    ).toBeGreaterThanOrEqual(7);
    for (const surface of [
      palette["--regard-page-paper"],
      palette["--regard-panel-paper"],
    ])
      expect(
        contrast(palette["--regard-border-color"], surface),
      ).toBeGreaterThanOrEqual(3);
  },
);
it("composes visual and native-control recipes and restores their baseline", () => {
  const root = document.createElement("div");
  document.body.append(root);
  root.style.setProperty("--regard-line-height", "1.7");
  const r = createRegard({
    version: 1,
    storageKey: "preset-test",
    controlLabel: "Display",
    defaultProfile: "base",
    profiles: [
      { id: "base", label: "Standard" },
      {
        id: "vision",
        label: "Vision",
        tokens: {
          ...wcagPresets.textSpacing,
          ...wcagPresets.text200,
          ...htmlPresets.nativeControls,
        },
      },
    ],
  });
  const stop = r.start({ root });
  try {
    r.setProfile("vision");
    expect(root.style.getPropertyValue("--regard-font-size")).toBe("200%");
    expect(root.style.getPropertyValue("--regard-letter-spacing")).toBe(
      "0.12em",
    );
    expect(root.style.getPropertyValue("--openregard-control-background")).toBe(
      "Canvas",
    );
    r.reset();
    expect(root.style.getPropertyValue("--regard-line-height")).toBe("1.7");
    expect(root.style.getPropertyValue("--regard-font-size")).toBe("");
    expect(Object.isFrozen(wcagPresets.textSpacing)).toBe(true);
  } finally {
    stop();
    root.remove();
    localStorage.removeItem("preset-test");
  }
});
