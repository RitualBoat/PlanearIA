import http from "node:http";
import { createRequire } from "node:module";
import { URL } from "node:url";

const require = createRequire(import.meta.url);
const port = Number(process.env.BACKEND_LOCAL_PORT ?? 3000);

process.env.API_SECRET ||= "local-dev-only-api-secret";
process.env.JWT_SECRET ||= process.env.API_SECRET;

const routes = new Map([
  ["/api/health", require("../backend/api/health.js")],
]);

const createResponseAdapter = (res) => {
  res.status = (statusCode) => {
    res.statusCode = statusCode;
    return res;
  };

  res.json = (payload) => {
    if (!res.hasHeader("Content-Type")) {
      res.setHeader("Content-Type", "application/json");
    }
    res.end(JSON.stringify(payload));
    return res;
  };

  return res;
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? `localhost:${port}`}`);
  const handler = routes.get(url.pathname);

  if (!handler) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, error: "Route not available in local smoke server" }));
    return;
  }

  req.query = Object.fromEntries(url.searchParams.entries());

  try {
    await handler(req, createResponseAdapter(res));
  } catch (error) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
    }
    res.end(
      JSON.stringify({
        success: false,
        error: error.message,
      })
    );
  }
});

server.listen(port, () => {
  console.log(`[backend:dev:local] listening on http://localhost:${port}`);
  console.log("[backend:dev:local] available routes: /api/health");
});
