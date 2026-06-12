/**
 * API de Asistencias - Operaciones CRUD
 *
 * GET    /api/asistencias                       - Listar asistencias (filtro por grupoId, fecha)
 * POST   /api/asistencias                       - Crear registro(s) de asistencia (uno o masivo)
 * PUT    /api/asistencias                       - Actualizar registro de asistencia
 * DELETE /api/asistencias?id=xxx                - Eliminar registro de asistencia
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

const COLLECTION = "asistencias";

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
    await collection.createIndex({ grupoId: 1, fecha: -1 });
    await collection.createIndex({ alumnoId: 1 });
    await collection.createIndex({ userId: 1, fecha: -1 });

    // Additive per-user isolation: scoped when a JWT is present.
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
    console.error("❌ Error en API asistencias:", error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * GET - Listar asistencias con filtros opcionales
 */
async function handleGet(req, res, collection, userId) {
  const { id, grupoId, fecha, alumnoId, limit = 500 } = req.query;

  if (id) {
    const asistencia = await collection.findOne({ id: Number(id) });
    if (!asistencia || (userId && String(asistencia.userId) !== userId)) {
      return errorResponse(res, 404, "Registro de asistencia no encontrado");
    }
    return successResponse(res, asistencia);
  }

  const query = {};
  if (userId) query.userId = userId;
  if (grupoId) query.grupoId = Number(grupoId);
  if (fecha) query.fecha = fecha;
  if (alumnoId) query.alumnoId = Number(alumnoId);

  const asistencias = await collection
    .find(query)
    .sort({ fecha: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, {
    count: asistencias.length,
    asistencias,
  });
}

/**
 * POST - Crear registro(s) de asistencia (soporte masivo)
 */
async function handlePost(req, res, collection, userId) {
  const body = req.body;

  // Soporte masivo: si body es un array, insertar múltiples
  if (Array.isArray(body)) {
    if (body.length === 0) {
      return errorResponse(res, 400, "Array de registros vacío");
    }

    const docs = body.map((item) => ({
      ...item,
      ...(userId ? { userId } : {}),
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }));

    // Upsert each record (replace if same grupo+alumno+fecha exists)
    let created = 0;
    let updated = 0;

    for (const doc of docs) {
      if (!doc.alumnoId || !doc.grupoId) continue;

      const matchKey = { alumnoId: doc.alumnoId, grupoId: doc.grupoId, fecha: doc.fecha };
      if (userId) matchKey.userId = userId;

      const result = await collection.updateOne(matchKey, { $set: doc }, { upsert: true });

      if (result.upsertedCount > 0) created++;
      else updated++;
    }

    return successResponse(res, { action: "bulk", created, updated, total: docs.length }, 201);
  }

  // Registro individual
  const asistencia = body;
  if (!asistencia || !asistencia.alumnoId || !asistencia.grupoId) {
    return errorResponse(res, 400, "Datos de asistencia inválidos (alumnoId y grupoId requeridos)");
  }

  const existing = await collection.findOne({ id: asistencia.id });
  if (existing && !ownsDoc(existing, userId)) {
    return errorResponse(res, 403, "No autorizado");
  }
  if (existing) {
    await collection.updateOne(
      { id: asistencia.id },
      { $set: { ...asistencia, ...(userId ? { userId } : {}), syncedAt: new Date().toISOString() } }
    );
    return successResponse(res, { action: "updated", id: asistencia.id });
  }

  const doc = {
    ...asistencia,
    ...(userId ? { userId } : {}),
    syncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await collection.insertOne(doc);
  return successResponse(res, { action: "created", id: asistencia.id }, 201);
}

/**
 * PUT - Actualizar registro de asistencia existente
 */
async function handlePut(req, res, collection, userId) {
  const asistencia = req.body;

  if (!asistencia || !asistencia.id) {
    return errorResponse(res, 400, "ID de asistencia requerido");
  }

  if (userId) {
    const existing = await collection.findOne({ id: asistencia.id });
    if (existing && !ownsDoc(existing, userId)) {
      return errorResponse(res, 403, "No autorizado");
    }
  }

  const result = await collection.updateOne(
    { id: asistencia.id },
    { $set: { ...asistencia, ...(userId ? { userId } : {}), syncedAt: new Date().toISOString() } },
    { upsert: true }
  );

  return successResponse(res, {
    action: result.upsertedCount > 0 ? "created" : "updated",
    id: asistencia.id,
    modifiedCount: result.modifiedCount,
  });
}

/**
 * DELETE - Eliminar registro de asistencia
 */
async function handleDelete(req, res, collection, userId) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "ID de asistencia requerido");
  }

  if (userId) {
    const existing = await collection.findOne({ id: Number(id) });
    if (existing && !ownsDoc(existing, userId)) {
      return errorResponse(res, 404, "Registro de asistencia no encontrado");
    }
  }

  const result = await collection.deleteOne({ id: Number(id) });

  if (result.deletedCount === 0) {
    return errorResponse(res, 404, "Registro de asistencia no encontrado");
  }

  return successResponse(res, {
    action: "deleted",
    id,
    deletedCount: result.deletedCount,
  });
}
