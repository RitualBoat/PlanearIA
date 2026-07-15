export {
  sessionStorage,
  createSessionStorage,
  SESSION_KEYS,
  LEGACY_SESSION_KEYS,
} from "./sessionStorage";
export type { SessionStoragePort } from "./sessionStorage";

export {
  login,
  registro,
  logout,
  loginComoInvitado,
  loginComoDesarrollador,
  restoreSession,
  refreshAccessToken,
  refreshSession,
  verificarToken,
  verificarTokenDetallado,
  actualizarPerfil,
  actualizarPreferencias,
  eliminarCuenta,
  getAccessToken,
} from "./authService";
export type {
  AuthResult,
  LoginResult,
  RegistroData,
  RefreshResult,
  TokenVerification,
} from "./authService";

export { migrateLegacySessionKeys } from "./legacyMigration";
