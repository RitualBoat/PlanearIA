/**
 * API de Notificaciones — PlanearIA
 *
 * GET  /api/notificaciones?usuarioId=xxx          - Listar notificaciones del usuario
 * GET  /api/notificaciones?usuarioId=xxx&soloNoLeidas=true - Solo sin leer
 * POST /api/notificaciones                        - Crear notificación
 * PUT  /api/notificaciones                        - Marcar como leída (una o todas)
 * DELETE /api/notificaciones?id=xxx              - Eliminar notificación
 */
const { connectToDatabase } = require("../lib/mongodb");
const {
  validateAuth,
  getScopeUserId,
  ownsDoc,
  handleCors,
  applyCors,
  errorResponse,
  successResponse,
} = require("../lib/auth");

const COLLECTION = "notificaciones";
const NOTIFICACION_ALLOWED_FIELDS = [
  "id",
  "usuarioId",
  "titulo",
  "mensaje",
  "tipo",
  "leida",
  "fechaCreacion",
  "syncStatus",
];

function pickNotificacionInput(body) {
  const notificacion = {};
  if (!body || typeof body !== "object") return notificacion;

  for (const field of NOTIFICACION_ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      notificacion[field] = body[field];
    }
  }

  return notificacion;
}

function buildScopedNotificacion(body, tokenUserId) {
  const notificacion = pickNotificacionInput(body);
  if (tokenUserId) notificacion.usuarioId = tokenUserId;
  return notificacion;
}

module.exports = async (req, res) => {
  applyCors(req, res);
  if (handleCors(req, res)) return;

  const auth = validateAuth(req);
  if (!auth.valid) {
    return errorResponse(res, 401, auth.error);
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    // Crear índices (idempotente)
    await Promise.all([
      collection.createIndex({ id: 1 }, { unique: true }),
      collection.createIndex({ usuarioId: 1, leida: 1 }),
      collection.createIndex({ fechaCreacion: -1 }),
    ]);

    // When a JWT is present, the owner is derived from the token (usuarioId
    // from the client is ignored) so a user can only touch their own
    // notifications. API-key-only traffic keeps the legacy usuarioId param.
    const tokenUserId = getScopeUserId(req);

    switch (req.method) {
      case "GET":
        return await handleGet(req, res, collection, tokenUserId);
      case "POST":
        return await handlePost(req, res, collection, tokenUserId);
      case "PUT":
        return await handlePut(req, res, collection, tokenUserId);
      case "DELETE":
        return await handleDelete(req, res, collection, tokenUserId);
      default:
        return errorResponse(res, 405, `Method ${req.method} not allowed`);
    }
  } catch (error) {
    console.error("❌ Error en API notificaciones:", error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * GET — Obtener notificaciones del usuario
 */
async function handleGet(req, res, collection, tokenUserId) {
  const { id, soloNoLeidas, desde, limit = 50 } = req.query;
  // Scoped requests own only their notifications; ignore client usuarioId.
  const usuarioId = tokenUserId || req.query.usuarioId;

  // Un solo ítem por ID
  if (id) {
    const notificacion = await collection.findOne({ id });
    if (!notificacion || (tokenUserId && String(notificacion.usuarioId) !== tokenUserId))
      return errorResponse(res, 404, "Notificación no encontrada");
    return successResponse(res, notificacion);
  }

  if (!usuarioId) {
    return errorResponse(res, 400, "usuarioId es requerido");
  }

  const query = { usuarioId };
  if (soloNoLeidas === "true") query.leida = false;
  if (desde) query.fechaCreacion = { $gt: desde };

  const notificaciones = await collection
    .find(query)
    .sort({ fechaCreacion: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  const totalNoLeidas = await collection.countDocuments({
    usuarioId,
    leida: false,
  });

  return successResponse(res, {
    count: notificaciones.length,
    totalNoLeidas,
    notificaciones,
  });
}

/**
 * POST — Crear notificación
 */
async function handlePost(req, res, collection, tokenUserId) {
  const notificacion = buildScopedNotificacion(req.body, tokenUserId);

  if (!notificacion || !notificacion.id || !notificacion.usuarioId) {
    return errorResponse(
      res,
      400,
      "Datos de notificación inválidos (id y usuarioId requeridos)"
    );
  }

  const existing = await collection.findOne({ id: notificacion.id });
  if (existing && !ownsDoc(existing, tokenUserId, "usuarioId")) {
    return errorResponse(res, 403, "No autorizado");
  }
  if (existing) {
    const now = new Date().toISOString();
    notificacion.syncedAt = now;
    await collection.updateOne(
      { id: notificacion.id },
      { $set: notificacion }
    );
    return successResponse(res, { action: "updated", id: notificacion.id });
  }

  const now = new Date().toISOString();
  const doc = notificacion;
  doc.leida = notificacion.leida ?? false;
  doc.syncedAt = now;
  doc.createdAt = now;

  await collection.insertOne(doc);
  return successResponse(res, { action: "created", id: notificacion.id }, 201);
}

/**
 * PUT — Marcar notificacion(es) como leída(s)
 *
 * Body { id } → marca una sola notificación
 * Body { usuarioId, marcarTodas: true } → marca todas las del usuario
 */
async function handlePut(req, res, collection, tokenUserId) {
  const body = req.body;

  if (!body) {
    return errorResponse(res, 400, "Body requerido");
  }

  // Marcar todas las del usuario como leídas
  const marcarUsuarioId = tokenUserId || body.usuarioId;
  if (body.marcarTodas === true && marcarUsuarioId) {
    const result = await collection.updateMany(
      { usuarioId: marcarUsuarioId, leida: false },
      { $set: { leida: true, syncedAt: new Date().toISOString() } }
    );
    return successResponse(res, {
      action: "markedAll",
      modifiedCount: result.modifiedCount,
    });
  }

  // Marcar una notificación específica
  if (!body.id) {
    return errorResponse(res, 400, "id o { usuarioId, marcarTodas } requerido");
  }

  if (tokenUserId) {
    const existing = await collection.findOne({ id: body.id });
    if (existing && !ownsDoc(existing, tokenUserId, "usuarioId")) {
      return errorResponse(res, 403, "No autorizado");
    }
  }

  const result = await collection.updateOne(
    { id: body.id },
    {
      $set: (() => {
        const update = buildScopedNotificacion(body, tokenUserId);
        update.leida = true;
        update.syncedAt = new Date().toISOString();
        return update;
      })(),
    },
    { upsert: true }
  );

  return successResponse(res, {
    action: result.upsertedCount > 0 ? "created" : "updated",
    id: body.id,
  });
}

/**
 * DELETE — Eliminar una notificación
 */
async function handleDelete(req, res, collection, tokenUserId) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "ID de notificación requerido");
  }

  if (tokenUserId) {
    const existing = await collection.findOne({ id });
    if (existing && !ownsDoc(existing, tokenUserId, "usuarioId")) {
      return errorResponse(res, 404, "Notificación no encontrada");
    }
  }

  const result = await collection.deleteOne({ id });

  if (result.deletedCount === 0) {
    return errorResponse(res, 404, "Notificación no encontrada");
  }

  return successResponse(res, { action: "deleted", id });
}
