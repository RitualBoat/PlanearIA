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
 * Orígenes permitidos para CORS
 */
const ALLOWED_ORIGINS = [
  "https://planearia.app",
  "https://planearia.vercel.app",
  "http://localhost:8081",
  "http://localhost:19006",
];

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
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
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
  verifyToken,
  getCorsHeaders,
  handleCors,
  applyCors,
  errorResponse,
  successResponse,
};
