import { readFile, writeFile, cp, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { highlight, escape } from "./highlight.mjs";
const require = createRequire(import.meta.url);
await mkdir("dist/examples", { recursive: true });
await cp("examples", "dist/examples", { recursive: true });
const theme = require.resolve("highlight.js/styles/github-dark.css");
await cp(theme, "dist/highlight.css");
await cp(new URL("../LICENSE", pathToFileURL(theme)), "dist/highlight.LICENSE");
await cp("examples/source-viewer.css", "dist/source-viewer.css");
await cp("examples/source-viewer.js", "dist/source-viewer.js");
const specifications = [
  {
    page: "index.html",
    files: [
      ["index.html", "html"],
      ["config.js", "js"],
      ["demo.css", "css"],
    ],
  },
  {
    page: "docs.html",
    files: [
      ["docs.html", "html"],
      ["config.js", "js"],
      ["demo.css", "css"],
    ],
  },
  {
    page: "react.html",
    files: [
      ["react-demo.tsx", "tsx"],
      ["react.html", "html"],
      ["config.js", "js"],
      ["demo.css", "css"],
    ],
  },
];
for (const { page, files } of specifications) {
  const sources = await Promise.all(
    files.map(async ([name, lang]) => ({
      name,
      lang,
      text: (await readFile("examples/" + name, "utf8")).replace(
        "<!-- OPENREGARD_SOURCE -->",
        "",
      ),
    })),
  );
  const tabs = sources
    .map(
      ({ name }, i) =>
        `<button type="button" role="tab" id="source-tab-${i}" aria-controls="source-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${escape(name)}</button>`,
    )
    .join("");
  const panels = sources
    .map(
      ({ name, lang, text }, i) =>
        `<section class="source-panel" data-source-panel id="source-panel-${i}" aria-labelledby="source-tab-${i}"><div class="source-toolbar"><span>${escape(name)}</span><button type="button" data-copy-source>Copy source</button><span role="status"></span></div><pre tabindex="0" aria-label="${escape(name)} source code"><code class="hljs language-${lang}">${highlight(text, lang)}</code></pre></section>`,
    )
    .join("");
  const viewer = `<section class="source-viewer" data-source-viewer aria-label="Example source code"><h2>Source code</h2><p>These are the files behind this example. The tabs support arrow keys, Home and End.</p><div class="source-tabs" role="tablist" aria-label="Source files" data-source-tabs hidden>${tabs}</div>${panels}</section>`;
  let html = await readFile("examples/" + page, "utf8");
  html = html.replace(
    "</head>",
    '<link rel="stylesheet" href="../dist/highlight.css"><link rel="stylesheet" href="../dist/source-viewer.css"><script src="../dist/source-viewer.js" defer></script></head>',
  );
  html = html.replace("<!-- OPENREGARD_SOURCE -->", viewer);
  await writeFile("dist/examples/" + page, html);
}
