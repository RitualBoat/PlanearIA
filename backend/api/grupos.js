/**
 * API de Grupos - Operaciones CRUD
 *
 * GET    /api/grupos         - Listar todos los grupos
 * POST   /api/grupos         - Crear nuevo grupo
 * GET    /api/grupos?id=xxx  - Obtener un grupo
 * PUT    /api/grupos         - Actualizar grupo
 * DELETE /api/grupos?id=xxx  - Eliminar grupo
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

const COLLECTION = "grupos";

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

    await ensureIndexes(collection);

    // Additive per-user isolation: scoped when a JWT is present, legacy when not.
    const userId = getScopeUserId(req);

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
    console.error("❌ Error en API de grupos:", error);
    return errorResponse(res, 500, error.message);
  }
};

async function ensureIndexes(collection) {
  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.createIndex({ userId: 1, fechaModificacion: -1 });
  await collection.createIndex({ fechaModificacion: -1 });
}

/**
 * GET - Listar u obtener grupo
 */
async function handleGet(req, res, collection, userId) {
  const { id, desde, limit = 100 } = req.query;

  if (id) {
    const grupo = await collection.findOne({ id: id });
    if (!grupo || (userId && String(grupo.userId) !== userId)) {
      return errorResponse(res, 404, "Grupo no encontrado");
    }
    return successResponse(res, grupo);
  }

  const query = {};
  if (userId) query.userId = userId;
  if (desde) {
    query.fechaModificacion = { $gt: desde };
  }

  const grupos = await collection
    .find(query)
    .sort({ fechaModificacion: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, {
    count: grupos.length,
    grupos,
  });
}

/**
 * POST - Crear nuevo grupo
 */
async function handlePost(req, res, collection, userId) {
  const grupo = req.body;

  if (!grupo || !grupo.id) {
    return errorResponse(res, 400, "Datos de grupo inválidos");
  }

  const existing = await collection.findOne({ id: grupo.id });
  if (existing) {
    if (!ownsDoc(existing, userId)) {
      return errorResponse(res, 403, "No autorizado");
    }
    return errorResponse(res, 409, "Ya existe un grupo con ese ID");
  }

  const nowIso = new Date().toISOString();
  const doc = {
    ...grupo,
    ...(userId ? { userId } : {}),
    fechaCreacion: grupo.fechaCreacion || nowIso,
    fechaModificacion: grupo.fechaModificacion || nowIso,
    syncedAt: nowIso,
    createdAt: nowIso,
  };

  await collection.insertOne(doc);
  return successResponse(res, { action: "created", id: grupo.id }, 201);
}

/**
 * PUT - Actualizar grupo existente
 */
async function handlePut(req, res, collection, userId) {
  const grupo = req.body;

  if (!grupo || !grupo.id) {
    return errorResponse(res, 400, "ID de grupo requerido");
  }

  if (userId) {
    const existing = await collection.findOne({ id: grupo.id });
    if (existing && !ownsDoc(existing, userId)) {
      return errorResponse(res, 403, "No autorizado");
    }
  }

  const nowIso = new Date().toISOString();
  const payload = {
    ...grupo,
    ...(userId ? { userId } : {}),
    fechaModificacion: grupo.fechaModificacion || nowIso,
    syncedAt: nowIso,
  };

  const result = await collection.updateOne({ id: grupo.id }, { $set: payload });

  if (result.matchedCount === 0) {
    return errorResponse(res, 404, "Grupo no encontrado");
  }

  return successResponse(res, {
    action: "updated",
    id: grupo.id,
    modifiedCount: result.modifiedCount,
  });
}

/**
 * DELETE - Eliminar grupo
 */
async function handleDelete(req, res, collection, userId) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "ID de grupo requerido");
  }

  if (userId) {
    const existing = await collection.findOne({ id: id });
    if (existing && !ownsDoc(existing, userId)) {
      return errorResponse(res, 404, "Grupo no encontrado");
    }
  }

  const result = await collection.deleteOne({ id: id });
  if (result.deletedCount === 0) {
    return errorResponse(res, 404, "Grupo no encontrado");
  }

  return successResponse(res, {
    action: "deleted",
    id,
    deletedCount: result.deletedCount,
  });
}
