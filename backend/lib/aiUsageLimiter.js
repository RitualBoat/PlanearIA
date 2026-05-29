/**
 * Limite simple por accion IA.
 *
 * Es intencionalmente in-memory para Vercel/local dev: suficiente para evitar
 * spinners/click-spam y proteger keys durante pruebas. En produccion real se
 * puede mover a MongoDB/Redis sin cambiar los endpoints.
 */

const crypto = require("crypto");
const { getUserFromToken } = require("./auth");

const usage = new Map();
const DEFAULT_MAX = parseInt(process.env.AI_MAX_REQUESTS_PER_ACTION || "10", 10);
const DEV_MAX = parseInt(process.env.AI_DEV_MAX_REQUESTS_PER_ACTION || "100", 10);
const DEV_TOKEN = process.env.AI_DEV_TOKEN || "dev-token-local-testing-only";
const WINDOW_MS = parseInt(process.env.AI_LIMIT_WINDOW_MS || String(24 * 60 * 60 * 1000), 10);

function isTruthy(value) {
  return /^(1|true|yes|on)$/i.test(String(value || "").trim());
}

function isDevModeEnabled() {
  return isTruthy(process.env.AI_DEV_MODE) || isTruthy(process.env.PLANEARIA_DEV_MODE);
}

function getBearerToken(req) {
  return String(req.headers["authorization"] || "").replace(/^Bearer\s+/i, "").trim();
}

function isDevRequest(req) {
  if (!isDevModeEnabled()) return false;

  const bearerToken = getBearerToken(req);
  if (bearerToken && bearerToken === DEV_TOKEN) return true;

  const tokenUser = getUserFromToken(req);
  const email = String(tokenUser?.email || "").toLowerCase();
  const role = String(tokenUser?.rol || tokenUser?.role || "").toLowerCase();
  return role === "admin" && email.includes("dev");
}

function hash(value) {
  return crypto.createHash("sha256").update(String(value || "anonymous")).digest("hex").slice(0, 16);
}

function getActorKey(req) {
  if (isDevRequest(req)) return "dev:local";

  const tokenUser = getUserFromToken(req);
  const userId = tokenUser?.userId || tokenUser?.id || tokenUser?.email;
  if (userId) return `user:${userId}`;

  const apiKey = req.headers["x-api-key"];
  if (apiKey) return `api:${hash(apiKey)}`;

  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || req.socket?.remoteAddress || "");
  return `ip:${hash(ip)}`;
}

function assertAiUsageLimit(req, action, max = DEFAULT_MAX) {
  const isDev = isDevRequest(req);
  const standardMax = Math.max(1, Number(max) || DEFAULT_MAX);
  const normalizedMax = isDev ? Math.max(standardMax + 1, Number(DEV_MAX) || 100) : standardMax;
  const now = Date.now();
  const bucketStart = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  const resetAt = new Date(bucketStart + WINDOW_MS).toISOString();
  const key = `${bucketStart}:${getActorKey(req)}:${action}`;
  const current = usage.get(key) || { count: 0, resetAt };

  if (current.count >= normalizedMax) {
    const error = new Error(
      `Limite IA alcanzado para '${action}'. Intenta de nuevo despues de ${resetAt}.`
    );
    error.statusCode = 429;
    error.limit = normalizedMax;
    error.remaining = 0;
    error.resetAt = resetAt;
    throw error;
  }

  current.count += 1;
  current.resetAt = resetAt;
  usage.set(key, current);

  const result = {
    limit: normalizedMax,
    remaining: Math.max(0, normalizedMax - current.count),
    resetAt,
    mode: isDev ? "dev" : "standard",
  };

  if (isDev) {
    result.warning =
      `Modo dev IA activo: limite ampliado a ${normalizedMax} usos para '${action}'. ` +
      "No habilites AI_DEV_MODE en produccion.";
    console.warn(`[aiUsageLimiter] ${result.warning}`);
  }

  return result;
}

module.exports = {
  assertAiUsageLimit,
};
