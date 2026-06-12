const crypto = require("crypto");
const { AUTH_PERMISSIONS_VERSION, normalizeRole } = require("./authContract");

function getJWTSecret() {
  const secret = process.env.JWT_SECRET || process.env.API_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return secret;
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function parseDurationToMinutes(value, fallbackMinutes) {
  if (!value) return fallbackMinutes;
  const raw = String(value).trim();
  const match = raw.match(/^(\d+)(m|h|d)?$/i);
  if (!match) return fallbackMinutes;

  const amount = parseInt(match[1], 10);
  const unit = (match[2] || "m").toLowerCase();
  if (unit === "d") return amount * 24 * 60;
  if (unit === "h") return amount * 60;
  return amount;
}

function getAccessTokenMinutes() {
  return parseDurationToMinutes(
    process.env.AUTH_ACCESS_TOKEN_MINUTES || process.env.JWT_EXPIRES_IN,
    7 * 24 * 60
  );
}

function getRefreshTokenDays() {
  return parseInt(process.env.AUTH_REFRESH_TOKEN_DAYS || "14", 10);
}

function createToken(payload, expiresInMinutes = getAccessTokenMinutes()) {
  const secret = getJWTSecret();
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(
    JSON.stringify({ ...payload, iat: now, exp: now + expiresInMinutes * 60 })
  );
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const secret = getJWTSecret();
    const [header, body, signature] = String(token || "").split(".");
    if (!header || !body || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function getBearerToken(req) {
  return String(req?.headers?.authorization || "").replace(/^Bearer\s+/i, "").trim();
}

function getUserFromToken(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  return verifyToken(token);
}

function buildAuthClaims(user, sessionId) {
  const role = user?.rol || user?.role || "docente";
  const userId = user?.id || user?.userId;
  return {
    sub: String(userId),
    userId,
    email: user.email,
    rol: role,
    role: normalizeRole(role),
    sessionId,
    jti: crypto.randomUUID(),
    permissionsVersion: user.permissionsVersion || AUTH_PERMISSIONS_VERSION,
  };
}

function createAccessToken(user, sessionId) {
  const expiresInMinutes = getAccessTokenMinutes();
  const claims = buildAuthClaims(user, sessionId);
  const token = createToken(claims, expiresInMinutes);
  return {
    token,
    claims,
    expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
  };
}

function createRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

function hashRefreshToken(refreshToken) {
  return crypto.createHash("sha256").update(String(refreshToken || "")).digest("hex");
}

module.exports = {
  buildAuthClaims,
  createAccessToken,
  createRefreshToken,
  createToken,
  getAccessTokenMinutes,
  getBearerToken,
  getRefreshTokenDays,
  getUserFromToken,
  getJWTSecret,
  hashRefreshToken,
  parseDurationToMinutes,
  verifyToken,
};
