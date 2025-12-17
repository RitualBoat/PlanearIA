/**
 * API de Planeaciones - Operaciones CRUD
 *
 * GET    /api/planeaciones         - Listar todas las planeaciones
 * POST   /api/planeaciones         - Crear nueva planeación
 * GET    /api/planeaciones?id=xxx  - Obtener una planeación
 * PUT    /api/planeaciones         - Actualizar planeación
 * DELETE /api/planeaciones?id=xxx  - Eliminar planeación
 */
const { connectToDatabase } = require("../lib/mongodb");
const {
  validateAuth,
  handleCors,
  applyCors,
  errorResponse,
  successResponse,
} = require("../lib/auth");

const COLLECTION = "planeaciones";

module.exports = async (req, res) => {
  // Establecer headers CORS
  applyCors(res);

  // Manejar preflight
  if (handleCors(req, res)) return;

  // Validar autenticación
  const auth = validateAuth(req);
  if (!auth.valid) {
    return errorResponse(res, 401, auth.error);
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

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
    console.error("❌ Error en API:", error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * GET - Listar o obtener planeación
 */
async function handleGet(req, res, collection) {
  const { id, desde, limit = 100 } = req.query;

  // Obtener una planeación específica
  if (id) {
    const planeacion = await collection.findOne({ id: id });
    if (!planeacion) {
      return errorResponse(res, 404, "Planeación no encontrada");
    }
    return successResponse(res, planeacion);
  }

  // Listar planeaciones (con paginación opcional)
  const query = {};

  // Filtrar por fecha de modificación (para sync incremental)
  if (desde) {
    query.fechaModificacion = { $gt: desde };
  }

  const planeaciones = await collection
    .find(query)
    .sort({ fechaModificacion: -1 })
    .limit(parseInt(limit))
    .toArray();

  return successResponse(res, {
    count: planeaciones.length,
    planeaciones,
  });
}

/**
 * POST - Crear nueva planeación
 */
async function handlePost(req, res, collection) {
  const planeacion = req.body;

  if (!planeacion || !planeacion.id) {
    return errorResponse(res, 400, "Datos de planeación inválidos");
  }

  // Verificar si ya existe
  const existing = await collection.findOne({ id: planeacion.id });
  if (existing) {
    // Si existe, actualizar
    await collection.updateOne(
      { id: planeacion.id },
      {
        $set: {
          ...planeacion,
          syncedAt: new Date().toISOString(),
        },
      }
    );
    return successResponse(res, { action: "updated", id: planeacion.id });
  }

  // Crear nueva
  const doc = {
    ...planeacion,
    syncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await collection.insertOne(doc);
  return successResponse(res, { action: "created", id: planeacion.id }, 201);
}

/**
 * PUT - Actualizar planeación existente
 */
async function handlePut(req, res, collection) {
  const planeacion = req.body;

  if (!planeacion || !planeacion.id) {
    return errorResponse(res, 400, "ID de planeación requerido");
  }

  const result = await collection.updateOne(
    { id: planeacion.id },
    {
      $set: {
        ...planeacion,
        syncedAt: new Date().toISOString(),
      },
    },
    { upsert: true } // Crear si no existe
  );

  return successResponse(res, {
    action: result.upsertedCount > 0 ? "created" : "updated",
    id: planeacion.id,
    modifiedCount: result.modifiedCount,
  });
}

/**
 * DELETE - Eliminar planeación
 */
async function handleDelete(req, res, collection) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "ID de planeación requerido");
  }

  const result = await collection.deleteOne({ id: id });

  if (result.deletedCount === 0) {
    return errorResponse(res, 404, "Planeación no encontrada");
  }

  return successResponse(res, {
    action: "deleted",
    id,
    deletedCount: result.deletedCount,
  });
}
