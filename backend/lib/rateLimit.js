const crypto = require("crypto");

const buckets = new Map();

function hash(value) {
  return crypto.createHash("sha256").update(String(value || "anonymous")).digest("hex").slice(0, 16);
}

function getClientIp(req) {
  const forwarded = req?.headers?.["x-forwarded-for"];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : String(forwarded || req?.socket?.remoteAddress || "");
  return ip.split(",")[0].trim();
}

function getRateLimitIdentifier(req, explicitIdentifier) {
  if (explicitIdentifier) return explicitIdentifier;
  const auth = req?.headers?.authorization || "";
  const apiKey = req?.headers?.["x-api-key"] || "";
  return auth || apiKey || getClientIp(req) || "anonymous";
}

function assertRateLimit(req, scope, options = {}) {
  const max = Math.max(1, Number(options.max || process.env.AUTH_RATE_LIMIT_MAX || 20));
  const windowMs = Math.max(1000, Number(options.windowMs || process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000));
  const identifier = getRateLimitIdentifier(req, options.identifier);
  const now = Date.now();
  const bucketStart = Math.floor(now / windowMs) * windowMs;
  const resetAt = new Date(bucketStart + windowMs).toISOString();
  const key = `${scope}:${hash(identifier)}:${bucketStart}`;
  const current = buckets.get(key) || { count: 0, resetAt };

  if (current.count >= max) {
    const error = new Error(`Limite de intentos alcanzado. Intenta de nuevo despues de ${resetAt}.`);
    error.statusCode = 429;
    error.limit = max;
    error.remaining = 0;
    error.resetAt = resetAt;
    throw error;
  }

  current.count += 1;
  current.resetAt = resetAt;
  buckets.set(key, current);

  return {
    limit: max,
    remaining: Math.max(0, max - current.count),
    resetAt,
  };
}

function resetRateLimitForTests() {
  buckets.clear();
}

module.exports = {
  assertRateLimit,
  getClientIp,
  getRateLimitIdentifier,
  resetRateLimitForTests,
};
