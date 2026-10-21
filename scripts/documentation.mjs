import { readFile } from "node:fs/promises";
/** Keep HTML, Markdown and packaged reference examples in sync with real code. */
export async function readDocumentation() {
  let source = await readFile("site/documentation.md", "utf8");
  for (const [marker, file, language] of [
    ["VANILLA", "site/custom-widget.js", "js"],
    ["REACT", "site/snippets/custom-react.tsx", "tsx"],
    ["CSS", "site/custom-widget.css", "css"],
  ])
    source = source.replace(
      `<!-- OPENREGARD_CUSTOM_${marker} -->`,
      `\n\`\`\`${language}\n${await readFile(file, "utf8")}\n\`\`\`\n`,
    );
  return source;
}
