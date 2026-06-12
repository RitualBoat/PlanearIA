/**
 * Endpoints de autenticación — PlanearIA
 * POST /api/auth — { action: "registro" | "login" | "verificar" }
 *
 * Usa Node.js crypto (PBKDF2) para hashing de contraseñas
 * y HMAC-SHA256 para tokens JWT firmados.
 */
const { connectToDatabase } = require("../lib/mongodb");
const { handleCors, applyCors, errorResponse, successResponse } = require("../lib/auth");
const {
  createAuthSession,
  ensureAuthSessionIndexes,
  revokeAuthSession,
  rotateAuthSession,
} = require("../lib/authSessions");
const {
  AUTH_PERMISSIONS,
  AUTH_PERMISSIONS_VERSION,
  ASSIGNABLE_AUTH_ROLES,
  hasPermission,
  normalizeRole,
} = require("../lib/authContract");
const { hashPassword, validatePasswordPolicy, verifyPasswordDetailed } = require("../lib/passwords");
const { assertRateLimit } = require("../lib/rateLimit");
const {
  RESET_CODE_MAX_ATTEMPTS,
  RESET_CODE_TTL_MS,
  createResetCode,
  hashResetCode,
  isDevResetCodeEnabled,
  verifyResetCode,
} = require("../lib/resetCodes");
const { createAccessToken, getBearerToken, getUserFromToken, verifyToken } = require("../lib/tokens");

// =========== Validaciones ===========

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return validatePasswordPolicy(password).valid;
}

// =========== Roles válidos ===========

const ROLES_VALIDOS = ASSIGNABLE_AUTH_ROLES;

// =========== Handler ===========

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  applyCors(req, res);

  if (req.method !== "POST") {
    return errorResponse(res, 405, "Método no permitido");
  }

  const { action } = req.body || {};

  try {
    const { db } = await connectToDatabase();
    const usuarios = db.collection("usuarios");
    const sessions = db.collection("auth_sessions");

    // Crear índices (idempotente)
    await usuarios.createIndex({ id: 1 }, { unique: true });
    await usuarios.createIndex({ email: 1 }, { unique: true });
    await ensureAuthSessionIndexes(sessions);

    switch (action) {
      case "registro":
        return await handleRegistro(req, res, usuarios, sessions);
      case "login":
        return await handleLogin(req, res, usuarios, sessions);
      case "refresh":
        return await handleRefresh(req, res, usuarios, sessions);
      case "logout":
        return await handleLogout(req, res, sessions);
      case "verificar":
        return await handleVerificar(req, res);
      case "recuperar":
        return await handleRecuperar(req, res, usuarios);
      case "resetear":
        return await handleResetear(req, res, usuarios);
      case "actualizar_perfil":
        return await handleActualizarPerfil(req, res, usuarios);
      case "eliminar_cuenta":
        return await handleEliminarCuenta(req, res, usuarios);
      case "cambiar_rol":
        return await handleCambiarRol(req, res, usuarios);
      case "listar_usuarios":
        return await handleListarUsuarios(req, res, usuarios);
      case "actualizar_preferencias":
        return await handleActualizarPreferencias(req, res, usuarios);
      default:
        return errorResponse(res, 400, "Acción no válida.");
    }
  } catch (err) {
    if (err?.statusCode) {
      return errorResponse(res, err.statusCode, err.message);
    }
    console.error("[auth] Error:", err);
    return errorResponse(res, 500, "Error interno del servidor");
  }
};

function authRateLimit(req, action, identifier, max) {
  return assertRateLimit(req, `auth:${action}`, {
    identifier: identifier || req.body?.email || getBearerToken(req),
    max,
  });
}

function toSafeUser(usuario) {
  const { password, _id, resetCode, resetCodeHash, resetCodeExpiry, resetCodeAttempts, ...safeUser } =
    usuario;
  return {
    ...safeUser,
    canonicalRole: normalizeRole(safeUser.rol || "docente"),
    permissionsVersion: safeUser.permissionsVersion || AUTH_PERMISSIONS_VERSION,
  };
}

