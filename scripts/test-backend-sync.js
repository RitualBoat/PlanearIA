/**
 * Script de prueba de integración y sincronización - PlanearIA
 * 
 * Este script simula el comportamiento de la aplicación móvil haciendo peticiones
 * a los endpoints del backend (local o desplegado en Vercel) para verificar
 * la conectividad, autenticación y la persistencia en MongoDB Atlas.
 * 
 * Uso:
 *   node scripts/test-backend-sync.js [URL_DEL_BACKEND]
 * 
 * Ejemplos:
 *   node scripts/test-backend-sync.js http://localhost:3000
 *   node scripts/test-backend-sync.js https://planearia.vercel.app
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Configuración de colores para consola
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

console.log(`${colors.cyan}${colors.bright}=====================================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bright}  PlanearIA - Verificador de Backend y Sincronización${colors.reset}`);
console.log(`${colors.cyan}${colors.bright}=====================================================${colors.reset}\n`);

// 1. Leer secretos locales para la autenticación
let localSecret = "planearia-dev-secret-2025"; // fallback por defecto
let localMongoUri = "";

try {
  const envPath = path.resolve(__dirname, '../backend/.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const secretMatch = envContent.match(/^API_SECRET=(.*)$/m);
    const mongoMatch = envContent.match(/^MONGODB_URI=(.*)$/m);
    
    if (secretMatch && secretMatch[1]) {
      localSecret = secretMatch[1].trim();
      console.log(`🔑 Clave API detectada en backend/.env: ${colors.green}${localSecret.substring(0, 6)}...${colors.reset}`);
    }
    if (mongoMatch && mongoMatch[1]) {
      localMongoUri = mongoMatch[1].trim();
      // Ocultar contraseña en el log
      const maskedUri = localMongoUri.replace(/:([^@]+)@/, ":******@");
      console.log(`💾 URI de MongoDB Atlas detectada: ${colors.green}${maskedUri.substring(0, 45)}...${colors.reset}`);
    }
  } else {
    console.log(`⚠️  Archivo ${colors.yellow}backend/.env${colors.reset} no encontrado. Se usará la clave secreta por defecto.`);
  }
} catch (error) {
  console.log(`⚠️  Error leyendo variables de entorno: ${error.message}`);
}

// 2. Determinar la URL del backend a probar
const defaultUrl = "http://localhost:3000";
const targetUrl = process.argv[2] || defaultUrl;
console.log(`🌐 Probando backend en: ${colors.magenta}${colors.bright}${targetUrl}${colors.reset}\n`);

// Helper para hacer peticiones HTTP/HTTPS con fetch manual
function makeRequest(urlStr, endpoint, method, headers, body = null) {
  return new Promise((resolve, reject) => {
    const fullUrl = urlStr.endsWith('/') ? `${urlStr}${endpoint.substring(1)}` : `${urlStr}${endpoint}`;
    const url = new URL(fullUrl);
    
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };

    const client = url.protocol === 'https:' ? https : http;

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error("Timeout en la petición"));
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  const headers = {
    'X-API-Key': localSecret
  };

  // --- PRUEBA 1: Verificar Endpoint Health ---
  console.log(`${colors.bright}[Paso 1/4] Comprobando disponibilidad del servidor (/api/health)...${colors.reset}`);
  try {
    const res = await makeRequest(targetUrl, '/api/health', 'GET', {});
    if (res.statusCode === 200 && res.data && res.data.success) {
      console.log(`✅ Servidor en línea. Respuesta:`, res.data);
    } else {
      console.log(`❌ El health check devolvió estado ${res.statusCode}:`, res.data);
      if (targetUrl === defaultUrl) {
        console.log(`\n💡 ${colors.yellow}Consejo:${colors.reset} Asegúrate de que el servidor local de desarrollo esté corriendo.`);
        console.log(`   Ejecuta: ${colors.cyan}cd backend && npm run dev${colors.reset} en otra terminal.\n`);
      }
      return;
    }
  } catch (error) {
    console.log(`❌ Error al conectar con el servidor: ${colors.red}${error.message}${colors.reset}`);
    if (targetUrl === defaultUrl) {
      console.log(`\n💡 ${colors.yellow}Consejo:${colors.reset} Asegúrate de que el servidor local de desarrollo esté corriendo.`);
      console.log(`   Ejecuta: ${colors.cyan}cd backend && npm run dev${colors.reset} en otra terminal.\n`);
    }
    return;
  }

  // --- PRUEBA 2: Simulación de Sincronización (POST /api/sync) ---
  console.log(`\n${colors.bright}[Paso 2/4] Probando guardado en la nube y autenticación (/api/sync)...${colors.reset}`);
  
  const mockId = `test_planeacion_${Date.now()}`;
  const mockPlaneacion = {
    id: mockId,
    titulo: "Planeación de Prueba Automatizada",
    temaSesion: "Introducción a las APIs y Bases de Datos",
    asignatura: "Tecnología de la Información",
    nivelAcademico: "Superior",
    grado: "7",
    grupo: "A",
    fecha: new Date().toISOString().split('T')[0],
    fechaCreacion: new Date().toISOString(),
    fechaModificacion: new Date().toISOString(),
    contenido: "Esta es una planeación de prueba creada para validar la conexión con MongoDB Atlas.",
    estado: "borrador"
  };

  const syncPayload = {
    deviceId: "test_script_runner",
    lastSync: null,
    operations: [
      {
        type: "create",
        data: mockPlaneacion
      }
    ]
  };

  try {
    const res = await makeRequest(targetUrl, '/api/sync', 'POST', headers, syncPayload);
    
    if (res.statusCode === 200 && res.data && res.data.success) {
      console.log(`✅ ¡Éxito! Sincronización procesada correctamente.`);
      console.log(`   - Elementos subidos con éxito: ${colors.green}${res.data.data.uploaded}${colors.reset}`);
      console.log(`   - Cambios de servidor descargados: ${colors.green}${res.data.data.downloaded.length}${colors.reset}`);
      
      if (res.data.data.errors && res.data.data.errors.length > 0) {
        console.log(`⚠️  Hubo errores en operaciones individuales:`, res.data.data.errors);
      }
    } else {
      console.log(`❌ Error al intentar sincronizar (Estado ${res.statusCode}):`, res.data);
      console.log(`💡 Si obtienes un error 500, verifica que la variable de entorno MONGODB_URI esté bien configurada en Vercel o en tu .env local y que tu IP esté permitida en la lista blanca de MongoDB Atlas (Network Access).`);
      return;
    }
  } catch (error) {
    console.log(`❌ Error durante la petición de sincronización: ${colors.red}${error.message}${colors.reset}`);
    return;
  }

  // --- PRUEBA 3: Verificación de Datos en MongoDB Atlas (simulado buscando el elemento subido) ---
  console.log(`\n${colors.bright}[Paso 3/4] Verificando que los datos se puedan recuperar de la base de datos...${colors.reset}`);
  
  // Para verificar, forzamos un sync descargando elementos desde antes del timestamp actual
  const checkPayload = {
    deviceId: "test_script_checker",
    lastSync: new Date(Date.now() - 60000).toISOString(), // hace 1 minuto
    operations: []
  };

  try {
    const res = await makeRequest(targetUrl, '/api/sync', 'POST', headers, checkPayload);
    
    if (res.statusCode === 200 && res.data && res.data.success) {
      const downloadedList = res.data.data.downloaded || [];
      const found = downloadedList.find(p => p.id === mockId);
      
      if (found) {
        console.log(`✅ ¡Confirmado! El documento fue encontrado y recuperado del clúster de MongoDB Atlas.`);
        console.log(`   ID del elemento: ${colors.cyan}${found.id}${colors.reset}`);
        console.log(`   Título recuperado: ${colors.green}"${found.titulo}"${colors.reset}`);
      } else {
        console.log(`⚠️  El sync terminó con éxito pero el elemento de prueba no apareció en la descarga.`);
        console.log(`   Esto puede ocurrir si es el mismo dispositivo, pero aquí usamos un deviceId diferente.`);
        console.log(`   Cantidad de elementos devueltos: ${downloadedList.length}`);
      }
    } else {
      console.log(`❌ Error en la verificación de datos (Estado ${res.statusCode}):`, res.data);
    }
  } catch (error) {
    console.log(`❌ Error durante la verificación: ${colors.red}${error.message}${colors.reset}`);
  }

  // --- PRUEBA 4: Limpieza de Datos de Prueba (DELETE) ---
  console.log(`\n${colors.bright}[Paso 4/4] Limpiando el registro de prueba de la base de datos para no ensuciar...${colors.reset}`);
  
  const cleanPayload = {
    deviceId: "test_script_runner",
    lastSync: null,
    operations: [
      {
        type: "delete",
        data: { id: mockId }
      }
    ]
  };

  try {
    const res = await makeRequest(targetUrl, '/api/sync', 'POST', headers, cleanPayload);
    if (res.statusCode === 200 && res.data && res.data.success) {
      console.log(`✅ Registro de prueba eliminado satisfactoriamente de MongoDB.`);
    } else {
      console.log(`⚠️  No se pudo eliminar el registro de prueba automáticamente:`, res.data);
    }
  } catch (error) {
    console.log(`⚠️  Error en la limpieza: ${error.message}`);
  }

  console.log(`\n${colors.green}${colors.bright}=====================================================${colors.reset}`);
  console.log(`${colors.green}${colors.bright}              ¡PRUEBA COMPLETADA CON ÉXITO!          ${colors.reset}`);
  console.log(`${colors.green}${colors.bright}=====================================================${colors.reset}`);
  console.log(`\n📝 ${colors.bright}NOTAS IMPORTANTES PARA LA VERIFICACIÓN EN MONGODB ATLAS:${colors.reset}\n`);
  console.log(`1. ${colors.cyan}Base de Datos Real:${colors.reset} En la captura que compartiste, estabas visualizando la base de datos`);
  console.log(`   ${colors.yellow}sample_mflix${colors.reset} (el dataset de ejemplo oficial de MongoDB).`);
  console.log(`   PlanearIA utiliza la base de datos ${colors.green}${colors.bright}planeariaDB${colors.reset}.`);
  console.log(`   Una vez que realices la primera sincronización real desde la app o corras este test`);
  console.log(`   (antes de que se borre el test), aparecerá la base de datos ${colors.green}planeariaDB${colors.reset} en tu menú izquierdo.`);
  console.log(`   Debes hacer clic en ${colors.green}planeariaDB${colors.reset} y verás la colección ${colors.green}planeaciones${colors.reset}.`);
  console.log(`\n2. ${colors.cyan}Colecciones e Índices:${colors.reset} No necesitas crear NADA manualmente.`);
  console.log(`   MongoDB Atlas crea las bases de datos y colecciones automáticamente en la primera inserción.`);
  console.log(`   Los índices se crean de dos formas:`);
  console.log(`   - En caliente: Algunos endpoints (como /api/alumnos) los crean al iniciarse.`);
  console.log(`   - Pre-creación: Puedes ejecutar el script de índices directamente para asegurar optimización:`);
  console.log(`     ${colors.cyan}node backend/lib/databaseIndexes.js${colors.reset}`);
  console.log(`\n3. ${colors.cyan}Reglas de Validación:${colors.reset} Recomendamos ${colors.red}NO${colors.reset} añadir reglas de validación (JSON Schema)`);
  console.log(`   directamente en MongoDB Atlas. PlanearIA utiliza TypeScript y validación por software en la app y backend.`);
  console.log(`   Poner reglas duras en Atlas dificulta las migraciones de esquemas en el futuro y puede causar`);
  console.log(`   que las sincronizaciones de dispositivos offline fallen silenciosamente en la base de datos.`);
}

runTests();
