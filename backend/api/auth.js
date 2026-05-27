/**
 * Endpoints de autenticación — PlanearIA
 * POST /api/auth — { action: "registro" | "login" | "verificar" }
 *
 * Usa Node.js crypto (PBKDF2) para hashing de contraseñas
 * y HMAC-SHA256 para tokens JWT firmados.
 */
const crypto = require("crypto");
const { connectToDatabase } = require("../lib/mongodb");
const { handleCors, applyCors, errorResponse, successResponse } = require("../lib/auth");

// =========== Password hashing con PBKDF2 ===========

const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const ITERATIONS = 100000;
const DIGEST = "sha512";

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

function verifyPassword(password, stored) {
  return new Promise((resolve, reject) => {
    const [salt, key] = stored.split(":");
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString("hex") === key);
    });
  });
}

// =========== JWT con HMAC-SHA256 ===========

function getJWTSecret() {
  const secret = process.env.JWT_SECRET || process.env.API_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return secret;
}

function base64url(str) {
  return Buffer.from(str).toString("base64url");
}

function createToken(payload, expiresInHours = 168) {
  const secret = getJWTSecret();
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(
    JSON.stringify({ ...payload, iat: now, exp: now + expiresInHours * 3600 })
  );
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const secret = getJWTSecret();
    const [header, body, signature] = token.split(".");
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// =========== Validaciones ===========

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 6;
}

// =========== Roles válidos ===========

const ROLES_VALIDOS = ["admin", "supervisor", "docente", "alumno", "usuario"];

const PERMISOS_POR_ROL = {
  admin: [
    "gestionar_usuarios",
    "cambiar_roles",
    "ver_todos_grupos",
    "gestionar_planeaciones",
    "gestionar_grupos",
    "gestionar_alumnos",
    "gestionar_calificaciones",
    "gestionar_entregables",
    "gestionar_recursos",
    "gestionar_asistencia",
    "ver_propios_datos",
  ],
  supervisor: [
    "ver_todos_grupos",
    "gestionar_planeaciones",
    "gestionar_grupos",
    "gestionar_alumnos",
    "gestionar_calificaciones",
    "gestionar_entregables",
    "gestionar_recursos",
    "gestionar_asistencia",
    "ver_propios_datos",
  ],
  docente: [
    "gestionar_planeaciones",
    "gestionar_grupos",
    "gestionar_alumnos",
    "gestionar_calificaciones",
    "gestionar_entregables",
    "gestionar_recursos",
    "gestionar_asistencia",
    "ver_propios_datos",
  ],
  alumno: ["ver_propios_datos"],
  usuario: ["ver_propios_datos"],
};

function getUserFromToken(req) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

function hasPermission(rol, permiso) {
  const permisos = PERMISOS_POR_ROL[rol] || [];
  return permisos.includes(permiso);
}

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

    // Crear índices (idempotente)
    await usuarios.createIndex({ id: 1 }, { unique: true });
    await usuarios.createIndex({ email: 1 }, { unique: true });

    switch (action) {
      case "registro":
        return await handleRegistro(req, res, usuarios);
      case "login":
        return await handleLogin(req, res, usuarios);
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
    console.error("[auth] Error:", err);
    return errorResponse(res, 500, "Error interno del servidor");
  }
};

// =========== Registro ===========

async function handleRegistro(req, res, usuarios) {
  const { nombre, apellidos, email, password } = req.body;

  if (!nombre || !email || !password) {
    return errorResponse(res, 400, "Nombre, email y contraseña son obligatorios.");
  }

  if (!validateEmail(email)) {
    return errorResponse(res, 400, "Formato de email no válido.");
  }

  if (!validatePassword(password)) {
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
    fechaCreacion: now,
    fechaModificacion: now,
  };

  await usuarios.insertOne(usuario);

  const token = createToken({ userId: id, email: usuario.email, rol: "docente" });

  const { password: _, _id, ...safeUser } = usuario;

  return successResponse(res, { token, usuario: safeUser }, 201);
}