async function buildAuthResponse(req, usuario, sessions) {
  const { session, refreshToken, refreshTokenExpiresAt } = await createAuthSession(
    sessions,
    usuario,
    req
  );
  const access = createAccessToken(usuario, session.id);
  const safeUser = toSafeUser(usuario);

  return {
    token: access.token,
    accessToken: access.token,
    refreshToken,
    sessionId: session.id,
    tokens: {
      accessToken: access.token,
      refreshToken,
      tokenType: "Bearer",
      expiresAt: access.expiresAt.toISOString(),
      refreshExpiresAt: refreshTokenExpiresAt.toISOString(),
    },
    usuario: safeUser,
  };
}

// =========== Registro ===========

async function handleRegistro(req, res, usuarios, sessions) {
  const { nombre, apellidos, email, password } = req.body;
  authRateLimit(req, "registro", email, 10);

  if (!nombre || !email || !password) {
    return errorResponse(res, 400, "Nombre, email y contraseña son obligatorios.");
  }

  if (!validateEmail(email)) {
    return errorResponse(res, 400, "Formato de email no válido.");
  }

  const passwordPolicy = { valid: validatePassword(password) };
  if (!passwordPolicy.valid) {
    return errorResponse(res, 400, "La contraseña debe tener al menos 6 caracteres.");
  }

  // Verificar si el email ya existe
  const existing = await usuarios.findOne({ email: email.toLowerCase() });
  if (existing) {
    return errorResponse(res, 409, "Ya existe una cuenta con este email.");
  }

  const hashedPassword = await hashPassword(password);
  const now = new Date();
  const id = Date.now();

  const usuario = {
    id,
    nombre: nombre.trim(),
    apellidos: (apellidos || "").trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    fotoPerfil: null,
    biografia: "",
    pais: "México",
    rol: "docente",
    permissionsVersion: AUTH_PERMISSIONS_VERSION,
    fechaCreacion: now,
    fechaModificacion: now,
  };

  await usuarios.insertOne(usuario);

  return successResponse(res, await buildAuthResponse(req, usuario, sessions), 201);
}

// =========== Login ===========

async function handleLogin(req, res, usuarios, sessions) {
  const { email, password } = req.body;
  authRateLimit(req, "login", email, 10);

  if (!email || !password) {
    return errorResponse(res, 400, "Email y contraseña son obligatorios.");
  }

  const usuario = await usuarios.findOne({ email: email.toLowerCase().trim() });
  if (!usuario) {
    return errorResponse(res, 401, "Credenciales incorrectas.");
  }

  const passwordResult = await verifyPasswordDetailed(password, usuario.password);
  if (!passwordResult.valid) {
    return errorResponse(res, 401, "Credenciales incorrectas.");
  }

  const updateFields = {
    ultimoAcceso: new Date(),
    permissionsVersion: usuario.permissionsVersion || AUTH_PERMISSIONS_VERSION,
  };
  if (passwordResult.needsRehash) {
    updateFields.password = await hashPassword(password);
  }

  // Actualizar último acceso
  await usuarios.updateOne({ id: usuario.id }, { $set: updateFields });

  return successResponse(
    res,
    await buildAuthResponse(req, { ...usuario, ...updateFields }, sessions)
  );
}

// =========== Verificar token ===========

async function handleVerificar(req, res) {
  const token = getBearerToken(req);

  if (!token) {
    return errorResponse(res, 401, "Token no proporcionado.");
  }

  const payload = verifyToken(token);
  if (!payload) {
    return errorResponse(res, 401, "Token inválido o expirado.");
  }

  return successResponse(res, {
    valid: true,
    userId: payload.userId,
    email: payload.email,
    rol: payload.rol,
    role: payload.role || normalizeRole(payload.rol),
    permissionsVersion: payload.permissionsVersion || AUTH_PERMISSIONS_VERSION,
  });
}

