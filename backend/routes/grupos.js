/**
 * API de Grupos - Operaciones CRUD
 *
 * GET    /api/grupos         - Listar todos los grupos
 * POST   /api/grupos         - Crear nuevo grupo (idempotente: upsert si ya existe y es propio)
 * GET    /api/grupos?id=xxx  - Obtener un grupo
 * PUT    /api/grupos         - Actualizar grupo (upsert)
 * DELETE /api/grupos?id=xxx  - Eliminar grupo (idempotente)
 *
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

const COLLECTION = "grupos";

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

    await ensureIndexes(collection);

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
    console.error("Error en API de grupos:", error);
    return errorResponse(res, 500, error.message);
  }
};

async function ensureIndexes(collection) {
  await Promise.all([
    collection.createIndex({ id: 1 }, { unique: true }),
    collection.createIndex({ userId: 1, fechaModificacion: -1 }),
    collection.createIndex({ fechaModificacion: -1 }),
  ]);
}

// Query-string ids llegan como string; los grupos se guardan con id numerico
const normalizeId = (value) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return value;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
};

/**
 * GET - Listar u obtener grupo
 */
async function handleGet(req, res, collection, userId) {
  const { id, desde, limit = 100 } = req.query;

  if (id) {
    const grupo = await collection.findOne({ id: normalizeId(id) });
    if (!grupo || String(grupo.userId) !== userId) {
      return errorResponse(res, 404, "Grupo no encontrado");
    }
    return successResponse(res, grupo);
  }

  const query = { userId };
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
 * POST - Crear nuevo grupo. Idempotente para la cola de sincronizacion:
 * un reintento sobre un grupo propio ya creado lo actualiza en vez de 409.
 */
async function handlePost(req, res, collection, userId) {
  const grupo = req.body;

  if (!grupo || grupo.id === undefined || grupo.id === null) {
    return errorResponse(res, 400, "Datos de grupo inválidos");
  }

  const grupoId = normalizeId(grupo.id);
  const nowIso = new Date().toISOString();

  const existing = await collection.findOne({ id: grupoId });
  if (existing && !ownsDoc(existing, userId)) {
    return errorResponse(res, 403, "No autorizado");
  }

  if (existing) {
    await collection.updateOne(
      { id: grupoId },
      {
        $set: {
          ...grupo,
          id: grupoId,
          userId,
          fechaModificacion: grupo.fechaModificacion || nowIso,
          syncedAt: nowIso,
        },
      }
    );
    return successResponse(res, { action: "updated", id: grupoId });
  }

  const doc = {
    ...grupo,
    id: grupoId,
    userId,
    fechaCreacion: grupo.fechaCreacion || nowIso,
    fechaModificacion: grupo.fechaModificacion || nowIso,
    syncedAt: nowIso,
    createdAt: nowIso,
  };

  await collection.insertOne(doc);
  return successResponse(res, { action: "created", id: grupoId }, 201);
}

/**
 * PUT - Actualizar grupo (upsert: un update offline puede llegar antes
 * de que el create haya tocado el servidor).
 */
async function handlePut(req, res, collection, userId) {
  const grupo = req.body;

  if (!grupo || grupo.id === undefined || grupo.id === null) {
    return errorResponse(res, 400, "ID de grupo requerido");
  }

  const grupoId = normalizeId(grupo.id);
  const existing = await collection.findOne({ id: grupoId });
  if (existing && !ownsDoc(existing, userId)) {
    return errorResponse(res, 403, "No autorizado");
  }

  const nowIso = new Date().toISOString();
  const payload = {
    ...grupo,
    id: grupoId,
    userId,
    fechaModificacion: grupo.fechaModificacion || nowIso,
    syncedAt: nowIso,
  };

  const result = await collection.updateOne(
    { id: grupoId },
    {
      $set: payload,
      $setOnInsert: { createdAt: nowIso },
    },
    { upsert: true }
  );

  return successResponse(res, {
    action: result.upsertedCount > 0 ? "created" : "updated",
    id: grupoId,
    modifiedCount: result.modifiedCount,
  });
}

/**
 * DELETE - Eliminar grupo. Idempotente: borrar algo ya borrado es exito,
 * asi la cola offline no reintenta operaciones imposibles.
 */
async function handleDelete(req, res, collection, userId) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "ID de grupo requerido");
  }

  const grupoId = normalizeId(id);
  const existing = await collection.findOne({ id: grupoId });
  if (existing && !ownsDoc(existing, userId)) {
    return errorResponse(res, 404, "Grupo no encontrado");
  }

  const result = await collection.deleteOne({ id: grupoId, userId });

  return successResponse(res, {
    action: "deleted",
    id: grupoId,
    deletedCount: result.deletedCount,
  });
}
