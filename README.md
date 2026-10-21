# Open Regard

Configurable display preferences for websites, applications and static documentation.
A small TypeScript controller remembers a profile, applies a CSS hook and optional custom properties, and synchronizes native controls. You own the profiles and the styles that honor them.

```sh
npm install openregard
```

No runtime dependencies in the core. ESM, public TypeScript types, standalone browser bundle, widget CSS, optional React 18/19 binding. MIT licensed. Originally extracted from Startup Tier.

## Project website

The GitHub Pages website uses Open Regard itself and includes all three live demos.
From a source checkout, build it with `npm run build:site`, then run `npm run site` and open
http://127.0.0.1:4399/. The website sponsorship credit is separate from the reusable widget.

## Run the included demo

The published package includes a runnable demo with vanilla widgets, a separate static documentation page and a React example. No bundler or checkout required:

```sh
npx --package=openregard openregard-demo
# Open http://127.0.0.1:4397/examples/
```

From a source checkout:

```sh
npm ci
npm run build
npm run demo
```

The demo binds only to localhost, uses its own storage key and includes a deliberately long profile label, paired light/dark colors, flexible cards and forms. Both bindings share one controller. Open its docs in another tab to see synchronization.

## Vanilla

```js
import { createRegard, mountWidget } from "openregard";
import "openregard/style.css";

const regard = createRegard({
  version: 1,
  defaultProfile: "standard",
  storageKey: "my-site-display",
  controlLabel: "Reading and display preferences", // localize this
  profiles: [
    { id: "standard", label: "Standard" },
    {
      id: "roomy",
      label: "Room to read",
      description: "Larger text and spacing",
      tokens: { "--reading-size": "125%", "--reading-leading": "1.8" },
    },
  ],
});
const stop = regard.start();
const widget = mountWidget(document.querySelector("#display-settings"), regard);
// Later: widget.destroy(); stop();
```

Your site CSS must use the hook or tokens:

```css
:root {
  font-size: var(--reading-size, 100%);
}
body {
  line-height: var(--reading-leading, 1.5);
}
/* Tokens are optional. Profile IDs have no built-in meaning. */
:root[data-regard-profile="roomy"] .cards {
  gap: 1.5rem;
}
```

Keep the controller stable and share it across widgets. Each `start()` acquires a lease; its returned cleanup releases that lease. Widgets acquire/release their own leases. The last cleanup restores the root's original attribute and the values/priorities of all configured inline tokens. Dispose widgets before releasing your page lease. Storage is retained after cleanup.

`start({root, window})` supports a custom HTMLElement root and its owning window. A widget uses the controller's active root, or the document root when not started. Use one controller per root/attribute. Distinct roots with the same storage key synchronize on the same page. Do not ship duplicate independent copies controlling the same root.

## Configuration and API

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
  attribute?: string; // defaults to data-regard-profile
}
```

IDs are case-sensitive, 1–64 ASCII letters/digits/underscores/hyphens, beginning with a letter or digit. Keep IDs stable when translating labels. Empty labels, duplicate IDs, missing defaults, invalid token names and invalid attributes throw diagnostic errors at creation. `validateConfig(config)` returns an immutable copy. Tokens accept nonempty CSS strings; configuration is trusted application code, not untrusted user input. The browser determines CSS value validity.

| Method                | Behavior                                                                |
| --------------------- | ----------------------------------------------------------------------- |
| `getSnapshot()`       | Current profile ID; initially the default until `start()` reads storage |
| `getServerSnapshot()` | Always the configured default for SSR/hydration                         |
| `setProfile(id)`      | Apply, persist and notify; unknown IDs throw `RangeError`               |
| `reset()`             | Select default and attempt to remove the saved key                      |
| `subscribe(fn)`       | Listen to selection changes; returns unsubscribe                        |
| `start(options?)`     | Start synchronization and application; returns idempotent cleanup       |

On switching, all owned tokens return to their original baseline before the next profile's tokens are applied. A profile with no tokens cannot retain a previous profile's overrides. Tokens absent from the whole configuration are never touched. Avoid having another system write the same inline tokens/attribute while the controller owns them: final cleanup restores the captured baseline. Same-origin documents outside a custom root still share the preference, not the CSS scope.

Storage reads/writes are best effort. Selection works in memory if storage access fails. Missing, deleted or unknown saved IDs use the default. A cross-tab key removal or `localStorage.clear()` selects the default; unrelated keys and sessionStorage events are ignored. Changes within a page synchronize immediately, without relying on a storage event from the same tab. Switching before `start()` changes only memory; a later successful storage read takes precedence. `reset()` while stopped cannot clear browser storage.

There is **no automatic cross-subdomain synchronization**: protocol, host and port define the localStorage origin. Agree on IDs, defaults and storage keys across app/docs pages. Migrate retired IDs deliberately if you need something other than default fallback.

## Widget accessibility and customization

The widget is a native select with a localized accessible name, a visible label, selected profile text/description and a visible focus outline. Browser keyboard behavior, selection and focus are retained while profiles switch. The full selected label wraps below the select, including when a long native option cannot fit in a narrow viewport. All profile descriptions are also available in the select title; the current description is exposed through `aria-description`. No generated IDs or live announcements are needed.

`mountWidget(container, regard, {icon:false})` removes the decorative eye; `icon: document => element` provides a decorative replacement. The factory must return a noninteractive element. The eye is original artwork; no Lucide assets are bundled. Style `.openregard*` classes as needed. CSS affects only the widget, uses inherited font and platform Canvas/CanvasText colors, introduces no animations and keeps browser forced colors available. Avoid adding a second border to the wrapper.

## React

```tsx
import { createRegard } from "openregard";
import { RegardWidget, useProfile } from "openregard/react";
import "openregard/style.css";

