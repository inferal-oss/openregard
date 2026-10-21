import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, access, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const root = process.cwd();
const pack =
  process.argv[2] ??
  JSON.parse(
    execFileSync(npm, ["pack", "--ignore-scripts", "--json"], {
      encoding: "utf8",
    }),
  )[0].filename;
const spec = pack.endsWith(".tgz") ? resolve(pack) : pack;
const dir = await mkdtemp(join(tmpdir(), "openregard-consumer-"));
const run = (args) =>
  execFileSync(
    npm,
    [...args, "--cache", join(tmpdir(), "openregard-npm-cache")],
    { cwd: dir, stdio: "pipe" },
  );
let server;
try {
  await writeFile(
    join(dir, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  run(["install", "--ignore-scripts", "--omit=peer", spec]);
  await assert.rejects(access(join(dir, "node_modules/react")));
  await writeFile(
    join(dir, "core.mjs"),
    `import assert from 'node:assert/strict';
import {createRegard} from 'openregard';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const config={version:1,defaultProfile:'base',storageKey:'smoke',controlLabel:'Display',profiles:[{id:'base',label:'Base'}]};
assert.equal(createRegard(config).getSnapshot(),'base');
const sandbox={};vm.runInNewContext(readFileSync(import.meta.resolve('openregard/browser.js').replace('file://',''),'utf8'),sandbox);assert.equal(sandbox.OpenRegard.createRegard(config).getSnapshot(),'base');
assert.ok(readFileSync(import.meta.resolve('openregard/style.css').replace('file://',''),'utf8').includes('.openregard'));`,
  );
  execFileSync(process.execPath, ["core.mjs"], { cwd: dir, stdio: "inherit" });
  server = spawn(
    process.execPath,
    [join(dir, "node_modules/openregard/scripts/demo.mjs")],
    { env: { ...process.env, OPENREGARD_DEMO_PORT: "4398" }, stdio: "pipe" },
  );
  let started = false;
  let output = "";
  server.stdout.on("data", (data) => {
    output += data;
    started = true;
  });
  server.stderr.on("data", (data) => {
    output += data;
  });
  for (let attempt = 0; attempt < 50 && !started; attempt++)
    await new Promise((r) => setTimeout(r, 100));
  assert.ok(started, `Packaged demo did not start: ${output}`);
  for (const path of [
    "examples/",
    "examples/docs.html",
    "examples/react.html",
    "dist/browser.js",
    "dist/react-demo.js",
    "dist/style.css",
  ]) {
    const response = await fetch("http://127.0.0.1:4398/" + path);
    assert.equal(response.status, 200, path);
    assert.ok((await response.text()).length > 0);
  }
  run(["install", "--ignore-scripts", "react@19", "react-dom@19"]);
  await writeFile(
    join(dir, "react.mjs"),
    `import {createElement} from 'react';import {renderToString} from 'react-dom/server';import {createRegard} from 'openregard';import {RegardWidget} from 'openregard/react';import assert from 'node:assert/strict';const r=createRegard({version:1,defaultProfile:'base',storageKey:'smoke',controlLabel:'Display',profiles:[{id:'base',label:'Base'}]});assert.ok(renderToString(createElement(RegardWidget,{regard:r})).includes('aria-label="Display"'));`,
  );
  execFileSync(process.execPath, ["react.mjs"], { cwd: dir, stdio: "inherit" });
  await writeFile(
    join(dir, "consumer.mts"),
    `import {createRegard,type DisplayConfig} from 'openregard';import {RegardWidget} from 'openregard/react';const c:DisplayConfig={version:1,defaultProfile:'base',storageKey:'smoke',controlLabel:'Display',profiles:[{id:'base',label:'Base'}]};createRegard(c);void RegardWidget;`,
  );
  // Type declarations must resolve independently of the repository's source files.
  run(["install", "--ignore-scripts", "--save-dev", "@types/react@19"]);
  execFileSync(
    process.execPath,
    [
      join(root, "node_modules/typescript/bin/tsc"),
      "--noEmit",
      "--strict",
      "--module",
      "NodeNext",
      "--target",
      "ES2020",
      "consumer.mts",
    ],
    { cwd: dir, stdio: "inherit" },
  );
  console.log(
    `Clean consumer passed: ${spec}; dependency-free import, browser bundle, CSS, demo server, React SSR and types.`,
  );
} finally {
  server?.kill();
  await rm(dir, { recursive: true, force: true });
}
