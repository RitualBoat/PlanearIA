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
    await postsCol.createIndex({ id: 1 }, { unique: true });
    await postsCol.createIndex({ autorId: 1, fechaCreacion: -1 });
    await postsCol.createIndex({ fechaCreacion: -1 });
    console.log("Indices creados con exito para la coleccion 'posts'.");

    // 2) Coleccion 'contactos'
    console.log("Configurando indices para la coleccion 'contactos'...");
    const contactosCol = db.collection("contactos");
    await contactosCol.createIndex({ id: 1 }, { unique: true });
    await contactosCol.createIndex({ userId: 1, contactoId: 1 });
    await contactosCol.createIndex({ fechaModificacion: -1 });
    console.log("Indices creados con exito para la coleccion 'contactos'.");

    // 3) Coleccion 'mensajes'
    console.log("Configurando indices para la coleccion 'mensajes'...");
    const mensajesCol = db.collection("mensajes");
    await mensajesCol.createIndex({ id: 1 }, { unique: true });
    await mensajesCol.createIndex({ conversacionId: 1, fechaCreacion: -1 });
    await mensajesCol.createIndex({ conversacionId: 1, fechaEnvio: -1 }); // Fallback por compatibilidad
    await mensajesCol.createIndex({ remitenteId: 1 });
    await mensajesCol.createIndex({ fechaModificacion: -1 });
    console.log("Indices creados con exito para la coleccion 'mensajes'.");

    // 4) Coleccion 'conversaciones'
    console.log("Configurando indices para la coleccion 'conversaciones'...");
    const conversacionesCol = db.collection("conversaciones");
    await conversacionesCol.createIndex({ id: 1 }, { unique: true });
    await conversacionesCol.createIndex({ participantes: 1 });
    await conversacionesCol.createIndex({ fechaModificacion: -1 });
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
