# Contributing

Use Node.js 22 or later. Run `npm ci`, `npm run check`, then install Playwright's
Chromium and Firefox and run `npm run test:browser`. CI runs these checks on Linux.
Keep the core dependency-free and all imports safe in a server environment.

Changes to configuration or lifecycle behavior need transition tests. Check the
actual packed package in a clean consumer, not only workspace imports. Demo pages
are shipped and must work through `npx --package=openregard openregard-demo`.

For a release: review `npm pack --dry-run`, run all checks, create the concrete
versioned tarball, and publish that tarball with browser-authorized npm login.
Never commit registry credentials. Verify the exact version from the public
registry by running the package consumer smoke check with that version, then tag
and create a GitHub release with the verified tarball. Installing the widget does
not establish any site's accessibility conformance.
