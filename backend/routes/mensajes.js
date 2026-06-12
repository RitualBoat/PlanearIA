/**
 * API de Mensajería / Chat - Operaciones CRUD
 *
 * Conversaciones:
 * GET    /api/mensajes?tipo=conversaciones              - Listar conversaciones del usuario
 * POST   /api/mensajes?tipo=conversaciones              - Crear conversación
 * DELETE /api/mensajes?tipo=conversaciones&id=xxx        - Eliminar conversación
 *
 * Mensajes:
 * GET    /api/mensajes?conversacionId=xxx               - Listar mensajes de una conversación
 * POST   /api/mensajes                                  - Enviar mensaje
 * PUT    /api/mensajes                                  - Actualizar estado del mensaje
 */
const { connectToDatabase } = require("../lib/mongodb");
const {
  validateAuth,
  handleCors,
  applyCors,
  errorResponse,
  successResponse,
} = require("../lib/auth");

const CONVERSACIONES_COLLECTION = "conversaciones";
const MENSAJES_COLLECTION = "mensajes";

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
    const conversacionesCol = db.collection(CONVERSACIONES_COLLECTION);
    await conversacionesCol.createIndex({ id: 1 }, { unique: true });
    await conversacionesCol.createIndex({ participantes: 1 });
    await conversacionesCol.createIndex({ fechaModificacion: -1 });

    const mensajesCol = db.collection(MENSAJES_COLLECTION);
    await mensajesCol.createIndex({ id: 1 }, { unique: true });
    await mensajesCol.createIndex({ conversacionId: 1, fechaCreacion: 1 });
    await mensajesCol.createIndex({ remitenteId: 1 });
    await mensajesCol.createIndex({ fechaModificacion: -1 });

    const tipo = req.query?.tipo;

    if (tipo === "conversaciones") {
      switch (req.method) {
        case "GET":
          return await handleGetConversaciones(req, res, conversacionesCol);
        case "POST":
          return await handlePostConversacion(req, res, conversacionesCol);
        case "DELETE":
          return await handleDeleteConversacion(req, res, conversacionesCol, mensajesCol);
        default:
          return errorResponse(res, 405, `Method ${req.method} not allowed`);
      }
    }

    // Default: mensajes
    switch (req.method) {
      case "GET":
        return await handleGetMensajes(req, res, mensajesCol);
      case "POST":
        return await handlePostMensaje(req, res, mensajesCol, conversacionesCol);
      case "PUT":
        return await handlePutMensaje(req, res, mensajesCol);
      default:
        return errorResponse(res, 405, `Method ${req.method} not allowed`);
    }
  } catch (error) {
    console.error("❌ Error en API mensajes:", error);
    return errorResponse(res, 500, error.message);
  }
};

// ==========================================
// CONVERSACIONES HANDLERS
// ==========================================

async function handleGetConversaciones(req, res, collection) {
  const { id, usuarioId, desde, limit = 50 } = req.query;

  if (id) {
    const conv = await collection.findOne({ id: parseInt(id, 10) });
    if (!conv) return errorResponse(res, 404, "Conversación no encontrada");
    return successResponse(res, conv);
  }

  const query = {};
  if (usuarioId) query.participantes = usuarioId;
  if (desde) query.fechaModificacion = { $gt: desde };

  const conversaciones = await collection
    .find(query)
    .sort({ fechaUltimoMensaje: -1, fechaModificacion: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, { count: conversaciones.length, conversaciones });
}

async function handlePostConversacion(req, res, collection) {
  const conversacion = req.body;
  if (!conversacion || !conversacion.id) {
    return errorResponse(res, 400, "Datos de conversación inválidos");
  }

  const existing = await collection.findOne({ id: conversacion.id });
  if (existing) {
    await collection.updateOne(
      { id: conversacion.id },
      { $set: { ...conversacion, syncedAt: new Date().toISOString() } }
    );
    return successResponse(res, { action: "updated", conversacion });
  }

  await collection.insertOne({
    ...conversacion,
    syncedAt: new Date().toISOString(),
  });
  return successResponse(res, { action: "created", conversacion }, 201);
}

async function handleDeleteConversacion(req, res, convCollection, msgCollection) {
  const { id } = req.query;
  if (!id) return errorResponse(res, 400, "ID requerido");

  const convId = parseInt(id, 10);
  const result = await convCollection.deleteOne({ id: convId });
  // Also delete all messages in the conversation
  await msgCollection.deleteMany({ conversacionId: convId });

  if (result.deletedCount === 0) {
    return errorResponse(res, 404, "Conversación no encontrada");
  }
  return successResponse(res, { action: "deleted", id: convId });
}

// ==========================================
// MENSAJES HANDLERS
// ==========================================

async function handleGetMensajes(req, res, collection) {
  const { id, conversacionId, desde, limit = 100 } = req.query;

  if (id) {
    const mensaje = await collection.findOne({ id: parseInt(id, 10) });
    if (!mensaje) return errorResponse(res, 404, "Mensaje no encontrado");
    return successResponse(res, mensaje);
  }

  if (!conversacionId) {
    return errorResponse(res, 400, "conversacionId es requerido");
  }

  const query = { conversacionId: parseInt(conversacionId, 10) };
  if (desde) query.fechaCreacion = { $gt: desde };

  const mensajes = await collection
    .find(query)
    .sort({ fechaCreacion: 1 })
    .limit(parseInt(limit, 10))
    .toArray();

  return successResponse(res, { count: mensajes.length, mensajes });
}

async function handlePostMensaje(req, res, msgCollection, convCollection) {
  const mensaje = req.body;
  if (!mensaje || !mensaje.id || !mensaje.conversacionId) {
    return errorResponse(res, 400, "Datos de mensaje inválidos");
  }

  const existing = await msgCollection.findOne({ id: mensaje.id });
  if (existing) {
    await msgCollection.updateOne(
      { id: mensaje.id },
      { $set: { ...mensaje, syncedAt: new Date().toISOString() } }
    );
    return successResponse(res, { action: "updated", mensaje });
  }

  await msgCollection.insertOne({
    ...mensaje,
    syncedAt: new Date().toISOString(),
  });

  // Update conversation's last message info
  const previewText =
    mensaje.tipo === "archivo"
      ? `📎 ${mensaje.archivo?.nombre ?? "Archivo"}`
      : mensaje.tipo === "planeacion"
        ? `📋 ${mensaje.planeacion?.titulo ?? "Planeación"}`
        : mensaje.contenido;

  await convCollection.updateOne(
    { id: mensaje.conversacionId },
    {
      $set: {
        ultimoMensaje: previewText,
        ultimoMensajeTipo: mensaje.tipo,
        fechaUltimoMensaje: mensaje.fechaCreacion,
        fechaModificacion: mensaje.fechaCreacion,
      },
    }
  );

  return successResponse(res, { action: "created", mensaje }, 201);
}

async function handlePutMensaje(req, res, collection) {
  const mensaje = req.body;
  if (!mensaje || !mensaje.id) {
    return errorResponse(res, 400, "ID de mensaje requerido");
  }

  const result = await collection.updateOne(
    { id: mensaje.id },
    { $set: { ...mensaje, syncedAt: new Date().toISOString() } }
  );

  if (result.matchedCount === 0) {
    return errorResponse(res, 404, "Mensaje no encontrado");
  }

  return successResponse(res, { action: "updated", mensaje });
}