// =========== Recuperar contraseña ===========

// =========== Refresh / Logout ===========

async function handleRefresh(req, res, usuarios, sessions) {
  const { refreshToken } = req.body;
  authRateLimit(req, "refresh", refreshToken, 20);

  if (!refreshToken) {
    return errorResponse(res, 400, "refreshToken es obligatorio.");
  }

  const rotated = await rotateAuthSession(sessions, refreshToken, req);
  if (!rotated) {
    return errorResponse(res, 401, "Refresh token invalido o expirado.");
  }

  const usuario = await usuarios.findOne({ id: rotated.session.userId });
  if (!usuario) {
    await revokeAuthSession(sessions, { sessionId: rotated.session.id });
    return errorResponse(res, 401, "Sesion invalida.");
  }

  const access = createAccessToken(usuario, rotated.session.id);
  const safeUser = toSafeUser(usuario);

  return successResponse(res, {
    token: access.token,
    accessToken: access.token,
    refreshToken: rotated.refreshToken,
    sessionId: rotated.session.id,
    tokens: {
      accessToken: access.token,
      refreshToken: rotated.refreshToken,
      tokenType: "Bearer",
      expiresAt: access.expiresAt.toISOString(),
      refreshExpiresAt: rotated.refreshTokenExpiresAt.toISOString(),
    },
    usuario: safeUser,
  });
}

async function handleLogout(req, res, sessions) {
  const { refreshToken, all } = req.body || {};
  const payload = getUserFromToken(req);
  const sessionId = payload?.sessionId;

  if (!refreshToken && !sessionId && !payload?.userId) {
    return errorResponse(res, 400, "No hay sesion para cerrar.");
  }

  await revokeAuthSession(sessions, {
    refreshToken,
    sessionId: all ? undefined : sessionId,
    userId: all ? payload?.userId : undefined,
  });

  return successResponse(res, { message: "Sesion cerrada correctamente." });
}

async function handleRecuperar(req, res, usuarios) {
  const { email } = req.body;
  authRateLimit(req, "recuperar", email, 5);

  if (!email) {
    return errorResponse(res, 400, "El email es obligatorio.");
  }

  if (!validateEmail(email)) {
    return errorResponse(res, 400, "Formato de email no válido.");
  }

  const usuario = await usuarios.findOne({ email: email.toLowerCase().trim() });
  if (!usuario) {
    // No revelamos si el email existe o no (seguridad)
    return successResponse(res, {
      message: "Si el email existe, recibirás un código de recuperación.",
    });
  }

  // Generar código de 6 dígitos
  const code = createResetCode();
  const expiry = new Date(Date.now() + RESET_CODE_TTL_MS);

  await usuarios.updateOne(
    { id: usuario.id },
    {
      $set: {
        resetCodeHash: hashResetCode(usuario.email, code),
        resetCodeExpiry: expiry,
        resetCodeAttempts: 0,
        resetCodeIssuedAt: new Date(),
      },
      $unset: { resetCode: "" },
    }
  );

  // TODO producción: enviar email con el código usando SendGrid/Resend
  // Por ahora, retornamos el código en la respuesta (solo dev)
  return successResponse(res, {
    message: "Si el email existe, recibirás un código de recuperación.",
    // DEV ONLY — quitar en producción:
    ...(isDevResetCodeEnabled() ? { _devCode: code } : {}),
  });
}

// =========== Resetear contraseña ===========

