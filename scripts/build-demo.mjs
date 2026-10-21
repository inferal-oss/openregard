import { build } from "esbuild";
await build({
  entryPoints: ["examples/react-demo.tsx"],
  outfile: "dist/react-demo.js",
  bundle: true,
  minify: true,
  legalComments: "external",
  define: { "process.env.NODE_ENV": '"production"' },
});
