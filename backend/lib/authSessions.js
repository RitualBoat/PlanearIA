const crypto = require("crypto");
const { createRefreshToken, getRefreshTokenDays, hashRefreshToken } = require("./tokens");

function getRequestMetadata(req) {
  const forwarded = req?.headers?.["x-forwarded-for"];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : String(forwarded || req?.socket?.remoteAddress || "");

  return {
    userAgent: String(req?.headers?.["user-agent"] || ""),
    ip: ip.split(",")[0].trim(),
  };
}

function getRefreshExpiry() {
  return new Date(Date.now() + getRefreshTokenDays() * 24 * 60 * 60 * 1000);
}

async function ensureAuthSessionIndexes(sessions) {
  await Promise.allSettled([
    sessions.createIndex({ id: 1 }, { unique: true }),
    sessions.createIndex({ refreshTokenHash: 1 }, { unique: true }),
    sessions.createIndex({ userId: 1, revokedAt: 1 }),
    sessions.createIndex({ refreshTokenExpiresAt: 1 }),
  ]);
}

async function createAuthSession(sessions, user, req) {
  const refreshToken = createRefreshToken();
  const now = new Date();
  const refreshTokenExpiresAt = getRefreshExpiry();
  const metadata = getRequestMetadata(req);
  const session = {
    id: crypto.randomUUID(),
    userId: user.id || user.userId,
    refreshTokenHash: hashRefreshToken(refreshToken),
    refreshTokenExpiresAt,
    revokedAt: null,
    createdAt: now,
    updatedAt: now,
    lastUsedAt: now,
    ...metadata,
  };

  await sessions.insertOne(session);
  return {
    session,
    refreshToken,
    refreshTokenExpiresAt,
  };
}

async function rotateAuthSession(sessions, refreshToken, req) {
  const currentHash = hashRefreshToken(refreshToken);
  const session = await sessions.findOne({ refreshTokenHash: currentHash });
  if (!session || session.revokedAt) return null;
  if (new Date(session.refreshTokenExpiresAt) < new Date()) return null;

  const nextRefreshToken = createRefreshToken();
  const refreshTokenExpiresAt = getRefreshExpiry();
  const now = new Date();
  const metadata = getRequestMetadata(req);

  await sessions.updateOne(
    { id: session.id, refreshTokenHash: currentHash, revokedAt: null },
    {
      $set: {
        refreshTokenHash: hashRefreshToken(nextRefreshToken),
        refreshTokenExpiresAt,
        updatedAt: now,
        lastUsedAt: now,
        ...metadata,
      },
    }
  );

  return {
    session: { ...session, refreshTokenExpiresAt, updatedAt: now, lastUsedAt: now, ...metadata },
    refreshToken: nextRefreshToken,
    refreshTokenExpiresAt,
  };
}

async function revokeAuthSession(sessions, { sessionId, refreshToken, userId } = {}) {
  const now = new Date();
  const query = {};
  if (sessionId) query.id = sessionId;
  if (refreshToken) query.refreshTokenHash = hashRefreshToken(refreshToken);
  if (userId) query.userId = userId;
  if (!Object.keys(query).length) return { modifiedCount: 0 };

  return sessions.updateMany(
    { ...query, revokedAt: null },
    { $set: { revokedAt: now, updatedAt: now } }
  );
}

module.exports = {
  createAuthSession,
  ensureAuthSessionIndexes,
  getRequestMetadata,
  getRefreshExpiry,
  revokeAuthSession,
  rotateAuthSession,
};
