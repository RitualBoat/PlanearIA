/**
 * API de Plantillas - Operaciones CRUD
 *
 * GET    /api/plantillas                     - Listar plantillas (filtro por categoria, tipo)
 * POST   /api/plantillas                     - Crear plantilla
 * PUT    /api/plantillas                     - Actualizar plantilla
 * DELETE /api/plantillas?id=xxx              - Eliminar plantilla
 */
const { connectToDatabase } = require("../lib/mongodb");
const {
  validateAuth,
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

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    // Crear índices (idempotente)
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ categoria: 1 });
    await collection.createIndex({ tipo: 1 });
    await collection.createIndex({ fechaModificacion: -1 });
    await collection.createIndex({ esDelSistema: 1 });

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
    console.error("❌ Error en API plantillas:", error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * GET - Listar plantillas con filtros opcionales
 */
async function handleGet(req, res, collection) {
  const { id, categoria, tipo, sistema, limit = 500 } = req.query;

  if (id) {
    const plantilla = await collection.findOne({ id: Number(id) });
    if (!plantilla) {
      return errorResponse(res, 404, "Plantilla no encontrada");
    }
    return successResponse(res, plantilla);
  }

  const query = {};
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
 * POST - Crear plantilla
 */
async function handlePost(req, res, collection) {
  const body = req.body;

  if (!body || !body.nombre) {
    return errorResponse(res, 400, "El campo 'nombre' es requerido");
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
      plantilla: doc,
      upserted: result.upsertedCount > 0,
    },
    result.upsertedCount > 0 ? 201 : 200
  );
}

/**
 * PUT - Actualizar plantilla existente
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
    return errorResponse(res, 404, "Plantilla no encontrada");
  }

  return successResponse(res, {
    updated: true,
    plantilla: update,
  });
}

/**
 * DELETE - Eliminar plantilla por id
 */
async function handleDelete(req, res, collection) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "Se requiere el parámetro 'id'");
  }

  const result = await collection.deleteOne({ id: Number(id) });

  if (result.deletedCount === 0) {
    return errorResponse(res, 404, "Plantilla no encontrada");
  }

  return successResponse(res, { deleted: true, id: Number(id) });
}
