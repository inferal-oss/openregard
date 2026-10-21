<p align="center"><img src="https://raw.githubusercontent.com/inferal-oss/openregard/main/docs/assets/mark.svg" width="80" height="80" alt="Open Regard logo" /></p>

# Open Regard

**A modular accessibility toolkit. Display is the first module.**

[![CI](https://github.com/inferal-oss/openregard/actions/workflows/ci.yml/badge.svg)](https://github.com/inferal-oss/openregard/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/openregard)](https://www.npmjs.com/package/openregard)
[![npm downloads](https://img.shields.io/npm/dm/openregard)](https://www.npmjs.com/package/openregard)
[![MIT license](https://img.shields.io/npm/l/openregard)](LICENSE)

[Website](https://openregard.org/) · [Documentation](https://openregard.org/docs/) · [Live examples](https://openregard.org/examples/) · [npm](https://www.npmjs.com/package/openregard)

Open Regard brings small accessibility tools together as independent modules. **Display**, available today, lets people choose a site's display profile and keeps that preference in sync across controls, pages and tabs. More modules will follow; this release contains Display.

You define the profiles and CSS. The module handles selection, persistence, root attributes and optional CSS tokens. The core has no runtime dependencies; React is optional. ESM, TypeScript declarations and standalone browser bundles are included. MIT licensed; originally extracted from Startup Tier.

## Try Display

The package includes runnable vanilla HTML, static documentation and React demos, each with a syntax-highlighted source viewer:

```sh
npx --package=openregard openregard-demo
# Open http://127.0.0.1:4397/examples/
```

Try **Vision**, **Vision + High Contrast** or **Max Contrast**, then open the static docs in another tab. Both pages share the preference. The project website uses the module too.

## Install and use

```sh
npm install openregard
```

```js
import { createRegard, mountWidget } from "openregard";
import { wcagPresets } from "openregard/presets";
import "openregard/style.css";

const regard = createRegard({
  version: 1,
  defaultProfile: "standard",
  storageKey: "my-site-display",
  controlLabel: "Reading and display preferences",
  profiles: [
    { id: "standard", label: "Standard" },
    {
      id: "vision",
      label: "Vision",
      tokens: {
        ...wcagPresets.textSpacing,
        "--regard-font-size": "125%",
      },
    },
  ],
});

const widget = mountWidget(document.querySelector("#display-settings"), regard);
// When removing the control: widget.destroy();
```

Add `<div id="display-settings"></div>` to your page, and consume the tokens in your CSS:

```css
:root {
  font-size: var(--regard-font-size, 100%);
}
body {
  line-height: var(--regard-line-height, 1.6);
  letter-spacing: var(--regard-letter-spacing, normal);
  word-spacing: var(--regard-word-spacing, normal);
}
p {
  margin-block-end: var(--regard-paragraph-spacing, 1em);
}
```

Wire the same properties into authored heading and control styles as needed. Tokens are optional: profile IDs have no built-in meaning. Use `data-regard-profile` selectors if you prefer. The [preset guide](https://openregard.org/docs/#standards-and-token-presets) covers WCAG visual recipes and a WHATWG-inspired native-control recipe, their sources and limits. Presets do not establish accessibility conformance.

## React

```tsx
import { RegardWidget } from "openregard/react";

// Reuse the controller above; do not create it on each render.
<RegardWidget regard={regard} className="my-display-widget" />;
```

React 18/19 is an optional peer. `useProfile(regard)` is available for custom UI. [React, SSR and hydration guide →](https://openregard.org/docs/#react-binding)

## Match your site's design

Both widgets expose the same ordinary DOM, public CSS classes and theme properties. Pass `className` to either binding; the default stylesheet is optional and easy to override:

```js
mountWidget(container, regard, { className: "my-display-widget", icon: false });
```

```css
.my-display-widget {
  --openregard-control-radius: 0.5rem;
  --openregard-control-padding: 0.75em;
  --openregard-gap: 0.75em;
}
.my-display-widget .openregard-label {
  font-weight: 600;
}
```

Keep visible focus, native control behavior and wrapping text. [All styling hooks, theme variables and examples →](https://openregard.org/docs/#style-the-widget)

## Integration details

- **Static pages and first paint:** self-host the browser bundle and run a shared configuration synchronously in the head. [Guide →](https://openregard.org/docs/#before-paint-and-static-sites)
- **Synchronization:** share a controller within an app; use the same storage key and stable IDs across same-origin pages. Storage failures fall back to memory. Cross-subdomain sharing is not automatic. [Guide →](https://openregard.org/docs/#persistence-and-synchronization)
- **Lifecycle:** widgets acquire a controller lease. `start()` lets a page retain its own lease; final cleanup restores the original root attribute and configured token values. [Guide →](https://openregard.org/docs/#lifecycle-and-cleanup)
- **API:** configuration, controller methods and validation are in the [reference](https://openregard.org/docs/#define-your-profiles). Module imports and controller creation are SSR-safe.
- **Adoption:** check your content, reflow, forms, colors and browser preferences using the [adoption contract](docs/adoption-contract.md).

## Develop and contribute

```sh
npm ci
npm run check        # types, unit/hydration tests, build, clean package consumer
npx playwright install chromium firefox
npm run test:browser # native controls, synchronization, reflow, docs and source tabs
npm run demo        # packaged examples on localhost:4397
npm run build:site
npm run site        # project site on localhost:4399
```

See [contributing](CONTRIBUTING.md), [releases](https://github.com/inferal-oss/openregard/releases) and [issues](https://github.com/inferal-oss/openregard/issues). [Machine-readable site index →](https://openregard.org/llms.txt)

Sponsored by [Inferal](https://inferal.com/). The sponsor's website mark is separate from the reusable widget.
