const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const { readFileSync } = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3443;

const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: readFileSync(path.join(__dirname, "certs", "localhost-key.pem")),
  cert: readFileSync(path.join(__dirname, "certs", "localhost.pem")),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> CourtVision ready on https://localhost:${port}`);
  });
});
