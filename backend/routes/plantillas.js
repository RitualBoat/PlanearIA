/**
 * API de Plantillas - Operaciones CRUD
 *
 * GET    /api/plantillas                     - Listar plantillas (propias + del sistema)
 * POST   /api/plantillas                     - Crear plantilla
 * PUT    /api/plantillas                     - Actualizar plantilla (upsert)
 * DELETE /api/plantillas?id=xxx              - Eliminar plantilla (idempotente)
 *
 * Requiere JWT. Las plantillas con esDelSistema=true son visibles para
 * todos los usuarios pero no pueden modificarse desde la app.
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

const COLLECTION = "plantillas";

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
      collection.createIndex({ categoria: 1 }),
      collection.createIndex({ tipo: 1 }),
      collection.createIndex({ fechaModificacion: -1 }),
      collection.createIndex({ esDelSistema: 1 }),
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
    console.error("Error en API plantillas:", error);
    return errorResponse(res, 500, error.message);
  }
};

const canRead = (doc, userId) =>
  doc && (doc.esDelSistema === true || String(doc.userId) === userId);

/**
 * GET - Listar plantillas propias + del sistema
 */
async function handleGet(req, res, collection, userId) {
  const { id, categoria, tipo, sistema, limit = 500 } = req.query;

  if (id) {
    const plantilla = await collection.findOne({ id: Number(id) });
    if (!canRead(plantilla, userId)) {
      return errorResponse(res, 404, "Plantilla no encontrada");
    }
    return successResponse(res, plantilla);
  }

  const query = { $or: [{ userId }, { esDelSistema: true }] };
  if (categoria) query.categoria = categoria;
  if (tipo) query.tipo = tipo;
  if (sistema !== undefined) query.esDelSistema = sistema === "true";

  const plantillas = await collection
    .find(query)
    .sort({ esDelSistema: -1, fechaModificacion: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, {
    count: plantillas.length,
    plantillas,
  });
}

/**
 * POST - Crear plantilla (idempotente para la cola de sincronizacion)
 */
async function handlePost(req, res, collection, userId) {
  const body = req.body;

  if (!body || !body.nombre || body.id === undefined || body.id === null) {
    return errorResponse(res, 400, "Los campos 'nombre' e 'id' son requeridos");
  }

  const existing = await collection.findOne({ id: body.id });
  if (existing && (existing.esDelSistema === true || !ownsDoc(existing, userId))) {
    return errorResponse(res, 403, "No autorizado");
  }

  const doc = {
    ...body,
    userId,
    esDelSistema: false,
    syncedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });

  return successResponse(
    res,
    {
      plantilla: doc,
      upserted: result.upsertedCount > 0,
    },
    result.upsertedCount > 0 ? 201 : 200
  );
}

/**
 * PUT - Actualizar plantilla (upsert)
 */
async function handlePut(req, res, collection, userId) {
  const body = req.body;

  if (!body || !body.id) {
    return errorResponse(res, 400, "El campo 'id' es requerido para actualizar");
  }

  const plantillaId = Number(body.id);
  const existing = await collection.findOne({ id: plantillaId });
  if (existing && (existing.esDelSistema === true || !ownsDoc(existing, userId))) {
    return errorResponse(res, 403, "No autorizado");
  }

  const update = {
    ...body,
    id: plantillaId,
    userId,
    esDelSistema: false,
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.updateOne(
    { id: plantillaId },
    { $set: update, $setOnInsert: { createdAt: new Date().toISOString() } },
    { upsert: true }
  );

  return successResponse(res, {
    updated: true,
    created: result.upsertedCount > 0,
    plantilla: update,
  });
}

/**
 * DELETE - Eliminar plantilla propia (idempotente)
 */
async function handleDelete(req, res, collection, userId) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "Se requiere el parámetro 'id'");
  }

  const plantillaId = Number(id);
  const existing = await collection.findOne({ id: plantillaId });
  if (existing && (existing.esDelSistema === true || !ownsDoc(existing, userId))) {
    return errorResponse(res, 403, "No autorizado");
  }

  const result = await collection.deleteOne({ id: plantillaId, userId });

  return successResponse(res, {
    deleted: true,
    id: plantillaId,
    deletedCount: result.deletedCount,
  });
}
