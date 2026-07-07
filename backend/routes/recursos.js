/**
 * API de Recursos - Operaciones CRUD
 *
 * GET    /api/recursos                       - Listar recursos (filtro por tipo, tags)
 * POST   /api/recursos                       - Crear recurso
 * PUT    /api/recursos                       - Actualizar recurso
 * DELETE /api/recursos?id=xxx                - Eliminar recurso
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

const COLLECTION = "recursos";

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
      collection.createIndex({ tipo: 1 }),
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
    console.error("❌ Error en API recursos:", error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * GET - Listar recursos con filtros opcionales
 */
async function handleGet(req, res, collection, userId) {
  const { id, tipo, limit = 500 } = req.query;

  if (id) {
    const recurso = await collection.findOne({ id: Number(id) });
    if (!recurso || (userId && String(recurso.userId) !== userId)) {
      return errorResponse(res, 404, "Recurso no encontrado");
    }
    return successResponse(res, recurso);
  }

  const query = {};
  if (userId) query.userId = userId;
  if (tipo) query.tipo = tipo;

  const recursos = await collection
    .find(query)
    .sort({ fechaModificacion: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, {
    count: recursos.length,
    recursos,
  });
}

/**
 * POST - Crear recurso
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
      recurso: doc,
      upserted: result.upsertedCount > 0,
    },
    result.upsertedCount > 0 ? 201 : 200
  );
}

/**
 * PUT - Actualizar recurso existente
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
    recurso: update,
  });
}

/**
 * DELETE - Eliminar recurso por id
 */
async function handleDelete(req, res, collection, userId) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "Se requiere el parámetro 'id'");
  }

  if (userId) {
    const existing = await collection.findOne({ id: Number(id) });
    if (existing && !ownsDoc(existing, userId)) {
      return errorResponse(res, 404, "Recurso no encontrado");
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