async function handleResetear(req, res, usuarios) {
  const { email, code, newPassword } = req.body;
  authRateLimit(req, "resetear", email, 5);

  if (!email || !code || !newPassword) {
    return errorResponse(res, 400, "Email, código y nueva contraseña son obligatorios.");
  }

  const passwordPolicy = validatePasswordPolicy(newPassword);
  if (!passwordPolicy.valid) {
    return errorResponse(res, 400, passwordPolicy.error);
  }

  const usuario = await usuarios.findOne({ email: email.toLowerCase().trim() });
  if (!usuario || (!usuario.resetCodeHash && !usuario.resetCode)) {
    return errorResponse(res, 400, "Código inválido o expirado.");
  }

  if ((usuario.resetCodeAttempts || 0) >= RESET_CODE_MAX_ATTEMPTS) {
    return errorResponse(res, 429, "Demasiados intentos. Solicita un nuevo codigo.");
  }

  if (!verifyResetCode(usuario, code)) {
    await usuarios.updateOne({ id: usuario.id }, { $inc: { resetCodeAttempts: 1 } });
    return errorResponse(res, 400, "Código inválido o expirado.");
  }

  if (new Date() > new Date(usuario.resetCodeExpiry)) {
    // Limpiar código expirado
    await usuarios.updateOne(
      { id: usuario.id },
      {
        $unset: {
          resetCode: "",
          resetCodeHash: "",
          resetCodeExpiry: "",
          resetCodeAttempts: "",
          resetCodeIssuedAt: "",
        },
      }
    );
    return errorResponse(res, 400, "El código ha expirado. Solicita uno nuevo.");
  }

  const hashedPassword = await hashPassword(newPassword);

  await usuarios.updateOne(
    { id: usuario.id },
    {
      $set: { password: hashedPassword, fechaModificacion: new Date() },
      $unset: {
        resetCode: "",
        resetCodeHash: "",
        resetCodeExpiry: "",
        resetCodeAttempts: "",
        resetCodeIssuedAt: "",
      },
    }
  );

  return successResponse(res, { message: "Contraseña actualizada correctamente." });
}

// =========== Actualizar perfil ===========

async function handleActualizarPerfil(req, res, usuarios) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return errorResponse(res, 401, "Token no proporcionado.");
  }

  const payload = verifyToken(token);
  if (!payload) {
    return errorResponse(res, 401, "Token inválido o expirado.");
  }

  const { nombre, apellidos, biografia, pais, expoPushToken } = req.body;

  const updateFields = { fechaModificacion: new Date() };
  if (nombre !== undefined) updateFields.nombre = nombre.trim();
  if (apellidos !== undefined) updateFields.apellidos = apellidos.trim();
  if (biografia !== undefined) updateFields.biografia = biografia.trim();
  if (pais !== undefined) updateFields.pais = pais.trim();
  if (expoPushToken !== undefined) updateFields.expoPushToken = expoPushToken;

  await usuarios.updateOne({ id: payload.userId }, { $set: updateFields });

  const updated = await usuarios.findOne({ id: payload.userId });
  if (!updated) {
    return errorResponse(res, 404, "Usuario no encontrado.");
  }

  return successResponse(res, { usuario: toSafeUser(updated) });
}

// =========== Eliminar cuenta ===========

async function handleEliminarCuenta(req, res, usuarios) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return errorResponse(res, 401, "Token no proporcionado.");
  }

  const payload = verifyToken(token);
  if (!payload) {
    return errorResponse(res, 401, "Token inválido o expirado.");
  }

  const { password } = req.body;

  if (!password) {
    return errorResponse(res, 400, "La contraseña es obligatoria para eliminar la cuenta.");
  }

  const usuario = await usuarios.findOne({ id: payload.userId });
  if (!usuario) {
    return errorResponse(res, 404, "Usuario no encontrado.");
  }

  const passwordResult = await verifyPasswordDetailed(password, usuario.password);
  if (!passwordResult.valid) {
    return errorResponse(res, 401, "Contraseña incorrecta.");
  }

  // Eliminar datos asociados del usuario en otras colecciones
  const { db } = await connectToDatabase();
  const userId = payload.userId;

  await Promise.allSettled([
    db.collection("planeaciones").deleteMany({ userId }),
    db.collection("grupos").deleteMany({ userId }),
    db.collection("alumnos").deleteMany({ userId }),
    db.collection("entregables").deleteMany({ userId }),
    db.collection("recursos").deleteMany({ userId }),
    db.collection("asistencias").deleteMany({ userId }),
    db.collection("calificaciones").deleteMany({ userId }),
  ]);

  // Eliminar el usuario
  await usuarios.deleteOne({ id: userId });

  return successResponse(res, { message: "Cuenta eliminada correctamente." });
}

