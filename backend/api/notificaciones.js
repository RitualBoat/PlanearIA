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
  handleCors,
  applyCors,
  errorResponse,
  successResponse,
} = require("../lib/auth");

const COLLECTION = "notificaciones";

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
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ usuarioId: 1, leida: 1 });
    await collection.createIndex({ fechaCreacion: -1 });

    switch (req.method) {
      case "GET":
        return await handleGet(req, res, collection);
      case "POST":
        return await handlePost(req, res, collection);
      case "PUT":
        return await handlePut(req, res, collection);
      case "DELETE":
        return await handleDelete(req, res, collection);
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
async function handleGet(req, res, collection) {
  const { id, usuarioId, soloNoLeidas, desde, limit = 50 } = req.query;

  // Un solo ítem por ID
  if (id) {
    const notificacion = await collection.findOne({ id });
    if (!notificacion)
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
async function handlePost(req, res, collection) {
  const notificacion = req.body;

  if (!notificacion || !notificacion.id || !notificacion.usuarioId) {
    return errorResponse(
      res,
      400,
      "Datos de notificación inválidos (id y usuarioId requeridos)"
    );
  }

  const existing = await collection.findOne({ id: notificacion.id });
  if (existing) {
    await collection.updateOne(
      { id: notificacion.id },
      { $set: { ...notificacion, syncedAt: new Date().toISOString() } }
    );
    return successResponse(res, { action: "updated", id: notificacion.id });
  }

  const doc = {
    ...notificacion,
    leida: notificacion.leida ?? false,
    syncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await collection.insertOne(doc);
  return successResponse(res, { action: "created", id: notificacion.id }, 201);
}

/**
 * PUT — Marcar notificacion(es) como leída(s)
 *
 * Body { id } → marca una sola notificación
 * Body { usuarioId, marcarTodas: true } → marca todas las del usuario
 */
async function handlePut(req, res, collection) {
  const body = req.body;

  if (!body) {
    return errorResponse(res, 400, "Body requerido");
  }

  // Marcar todas las del usuario como leídas
  if (body.marcarTodas === true && body.usuarioId) {
    const result = await collection.updateMany(
      { usuarioId: body.usuarioId, leida: false },
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

  const result = await collection.updateOne(
    { id: body.id },
    {
      $set: {
        ...body,
        leida: true,
        syncedAt: new Date().toISOString(),
      },
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
async function handleDelete(req, res, collection) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "ID de notificación requerido");
  }

  const result = await collection.deleteOne({ id });

  if (result.deletedCount === 0) {
    return errorResponse(res, 404, "Notificación no encontrada");
  }

  return successResponse(res, { action: "deleted", id });
}
