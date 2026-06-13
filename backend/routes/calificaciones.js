/**
 * API de Calificaciones - Operaciones CRUD
 *
 * GET    /api/calificaciones                    - Listar calificaciones (filtro por grupoId, alumnoId)
 * POST   /api/calificaciones                    - Crear registro(s) de calificación (uno o masivo)
 * PUT    /api/calificaciones                    - Actualizar registro de calificación
 * DELETE /api/calificaciones?id=xxx             - Eliminar registro de calificación
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

const COLLECTION = "calificaciones";

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
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ alumnoId: 1 });
    await collection.createIndex({ grupoId: 1 });
    await collection.createIndex({ userId: 1, fechaRegistro: -1 });

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
    console.error("❌ Error en API calificaciones:", error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * GET - Listar calificaciones con filtros opcionales
 */
async function handleGet(req, res, collection, userId) {
  const { id, grupoId, alumnoId, limit = 500 } = req.query;

  if (id) {
    const calificacion = await collection.findOne({ id: Number(id) });
    if (!calificacion || (userId && String(calificacion.userId) !== userId)) {
      return errorResponse(res, 404, "Calificación no encontrada");
    }
    return successResponse(res, calificacion);
  }

  const query = {};
  if (userId) query.userId = userId;
  if (grupoId) query.grupoId = Number(grupoId);
  if (alumnoId) query.alumnoId = Number(alumnoId);

  const calificaciones = await collection
    .find(query)
    .sort({ fechaRegistro: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, {
    count: calificaciones.length,
    calificaciones,
  });
}

/**
 * POST - Crear registro(s) de calificación (soporte masivo)
 */
async function handlePost(req, res, collection, userId) {
  const body = req.body;

  // Soporte masivo: si body es un array, upsert múltiples
  if (Array.isArray(body)) {
    if (body.length === 0) {
      return errorResponse(res, 400, "Array de registros vacío");
    }

    let created = 0;
    let updated = 0;

    for (const item of body) {
      if (!item.alumnoId || !item.grupoId) continue;

      const doc = {
        ...item,
        ...(userId ? { userId } : {}),
        syncedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const matchKey = { alumnoId: doc.alumnoId, grupoId: doc.grupoId };
      if (userId) matchKey.userId = userId;

      const result = await collection.updateOne(matchKey, { $set: doc }, { upsert: true });

      if (result.upsertedCount > 0) created++;
      else updated++;
    }

    return successResponse(res, { action: "bulk", created, updated, total: body.length }, 201);
  }

  // Registro individual
  const calificacion = body;
  if (!calificacion || !calificacion.alumnoId || !calificacion.grupoId) {
    return errorResponse(
      res,
      400,
      "Datos de calificación inválidos (alumnoId y grupoId requeridos)"
    );
  }

  const existing = await collection.findOne({ id: calificacion.id });
  if (existing && !ownsDoc(existing, userId)) {
    return errorResponse(res, 403, "No autorizado");
  }
  if (existing) {
    await collection.updateOne(
      { id: calificacion.id },
      {
        $set: {
          ...calificacion,
          ...(userId ? { userId } : {}),
          syncedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
    );
    return successResponse(res, { action: "updated", id: calificacion.id });
  }

  const doc = {
    ...calificacion,
    ...(userId ? { userId } : {}),
    syncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await collection.insertOne(doc);
  return successResponse(res, { action: "created", id: calificacion.id }, 201);
}

/**
 * PUT - Actualizar registro de calificación existente
 */
async function handlePut(req, res, collection, userId) {
  const calificacion = req.body;

  if (!calificacion || !calificacion.id) {
    return errorResponse(res, 400, "ID de calificación requerido");
  }

  const existing = await collection.findOne({ id: calificacion.id });
  if (!existing) {
    return errorResponse(res, 404, "Calificación no encontrada");
  }
  if (!ownsDoc(existing, userId)) {
    return errorResponse(res, 403, "No autorizado");
  }

  await collection.updateOne(
    { id: calificacion.id },
    {
      $set: {
        ...calificacion,
        ...(userId ? { userId } : {}),
        syncedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
  );

  return successResponse(res, { action: "updated", id: calificacion.id });
}

/**
 * DELETE - Eliminar registro de calificación
 */
async function handleDelete(req, res, collection, userId) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "ID requerido para eliminar");
  }

  if (userId) {
    const existing = await collection.findOne({ id: Number(id) });
    if (existing && !ownsDoc(existing, userId)) {
      return errorResponse(res, 404, "Calificación no encontrada");
    }
  }

  // Idempotente: borrar algo ya borrado es exito para la cola offline
  const result = await collection.deleteOne({ id: Number(id) });

  return successResponse(res, {
    action: "deleted",
    id: Number(id),
    deletedCount: result.deletedCount,
  });
}
