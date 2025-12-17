/**
 * Middleware de autenticación simple
 * Verifica el API secret en el header
 */

const API_SECRET = process.env.API_SECRET || "planearia-dev-secret-2025";

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
 * Headers CORS para permitir requests desde la app
 */
function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
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
    const headers = getCorsHeaders();
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
function applyCors(res) {
  const headers = getCorsHeaders();
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
