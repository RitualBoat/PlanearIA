/**
 * Configuración del API de sincronización
 * Backend serverless en Vercel conectado a MongoDB Atlas
 *
 * ✅ 100% Gratuito (Vercel + MongoDB M0)
 * ✅ Offline-first con AsyncStorage
 * ✅ Sincronización automática
 */

// =====================================
// 🔧 CONFIGURACIÓN DE LA API
// =====================================

/**
 * Configuración del backend Vercel
 *
 * ⚠️ IMPORTANTE: Después de hacer deploy en Vercel,
 * actualiza API_BASE_URL con tu URL de producción
 */
export const API_CONFIG = {
  /**
   * URL base de la API
   *
   * Desarrollo local: http://localhost:3000
   * Producción: https://tu-proyecto.vercel.app
   */
  baseUrl: "https://backend-eight-chi-54.vercel.app", // ✅ URL de producción

  /**
   * Clave secreta para autenticación
   * Debe coincidir con API_SECRET en Vercel
   */
  apiSecret: "planearia-dev-secret-2025",

  /**
   * Timeout para requests (ms)
   */
  timeout: 15000,
};

// =====================================
// 📊 CONFIGURACIÓN DE SINCRONIZACIÓN
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
// 🗄️ CLAVES DE STORAGE
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
// 🌐 CONFIGURACIÓN DE CONECTIVIDAD
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
// 🔍 VALIDACIÓN
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
    console.log("✅ API de sincronización configurada");
    console.log(`   URL: ${API_CONFIG.baseUrl}`);
  } else {
    console.log("⚠️ API no configurada - usando solo modo local");
    console.log("   Actualiza API_CONFIG.baseUrl después del deploy en Vercel");
  }
};
