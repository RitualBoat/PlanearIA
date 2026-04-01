/**
 * API de Sincronización - Sync Batch
 *
 * POST /api/sync - Sincronización en lote
 *
 * Body:
 * {
 *   deviceId: string,
 *   lastSync: string (ISO date),
 *   operations: [
 *     { type: 'create' | 'update' | 'delete', data: Planeacion }
 *   ]
 * }
 *
 * Response:
 * {
 *   uploaded: number,
 *   downloaded: Planeacion[],
 *   errors: string[]
 * }
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
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    const { deviceId, lastSync, operations = [] } = req.body;

    const result = {
      uploaded: 0,
      downloaded: [],
      errors: [],
      serverTime: new Date().toISOString(),
    };

    // 1. Procesar operaciones del cliente (upload)
    for (const op of operations) {
      try {
        switch (op.type) {
          case "create":
          case "update":
            if (op.data && op.data.id) {
              await collection.updateOne(
                { id: op.data.id },
                {
                  $set: {
                    ...op.data,
                    syncedAt: new Date().toISOString(),
                    lastDeviceId: deviceId,
                  },
                },
                { upsert: true }
              );
              result.uploaded++;
            }
            break;

          case "delete":
            if (op.data && op.data.id) {
              await collection.deleteOne({ id: op.data.id });
              result.uploaded++;
            }
            break;
        }
      } catch (err) {
        result.errors.push(`${op.type} ${op.data?.id}: ${err.message}`);
      }
    }

    // 2. Obtener cambios del servidor (download)
    // Descarga planeaciones modificadas después de lastSync
    const query = {};
    if (lastSync) {
      query.syncedAt = { $gt: lastSync };
      // Excluir cambios del mismo dispositivo para evitar duplicados
      if (deviceId) {
        query.lastDeviceId = { $ne: deviceId };
      }
    }

    const serverChanges = await collection.find(query).sort({ syncedAt: -1 }).limit(200).toArray();

    result.downloaded = serverChanges;

    console.log(`🔄 Sync: ${result.uploaded} subidos, ${result.downloaded.length} descargados`);

    return successResponse(res, result);
  } catch (error) {
    console.error("❌ Error en sync:", error);
    return errorResponse(res, 500, error.message);
  }
};
