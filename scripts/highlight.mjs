import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import bash from "highlight.js/lib/languages/bash";
for (const [name, language] of Object.entries({
  javascript,
  typescript,
  css,
  xml,
  bash,
}))
  hljs.registerLanguage(name, language);
export const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
export function highlight(text, language) {
  const resolved =
    {
      html: "xml",
      js: "javascript",
      ts: "typescript",
      tsx: "typescript",
      sh: "bash",
      shell: "bash",
    }[language] ?? language;
  return hljs.getLanguage(resolved)
    ? hljs.highlight(text, { language: resolved }).value
    : escape(text);
}
