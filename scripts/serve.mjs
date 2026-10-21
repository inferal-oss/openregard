import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = process.cwd();
createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const path = resolve(
    root,
    (pathname.startsWith("/examples/") ? "./dist" : ".") + pathname,
  );
  if (path !== root && !path.startsWith(root + "/")) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(
      pathname.endsWith("/") ? path + "/index.html" : path,
    );
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
      }[extname(pathname.endsWith("/") ? "index.html" : path)] ??
        "application/octet-stream",
    );
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(
  Number(process.env.OPENREGARD_DEMO_PORT ?? 4397),
  "127.0.0.1",
  function () {
    console.log(
      `Open Regard demo: http://127.0.0.1:${this.address().port}/examples/`,
    );
  },
);
