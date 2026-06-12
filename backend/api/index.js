const { applyCors, errorResponse } = require("../lib/auth");

const ROUTES = {
  "/alumnos": require("../routes/alumnos.js"),
  "/asistencias": require("../routes/asistencias.js"),
  "/auth": require("../routes/auth.js"),
  "/calificaciones": require("../routes/calificaciones.js"),
  "/contactos": require("../routes/contactos.js"),
  "/entregables": require("../routes/entregables.js"),
  "/grupos": require("../routes/grupos.js"),
  "/health": require("../routes/health.js"),
  "/mensajes": require("../routes/mensajes.js"),
  "/notificaciones": require("../routes/notificaciones.js"),
  "/planeaciones": require("../routes/planeaciones.js"),
  "/plantillas": require("../routes/plantillas.js"),
  "/posts": require("../routes/posts.js"),
  "/recursos": require("../routes/recursos.js"),
  "/sync": require("../routes/sync.js"),
  "/classroom/copiloto": require("../routes/classroom/copiloto.js"),
  "/planeaciones/copiloto": require("../routes/planeaciones/copiloto.js"),
  "/planeaciones/escanear-plantilla": require("../routes/planeaciones/escanear-plantilla.js"),
  "/planeaciones/generar": require("../routes/planeaciones/generar.js"),
  "/planeaciones/mejorar": require("../routes/planeaciones/mejorar.js"),
};

function normalizeApiPath(req) {
  const host = req?.headers?.host || "localhost";
  const url = new URL(req?.url || "/api/health", `http://${host}`);
  let pathname = url.pathname.replace(/\/+$/, "");

  if (pathname === "/api" || pathname === "/api/index" || pathname === "/api/index.js") {
    return "/health";
  }

  pathname = pathname.replace(/^\/api/, "");
  return pathname || "/health";
}

module.exports = async function apiRouter(req, res) {
  const apiPath = normalizeApiPath(req);
  const handler = ROUTES[apiPath];

  if (!handler) {
    applyCors(req, res);
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    return errorResponse(res, 404, `Ruta no encontrada: /api${apiPath}`);
  }

  return handler(req, res);
};
