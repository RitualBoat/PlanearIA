/**
 * Middleware de autenticación simple
 * Verifica el API secret en el header y valida JWT tokens.
 */
const { getUserFromToken, verifyToken } = require("./tokens");

const API_SECRET = process.env.API_SECRET;

if (!API_SECRET) {
  console.error("FATAL: API_SECRET environment variable is not set");
}

/**
 * Valida que la request tenga el API secret correcto
 */
function validateAuth(req) {
  const authHeader = req.headers["x-api-key"] || req.headers["authorization"];

  if (!authHeader) {
    return { valid: false, error: "Missing API key" };
  }

  const apiKey = authHeader.replace("Bearer ", "");

  if (apiKey !== API_SECRET) {
    return { valid: false, error: "Invalid API key" };
  }

  return { valid: true };
}

/**
 * Obtiene la información del usuario desde el JWT token en la cabecera de la petición
 */

/**
 * Returns the userId (as string) from a valid JWT, or null when the request
 * is authenticated only by API key. Additive isolation: callers add the
 * userId filter when present and keep legacy behavior when absent, so the
 * app keeps working offline-first while authenticated traffic gets isolated.
 */
function getScopeUserId(req) {
  try {
    const payload = getUserFromToken(req);
    if (!payload || payload.userId === undefined || payload.userId === null) {
      return null;
    }
    return String(payload.userId);
  } catch {
    return null;
  }
}

/**
 * Returns a shallow copy of `filter` scoped to `userId` when present.
 */
function scopeFilter(filter, userId) {
  if (!userId) return { ...filter };
  return { ...filter, userId };
}

/**
 * Ownership guard for a single existing doc under additive isolation.
 * - Unscoped (API key only): always true (legacy compatibility).
 * - Scoped: true only when the doc is new or already owned by userId.
 *   Legacy/foreign docs (different or missing owner) are rejected.
 */
function ownsDoc(existing, userId, ownerField = "userId") {
  if (!userId) return true;
  if (!existing) return true;
  const owner = existing[ownerField];
  if (owner === undefined || owner === null) return false;
  return String(owner) === String(userId);
}

/**
 * Orígenes permitidos para CORS
 */
const ALLOWED_ORIGINS = [
  "https://planearia.app",
  "https://planearia.vercel.app",
  "http://localhost:8081",
  "http://localhost:19006",
];

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function originMatchesAllowed(origin, allowedOrigin) {
  if (!origin || !allowedOrigin) return false;
  if (origin === allowedOrigin) return true;
  if (!allowedOrigin.includes("*")) return false;

  const pattern = `^${escapeRegExp(allowedOrigin).replace(/\\\*/g, ".*")}$`;
  return new RegExp(pattern).test(origin);
}

/**
 * Headers CORS para permitir requests desde la app
 */
function getCorsHeaders(req) {
  const origin = req?.headers?.origin || "";
  const envOrigins = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowedOrigins = envOrigins.length ? envOrigins : ALLOWED_ORIGINS;
  const allowedOrigin = allowedOrigins.some((allowed) => originMatchesAllowed(origin, allowed))
    ? origin
    : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };
}

/**
 * Maneja preflight CORS
 */
function handleCors(req, res) {
  if (req.method === "OPTIONS") {
    const headers = getCorsHeaders(req);
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Aplica headers CORS a la respuesta
 */
function applyCors(req, res) {
  const headers = getCorsHeaders(req);
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

/**
 * Respuesta de error estandarizada
 */
function errorResponse(res, status, message) {
  return res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Respuesta de éxito estandarizada
 */
function successResponse(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  validateAuth,
  getUserFromToken,
  getScopeUserId,
  scopeFilter,
  ownsDoc,
  verifyToken,
  getCorsHeaders,
  handleCors,
  applyCors,
  errorResponse,
  successResponse,
};
