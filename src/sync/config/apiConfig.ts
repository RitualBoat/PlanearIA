import logger from "../../utils/logger";
/**
 * Configuración del API de sincronización
 * Backend serverless en Vercel conectado a MongoDB Atlas
 *
 * Gratuito (Vercel + MongoDB M0)
 * Offline-first con AsyncStorage
 * Sincronizacion automatica
 */

// =====================================
// CONFIGURACION DE LA API
// =====================================

const API_SECRET_FROM_ENV = process.env.EXPO_PUBLIC_API_SECRET?.trim() ?? "";
const API_BASE_URL_FROM_ENV = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
const FALLBACK_API_BASE_URL = "https://backend-eight-chi-54.vercel.app";

/**
 * Configuración del backend Vercel
 *
 * IMPORTANTE: Despues de hacer deploy en Vercel,
 * actualiza API_BASE_URL con tu URL de producción
 */
export const API_CONFIG = {
  /**
   * URL base de la API
   *
   * Desarrollo local: http://localhost:3000
   * Producción: https://tu-proyecto.vercel.app
   */
  baseUrl: API_BASE_URL_FROM_ENV || FALLBACK_API_BASE_URL,

  /**
   * Clave secreta para autenticación
   * Debe coincidir con API_SECRET en Vercel.
   * Se configura en variable de entorno: EXPO_PUBLIC_API_SECRET
   */
  apiSecret: API_SECRET_FROM_ENV,

  /**
   * Timeout para requests (ms)
   */
  timeout: 15000,
};

// =====================================
// CONFIGURACION DE SINCRONIZACION
// =====================================

export const SYNC_CONFIG = {
  /**
   * Intervalo de sincronización automática (ms)
   * 60 segundos = 1 minuto
   */
  autoSyncInterval: 60000,

  /**
   * Tiempo máximo de espera para requests (ms)
   */
  requestTimeout: 15000,

  /**
   * Número máximo de reintentos
   */
  maxRetries: 3,

  /**
   * Intervalo entre reintentos (ms)
   */
  retryDelay: 2000,

  /**
   * Habilitar logs de debug
   */
  debugMode: __DEV__,

  /**
   * Tamaño máximo del batch para sync
   */
  batchSize: 50,
};

// =====================================
// CLAVES DE STORAGE
// =====================================

export const STORAGE_KEYS = {
  /** Planeaciones guardadas localmente */
  PLANEACIONES: "@planearia:planeaciones",

  /** Última sincronización exitosa */
  LAST_SYNC: "@planearia:last_sync",

  /** Operaciones pendientes de sincronizar */
  PENDING_OPERATIONS: "@planearia:pending_ops",

  /** ID del dispositivo */
  DEVICE_ID: "@planearia:device_id",

  /** Estado de la primera carga */
  INITIAL_SYNC_COMPLETE: "@planearia:initial_sync",
};

// =====================================
// CONFIGURACION DE CONECTIVIDAD
// =====================================

export const CONNECTIVITY_CONFIG = {
  /**
   * Intervalo para verificar conectividad (ms)
   */
  checkInterval: 10000,

  /**
   * URLs para verificar conectividad
   */
  pingUrls: ["https://www.google.com"],

  /**
   * Timeout para ping (ms)
   */
  pingTimeout: 5000,
};

// =====================================
// VALIDACION
// =====================================

/**
 * Verifica si la API está configurada
 */
export const isAPIConfigured = (): boolean => {
  return (
    API_CONFIG.baseUrl !== "" &&
    !API_CONFIG.baseUrl.includes("tu-proyecto") &&
    API_CONFIG.apiSecret !== ""
  );
};

/**
 * Log del estado de configuración
 */
export const logConfigStatus = (): void => {
  if (isAPIConfigured()) {
    logger.log("[config] Sync API configured");
    logger.log(`   URL: ${API_CONFIG.baseUrl}`);
  } else {
    logger.log("[config] API not configured, local-only mode");
    logger.log("   Actualiza API_CONFIG.baseUrl después del deploy en Vercel");
  }
};
