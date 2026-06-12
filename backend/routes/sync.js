/**
 * API de Sincronización - Compatibilidad V2
 *
 * Endpoint legacy batch mantenido por compatibilidad temporal.
 * El flujo recomendado para V2 es CRUD directo en /api/planeaciones.
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

const normalizeDocForV2 = (rawDoc, userIdFromToken) => {
  const now = new Date().toISOString();
  const { _id, ...doc } = rawDoc || {};
  const resolvedUserId = userIdFromToken || String(doc.userId || "");

  return {
    ...doc,
    version: 2,
    userId: resolvedUserId,
    fechaCreacion: doc.fechaCreacion || now,
    fechaModificacion: doc.fechaModificacion || now,
  };
};

module.exports = async (req, res) => {
  applyCors(req, res);

  if (handleCors(req, res)) return;

  const auth = validateAuth(req);
  if (!auth.valid) {
    return errorResponse(res, 401, auth.error);
  }

  if (req.method !== "POST") {
    return errorResponse(res, 405, "Only POST allowed");
  }

  try {
    const userPayload = getUserFromToken(req);
    const userIdFromToken = userPayload?.userId ? String(userPayload.userId) : "";

    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    await collection.createIndex({ id: 1, userId: 1 }, { unique: true });
    await collection.createIndex({ userId: 1, fechaModificacion: -1 });
    await collection.createIndex({ syncedAt: -1 });

    const { deviceId, lastSync, operations = [], mode = "legacy" } = req.body || {};

    const result = {
      uploaded: 0,
      downloaded: [],
      errors: [],
      serverTime: new Date().toISOString(),
      mode: "v2",
      deprecatedLegacyBatch:
        mode !== "v2"
          ? "El batch legacy de /api/sync está deprecado. Usa /api/planeaciones para V2."
          : undefined,
    };

    for (const op of operations) {
      try {
        if (!op || !op.type) continue;

        if ((op.type === "create" || op.type === "update") && op.data?.id) {
          const doc = normalizeDocForV2(op.data, userIdFromToken);
          if (!doc.userId) {
            result.errors.push(`${op.type} ${op.data.id}: userId requerido`);
            continue;
          }

          await collection.updateOne(
            { id: doc.id, userId: doc.userId },
            {
              $set: {
                ...doc,
                syncedAt: new Date().toISOString(),
                lastDeviceId: deviceId || "",
              },
            },
            { upsert: true }
          );
          result.uploaded += 1;
          continue;
        }

        if (op.type === "delete" && op.data?.id) {
          const deleteQuery = { id: op.data.id };
          const opUserId = userIdFromToken || String(op.data.userId || "");
          if (opUserId) {
            deleteQuery.userId = opUserId;
          }
          await collection.deleteOne(deleteQuery);
          result.uploaded += 1;
        }
      } catch (err) {
        result.errors.push(`${op?.type || "unknown"} ${op?.data?.id || "sin_id"}: ${err.message}`);
      }
    }

    const query = {};
    if (userIdFromToken) {
      query.userId = userIdFromToken;
    }
    if (lastSync) {
      query.syncedAt = { $gt: lastSync };
      if (deviceId) {
        query.lastDeviceId = { $ne: deviceId };
      }
    }

    const serverChanges = await collection.find(query).sort({ syncedAt: -1 }).limit(300).toArray();
    result.downloaded = serverChanges.map(({ _id, ...doc }) => doc);

    return successResponse(res, result);
  } catch (error) {
    console.error("Error en sync:", error);
    return errorResponse(res, 500, error.message);
  }
};
