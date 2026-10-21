import { mkdir, cp, readFile, writeFile, rm } from "node:fs/promises";
import { marked } from "marked";
const out = ".pages";
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp("site", out, { recursive: true });
await cp("dist", `${out}/dist`, { recursive: true });
await cp("examples", `${out}/examples`, { recursive: true });
await writeFile(`${out}/.nojekyll`, "");
await mkdir(`${out}/adoption`, { recursive: true });
const contract = await readFile("docs/adoption-contract.md", "utf8");
const html = await readFile("site/index.html", "utf8");
const head = html
  .slice(0, html.indexOf("<body>"))
  .replaceAll("./", "../")
  .replace(
    "<title>Open Regard — a view on your terms</title>",
    "<title>Adoption contract — Open Regard</title>",
  );
const header = html
  .slice(html.indexOf("<header"), html.indexOf("<main"))
  .replaceAll("./", "../")
  .replaceAll('href="#', 'href="../#');
const footer = html
  .slice(html.indexOf("<footer"), html.indexOf('<script src="./site.js"'))
  .replaceAll("./", "../");
await writeFile(
  `${out}/adoption/index.html`,
  `${head}<body><a class="skip" href="#main">Skip to content</a>${header}<main id="main" class="article shell">${marked.parse(contract)}</main>${footer}</body></html>`,
);
console.log("GitHub Pages site built in .pages/");
