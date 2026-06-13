/**
 * API Health Check
 * GET /api/health        - Estado del servicio
 * GET /api/health?db=1   - Tambien verifica que MongoDB Atlas responda
 */
const { applyCors, successResponse } = require("../lib/auth");

module.exports = async (req, res) => {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const payload = {
    status: "ok",
    service: "PlanearIA API",
    version: "1.0.0",
  };

  const url = new URL(req?.url || "/api/health", "http://localhost");
  if (url.searchParams.get("db") === "1") {
    try {
      // Lazy require: el health basico no debe depender del driver de Mongo
      const { connectToDatabase } = require("../lib/mongodb");
      const { db } = await connectToDatabase();
      await db.command({ ping: 1 });
      payload.db = "ok";
    } catch (error) {
      payload.db = "unreachable";
      payload.status = "degraded";
    }
  }

  return successResponse(res, payload);
};