// =========== Login ===========

async function handleLogin(req, res, usuarios) {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, "Email y contraseña son obligatorios.");
  }

  const usuario = await usuarios.findOne({ email: email.toLowerCase().trim() });
  if (!usuario) {
    return errorResponse(res, 401, "Credenciales incorrectas.");
  }

  const valid = await verifyPassword(password, usuario.password);
  if (!valid) {
    return errorResponse(res, 401, "Credenciales incorrectas.");
  }

  const token = createToken({
    userId: usuario.id,
    email: usuario.email,
    rol: usuario.rol || "docente",
  });

  // Actualizar último acceso
  await usuarios.updateOne({ id: usuario.id }, { $set: { ultimoAcceso: new Date() } });

  const { password: _, _id, ...safeUser } = usuario;

  return successResponse(res, { token, usuario: safeUser });
}

// =========== Verificar token ===========

async function handleVerificar(req, res) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return errorResponse(res, 401, "Token no proporcionado.");
  }

  const payload = verifyToken(token);
  if (!payload) {
    return errorResponse(res, 401, "Token inválido o expirado.");
  }

  return successResponse(res, { valid: true, userId: payload.userId, email: payload.email });
}

// =========== Recuperar contraseña ===========

async function handleRecuperar(req, res, usuarios) {
  const { email } = req.body;

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
  const code = crypto.randomInt(100000, 999999).toString();
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

  await usuarios.updateOne(
    { id: usuario.id },
    { $set: { resetCode: code, resetCodeExpiry: expiry } }
  );

  // TODO producción: enviar email con el código usando SendGrid/Resend
  // Por ahora, retornamos el código en la respuesta (solo dev)
  return successResponse(res, {
    message: "Si el email existe, recibirás un código de recuperación.",
    // DEV ONLY — quitar en producción:
    _devCode: code,
  });
}

// =========== Resetear contraseña ===========

async function handleResetear(req, res, usuarios) {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return errorResponse(res, 400, "Email, código y nueva contraseña son obligatorios.");
  }

  if (!validatePassword(newPassword)) {
    return errorResponse(res, 400, "La contraseña debe tener al menos 6 caracteres.");
  }

  const usuario = await usuarios.findOne({ email: email.toLowerCase().trim() });
  if (!usuario || !usuario.resetCode) {
    return errorResponse(res, 400, "Código inválido o expirado.");
  }

  if (usuario.resetCode !== code) {
    return errorResponse(res, 400, "Código inválido o expirado.");
  }

  if (new Date() > new Date(usuario.resetCodeExpiry)) {
    // Limpiar código expirado
    await usuarios.updateOne(
      { id: usuario.id },
      { $unset: { resetCode: "", resetCodeExpiry: "" } }
    );
    return errorResponse(res, 400, "El código ha expirado. Solicita uno nuevo.");
  }

  const hashedPassword = await hashPassword(newPassword);

  await usuarios.updateOne(
    { id: usuario.id },
    {
      $set: { password: hashedPassword, fechaModificacion: new Date() },
      $unset: { resetCode: "", resetCodeExpiry: "" },
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

  const { password: _, _id, resetCode, resetCodeExpiry, ...safeUser } = updated;

  return successResponse(res, { usuario: safeUser });
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

  const valid = await verifyPassword(password, usuario.password);
  if (!valid) {
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
  if (!solicitante || solicitante.rol !== "admin") {
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
  if (!solicitante || solicitante.rol !== "admin") {
    return errorResponse(res, 403, "Solo los administradores pueden cambiar roles.");
  }

  const { targetUserId, nuevoRol } = req.body;

  if (!targetUserId || !nuevoRol) {
    return errorResponse(res, 400, "targetUserId y nuevoRol son obligatorios.");
  }

  if (!ROLES_VALIDOS.includes(nuevoRol)) {
    return errorResponse(res, 400, `Rol no válido. Roles válidos: ${ROLES_VALIDOS.join(", ")}`);
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
