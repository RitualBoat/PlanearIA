/**
 * Script de creacion de indices de produccion para MongoDB Atlas - PlanearIA
 *
 * Configura los indices de base de datos necesarios para optimizar las consultas
 * en entornos de alta carga, especialmente para Posts, Contactos y Mensajes.
 */

const { connectToDatabase } = require("./mongodb");
const path = require("path");

// Cargar variables de entorno en caso de ejecucion directa fuera del entorno serverless
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

async function runIndexSetup() {
  console.log("Iniciando configuracion de indices en MongoDB Atlas...");

  try {
    const { db, client } = await connectToDatabase();

    // 1) Coleccion 'posts'
    console.log("Configurando indices para la coleccion 'posts'...");
    const postsCol = db.collection("posts");
    await Promise.all([
      postsCol.createIndex({ id: 1 }, { unique: true }),
      postsCol.createIndex({ autorId: 1, fechaCreacion: -1 }),
      postsCol.createIndex({ fechaCreacion: -1 })
    ]);
    console.log("Indices creados con exito para la coleccion 'posts'.");

    // 2) Coleccion 'contactos'
    console.log("Configurando indices para la coleccion 'contactos'...");
    const contactosCol = db.collection("contactos");
    await Promise.all([
      contactosCol.createIndex({ id: 1 }, { unique: true }),
      contactosCol.createIndex({ userId: 1, contactoId: 1 }),
      contactosCol.createIndex({ fechaModificacion: -1 })
    ]);
    console.log("Indices creados con exito para la coleccion 'contactos'.");

    // 3) Coleccion 'mensajes'
    console.log("Configurando indices para la coleccion 'mensajes'...");
    const mensajesCol = db.collection("mensajes");
    await Promise.all([
      mensajesCol.createIndex({ id: 1 }, { unique: true }),
      mensajesCol.createIndex({ conversacionId: 1, fechaCreacion: -1 }),
      mensajesCol.createIndex({ conversacionId: 1, fechaEnvio: -1 }), // Fallback por compatibilidad
      mensajesCol.createIndex({ remitenteId: 1 }),
      mensajesCol.createIndex({ fechaModificacion: -1 })
    ]);
    console.log("Indices creados con exito para la coleccion 'mensajes'.");

    // 4) Coleccion 'conversaciones'
    console.log("Configurando indices para la coleccion 'conversaciones'...");
    const conversacionesCol = db.collection("conversaciones");
    await Promise.all([
      conversacionesCol.createIndex({ id: 1 }, { unique: true }),
      conversacionesCol.createIndex({ participantes: 1 }),
      conversacionesCol.createIndex({ fechaModificacion: -1 })
    ]);
    console.log("Indices creados con exito para la coleccion 'conversaciones'.");

    console.log("Todos los indices han sido configurados correctamente en MongoDB Atlas.");
    
    // Cerrar conexion al ejecutar de forma manual
    if (require.main === module) {
      await client.close();
      console.log("Conexion con MongoDB cerrada.");
    }
  } catch (error) {
    console.error("Error al configurar los indices de base de datos:", error);
    process.exit(1);
  }
}

// Ejecutar si se invoca directamente desde Node.js
if (require.main === module) {
  runIndexSetup();
}

module.exports = { runIndexSetup };
