import { fileURLToPath } from "node:url";
process.chdir(fileURLToPath(new URL("../.pages", import.meta.url)));
process.env.OPENREGARD_DEMO_PORT ??= "4399";
await import("./serve.mjs");
