/**
 * Backend per-user isolation smoke (Fase 5).
 *
 * Exercises the academic + notificaciones endpoints with real JWTs and an
 * in-memory Mongo collection to assert that an authenticated user cannot read,
 * update or delete another user's data, while API-key-only traffic keeps the
 * legacy (unscoped) behavior.
 *
 * Runs offline (no real MongoDB) via a require.cache stub for lib/mongodb.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

process.env.API_SECRET ||= "ci-local-only-api-secret";
process.env.JWT_SECRET ||= process.env.API_SECRET;

const API_SECRET = process.env.API_SECRET;
const { createAccessToken } = require("../backend/lib/tokens.js");

const tokenA = createAccessToken({ id: 1, email: "a@test.com", rol: "docente" }, "sa").token;
const tokenB = createAccessToken({ id: 2, email: "b@test.com", rol: "docente" }, "sb").token;

// ---- In-memory Mongo collection ----

function matchesFilter(doc, filter) {
  return Object.entries(filter).every(([key, cond]) => {
    if (cond && typeof cond === "object" && !Array.isArray(cond)) {
      if ("$gt" in cond) return doc[key] !== undefined && doc[key] > cond.$gt;
      return false;
    }
    if (doc[key] === undefined) return false;
    return String(doc[key]) === String(cond);
  });
}

function equalityFields(filter) {
  const out = {};
  for (const [k, v] of Object.entries(filter)) {
    if (!(v && typeof v === "object" && !Array.isArray(v))) out[k] = v;
  }
  return out;
}

function makeCollection() {
  const docs = [];
  return {
    async createIndex() {},
    async findOne(filter) {
      return docs.find((d) => matchesFilter(d, filter)) || null;
    },
    find(filter) {
      const rows = docs.filter((d) => matchesFilter(d, filter));
      const cursor = {
        sort: () => cursor,
        limit: () => cursor,
        toArray: async () => rows,
      };
      return cursor;
    },
    async insertOne(doc) {
      docs.push({ ...doc });
      return { insertedId: doc.id };
    },
    async updateOne(filter, update, opts = {}) {
      const idx = docs.findIndex((d) => matchesFilter(d, filter));
      if (idx >= 0) {
        docs[idx] = { ...docs[idx], ...(update.$set || {}) };
        return { matchedCount: 1, modifiedCount: 1, upsertedCount: 0 };
      }
      if (opts.upsert) {
        docs.push({ ...equalityFields(filter), ...(update.$setOnInsert || {}), ...(update.$set || {}) });
        return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1 };
      }
      return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
    },
    async updateMany(filter, update) {
      let modifiedCount = 0;
      docs.forEach((d, i) => {
        if (matchesFilter(d, filter)) {
          docs[i] = { ...d, ...(update.$set || {}) };
          modifiedCount++;
        }
      });
      return { modifiedCount };
    },
    async deleteOne(filter) {
      const idx = docs.findIndex((d) => matchesFilter(d, filter));
      if (idx >= 0) {
        docs.splice(idx, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },
    async countDocuments(filter) {
      return docs.filter((d) => matchesFilter(d, filter)).length;
    },
  };
}

let currentDb;
function resetDb() {
  const collections = new Map();
  currentDb = {
    collection(name) {
      if (!collections.has(name)) collections.set(name, makeCollection());
      return collections.get(name);
    },
  };
}

// Stub lib/mongodb before requiring the endpoints.
const mongoPath = require.resolve("../backend/lib/mongodb.js");
require.cache[mongoPath] = {
  id: mongoPath,
  filename: mongoPath,
  loaded: true,
  exports: { connectToDatabase: async () => ({ db: currentDb }) },
};

const grupos = require("../backend/api/grupos.js");
const alumnos = require("../backend/api/alumnos.js");
const calificaciones = require("../backend/api/calificaciones.js");
const notificaciones = require("../backend/api/notificaciones.js");
const auth = require("../backend/api/auth.js");

// ---- Mock req/res ----

function makeRes() {
  const res = {
    statusCode: 200,
    body: undefined,
    setHeader() {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
  return res;
}

async function call(handler, { method = "GET", token, query = {}, body } = {}) {
  const headers = { origin: "http://localhost:8081", "x-api-key": API_SECRET };
  if (token) headers.authorization = `Bearer ${token}`;
  const req = { method, headers, query, body };
  const res = makeRes();
  await handler(req, res);
  return res;
}

let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    failures++;
    console.error(`  FAIL ${msg}`);
  } else {
    console.log(`  ok   ${msg}`);
  }
}

// ---- Scenarios ----

async function testGrupos() {
  resetDb();
  console.log("[isolation] grupos");

  await call(grupos, { method: "POST", token: tokenA, body: { id: "g1", nombre: "A" } });
  await call(grupos, { method: "POST", token: tokenB, body: { id: "g2", nombre: "B" } });

  const listA = await call(grupos, { method: "GET", token: tokenA });
  assert(listA.body.data.count === 1 && listA.body.data.grupos[0].id === "g1", "A lists only its own grupo");

  const getB = await call(grupos, { method: "GET", token: tokenA, query: { id: "g2" } });
  assert(getB.statusCode === 404, "A cannot read B's grupo by id");

  const putB = await call(grupos, { method: "PUT", token: tokenA, body: { id: "g2", nombre: "hack" } });
  assert(putB.statusCode === 403, "A cannot update B's grupo");

  const delB = await call(grupos, { method: "DELETE", token: tokenA, query: { id: "g2" } });
  assert(delB.statusCode === 404, "A cannot delete B's grupo");

  const getBself = await call(grupos, { method: "GET", token: tokenB, query: { id: "g2" } });
  assert(getBself.statusCode === 200, "B can read its own grupo");

  // Additive compat: API-key-only sees everything (legacy).
  const listLegacy = await call(grupos, { method: "GET" });
  assert(listLegacy.body.data.count === 2, "API-key-only request sees all grupos (legacy)");
}

async function testAlumnos() {
  resetDb();
  console.log("[isolation] alumnos");

  await call(alumnos, { method: "POST", token: tokenA, body: { id: 1, nombre: "Ana" } });
  const listB = await call(alumnos, { method: "GET", token: tokenB });
  assert(listB.body.data.count === 0, "B sees none of A's alumnos");

  const postForeign = await call(alumnos, { method: "POST", token: tokenB, body: { id: 1, nombre: "x" } });
  assert(postForeign.statusCode === 403, "B cannot overwrite A's alumno via POST");

  const putForeign = await call(alumnos, { method: "PUT", token: tokenB, body: { id: 1, nombre: "x" } });
  assert(putForeign.statusCode === 403, "B cannot overwrite A's alumno via PUT");
}

async function testCalificacionesBulk() {
  resetDb();
  console.log("[isolation] calificaciones (bulk)");

  await call(calificaciones, {
    method: "POST",
    token: tokenA,
    body: [{ alumnoId: 1, grupoId: 1, calificacion: 10 }],
  });

  const listA = await call(calificaciones, { method: "GET", token: tokenA });
  assert(listA.body.data.count === 1, "A sees its bulk calificacion");

  const listB = await call(calificaciones, { method: "GET", token: tokenB });
  assert(listB.body.data.count === 0, "B sees no calificaciones of A");
}

async function testNotificaciones() {
  resetDb();
  console.log("[isolation] notificaciones");

  // usuarioId in body is ignored; owner comes from the token.
  await call(notificaciones, { method: "POST", token: tokenA, body: { id: "n1", usuarioId: "999" } });
  await call(notificaciones, { method: "POST", token: tokenB, body: { id: "n2" } });

  const listA = await call(notificaciones, { method: "GET", token: tokenA });
  assert(listA.body.data.count === 1 && listA.body.data.notificaciones[0].id === "n1", "A lists only its notifications");

  const getForeign = await call(notificaciones, { method: "GET", token: tokenB, query: { id: "n1" } });
  assert(getForeign.statusCode === 404, "B cannot read A's notification by id");

  const putForeign = await call(notificaciones, { method: "PUT", token: tokenB, body: { id: "n1" } });
  assert(putForeign.statusCode === 403, "B cannot mark A's notification");
}

async function testSesiones() {
  resetDb();
  console.log("[isolation] sesiones (/api/auth)");

  const future = new Date(Date.now() + 60 * 60 * 1000);
  const sessions = currentDb.collection("auth_sessions");
  await sessions.insertOne({ id: "sa", userId: 1, revokedAt: null, refreshTokenExpiresAt: future, createdAt: new Date(), lastUsedAt: new Date() });
  await sessions.insertOne({ id: "sb", userId: 2, revokedAt: null, refreshTokenExpiresAt: future, createdAt: new Date(), lastUsedAt: new Date() });

  const listA = await call(auth, { method: "POST", token: tokenA, body: { action: "listar_sesiones" } });
  assert(
    listA.body.data.sessions.length === 1 && listA.body.data.sessions[0].id === "sa" && listA.body.data.sessions[0].current === true,
    "A lists only its own session, marked current"
  );

  const revokeForeign = await call(auth, { method: "POST", token: tokenA, body: { action: "revocar_sesion", sessionId: "sb" } });
  assert(revokeForeign.statusCode === 404, "A cannot revoke B's session");

  const revokeOwn = await call(auth, { method: "POST", token: tokenA, body: { action: "revocar_sesion", sessionId: "sa" } });
  assert(revokeOwn.body?.data?.action === "revoked", "A can revoke its own session");

  const listB = await call(auth, { method: "POST", token: tokenB, body: { action: "listar_sesiones" } });
  assert(listB.body.data.sessions.length === 1 && listB.body.data.sessions[0].id === "sb", "B still sees only its own session");
}

async function main() {
  await testGrupos();
  await testAlumnos();
  await testCalificacionesBulk();
  await testNotificaciones();
  await testSesiones();

  if (failures > 0) {
    console.error(`[isolation] ${failures} assertion(s) failed`);
    process.exit(1);
  }
  console.log("[isolation] OK all per-user isolation checks passed");
}

main().catch((err) => {
  console.error("[isolation] error:", err);
  process.exit(1);
});
