// Optional token recipes. Profile names, composition and site styling are yours.
const { wcagPresets, htmlPresets } = OpenRegardPresets;
window.regardConfig = {
  version: 1,
  defaultProfile: "standard",
  storageKey: "openregard-example",
  controlLabel: "Reading and display preferences",
  profiles: [
    {
      id: "standard",
      label: "Standard",
      description: "The original site presentation.",
    },
    {
      id: "roomy",
      label: "Vision",
      description: "Larger text with the WCAG text-spacing override values.",
      tokens: {
        ...wcagPresets.textSpacing,
        ...htmlPresets.nativeControls,
        "--regard-font-size": "125%",
      },
    },
    {
      id: "vision-contrast",
      label: "Vision + High Contrast",
      description:
        "Larger, spaced text with a restrained palette and stronger borders.",
      tokens: {
        ...wcagPresets.textSpacing,
        ...wcagPresets.contrastLight,
        ...htmlPresets.nativeControls,
        "--regard-font-size": "125%",
      },
    },
    {
      id: "strong",
      label: "Max Contrast",
      description:
        "Larger text, generous spacing and black-and-white surfaces.",
      tokens: {
        ...wcagPresets.textSpacing,
        ...htmlPresets.nativeControls,
        "--regard-font-size": "150%",
        "--regard-page-ink": "#000",
        "--regard-page-paper": "#fff",
        "--regard-panel-ink": "#fff",
        "--regard-panel-paper": "#000",
        "--regard-border-color": "#000",
      },
    },
  ],
};
window.regard = OpenRegardDisplay.createDisplay(window.regardConfig);
window.stopRegard = window.regard.start();
