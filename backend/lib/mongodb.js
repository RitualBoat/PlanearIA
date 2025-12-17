/**
 * Conexión a MongoDB Atlas
 * Reutiliza la conexión entre invocaciones serverless
 */
const { MongoClient } = require("mongodb");

// Variable global para cache de conexión
let cachedClient = null;
let cachedDb = null;

const DB_NAME = "planeariaDB";

/**
 * Conecta a MongoDB Atlas
 * Reutiliza conexiones existentes para mejor rendimiento
 */
async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "⚠️ MONGODB_URI no está definida en las variables de entorno"
    );
  }

  // Si ya hay conexión cacheada, usarla
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Crear nueva conexión
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  await client.connect();
  const db = client.db(DB_NAME);

  // Cachear para futuras invocaciones
  cachedClient = client;
  cachedDb = db;

  console.log("✅ Conectado a MongoDB Atlas");

  return { client, db };
}

module.exports = { connectToDatabase };
