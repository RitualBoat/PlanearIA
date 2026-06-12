import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);

process.env.API_SECRET ||= "ci-local-only-api-secret";
process.env.JWT_SECRET ||= process.env.API_SECRET;

const vercelConfig = JSON.parse(await readFile(new URL("../backend/vercel.json", import.meta.url)));

if (vercelConfig.version !== 2) {
  throw new Error("backend/vercel.json must keep version=2");
}

if (!vercelConfig.functions?.["api/index.js"]) {
  throw new Error("backend/vercel.json must keep a single api/index.js function");
}

if (Object.keys(vercelConfig.functions).length !== 1) {
  throw new Error("backend/vercel.json must stay within Vercel Hobby limits with one function");
}

const apiRewrite = vercelConfig.rewrites?.find(
  (rewrite) => rewrite.source === "/api/:path*" && rewrite.destination === "/api/index.js"
);

if (!apiRewrite) {
  throw new Error("backend/vercel.json must rewrite /api/:path* to /api/index.js");
}

const apiRouter = require("../backend/api/index.js");

const createMockResponse = () => {
  const headers = {};
  const response = {
    statusCode: 200,
    body: undefined,
    ended: false,
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
    },
    hasHeader(name) {
      return Object.prototype.hasOwnProperty.call(headers, name.toLowerCase());
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(payload) {
      this.body = payload;
      this.ended = true;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };

  return { response, headers };
};

const getReq = {
  url: "/api/health",
  method: "GET",
  headers: {
    origin: "http://localhost:8081",
  },
};

const { response: getRes, headers: getHeaders } = createMockResponse();
await apiRouter(getReq, getRes);

if (getRes.statusCode !== 200 || !getRes.body?.success || getRes.body?.data?.status !== "ok") {
  throw new Error("GET /api/health static smoke failed");
}

if (getHeaders["access-control-allow-origin"] !== "http://localhost:8081") {
  throw new Error("GET /api/health CORS origin smoke failed");
}

const optionsReq = {
  url: "/api/health",
  method: "OPTIONS",
  headers: {
    origin: "http://localhost:8081",
  },
};

const { response: optionsRes } = createMockResponse();
await apiRouter(optionsReq, optionsRes);

if (optionsRes.statusCode !== 200 || !optionsRes.ended) {
  throw new Error("OPTIONS /api/health static smoke failed");
}

const { response: unknownRes } = createMockResponse();
await apiRouter(
  {
    url: "/api/no-existe",
    method: "GET",
    headers: {
      origin: "http://localhost:8081",
    },
  },
  unknownRes
);

if (unknownRes.statusCode !== 404 || !unknownRes.body?.error) {
  throw new Error("Unknown route static smoke failed");
}

console.log("[backend:check] OK backend/vercel.json");
console.log("[backend:check] OK GET /api/health");
console.log("[backend:check] OK OPTIONS /api/health");
console.log("[backend:check] OK single-function router");
