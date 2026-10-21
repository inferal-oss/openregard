# Documentation

Open Regard is a **modular accessibility toolkit**. Use each module independently, with its own integration and documentation. **Display is the first available module**: configurable site-owned profiles, remembered across pages and tabs. More modules will follow; this release contains Display.

<div class="docs-callout"><strong>You supply the profiles and CSS.</strong> Open Regard supplies the controller and native controls. Installing it does not establish accessibility conformance.</div>

## Display module and imports

`openregard/display` is the Display module: `createDisplay`, `mountDisplayWidget` and `validateDisplayConfig`. Its optional entries are `openregard/display/react`, `openregard/display/presets`, `openregard/display/style.css` and browser bundles. **Vision is a configurable profile, not a separate module.**

The original root exports (`createRegard`, `mountWidget`, `RegardWidget` from `openregard/react`) remain compatible. Existing integrations can migrate imports and names without changing profile IDs or storage keys.

For ready-to-compose WCAG and WHATWG recipes, see the dedicated [Display presets guide](../presets/).

## Quick start

Install the package from [npm](https://www.npmjs.com/package/openregard):

```sh
npm install openregard
```

Create one controller for your browser application and share it across controls:

```ts
import { createDisplay, mountDisplayWidget } from "openregard/display";
import "openregard/display/style.css";

const regard = createDisplay({
  version: 1,
  defaultProfile: "original",
  storageKey: "my-site-view",
  controlLabel: "Reading and display preferences",
  profiles: [
    { id: "original", label: "Original" },
    {
      id: "roomy",
      label: "Vision",
      description: "Larger text and more generous spacing.",
      tokens: {
        "--reading-size": "125%",
        "--reading-leading": "1.8",
      },
    },
  ],
});

const widget = mountDisplayWidget(
  document.querySelector<HTMLElement>("#display-settings")!,
  regard,
);
```

Add a container in your page and use the optional tokens in **your** CSS:

```html
<div id="display-settings"></div>
```

```css
:root {
  font-size: var(--reading-size, 100%);
}
body {
  line-height: var(--reading-leading, 1.5);
}
```

A controller applies `data-regard-profile="roomy"` to the document root by default. Tokens are optional: you can instead write your own selectors using that attribute. Profile IDs have no built-in meaning. Optional token recipes are available separately from `openregard/display/presets`; they do not apply CSS until you compose them into profiles and consume their properties.

## Run the examples

The runnable demo ships in the npm package. It needs no checkout or bundler:

```sh
npx --package=openregard openregard-demo
```

Open `http://127.0.0.1:4397/examples/`. The [vanilla](../examples/), [static documentation](../examples/docs.html), and [React](../examples/react.html) pages are also live on this website. Each includes a source viewer. The examples offer Standard, Vision, Vision + High Contrast and Max Contrast. The full selected label and description wrap below the native select.

From a source checkout, run `npm ci`, `npm run build`, and `npm run demo`. To build this project website, run `npm run build:site`, then `npm run site`.

## Define your profiles

```ts
interface DisplayProfile {
  id: string;
  label: string;
  description?: string;
  tokens?: Record<`--${string}`, string>;
}

interface DisplayConfig {
  version: 1;
  defaultProfile: string;
  storageKey: string;
  controlLabel: string;
  profiles: readonly DisplayProfile[];
  attribute?: string;
}
```

| Field            | Contract                                                                   |
| ---------------- | -------------------------------------------------------------------------- |
| `version`        | Use `1`. Unsupported versions throw a diagnostic error.                    |
| `defaultProfile` | An existing profile ID; used for missing or retired saved choices.         |
| `storageKey`     | A nonempty localStorage key that you own. Agree on it across app and docs. |
| `controlLabel`   | A nonempty localized accessible name for the select.                       |
| `profiles`       | Your ordered, nonempty list of profiles, with unique stable IDs.           |
| `attribute`      | A lowercase `data-*` attribute. Defaults to `data-regard-profile`.         |

IDs are case-sensitive, 1–64 ASCII letters, digits, underscores or hyphens, starting with a letter or digit. Keep them stable when translating labels. Tokens must use CSS custom-property names and nonempty string values. Configuration is trusted application code; the browser determines whether a CSS value is valid.

`createDisplay(config)` validates and freezes a copy of the configuration. `validateDisplayConfig(config)` is available separately when you want to validate at build time.

## Use the native widget

`mountDisplayWidget(container, regard, options?)` appends a widget to your container and returns its `element`, `select`, and `destroy()` method. Multiple widgets sharing a controller update together without replacing their selects or losing focus.

```ts
const first = mountDisplayWidget(headerSettings, regard);
const second = mountDisplayWidget(footerSettings, regard, { icon: false });

// When you remove those parts of the interface:
first.destroy();
second.destroy();
```

The visible label, accessible name, selected profile text and description come from your configuration. The eye is decorative. Hide it with `{ icon: false }` or provide an element factory through `icon: document => element`. A replacement icon must not contain interactive elements.

Import `openregard/display/style.css` for the small, widget-only styles. They inherit the site's font, use platform control colors, preserve visible keyboard focus and add no animation. You can style `.openregard*` classes to fit your interface. Site-wide typography, layout and colors remain yours.

## Style the widget

Both bindings render ordinary, unshadowed DOM with the same public CSS classes. The stylesheet is optional: import it for usable defaults, or supply all your own widget CSS. It uses low-specificity `:where(...)` selectors, inherits the site font and imposes no page styling. There are no inline widget styles to override.

Scope a theme with `className` in either binding:

```ts
mountDisplayWidget(container, regard, {
  className: "footer-display",
  icon: false,
});
```

```tsx
<DisplayWidget display={regard} className="footer-display" icon={false} />
```

Load your stylesheet after the default stylesheet. Custom properties on a wrapper theme just that widget; values on an ancestor or root are inherited:

```css
.footer-display {
  --openregard-control-background: #17352d;
  --openregard-control-color: #f8faf4;
  --openregard-control-border-color: #17352d;
  --openregard-control-radius: 0.5rem;
  --openregard-control-padding: 0.75em 1em;
  --openregard-gap: 0.75em;
  --openregard-focus-color: #17352d;
}
.footer-display .openregard-label {
  font-weight: 600;
}
.footer-display .openregard-select {
  inline-size: 100%;
}
```

| Property                            | Default        |
| ----------------------------------- | -------------- |
| `--openregard-color`                | `inherit`      |
| `--openregard-gap`                  | `0.5em`        |
| `--openregard-icon-size`            | `1.2em`        |
| `--openregard-control-background`   | `Canvas`       |
| `--openregard-control-color`        | `CanvasText`   |
| `--openregard-control-border-color` | `currentColor` |
| `--openregard-control-border-width` | `1px`          |
| `--openregard-control-radius`       | `0.3em`        |
| `--openregard-control-padding`      | `0.5em`        |
| `--openregard-color-scheme`         | `normal`       |
| `--openregard-focus-color`          | `currentColor` |
| `--openregard-focus-width`          | `2px`          |
| `--openregard-description-size`     | `0.9em`        |

Public hooks are `.openregard-widget` (outer wrapper), `.openregard` (label/layout), `.openregard-label`, `.openregard-select`, `.openregard-icon` and `.openregard-description`. Use them for layout as well as appearance. `mountDisplayWidget` also returns `element` and `select` for direct DOM integration. The examples use the same `demo-widget` theme for vanilla and React; inspect **demo.css** in their source viewer.

Keep the native select, its accessible name, visible keyboard focus, wrapping selected description and browser forced-color behavior. Native option popup styling varies by platform. Avoid fixed heights, clipping enlarged labels, removing outlines or setting `forced-color-adjust: none`. The label and description are meaningful content, not decoration. For a custom control, subscribe to the controller (or use `useDisplayProfile` in React) and implement its accessibility behavior yourself.

## Build custom widgets

The Display controller is **headless**. `mountDisplayWidget` and `DisplayWidget` are optional views over that controller; your application can supply its entire interface. No bundled widget CSS is required.

[Try the live custom-control example and read its source →](../custom-widgets/)

Reuse `createDisplay(config)` and its `setProfile`, `getSnapshot`, `subscribe` and `start` methods. Your custom control supplies markup and interaction; the controller still owns validation, CSS tokens, persistence, reset behavior and synchronization. A custom widget and a standard widget can share the same controller without an adapter.

### Vanilla custom control

This example creates a group of native toggle buttons. It reads labels from configuration, updates the pressed state without replacing focused elements, and releases its lease and subscription on destruction.

<!-- OPENREGARD_CUSTOM_VANILLA -->

Mount it after the container exists, using a controller shared with your app:

```js
import { createDisplay } from "openregard/display";
const display = createDisplay(config);
const widget = mountProfileButtons(container, display);
// Later, when this UI is removed:
widget.destroy();
```

When reusing a controller initialized before paint, pass that existing instance instead of creating another one. A page-level `display.start()` lease can retain preferences while all controls are temporarily unmounted.

### React custom control

Reuse `useDisplayProfile(display)` for the subscription, SSR snapshot and browser lease. The returned ID is reactive; use the same controller to change the selection. You do not need to render `DisplayWidget` or reimplement localStorage and storage events.

<!-- OPENREGARD_CUSTOM_REACT -->

Pass a stable controller created once per browser app or SSR request. If your app also uses a provider, give both the provider and custom controls that instance: `<DisplayProvider display={display}>`. The hook works independently of the standard widget and provider.

### Style and interaction

Your custom UI owns its styling. The live button example uses this CSS; it does not import or depend on `openregard/display/style.css`:

<!-- OPENREGARD_CUSTOM_CSS -->

Keep a visible group label and full choice names. Native buttons already support Tab, Enter and Space; `aria-pressed` exposes their state. A radio-group design instead needs radio semantics and its expected keyboard behavior. Preserve focus on updates, indicate selection with more than color, allow labels to wrap and check forced colors, narrow layouts and enlargement. Tokens cannot supply these semantics for custom markup.

The live example shares its controller with the standard select above it. Switching either updates both, and selecting a profile still updates the page and other same-origin tabs.

## Standards and token presets

[Open the dedicated Display presets guide →](../presets/)

The optional entry `openregard/display/presets` offers **WCAG-informed visual recipes** and a **WHATWG-inspired native-control recipe**. Both are immutable token maps you can spread into `tokens`; importing them has no DOM side effects. They are starting points for site-owned profiles, not built-in profile IDs or a conformance guarantee.

```ts
import { wcagPresets, htmlPresets } from "openregard/display/presets";

const vision = {
  id: "vision",
  label: "Vision",
  tokens: {
    ...wcagPresets.textSpacing,
    ...htmlPresets.nativeControls,
    "--regard-font-size": "125%",
  },
};
const highContrast = {
  id: "vision-contrast",
  label: "Vision + High Contrast",
  tokens: { ...vision.tokens, ...wcagPresets.contrastLight },
};
// Include these in createDisplay({ ..., profiles: [original, vision, highContrast] }).
```

Your CSS connects each token to actual content:

```css
:root {
  font-size: var(--regard-font-size, 100%);
  color: var(--regard-page-ink, #20332d);
  background: var(--regard-page-paper, #f3f4ed);
}
body {
  line-height: var(--regard-line-height, 1.6);
  letter-spacing: var(--regard-letter-spacing, normal);
  word-spacing: var(--regard-word-spacing, normal);
}
p {
  margin-block-end: var(--regard-paragraph-spacing, 1em);
}
h1,
h2,
h3,
button,
input,
select {
  line-height: var(--regard-line-height, 1.3);
  letter-spacing: var(--regard-letter-spacing, normal);
  word-spacing: var(--regard-word-spacing, normal);
}
.card {
  border: 1px solid var(--regard-border-color, #71877a);
}
.dark-panel {
  color: var(--regard-panel-ink, #f8faf4);
  background: var(--regard-panel-paper, #17352d);
}
```

### Profiles in the live examples

The runnable examples compose these recipes into site-owned profiles:

| Profile                | Composition                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Standard               | The site's default presentation; no token overrides.                                 |
| Vision                 | `textSpacing` + `nativeControls` + 125% root font size.                              |
| Vision + High Contrast | Vision + `contrastLight`, including paired colors and stronger borders.              |
| Max Contrast           | `textSpacing` + `nativeControls` + 150% root font size and custom black/white pairs. |

The project website uses calmer reading profiles with modest tracking and compact headings; it does not automatically apply the full WCAG spacing test recipe.

These profile names are library examples, not names defined by W3C or WHATWG. Copy and adapt them; the standards sources below explain which values informed the recipes.

### WCAG visual recipes

| Recipe                      | Tokens and intended use                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `wcagPresets.textSpacing`   | `--regard-line-height: 1.5`, `--regard-paragraph-spacing: 2em`, `--regard-letter-spacing: 0.12em`, `--regard-word-spacing: 0.16em`. |
| `wcagPresets.text200`       | `--regard-font-size: 200%`. A resize test/starting point; browser zoom remains available.                                           |
| `wcagPresets.contrastLight` | Page ink/paper `#17352d` / `#f8faf4`; panel inverse; border `#71877a`.                                                              |
| `wcagPresets.contrastDark`  | Page ink/paper `#f8faf4` / `#17352d`; panel inverse; border `#71877a`.                                                              |

The spacing recipe reflects the override values in [WCAG 2.2 SC 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html). Sites must tolerate those overrides without losing content or functionality; they are **not required default styling**. Adapt the recipe for languages and scripts that use different spacing conventions. Authored component rules can override inheritance, so wire the properties into all relevant text styles.

Both contrast recipes use solid text/background pairs above the 7:1 threshold in [SC 1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html). Their borders also exceed 3:1 against both supplied surfaces, informed by [SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Transparency, imagery, syntax colors, links and component states can change the result; test them separately.

The resize recipe helps exercise [SC 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), which concerns resizing text to 200% without loss. A selector does not replace browser enlargement. Check [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) at 320 CSS pixels and test the actual layouts.

### WHATWG native HTML recipe

`htmlPresets.nativeControls` sets `--openregard-control-background: Canvas`, `--openregard-control-color: CanvasText`, `--openregard-control-border-color: ButtonText`, `--openregard-focus-color: CanvasText` and `--openregard-color-scheme: light dark`. The optional widget CSS consumes them, keeping platform colors and the user's preferred color scheme. A theme set directly on a widget overrides inherited profile tokens.

This is a library styling recipe inspired by [WHATWG's rendering guidance for selects](https://html.spec.whatwg.org/multipage/rendering.html#the-select-element-2), not a standardized WHATWG token set. HTML does not prescribe WCAG numeric contrast or spacing values. Native semantics still require real HTML:

```html
<label>
  Reading preferences
  <select name="display-profile">
    <option value="original">Standard</option>
    <option value="vision">Vision</option>
  </select>
</label>
<button type="button">Reset preferences</button>
```

The library widget already uses a native label, select and options. If you build your own, wire its `change` event to `regard.setProfile(...)` and subscribe to keep its value synchronized. Preserve the [label association](https://html.spec.whatwg.org/multipage/forms.html#the-label-element), [select semantics](https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element), keyboard interaction and focus. Use real links, headings, landmarks and labeled inputs around the widget. Tokens cannot repair missing semantics.

For classic scripts, self-host `openregard/display/presets/browser.js` and load it synchronously **between** the core bundle and a configuration that uses presets. It exposes `OpenRegardPresets.wcagPresets` and `OpenRegardPresets.htmlPresets`. The three runnable examples demonstrate this setup.

## React binding

Import from `openregard/display/react`. React is optional; the Display core and browser bundle never import it.

### Configure a standalone widget

A single widget can create and manage its controller directly from configuration:

```tsx
import { DisplayWidget } from "openregard/display/react";
import "openregard/display/style.css";

const config = {
  version: 1 as const,
  defaultProfile: "standard",
  storageKey: "my-site-view",
  controlLabel: "Reading preferences",
  profiles: [
    { id: "standard", label: "Standard" },
    { id: "vision", label: "Vision", tokens: { "--reading-size": "125%" } },
  ],
};
export function Settings() {
  return <DisplayWidget config={config} className="my-display" />;
}
```

Your CSS must still consume the tokens. Keep configuration stable, for example at module scope in a browser application or memoized from props. A changed config object creates a new controller; cleanup releases the previous one and the new instance reads the saved preference after mounting. A standalone widget starts after mount, so it can show the default briefly.

### Share configuration across React controls

Use one provider for multiple widgets and custom UI. Set `config` on the provider; its descendants inherit the controller:

```tsx
import {
  DisplayProvider,
  DisplayWidget,
  useDisplayProfile,
} from "openregard/display/react";

function CurrentProfile() {
  const profile = useDisplayProfile();
  return <p>Selected profile: {profile}</p>;
}
function App() {
  return (
    <DisplayProvider config={config}>
      <header>
        <DisplayWidget />
      </header>
      <CurrentProfile />
      <footer>
        <DisplayWidget icon={false} />
      </footer>
    </DisplayProvider>
  );
}
```

Do not mount separate `config` widgets on the same root: each would try to own that root. A widget inside a provider inherits its configuration; passing `config` there throws a diagnostic error. `DisplayProvider` retains a lease even when no widgets are mounted.

### Reuse an existing controller

For a shared vanilla/React app or before-paint initialization, pass the existing controller:

```tsx
import { createDisplay } from "openregard/display";
import { DisplayWidget, DisplayProvider } from "openregard/display/react";

const display = createDisplay(config); // once per browser app / SSR request
<DisplayWidget display={display} />;
// Or share it throughout a subtree:
<DisplayProvider display={display}>
  <AppContent />
</DisplayProvider>;
```

`DisplayWidget` accepts `config`, `display`, or an inherited provider, plus `className` and an optional decorative `icon`. Choose one source, not both props. `icon={false}` hides the eye. `useDisplayProfile(display?)` reads a provider or explicit controller with `useSyncExternalStore`. Both bindings share the same styling hooks.

React StrictMode and multiple controls are supported. For a custom root, start an existing controller on that root before mounting. Server rendering uses a fresh controller per request and the configured default; use the existing head-created controller for first-paint hydration as described below.

## Before paint and static sites

Importing modules and creating controllers is safe on the server: neither accesses window or document. Calling `start()` needs the browser.

For a saved preference before content paints, self-host `dist/display.browser.js` and your configuration script. Load both synchronously in the head, before body content:

```html
<head>
  <script src="/assets/openregard.js"></script>
  <script src="/assets/display-config.js"></script>
  <link rel="stylesheet" href="/assets/openregard.css" />
</head>
```

```js
// display-config.js
window.siteRegard = OpenRegardDisplay.createDisplay({
  version: 1,
  defaultProfile: "original",
  storageKey: "my-site-view",
  controlLabel: "Choose your view",
  profiles: [
    { id: "original", label: "Original" },
    { id: "roomy", label: "Vision" },
  ],
});
window.stopSiteRegard = window.siteRegard.start();
```

The browser bundle exposes the core API as `OpenRegardDisplay`. Mount controls after their containers exist, for example at DOMContentLoaded. Keep your head-created controller and reuse it throughout the page.

A `defer`, `async`, or module script does not provide the same first-paint guarantee. Self-host pinned assets, check your content security policy, and keep the default page usable when JavaScript is disabled.

## Server rendering and hydration

Create a fresh controller per SSR request and render the configured default. The browser controller reads saved preferences after it starts. React uses a stable default server snapshot during hydration, then subscribes to the saved selection.

For first-paint styling, run the synchronous head initialization above and pass the **existing `window.siteRegard` instance** to the client React tree:

```jsx
import { hydrateRoot } from "react-dom/client";
import { DisplayWidget } from "openregard/display/react";

// Browser entry, after the head script has created the controller.
hydrateRoot(container, <DisplayWidget display={window.siteRegard} />);
```

Do not create a second controller for the same root. Without a head script, `DisplayWidget` starts after mounting and may show the default briefly. Your surrounding markup still needs to satisfy React's hydration rules. If the framework hydrates `<html>` itself, use its supported document strategy to keep root attributes and styles consistent with initialization; do not broadly suppress hydration errors.

## Persistence and synchronization

Selection persists as a profile ID. Controls sharing a controller update immediately; distinct roots using the same storage key synchronize within the page. Same-origin tabs synchronize through storage events.

- Missing, deleted or unknown saved IDs select the configured default.
- Removing the saved key or clearing localStorage in another tab selects the default.
- Unrelated keys and sessionStorage events are ignored.
- Storage failures leave the current in-memory selection usable.
- There is **no automatic cross-subdomain sharing**. Protocol, host and port define the storage origin.

Keep the same IDs, defaults and key across application and documentation builds. If you need to map a retired ID to another profile, migrate storage before starting the controller. Switching before `start()` changes memory only; a successful storage read at start takes precedence. Resetting a stopped controller cannot remove browser storage.

## Lifecycle and cleanup

Every `start()` acquires a lease. Its returned function releases that lease once. The last release removes synchronization listeners and restores the original root attribute and configured inline token values, including priorities. Widgets acquire and release their own leases.

```ts
const regard = createDisplay(config);
const stopPage = regard.start({ root: document.documentElement });
const widget = mountDisplayWidget(settingsContainer, regard);

// Keep your page lease while widgets mount and unmount.
widget.destroy();
stopPage();
```

On every switch, previously owned token overrides return to their captured baseline before the next profile is applied. A default profile without tokens cannot retain stale enlargement or colors. Tokens not named anywhere in your configuration are untouched. Avoid letting another system write those same tokens or the attribute while the controller owns them.

`start({ root, window })` supports a custom HTMLElement and its owning window. One controller owns each root/attribute; share it between widgets. CSS only reaches the root's subtree, so consider portals and independently rendered documents deliberately.

## Controller reference

| Method                | Result                                                          |
| --------------------- | --------------------------------------------------------------- |
| `getSnapshot()`       | Current profile ID; initially the configured default.           |
| `getServerSnapshot()` | The default snapshot used for SSR and hydration.                |
| `setProfile(id)`      | Apply, persist and notify. Unknown IDs throw `RangeError`.      |
| `reset()`             | Select the default and attempt to remove the saved key.         |
| `subscribe(listener)` | Listen to selection changes; returns an unsubscribe function.   |
| `start(options?)`     | Apply saved state and connect synchronization; returns cleanup. |

## Adopt with care

Open Regard selects a preference. Your CSS must honor it across the website, app, docs, forms and owned portals. Preserve browser enlargement, content, functionality and navigation. Check reflow at small widths and test foreground/background pairs on both light and dark surfaces.

Read the [adoption contract](../adoption/) before enabling a profile. It includes practical checks and a migration proposal for Startup Tier. It draws on W3C's guidance on [text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) and [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

## Project and support

Display is available now. Future modules will have their own scope and entry points; features beyond Display are not available in this release.

Find [source and issues on GitHub](https://github.com/inferal-oss/openregard), the [npm package](https://www.npmjs.com/package/openregard), and the [release history](https://github.com/inferal-oss/openregard/releases). Core code is MIT licensed. The website is sponsored by Inferal; its brand mark is separate from the reusable widget.