// Create once per browser app, and once per SSR request (not once per render).
const regard = createRegard(config);
function Settings() {
  return <RegardWidget regard={regard} />;
}
```

React is an optional peer and never imported by the core or browser bundle. `useProfile(regard)` uses `useSyncExternalStore` and acquires a browser lease after mounting. `RegardWidget` accepts `icon={false}`, a decorative React node and `className`. Custom icons must not contain interactive elements. React StrictMode and multiple widgets are supported. Custom-root apps should start the controller on that root before mounting.

## Before paint, static sites and SSR

All module imports and controller creation are safe without window/document. `start()` needs the browser. For first-paint preferences, copy `dist/browser.js` and your configuration script into your site's assets and load them **synchronously in the head**, before body content. Neither `defer`, `async` nor a module script provides this first-paint guarantee:

```html
<script src="/assets/openregard.js"></script>
<script src="/assets/display-config.js"></script>
<link rel="stylesheet" href="/assets/openregard.css" />
```

```js
// display-config.js: external script, compatible with a self-only script CSP.
window.siteRegard = OpenRegard.createRegard({/* your configuration */});
window.stopSiteRegard = window.siteRegard.start();
```

The global bundle exports the same core API as `openregard`. Bind vanilla widgets after DOMContentLoaded. See [the static example](examples/index.html) and [docs example](examples/docs.html). Self-host pinned assets; test your CSP (token overrides use inline CSS custom properties). With JavaScript disabled the page keeps its site default; provide normal accessible markup regardless of the widget.

For SSR, render with a fresh server controller and the configured default snapshot. On the client, pass the **existing `window.siteRegard` controller** from the synchronous head script into your React tree. Do not create another controller for the same root. Hydration renders the default snapshot first, then subscribes to the saved browser selection without replacing the select. The controller has already applied the saved page CSS before paint. No generated label IDs depend on provider-tree shape. Your surrounding DOM still has to satisfy React's normal hydration rules. If your framework hydrates `<html>` itself, arrange its root attributes/styles to agree with the head initialization using that framework's supported document strategy; do not broadly suppress hydration errors.

Without the synchronous head script, `<RegardWidget>` reads preferences after mounting; that may show the default briefly. To bundle a smaller custom prepaint entry, import `createRegard`, create the page controller and expose the same instance for the client. Keep the configuration consistent between server, client and documentation builds.

## Adoption contract and validation

Read [the adoption contract](docs/adoption-contract.md) before enabling a profile. Open Regard selects a preference; it cannot make an arbitrary site accessible. Installing it is not an accessibility compliance claim.

```sh
npm run check        # types, unit/hydration tests, build and clean tarball consumer
npx playwright install chromium firefox
npm run test:browser # native keyboard, tabs, 320px, enlargement, static docs and React
```

The browser demo is included in the package; tests and development tools stay in the repository. See [contributing](CONTRIBUTING.md) for release verification.
