/**
 * API Health Check
 * GET /api/health
 */
const { applyCors, successResponse } = require("../lib/auth");

module.exports = async (req, res) => {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return successResponse(res, {
    status: "ok",
    service: "PlanearIA API",
    version: "1.0.0",
  });
};
