// The project site's reading profiles are independent of the full WCAG
// text-spacing override recipe demonstrated in the packaged examples.
const { wcagPresets, htmlPresets } = OpenRegardPresets;
const readingTokens = {
  ...htmlPresets.nativeControls,
  "--regard-font-size": "125%",
  "--regard-line-height": "1.55",
  "--regard-paragraph-spacing": "1.1em",
  "--regard-letter-spacing": "0.01em",
  "--regard-word-spacing": "0.03em",
};
window.regard = OpenRegardDisplay.createDisplay({
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
      description: "Larger text with comfortable reading spacing.",
      tokens: readingTokens,
    },
    {
      id: "vision-contrast",
      label: "Vision + High Contrast",
      description: "Larger text, a restrained palette and clearer borders.",
      tokens: { ...readingTokens, ...wcagPresets.contrastLight },
    },
    {
      id: "strong",
      label: "Max Contrast",
      description: "Larger text and black-and-white surfaces.",
      tokens: {
        ...readingTokens,
        "--regard-font-size": "150%",
        "--regard-page-ink": "#000",
        "--regard-page-paper": "#fff",
        "--regard-panel-ink": "#fff",
        "--regard-panel-paper": "#000",
        "--regard-border-color": "#000",
      },
    },
  ],
});
window.stopRegard = window.regard.start();
