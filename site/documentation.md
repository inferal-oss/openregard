# Documentation

Open Regard is an open-source project for small accessibility tools. **Display preferences is the first module**: a configurable choice of site-owned profiles, remembered across pages and tabs. Other accessibility and preference tools can follow; the current release provides display preferences.

<div class="docs-callout"><strong>You supply the profiles and CSS.</strong> Open Regard supplies the controller and native controls. Installing it does not establish accessibility conformance.</div>

## Quick start

Install the package from [npm](https://www.npmjs.com/package/openregard):

```sh
npm install openregard
```

Create one controller for your browser application and share it across controls:

```ts
import { createRegard, mountWidget } from "openregard";
import "openregard/style.css";

const regard = createRegard({
  version: 1,
  defaultProfile: "original",
  storageKey: "my-site-view",
  controlLabel: "Reading and display preferences",
  profiles: [
    { id: "original", label: "Original" },
    {
      id: "roomy",
      label: "Room to read",
      description: "Larger text and more generous spacing.",
      tokens: {
        "--reading-size": "125%",
        "--reading-leading": "1.8",
      },
    },
  ],
});

const widget = mountWidget(
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

A controller applies `data-regard-profile="roomy"` to the document root by default. Tokens are optional: you can instead write your own selectors using that attribute. Profile IDs have no built-in meaning, and the package supplies no preset palettes or typography.

## Run the examples

The runnable demo ships in the npm package. It needs no checkout or bundler:

```sh
npx --package=openregard openregard-demo
```

Open `http://127.0.0.1:4397/examples/`. The [vanilla](../examples/), [static documentation](../examples/docs.html), and [React](../examples/react.html) pages are also live on this website. Each includes a source viewer. The deliberately long profile label demonstrates how the full choice remains visible below a narrow native select.

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

`createRegard(config)` validates and freezes a copy of the configuration. `validateConfig(config)` is available separately when you want to validate at build time.

## Use the native widget

`mountWidget(container, regard, options?)` appends a widget to your container and returns its `element`, `select`, and `destroy()` method. Multiple widgets sharing a controller update together without replacing their selects or losing focus.

```ts
const first = mountWidget(headerSettings, regard);
const second = mountWidget(footerSettings, regard, { icon: false });

// When you remove those parts of the interface:
first.destroy();
second.destroy();
```

The visible label, accessible name, selected profile text and description come from your configuration. The eye is decorative. Hide it with `{ icon: false }` or provide an element factory through `icon: document => element`. A replacement icon must not contain interactive elements.

Import `openregard/style.css` for the small, widget-only styles. They inherit the site's font, use platform control colors, preserve visible keyboard focus and add no animation. You can style `.openregard*` classes to fit your interface. Site-wide typography, layout and colors remain yours.

## React binding

React is an optional peer dependency. The core and browser bundle do not import it.

```tsx
import { createRegard } from "openregard";
import { RegardWidget } from "openregard/react";
import "openregard/style.css";

// Reuse the same instance; do not create one on every render.
const regard = createRegard(config);

export function Settings() {
  return <RegardWidget regard={regard} />;
}
```

`RegardWidget` accepts `regard`, an optional decorative `icon`, and `className`. Pass `icon={false}` to hide the eye. `useProfile(regard)` is available when you need a custom React control; it subscribes with `useSyncExternalStore` and starts the controller after mounting.

React StrictMode and multiple controls are supported. No generated label IDs depend on the surrounding provider tree. For a custom root, start the controller on that root before mounting React controls.

## Before paint and static sites

Importing modules and creating controllers is safe on the server: neither accesses window or document. Calling `start()` needs the browser.

For a saved preference before content paints, self-host `dist/browser.js` and your configuration script. Load both synchronously in the head, before body content:

```html
<head>
  <script src="/assets/openregard.js"></script>
  <script src="/assets/display-config.js"></script>
  <link rel="stylesheet" href="/assets/openregard.css" />
</head>
```

```js
// display-config.js
window.siteRegard = OpenRegard.createRegard({
  version: 1,
  defaultProfile: "original",
  storageKey: "my-site-view",
  controlLabel: "Choose your view",
  profiles: [
    { id: "original", label: "Original" },
    { id: "roomy", label: "Room to read" },
  ],
});
window.stopSiteRegard = window.siteRegard.start();
```

The browser bundle exposes the core API as `OpenRegard`. Mount controls after their containers exist, for example at DOMContentLoaded. Keep your head-created controller and reuse it throughout the page.

A `defer`, `async`, or module script does not provide the same first-paint guarantee. Self-host pinned assets, check your content security policy, and keep the default page usable when JavaScript is disabled.

## Server rendering and hydration

Create a fresh controller per SSR request and render the configured default. The browser controller reads saved preferences after it starts. React uses a stable default server snapshot during hydration, then subscribes to the saved selection.

For first-paint styling, run the synchronous head initialization above and pass the **existing `window.siteRegard` instance** to the client React tree:

```jsx
import { hydrateRoot } from "react-dom/client";
import { RegardWidget } from "openregard/react";

// Browser entry, after the head script has created the controller.
hydrateRoot(container, <RegardWidget regard={window.siteRegard} />);
```

Do not create a second controller for the same root. Without a head script, `RegardWidget` starts after mounting and may show the default briefly. Your surrounding markup still needs to satisfy React's hydration rules. If the framework hydrates `<html>` itself, use its supported document strategy to keep root attributes and styles consistent with initialization; do not broadly suppress hydration errors.

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
const regard = createRegard(config);
const stopPage = regard.start({ root: document.documentElement });
const widget = mountWidget(settingsContainer, regard);

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

The first release focuses on display preferences. Open Regard is a broader home for future, carefully scoped accessibility tools; features beyond this module are not available yet.

Find [source and issues on GitHub](https://github.com/inferal-oss/openregard), the [npm package](https://www.npmjs.com/package/openregard), and the [release history](https://github.com/inferal-oss/openregard/releases). Core code is MIT licensed. The website is sponsored by Inferal; its brand mark is separate from the reusable widget.
