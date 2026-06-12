const {
  hashPassword,
  parseStoredPassword,
  verifyPassword,
  verifyPasswordDetailed,
} = require("../../../backend/lib/passwords");
const {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  verifyToken,
} = require("../../../backend/lib/tokens");
const {
  createAuthSession,
  revokeAuthSession,
  rotateAuthSession,
} = require("../../../backend/lib/authSessions");
const {
  createResetCode,
  hashResetCode,
  verifyResetCode,
} = require("../../../backend/lib/resetCodes");
const { assertRateLimit, resetRateLimitForTests } = require("../../../backend/lib/rateLimit");

function createFakeCollection() {
  const docs: Record<string, any>[] = [];
  const matches = (doc: Record<string, any>, query: Record<string, any>) =>
    Object.entries(query).every(([key, value]) => doc[key] === value);

  return {
    docs,
    insertOne: jest.fn(async (doc: Record<string, any>) => {
      docs.push({ ...doc });
      return { insertedId: doc.id };
    }),
    findOne: jest.fn(async (query: Record<string, any>) => docs.find((doc) => matches(doc, query))),
    updateOne: jest.fn(async (query: Record<string, any>, update: Record<string, any>) => {
      const doc = docs.find((item) => matches(item, query));
      if (!doc) return { modifiedCount: 0 };
      Object.assign(doc, update.$set || {});
      return { modifiedCount: 1 };
    }),
    updateMany: jest.fn(async (query: Record<string, any>, update: Record<string, any>) => {
      let modifiedCount = 0;
      for (const doc of docs) {
        if (matches(doc, query)) {
          Object.assign(doc, update.$set || {});
          modifiedCount += 1;
        }
      }
      return { modifiedCount };
    }),
  };
}

describe("backend auth helpers", () => {
  beforeEach(() => {
    process.env.API_SECRET = "test-api-secret";
    process.env.JWT_SECRET = "test-jwt-secret";
    process.env.AUTH_ACCESS_TOKEN_MINUTES = "60";
    process.env.AUTH_REFRESH_TOKEN_DAYS = "14";
    process.env.AUTH_RATE_LIMIT_MAX = "2";
    process.env.AUTH_RATE_LIMIT_WINDOW_MS = "60000";
    resetRateLimitForTests();
  });

  it("hashes passwords with versioned pbkdf2 and verifies legacy hashes", async () => {
    const modernHash = await hashPassword("secret123");
    expect(parseStoredPassword(modernHash)?.format).toBe("pbkdf2:v1");
    await expect(verifyPassword("secret123", modernHash)).resolves.toBe(true);

    const legacyHash = modernHash.split(":").slice(4).join(":");
    const legacyResult = await verifyPasswordDetailed("secret123", legacyHash);
    expect(legacyResult).toEqual({ valid: true, needsRehash: true });
  });

  it("creates verifiable access tokens with canonical role claims", () => {
    const access = createAccessToken(
      { id: 1, email: "docente@test.local", rol: "supervisor" },
      "session-1"
    );
    const payload = verifyToken(access.token);

    expect(payload.userId).toBe(1);
    expect(payload.rol).toBe("supervisor");
    expect(payload.role).toBe("docente");
    expect(payload.sessionId).toBe("session-1");
    expect(payload.permissionsVersion).toBe(1);
  });

  it("creates, rotates and revokes refresh sessions", async () => {
    const sessions = createFakeCollection();
    const created = await createAuthSession(
      sessions,
      { id: 7, email: "ana@test.local", rol: "docente" },
      { headers: { "user-agent": "jest" }, socket: { remoteAddress: "127.0.0.1" } }
    );

    expect(created.refreshToken).toBeTruthy();
    expect(sessions.docs[0].refreshTokenHash).toBe(hashRefreshToken(created.refreshToken));

    const rotated = await rotateAuthSession(sessions, created.refreshToken, { headers: {} });
    expect(rotated.refreshToken).not.toBe(created.refreshToken);
    expect(sessions.docs[0].refreshTokenHash).toBe(hashRefreshToken(rotated.refreshToken));

    const revoked = await revokeAuthSession(sessions, { sessionId: created.session.id });
    expect(revoked.modifiedCount).toBe(1);
    expect(sessions.docs[0].revokedAt).toBeInstanceOf(Date);
  });

  it("hashes reset codes instead of storing plain values", () => {
    const code = createResetCode();
    const resetCodeHash = hashResetCode("ana@test.local", code);

    expect(code).toHaveLength(6);
    expect(resetCodeHash).not.toBe(code);
    expect(verifyResetCode({ email: "ana@test.local", resetCodeHash }, code)).toBe(true);
    expect(verifyResetCode({ email: "ana@test.local", resetCodeHash }, "000000")).toBe(false);
  });

  it("limits repeated auth actions in-memory", () => {
    const req = { headers: {}, socket: { remoteAddress: "127.0.0.1" } };
    expect(assertRateLimit(req, "auth:login", { identifier: "ana@test.local", max: 2 })).toMatchObject({
      remaining: 1,
    });
    expect(assertRateLimit(req, "auth:login", { identifier: "ana@test.local", max: 2 })).toMatchObject({
      remaining: 0,
    });
    expect(() =>
      assertRateLimit(req, "auth:login", { identifier: "ana@test.local", max: 2 })
    ).toThrow(/Limite de intentos/);
  });

  it("creates opaque refresh tokens and stable hashes", () => {
    const refreshToken = createRefreshToken();
    expect(refreshToken.length).toBeGreaterThan(40);
    expect(hashRefreshToken(refreshToken)).toBe(hashRefreshToken(refreshToken));
  });
});
