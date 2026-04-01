/**
 * Middleware de autenticación simple
 * Verifica el API secret en el header
 */

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
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Content-Type": "application/json",
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
  getCorsHeaders,
  handleCors,
  applyCors,
  errorResponse,
  successResponse,
};
