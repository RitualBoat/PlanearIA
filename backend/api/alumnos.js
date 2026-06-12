/**
 * API de Alumnos - Operaciones CRUD
 *
 * GET    /api/alumnos             - Listar alumnos
 * GET    /api/alumnos?id=123      - Obtener alumno por id
 * POST   /api/alumnos             - Crear alumno
 * PUT    /api/alumnos             - Actualizar alumno
 * DELETE /api/alumnos?id=123      - Eliminar alumno
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

const COLLECTION = "alumnos";

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

    // Indices requeridos para alumnos (idempotente)
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ grupoId: 1 });
    await collection.createIndex({ userId: 1, fechaModificacion: -1 });

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
    console.error("❌ Error en API alumnos:", error);
    return errorResponse(res, 500, error.message);
  }
};

const normalizeId = (value) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return value;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
};

async function handleGet(req, res, collection, userId) {
  const { id, grupoId, desde, limit = 200 } = req.query;

  if (id) {
    const alumno = await collection.findOne({ id: normalizeId(id) });
    if (!alumno || (userId && String(alumno.userId) !== userId)) {
      return errorResponse(res, 404, "Alumno no encontrado");
    }
    return successResponse(res, alumno);
  }

  const query = {};

  if (userId) query.userId = userId;

  if (grupoId) {
    query.grupoId = normalizeId(grupoId);
  }

  if (desde) {
    query.fechaModificacion = { $gt: desde };
  }

  const alumnos = await collection
    .find(query)
    .sort({ fechaModificacion: -1, createdAt: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, {
    count: alumnos.length,
    alumnos,
  });
}

async function handlePost(req, res, collection, userId) {
  const alumno = req.body;

  if (!alumno || alumno.id === undefined || alumno.id === null) {
    return errorResponse(res, 400, "Datos de alumno inválidos");
  }

  const alumnoId = normalizeId(alumno.id);
  const nowIso = new Date().toISOString();

  const existing = await collection.findOne({ id: alumnoId });
  if (existing && !ownsDoc(existing, userId)) {
    return errorResponse(res, 403, "No autorizado");
  }
  if (existing) {
    await collection.updateOne(
      { id: alumnoId },
      {
        $set: {
          ...alumno,
          id: alumnoId,
          ...(userId ? { userId } : {}),
          fechaModificacion: alumno.fechaModificacion || nowIso,
          syncedAt: nowIso,
        },
      }
    );

    return successResponse(res, { action: "updated", id: alumnoId });
  }

  await collection.insertOne({
    ...alumno,
    id: alumnoId,
    ...(userId ? { userId } : {}),
    fechaModificacion: alumno.fechaModificacion || nowIso,
    createdAt: nowIso,
    syncedAt: nowIso,
  });

  return successResponse(res, { action: "created", id: alumnoId }, 201);
}

async function handlePut(req, res, collection, userId) {
  const alumno = req.body;

  if (!alumno || alumno.id === undefined || alumno.id === null) {
    return errorResponse(res, 400, "ID de alumno requerido");
  }

  const alumnoId = normalizeId(alumno.id);
  const nowIso = new Date().toISOString();

  if (userId) {
    const existing = await collection.findOne({ id: alumnoId });
    if (existing && !ownsDoc(existing, userId)) {
      return errorResponse(res, 403, "No autorizado");
    }
  }

  const result = await collection.updateOne(
    { id: alumnoId },
    {
      $set: {
        ...alumno,
        id: alumnoId,
        ...(userId ? { userId } : {}),
        fechaModificacion: alumno.fechaModificacion || nowIso,
        syncedAt: nowIso,
      },
      $setOnInsert: {
        createdAt: nowIso,
      },
    },
    { upsert: true }
  );

  return successResponse(res, {
    action: result.upsertedCount > 0 ? "created" : "updated",
    id: alumnoId,
    modifiedCount: result.modifiedCount,
  });
}

async function handleDelete(req, res, collection, userId) {
  const { id } = req.query;

  if (id === undefined || id === null || id === "") {
    return errorResponse(res, 400, "ID de alumno requerido");
  }

  const alumnoId = normalizeId(id);

  if (userId) {
    const existing = await collection.findOne({ id: alumnoId });
    if (existing && !ownsDoc(existing, userId)) {
      return errorResponse(res, 404, "Alumno no encontrado");
    }
  }

  const result = await collection.deleteOne({ id: alumnoId });

  if (result.deletedCount === 0) {
    return errorResponse(res, 404, "Alumno no encontrado");
  }

  return successResponse(res, {
    action: "deleted",
    id: alumnoId,
    deletedCount: result.deletedCount,
  });
}
