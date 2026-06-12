/**
 * API de Contactos - Operaciones CRUD
 *
 * GET    /api/contactos              - Listar contactos del usuario
 * POST   /api/contactos              - Crear/agregar contacto
 * PUT    /api/contactos              - Actualizar contacto
 * DELETE /api/contactos?id=xxx       - Eliminar contacto
 *
 * GET    /api/contactos?tipo=solicitudes  - Listar solicitudes
 * POST   /api/contactos?tipo=solicitudes  - Enviar solicitud
 * PUT    /api/contactos?tipo=solicitudes  - Aceptar/rechazar solicitud
 */
const { connectToDatabase } = require("../lib/mongodb");
const {
  validateAuth,
  handleCors,
  applyCors,
  errorResponse,
  successResponse,
} = require("../lib/auth");

const CONTACTOS_COLLECTION = "contactos";
const SOLICITUDES_COLLECTION = "solicitudes";

module.exports = async (req, res) => {
  applyCors(req, res);
  if (handleCors(req, res)) return;

  const auth = validateAuth(req);
  if (!auth.valid) {
    return errorResponse(res, 401, auth.error);
  }

  try {
    const { db } = await connectToDatabase();

    // Crear índices (idempotente)
    const contactosCol = db.collection(CONTACTOS_COLLECTION);
    await contactosCol.createIndex({ id: 1 }, { unique: true });
    await contactosCol.createIndex({ usuarioId: 1 });
    await contactosCol.createIndex({ fechaModificacion: -1 });

    const solicitudesCol = db.collection(SOLICITUDES_COLLECTION);
    await solicitudesCol.createIndex({ id: 1 }, { unique: true });
    await solicitudesCol.createIndex({ deUsuarioId: 1 });
    await solicitudesCol.createIndex({ paraUsuarioId: 1 });
    await solicitudesCol.createIndex({ fechaModificacion: -1 });

    const tipo = req.query?.tipo;

    if (tipo === "solicitudes") {
      const collection = solicitudesCol;
      switch (req.method) {
        case "GET":
          return await handleGetSolicitudes(req, res, collection);
        case "POST":
          return await handlePostSolicitud(req, res, collection);
        case "PUT":
          return await handlePutSolicitud(req, res, collection);
        default:
          return errorResponse(res, 405, `Method ${req.method} not allowed`);
      }
    }

    const collection = contactosCol;
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
    console.error("❌ Error en API contactos:", error);
    return errorResponse(res, 500, error.message);
  }
};

// ==========================================
// CONTACTOS HANDLERS
// ==========================================

async function handleGet(req, res, collection) {
  const { id, usuarioId, desde, limit = 100 } = req.query;

  if (id) {
    const contacto = await collection.findOne({ id: id });
    if (!contacto) return errorResponse(res, 404, "Contacto no encontrado");
    return successResponse(res, contacto);
  }

  const query = {};
  if (usuarioId) query.usuarioId = usuarioId;
  if (desde) query.fechaModificacion = { $gt: desde };

  const contactos = await collection
    .find(query)
    .sort({ fechaModificacion: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, { count: contactos.length, contactos });
}

async function handlePost(req, res, collection) {
  const contacto = req.body;
  if (!contacto || !contacto.id) {
    return errorResponse(res, 400, "Datos de contacto inválidos");
  }

  const existing = await collection.findOne({ id: contacto.id });
  if (existing) {
    await collection.updateOne(
      { id: contacto.id },
      { $set: { ...contacto, syncedAt: new Date().toISOString() } }
    );
    return successResponse(res, { action: "updated", id: contacto.id });
  }

  await collection.insertOne({
    ...contacto,
    syncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  return successResponse(res, { action: "created", id: contacto.id }, 201);
}

async function handlePut(req, res, collection) {
  const contacto = req.body;
  if (!contacto || !contacto.id) {
    return errorResponse(res, 400, "ID de contacto requerido");
  }

  const result = await collection.updateOne(
    { id: contacto.id },
    { $set: { ...contacto, syncedAt: new Date().toISOString() } },
    { upsert: true }
  );

  return successResponse(res, {
    action: result.upsertedCount > 0 ? "created" : "updated",
    id: contacto.id,
  });
}

async function handleDelete(req, res, collection) {
  const { id } = req.query;
  if (!id) return errorResponse(res, 400, "ID requerido");

  const result = await collection.deleteOne({ id: id });
  if (result.deletedCount === 0) {
    return errorResponse(res, 404, "Contacto no encontrado");
  }
  return successResponse(res, { action: "deleted", id });
}

// ==========================================
// SOLICITUDES HANDLERS
// ==========================================

async function handleGetSolicitudes(req, res, collection) {
  const { deUsuarioId, paraUsuarioId, estado, desde, limit = 100 } = req.query;

  const query = {};
  if (deUsuarioId) query.deUsuarioId = deUsuarioId;
  if (paraUsuarioId) query.paraUsuarioId = paraUsuarioId;
  if (estado) query.estado = estado;
  if (desde) query.fechaModificacion = { $gt: desde };

  const solicitudes = await collection
    .find(query)
    .sort({ fechaCreacion: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, { count: solicitudes.length, solicitudes });
}

async function handlePostSolicitud(req, res, collection) {
  const solicitud = req.body;
  if (!solicitud || !solicitud.id) {
    return errorResponse(res, 400, "Datos de solicitud inválidos");
  }

  const existing = await collection.findOne({ id: solicitud.id });
  if (existing) {
    await collection.updateOne(
      { id: solicitud.id },
      { $set: { ...solicitud, syncedAt: new Date().toISOString() } }
    );
    return successResponse(res, { action: "updated", id: solicitud.id });
  }

  await collection.insertOne({
    ...solicitud,
    syncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  return successResponse(res, { action: "created", id: solicitud.id }, 201);
}

async function handlePutSolicitud(req, res, collection) {
  const solicitud = req.body;
  if (!solicitud || !solicitud.id) {
    return errorResponse(res, 400, "ID de solicitud requerido");
  }

  const result = await collection.updateOne(
    { id: solicitud.id },
    { $set: { ...solicitud, syncedAt: new Date().toISOString() } },
    { upsert: true }
  );

  return successResponse(res, {
    action: result.upsertedCount > 0 ? "created" : "updated",
    id: solicitud.id,
  });
}