// =========== Cambiar rol (solo admin) ===========

async function handleListarUsuarios(req, res, usuarios) {
  const payload = getUserFromToken(req);
  if (!payload) {
    return errorResponse(res, 401, "Token inválido o expirado.");
  }

  const solicitante = await usuarios.findOne({ id: payload.userId });
  if (!solicitante || !hasPermission(solicitante.rol, AUTH_PERMISSIONS.GESTIONAR_USUARIOS)) {
    return errorResponse(res, 403, "Solo los administradores pueden listar usuarios.");
  }

  const lista = await usuarios
    .find({}, { projection: { password: 0, _id: 0 } })
    .sort({ fechaCreacion: -1 })
    .toArray();

  return successResponse(res, { usuarios: lista });
}

async function handleActualizarPreferencias(req, res, usuarios) {
  const payload = getUserFromToken(req);
  if (!payload) {
    return errorResponse(res, 401, "Token inválido o expirado.");
  }

  const { preferencias } = req.body;
  if (!preferencias || typeof preferencias !== "object") {
    return errorResponse(res, 400, "El campo 'preferencias' es obligatorio.");
  }

  const CAMPOS_PERMITIDOS = [
    "recibirRecomendaciones",
    "compartirDatos",
    "contenidoAdulto",
    "tema",
    "tamanoFuente",
    "notificaciones",
  ];

  const prefsFiltradas = {};
  for (const key of CAMPOS_PERMITIDOS) {
    if (key in preferencias) {
      prefsFiltradas[key] = preferencias[key];
    }
  }

  await usuarios.updateOne(
    { id: payload.userId },
    { $set: { preferencias: prefsFiltradas, fechaModificacion: new Date() } }
  );

  return successResponse(res, { preferencias: prefsFiltradas });
}

async function handleCambiarRol(req, res, usuarios) {
  const payload = getUserFromToken(req);
  if (!payload) {
    return errorResponse(res, 401, "Token inválido o expirado.");
  }

  // Verificar que el solicitante es admin
  const solicitante = await usuarios.findOne({ id: payload.userId });
  if (!solicitante || !hasPermission(solicitante.rol, AUTH_PERMISSIONS.CAMBIAR_ROLES)) {
    return errorResponse(res, 403, "Solo los administradores pueden cambiar roles.");
  }

  const { targetUserId, nuevoRol } = req.body;

  if (!targetUserId || !nuevoRol) {
    return errorResponse(res, 400, "targetUserId y nuevoRol son obligatorios.");
  }

  if (!ROLES_VALIDOS.includes(nuevoRol)) {
    return errorResponse(res, 400, `Rol no válido. Roles válidos: ${ROLES_VALIDOS.join(", ")}`);
  }

  if (nuevoRol === "dev" && process.env.ALLOW_DEV_ROLE_ASSIGNMENT !== "true") {
    return errorResponse(res, 403, "El rol dev solo puede asignarse con entorno autorizado.");
  }

  const target = await usuarios.findOne({ id: targetUserId });
  if (!target) {
    return errorResponse(res, 404, "Usuario objetivo no encontrado.");
  }

  await usuarios.updateOne(
    { id: targetUserId },
    { $set: { rol: nuevoRol, fechaModificacion: new Date() } }
  );

  return successResponse(res, {
    message: `Rol actualizado a '${nuevoRol}'.`,
    userId: targetUserId,
    nuevoRol,
  });
}
