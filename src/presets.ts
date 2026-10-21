/** Optional, immutable token recipes. Your CSS must consume these properties. */
export const wcagPresets = Object.freeze({
  /** SC 1.4.12 override values, not required default typography. */
  textSpacing: Object.freeze({
    "--regard-line-height": "1.5",
    "--regard-paragraph-spacing": "2em",
    "--regard-letter-spacing": "0.12em",
    "--regard-word-spacing": "0.16em",
  }),
  /** A resize test/starting point; browser zoom must remain available. */
  text200: Object.freeze({ "--regard-font-size": "200%" }),
  /** Solid foreground/background pairs exceed 7:1; borders exceed 3:1. */
  contrastLight: Object.freeze({
    "--regard-page-ink": "#17352d",
    "--regard-page-paper": "#f8faf4",
    "--regard-panel-ink": "#f8faf4",
    "--regard-panel-paper": "#17352d",
    "--regard-border-color": "#71877a",
  }),
  contrastDark: Object.freeze({
    "--regard-page-ink": "#f8faf4",
    "--regard-page-paper": "#17352d",
    "--regard-panel-ink": "#17352d",
    "--regard-panel-paper": "#f8faf4",
    "--regard-border-color": "#71877a",
  }),
});

/** A native-control styling recipe inspired by WHATWG HTML rendering guidance.
 * Semantics, labels and keyboard behavior require HTML, not CSS tokens.
 * WHATWG does not prescribe WCAG contrast ratios or text-spacing values.
 */
export const htmlPresets = Object.freeze({
  nativeControls: Object.freeze({
    "--openregard-control-background": "Canvas",
    "--openregard-control-color": "CanvasText",
    "--openregard-control-border-color": "ButtonText",
    "--openregard-focus-color": "CanvasText",
    "--openregard-color-scheme": "light dark",
  }),
});
