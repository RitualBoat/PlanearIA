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

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    // Crear índices (idempotente)
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ grupoId: 1 });
    await collection.createIndex({ fechaModificacion: -1 });

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
    console.error("❌ Error en API entregables:", error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * GET - Listar entregables con filtros opcionales
 */
async function handleGet(req, res, collection) {
  const { id, grupoId, tipo, limit = 500 } = req.query;

  if (id) {
    const entregable = await collection.findOne({ id: Number(id) });
    if (!entregable) {
      return errorResponse(res, 404, "Entregable no encontrado");
    }
    return successResponse(res, entregable);
  }

  const query = {};
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
async function handlePost(req, res, collection) {
  const body = req.body;

  if (!body || !body.titulo) {
    return errorResponse(res, 400, "El campo 'titulo' es requerido");
  }

  const doc = {
    ...body,
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
async function handlePut(req, res, collection) {
  const body = req.body;

  if (!body || !body.id) {
    return errorResponse(res, 400, "El campo 'id' es requerido para actualizar");
  }

  const update = {
    ...body,
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.updateOne({ id: Number(body.id) }, { $set: update });

  if (result.matchedCount === 0) {
    return errorResponse(res, 404, "Entregable no encontrado");
  }

  return successResponse(res, {
    updated: true,
    entregable: update,
  });
}

/**
 * DELETE - Eliminar entregable por id
 */
async function handleDelete(req, res, collection) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "Se requiere el parámetro 'id'");
  }

  const result = await collection.deleteOne({ id: Number(id) });

  if (result.deletedCount === 0) {
    return errorResponse(res, 404, "Entregable no encontrado");
  }

  return successResponse(res, { deleted: true, id: Number(id) });
}
