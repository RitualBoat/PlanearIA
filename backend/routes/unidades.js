/**
 * API de Unidades (secciones de Classroom) - Operaciones CRUD
 *
 * GET    /api/unidades              - Listar unidades del usuario
 * GET    /api/unidades?id=xxx       - Obtener una unidad
 * POST   /api/unidades              - Crear unidad (idempotente)
 * PUT    /api/unidades              - Actualizar unidad (upsert)
 * DELETE /api/unidades?id=xxx       - Eliminar unidad (idempotente)
 *
 * Las unidades usan ids string (`unidad_<grupoId>_<timestamp>`).
 * Requiere JWT: toda operacion queda aislada por userId.
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

const COLLECTION = "unidades";

module.exports = async (req, res) => {
  applyCors(req, res);

  if (handleCors(req, res)) return;

  const auth = validateAuth(req);
  if (!auth.valid) {
    return errorResponse(res, 401, auth.error);
  }

  const userId = getScopeUserId(req);
  if (!userId) {
    return errorResponse(res, 401, "Se requiere sesión de usuario (JWT)");
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    await Promise.all([
      collection.createIndex({ id: 1 }, { unique: true }),
      collection.createIndex({ userId: 1, fechaModificacion: -1 }),
      collection.createIndex({ grupoId: 1 }),
    ]);

    switch (req.method) {
      case "GET":
        return await handleGet(req, res, collection, userId);
      case "POST":
      case "PUT":
        return await handleUpsert(req, res, collection, userId);
      case "DELETE":
        return await handleDelete(req, res, collection, userId);
      default:
        return errorResponse(res, 405, `Method ${req.method} not allowed`);
    }
  } catch (error) {
    console.error("Error en API unidades:", error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * GET - Listar u obtener unidad
 */
async function handleGet(req, res, collection, userId) {
  const { id, grupoId, limit = 500 } = req.query;

  if (id) {
    const unidad = await collection.findOne({ id });
    if (!unidad || String(unidad.userId) !== userId) {
      return errorResponse(res, 404, "Unidad no encontrada");
    }
    return successResponse(res, unidad);
  }

  const query = { userId };
  if (grupoId) {
    const numeric = Number(grupoId);
    query.grupoId = Number.isNaN(numeric) ? grupoId : numeric;
  }

  const unidades = await collection
    .find(query)
    .sort({ grupoId: 1, posicion: 1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, {
    count: unidades.length,
    unidades,
  });
}

/**
 * POST/PUT - Upsert idempotente: la cola offline puede reintentar creates
 * y mandar updates antes de que el create llegue al servidor.
 */
async function handleUpsert(req, res, collection, userId) {
  const unidad = req.body;

  if (!unidad || !unidad.id) {
    return errorResponse(res, 400, "ID de unidad requerido");
  }

  const existing = await collection.findOne({ id: unidad.id });
  if (existing && !ownsDoc(existing, userId)) {
    return errorResponse(res, 403, "No autorizado");
  }

  const nowIso = new Date().toISOString();
  const result = await collection.updateOne(
    { id: unidad.id },
    {
      $set: {
        ...unidad,
        userId,
        fechaModificacion: unidad.fechaModificacion || nowIso,
        syncedAt: nowIso,
      },
      $setOnInsert: { createdAt: nowIso },
    },
    { upsert: true }
  );

  return successResponse(
    res,
    {
      action: result.upsertedCount > 0 ? "created" : "updated",
      id: unidad.id,
    },
    result.upsertedCount > 0 ? 201 : 200
  );
}

/**
 * DELETE - Idempotente: borrar algo ya borrado es exito.
 */
async function handleDelete(req, res, collection, userId) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "ID de unidad requerido");
  }

  const existing = await collection.findOne({ id });
  if (existing && !ownsDoc(existing, userId)) {
    return errorResponse(res, 404, "Unidad no encontrada");
  }

  const result = await collection.deleteOne({ id, userId });

  return successResponse(res, {
    action: "deleted",
    id,
    deletedCount: result.deletedCount,
  });
}
