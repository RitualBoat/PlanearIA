const { applyCors, errorResponse } = require("../lib/auth");

const ROUTES = {
  "/alumnos": "../routes/alumnos.js",
  "/asistencias": "../routes/asistencias.js",
  "/auth": "../routes/auth.js",
  "/calificaciones": "../routes/calificaciones.js",
  "/contactos": "../routes/contactos.js",
  "/entregables": "../routes/entregables.js",
  "/grupos": "../routes/grupos.js",
  "/health": "../routes/health.js",
  "/mensajes": "../routes/mensajes.js",
  "/notificaciones": "../routes/notificaciones.js",
  "/planeaciones": "../routes/planeaciones.js",
  "/plantillas": "../routes/plantillas.js",
  "/posts": "../routes/posts.js",
  "/recursos": "../routes/recursos.js",
  "/sync": "../routes/sync.js",
  "/classroom/copiloto": "../routes/classroom/copiloto.js",
  "/planeaciones/copiloto": "../routes/planeaciones/copiloto.js",
  "/planeaciones/escanear-plantilla": "../routes/planeaciones/escanear-plantilla.js",
  "/planeaciones/generar": "../routes/planeaciones/generar.js",
  "/planeaciones/mejorar": "../routes/planeaciones/mejorar.js",
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
  const routeModule = ROUTES[apiPath];

  if (!routeModule) {
    applyCors(req, res);
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    return errorResponse(res, 404, `Ruta no encontrada: /api${apiPath}`);
  }

  const handler = require(routeModule);
  return handler(req, res);
};
