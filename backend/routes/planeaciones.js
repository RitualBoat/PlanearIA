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
  getUserFromToken,
  handleCors,
  applyCors,
  errorResponse,
  successResponse,
} = require("../lib/auth");

const COLLECTION = "planeaciones";

module.exports = async (req, res) => {
  // Establecer headers CORS
  applyCors(req, res);

  // Manejar preflight
  if (handleCors(req, res)) return;

  // Validar autenticación
  const auth = validateAuth(req);
  if (!auth.valid) {
    return errorResponse(res, 401, auth.error);
  }

  // Obtener el userId del JWT
  const userPayload = getUserFromToken(req);
  if (!userPayload || !userPayload.userId) {
    return errorResponse(res, 401, "Token de usuario inválido o ausente");
  }
  const userId = String(userPayload.userId);

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    // Crear índices (idempotente)
    await Promise.all([
      collection.createIndex({ id: 1 }, { unique: true }),
      collection.createIndex({ userId: 1, fechaModificacion: -1 }),
      collection.createIndex({ fechaModificacion: -1 }),
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
    console.error("❌ Error en API:", error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * GET - Listar o obtener planeación
 */
async function handleGet(req, res, collection, userId) {
  const { id, desde, limit = 100 } = req.query;

  // Obtener una planeación específica
  if (id) {
    const planeacion = await collection.findOne({ id: id, userId: userId });
    if (!planeacion) {
      return errorResponse(res, 404, "Planeación no encontrada");
    }
    return successResponse(res, planeacion);
  }

  // Listar planeaciones (con paginación opcional)
  const query = { userId: userId };

  // Filtrar por fecha de modificación (para sync incremental)
  if (desde) {
    query.fechaModificacion = { $gt: desde };
  }

  const planeaciones = await collection
    .find(query)
    .sort({ fechaModificacion: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, {
    count: planeaciones.length,
    planeaciones,
  });
}

/**
 * POST - Crear nueva planeación
 */
async function handlePost(req, res, collection, userId) {
  const planeacion = req.body;

  if (!planeacion || !planeacion.id) {
    return errorResponse(res, 400, "Datos de planeación inválidos");
  }

  // Asegurar el aislamiento asignando el userId validado en el token
  planeacion.userId = userId;

  // Verificar si ya existe
  const existing = await collection.findOne({ id: planeacion.id });
  if (existing) {
    // Si existe, verificar que pertenezca al usuario antes de actualizar
    if (existing.userId !== userId) {
      return errorResponse(res, 403, "No tienes permiso para modificar esta planeación");
    }
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
async function handlePut(req, res, collection, userId) {
  const planeacion = req.body;

  if (!planeacion || !planeacion.id) {
    return errorResponse(res, 400, "ID de planeación requerido");
  }

  // Asegurar el aislamiento asignando el userId validado en el token
  planeacion.userId = userId;

  // Verificar si ya existe y pertenece al usuario
  const existing = await collection.findOne({ id: planeacion.id });
  if (existing && existing.userId !== userId) {
    return errorResponse(res, 403, "No tienes permiso para modificar esta planeación");
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
async function handleDelete(req, res, collection, userId) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "ID de planeación requerido");
  }

  // Verificar que pertenezca al usuario antes de eliminar
  const existing = await collection.findOne({ id: id });
  if (!existing) {
    return errorResponse(res, 404, "Planeación no encontrada");
  }
  if (existing.userId !== userId) {
    return errorResponse(res, 403, "No tienes permiso para eliminar esta planeación");
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
