import { mkdir, cp, readFile, writeFile, rm } from "node:fs/promises";
import { Marked } from "marked";
import { readDocumentation } from "./documentation.mjs";
import { createHash } from "node:crypto";
import { highlight, escape } from "./highlight.mjs";
const out = ".pages";
const assetVersion = createHash("sha256")
  .update(
    (
      await Promise.all(
        [
          "site/index.html",
          "site/site.css",
          "site/site.js",
          "site/display-config.js",
          "site/custom-widget.js",
          "site/custom-widget.css",
          "site/snippets/custom-react.tsx",
          "site/documentation.md",
          "package.json",
        ].map((file) => readFile(file, "utf8")),
      )
    ).join("\n"),
  )
  .digest("hex")
  .slice(0, 10);
const versionAssets = (markup) =>
  markup.replace(
    /((?:src|href)=")([^"#?]+\.(?:js|css|svg))(")/g,
    `$1$2?v=${assetVersion}$3`,
  );
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp("site", out, { recursive: true });
await cp("dist", `${out}/dist`, { recursive: true });
await cp("dist/examples", `${out}/examples`, { recursive: true });
await writeFile(`${out}/.nojekyll`, "");
let html = await readFile("site/index.html", "utf8");
const snippets = await Promise.all(
  [
    ["vanilla", "vanilla.js", "js"],
    ["react", "react.tsx", "tsx"],
  ].map(
    async ([id, file, language]) =>
      `<div data-quickstart-panel="${id}"${id === "react" ? " hidden" : ""}><pre><code class="hljs">${highlight(await readFile(`site/snippets/${file}`, "utf8"), language)}</code></pre></div>`,
  ),
);
html = html.replace("<!-- OPENREGARD_QUICKSTART -->", snippets.join(""));
html = html.replace(
  "</head>",
  '<link rel="stylesheet" href="./dist/highlight.css"></head>',
);
await writeFile(`${out}/index.html`, versionAssets(html));
const header = html
  .slice(html.indexOf("<header"), html.indexOf("<main"))
  .replaceAll("./", "../")
  .replaceAll('href="#', 'href="../#');
const footer = html
  .slice(html.indexOf("<footer"), html.indexOf('<script src="./site.js"'))
  .replaceAll("./", "../");
const head = (title) =>
  html
    .slice(0, html.indexOf("<body>"))
    .replaceAll("./", "../")
    .replace(/<title>.*?<\/title>/, `<title>${title} — Open Regard</title>`);
for (const [route, title, file, isDocs] of [
  ["adoption", "Adoption contract", "docs/adoption-contract.md", false],
  ["docs", "Documentation", "site/documentation.md", true],
  ["presets", "Display presets", "site/documentation.md", true],
  ["custom-widgets", "Custom display widgets", "site/documentation.md", true],
]) {
  const headings = [];
  let used = new Map();
  const markdown = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const label = tokens
          .map((t) => t.raw)
          .join("")
          .replaceAll("`", "");
        const base = label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        const n = used.get(base) ?? 0;
        used.set(base, n + 1);
        const id = n ? `${base}-${n}` : base;
        if (depth === 2) headings.push({ id, label });
        return `<h${depth} id="${id}">${text}</h${depth}>`;
      },
      code({ text, lang }) {
        return `<div class="docs-code"><div class="docs-code-label">${escape(lang ?? "code")}</div><pre><code class="hljs">${highlight(text, lang ?? "")}</code></pre></div>`;
      },
    },
  });
  let source =
    file === "site/documentation.md"
      ? await readDocumentation()
      : await readFile(file, "utf8");
  if (route === "presets")
    source = source
      .slice(
        source.indexOf("## Standards and token presets"),
        source.indexOf("## React binding"),
      )
      .replace("## Standards and token presets", "# Display presets")
      .replace("[Open the dedicated Display presets guide →](../presets/)", "")
      .replaceAll("### ", "## ");
  if (route === "custom-widgets")
    source = source
      .slice(
        source.indexOf("## Build custom widgets"),
        source.indexOf("## Standards and token presets"),
      )
      .replace("## Build custom widgets", "# Custom Display widgets")
      .replace(
        "[Try the live custom-control example and read its source →](../custom-widgets/)",
        '<div class="docs-callout"><strong>Live custom control</strong><p>These buttons share a controller with the standard select above. Change either one to see both update.</p><div id="custom-display-demo"></div></div>',
      )
      .replaceAll("### ", "## ");
  if (route === "docs")
    source = source.replace(
      /## Build custom widgets[\s\S]+?(?=## Standards and token presets)/,
      `## Build custom widgets

The Display controller is headless; both bundled widgets are optional. Build your own UI using \`getSnapshot\`, \`subscribe\`, \`setProfile\` and \`start\`. In React, \`useDisplayProfile(display)\` reuses the subscription, server snapshot and lifecycle handling.

[Try the custom button control and read the vanilla/React implementations →](../custom-widgets/)

`,
    );
  const content = markdown.parse(source);
  const controls = '<div class="docs-controls" id="docs-controls"></div>';
  const main = isDocs
    ? `<main id="main" class="shell docs-layout"><aside class="docs-sidebar"><a class="docs-version" href="https://www.npmjs.com/package/openregard">openregard / npm ↗</a><details open><summary>On this page</summary><nav aria-label="Documentation sections">${headings.map(({ id, label }) => `<a href="#${id}">${escape(label)}</a>`).join("")}</nav></details></aside><article class="docs-content">${controls}${content}</article></main>`
    : `<main id="main" class="article docs-content shell">${controls}${content}</main>`;
  await mkdir(`${out}/${route}`, { recursive: true });
  const routeHead =
    route === "custom-widgets"
      ? head(title).replace(
          "</head>",
          '<link rel="stylesheet" href="../custom-widget.css"></head>',
        )
      : head(title);
  const customScript =
    route === "custom-widgets"
      ? '<script src="../custom-widget.js" defer></script>'
      : "";
  await writeFile(
    `${out}/${route}/index.html`,
    versionAssets(
      `${routeHead}<body><a class="skip" href="#main">Skip to content</a>${header}${main}${footer}${customScript}<script src="../docs.js" defer></script></body></html>`,
    ),
  );
}
const plainDocs = (await readDocumentation())
  .replaceAll("(../examples/", "(https://openregard.org/examples/")
  .replaceAll("(../adoption/)", "(https://openregard.org/adoption/)")
  .replaceAll("(../presets/)", "(https://openregard.org/presets/)")
  .replaceAll(
    "(../custom-widgets/)",
    "(https://openregard.org/custom-widgets/)",
  );
await writeFile(`${out}/docs/display.md`, plainDocs);
for (const page of ["index.html", "docs.html", "react.html"]) {
  const file = `${out}/examples/${page}`;
  await writeFile(file, versionAssets(await readFile(file, "utf8")));
}
console.log("GitHub Pages site built in .pages/");
