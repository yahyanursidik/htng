import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export function startStaticServer({
  root = resolve("dist"),
  host = "127.0.0.1",
  port = 4407,
} = {}) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://${host}:${port}`);
    const requestedPath = decodeURIComponent(url.pathname);
    let filePath = resolve(root, `.${requestedPath}`);

    if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    try {
      const details = await stat(filePath);
      if (details.isDirectory()) filePath = resolve(filePath, "index.html");
      await stat(filePath);
      response.writeHead(200, {
        "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });

  return new Promise((resolveServer, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolveServer(server);
    });
  });
}
