/**
 * API de Entregables - Operaciones CRUD
 *
 * GET    /api/entregables                       - Listar entregables (filtro por grupoId, tipo)
 * POST   /api/entregables                       - Crear entregable
 * PUT    /api/entregables                       - Actualizar entregable
 * DELETE /api/entregables?id=xxx                - Eliminar entregable
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

const COLLECTION = "entregables";

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

    // Crear índices (idempotente)
    await Promise.all([
      collection.createIndex({ id: 1 }, { unique: true }),
      collection.createIndex({ grupoId: 1 }),
      collection.createIndex({ fechaModificacion: -1 }),
      collection.createIndex({ userId: 1, fechaModificacion: -1 }),
    ]);

    switch (req.method) {
      case "GET":
        return await handleGet(req, res, collection, userId);
      case "POST":
        return await handlePost(req, res, collection, userId);
      case "PUT":
        return await handlePut(req, res, collection, userId);
      case "DELETE":
        return await handleDelete(req, res, collection, userId);
      default:
        return errorResponse(res, 405, `Method ${req.method} not allowed`);
    }
  } catch (error) {
    console.error("❌ Error en API entregables:", error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * GET - Listar entregables con filtros opcionales
 */
async function handleGet(req, res, collection, userId) {
  const { id, grupoId, tipo, limit = 500 } = req.query;

  if (id) {
    const entregable = await collection.findOne({ id: Number(id) });
    if (!entregable || (userId && String(entregable.userId) !== userId)) {
      return errorResponse(res, 404, "Entregable no encontrado");
    }
    return successResponse(res, entregable);
  }

  const query = {};
  if (userId) query.userId = userId;
  if (grupoId) query.grupoId = Number(grupoId);
  if (tipo) query.tipo = tipo;

  const entregables = await collection
    .find(query)
    .sort({ fechaEntrega: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, {
    count: entregables.length,
    entregables,
  });
}

/**
 * POST - Crear entregable
 */
async function handlePost(req, res, collection, userId) {
  const body = req.body;

  if (!body || !body.titulo) {
    return errorResponse(res, 400, "El campo 'titulo' es requerido");
  }

  if (userId) {
    const existing = await collection.findOne({ id: body.id });
    if (existing && !ownsDoc(existing, userId)) {
      return errorResponse(res, 403, "No autorizado");
    }
  }

  const doc = {
    ...body,
    ...(userId ? { userId } : {}),
    syncedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });

  return successResponse(
    res,
    {
      entregable: doc,
      upserted: result.upsertedCount > 0,
    },
    result.upsertedCount > 0 ? 201 : 200
  );
}

/**
 * PUT - Actualizar entregable existente
 */
async function handlePut(req, res, collection, userId) {
  const body = req.body;

  if (!body || !body.id) {
    return errorResponse(res, 400, "El campo 'id' es requerido para actualizar");
  }

  if (userId) {
    const existing = await collection.findOne({ id: Number(body.id) });
    if (existing && !ownsDoc(existing, userId)) {
      return errorResponse(res, 403, "No autorizado");
    }
  }

  const update = {
    ...body,
    id: Number(body.id),
    ...(userId ? { userId } : {}),
    updatedAt: new Date().toISOString(),
  };

  // Upsert: un update offline puede llegar antes que el create
  const result = await collection.updateOne(
    { id: Number(body.id) },
    { $set: update, $setOnInsert: { createdAt: new Date().toISOString() } },
    { upsert: true }
  );

  return successResponse(res, {
    updated: true,
    created: result.upsertedCount > 0,
    entregable: update,
  });
}

/**
 * DELETE - Eliminar entregable por id
 */
async function handleDelete(req, res, collection, userId) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "Se requiere el parámetro 'id'");
  }

  if (userId) {
    const existing = await collection.findOne({ id: Number(id) });
    if (existing && !ownsDoc(existing, userId)) {
      return errorResponse(res, 404, "Entregable no encontrado");
    }
  }

  // Idempotente: borrar algo ya borrado es exito para la cola offline
  const result = await collection.deleteOne({ id: Number(id) });

  return successResponse(res, {
    deleted: true,
    id: Number(id),
    deletedCount: result.deletedCount,
  });
}
