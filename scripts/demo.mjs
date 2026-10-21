#!/usr/bin/env node
// Runs both from a source checkout and from the installed npm package.
import { fileURLToPath } from "node:url";
process.chdir(fileURLToPath(new URL("..", import.meta.url)));
await import("./serve.mjs");
