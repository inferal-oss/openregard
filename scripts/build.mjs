import { build } from "esbuild";
import { mkdir, copyFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
await rm("dist", { recursive: true, force: true });
await mkdir("dist");
execFileSync("node_modules/.bin/tsc", ["--emitDeclarationOnly"], {
  stdio: "inherit",
});
await build({
  entryPoints: ["src/index.ts", "src/react.tsx"],
  outdir: "dist",
  format: "esm",
  target: "es2020",
  bundle: false,
});
await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/browser.js",
  format: "iife",
  globalName: "OpenRegard",
  bundle: true,
  minify: true,
  target: "es2020",
});
await copyFile("src/style.css", "dist/style.css");
await import("./build-demo.mjs");
await import("./build-examples.mjs");
