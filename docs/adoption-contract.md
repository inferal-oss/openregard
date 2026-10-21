# Adoption contract

Open Regard owns preference selection, persistence, synchronization and its control. The adopter owns each profile's meaning, localized text, CSS, content and layout. IDs are opaque. No profiles, palettes, text-size axes or contrast promises are built in.

## Before enabling a profile

- Apply the selected hook/tokens to your site, authenticated app, independent docs, forms and portals that you own. Document intentional scope boundaries. A portal outside a custom root needs a deliberate style strategy.
- Allow enlargement and reflow. Use relative typography and flexible containers; preserve browser zoom, preferred fonts and text size. Do not force fixed heights, hide navigation or clip important text to make the layout fit.
- Check every foreground/background pair on light and dark surfaces, including buttons, badges, placeholders, pricing panels and focus indicators. Do not recolor third-party overlays with sweeping universal selectors.
- Preserve content, functionality and navigation at every offered profile, at 320 CSS pixels wide, and with browser text enlargement/zoom. A selector cannot repair missing mobile links. Test long translations, search placeholders, badge numeral alignment and header collisions.
- Respect forced colors and reduced motion. Profile styles must not disable platform color adaptation, zoom or user preferences. This widget adds no motion; your page may still need reduced-motion rules.

W3C's [Resize Text explanation](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) describes supporting text enlargement to 200% without losing content or functionality. Its [Reflow explanation](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) describes retaining information and functionality at a width equivalent to 320 CSS pixels for vertical content, with exceptions for content needing two dimensions. Use those explanations alongside the actual WCAG requirements; this checklist and the demo are not a conformance audit.

## Preference and lifecycle agreement

Use the same stable IDs and storage key wherever a same-origin preference should carry over. No automatic sharing crosses origins or subdomains. Removing an ID falls back to the configured default. If preserving a retired preference requires remapping, migrate it before starting the controller. Keep the default, labels and descriptions identical through an SSR lifecycle. The default snapshot is used for server rendering; browser storage becomes authoritative after start.

Use one controller per root and attribute; share it between controls. Before-paint initialization and application code must reuse that same instance. Every start has a matching cleanup; tokens and the attribute restore after the last lease ends. Do not let unrelated code overwrite those owned inline values while active. A switch to default restores baseline inline values, not a guessed palette.

## Suggested Startup Tier migration (review before adoption)

This is a migration proposal, not an implementation in Startup Tier:

1. Install a reviewed exact Open Regard release. Configure `storageKey: 'startuptier-display-mode'`, `attribute: 'data-display'`, default `standard`, and the current IDs `standard`, `vision`, `clarity`, `contrast`. Keep its localized control label and profile descriptions. Existing stored choices then need no rewrite.
2. Keep current site typography, palettes, responsive fixes and docs CSS in Startup Tier. Use hook-only profiles initially; do not move site selectors into the package.
3. Replace the fixed runtime with one page controller. Connect all React/vanilla widgets to it. Replace the old synchronous docs initialization with a bundled/self-hosted head entry using the same config and persistence key. Retire the old runtime together to avoid two owners.
4. Re-run persistence, multi-widget/tab synchronization, unavailable storage and actual SSR hydration checks in Startup Tier's provider tree. Verify docs and app in separate tabs on the same origin. Check mobile navigation, badges, search fields and both light/dark pricing cards at 320px and enlarged settings.
5. Review the extracted package and this contract before any production adoption or deploy.
