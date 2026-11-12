// Local HTTPS dev server.
// Spawns the native Next.js dev server (Turbopack) and reverse-proxies HTTPS to it,
// so you get a reliable dev server behind a self-signed TLS cert.
const { createServer } = require("https");
const http = require("http");
const { spawn } = require("child_process");
const { readFileSync } = require("fs");
const path = require("path");

const DEV_PORT = Number(process.env.DEV_PORT) || 3100;
const HTTPS_PORT = Number(process.env.PORT) || 3443;
const NEXT_BIN = path.join(__dirname, "node_modules", "next", "dist", "bin", "next");

const httpsOptions = {
  key: readFileSync(path.join(__dirname, "certs", "localhost-key.pem")),
  cert: readFileSync(path.join(__dirname, "certs", "localhost.pem")),
};

const child = spawn(
  process.execPath,
  [NEXT_BIN, "dev", "--turbopack", "-p", String(DEV_PORT)],
  { stdio: "inherit", cwd: __dirname },
);

child.on("exit", () => process.exit(0));

const proxy = createServer(httpsOptions, (req, res) => {
  const proxyReq = http.request(
    {
      hostname: "127.0.0.1",
      port: DEV_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${DEV_PORT}` },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  req.pipe(proxyReq);

  proxyReq.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end("Dev server is still starting — reload in a second.");
    } else {
      res.end();
    }
  });
});

proxy.listen(HTTPS_PORT, () => {
  console.log(
    `CourtVision: https://localhost:${HTTPS_PORT} -> http://127.0.0.1:${DEV_PORT}`,
  );
});

process.on("SIGINT", () => child.kill());
process.on("SIGTERM", () => child.kill());
