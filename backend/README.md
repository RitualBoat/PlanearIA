# 🚀 PlanearIA API - Backend Serverless

API serverless para sincronización de PlanearIA con MongoDB Atlas.
Diseñado para desplegarse en Vercel (100% gratis).

## 🤖 Integración IA (Task 1.2.1.2)

- **Proveedor seleccionado:** OpenAI
- **Modelo por defecto:** `gpt-4o-mini` (configurable con `OPENAI_MODEL`)
- **Endpoint usado:** `POST /api/planeaciones/generar`
- **API key en backend:** `OPENAI_API_KEY` (variable de entorno en Vercel, nunca hardcodeada en el endpoint)

### Criterio de selección (resumen)

- OpenAI se eligió por compatibilidad con salida JSON estructurada y buena latencia para generación breve de planeaciones.
- El endpoint ya valida timeout (`OPENAI_TIMEOUT_MS`) y parsea JSON de forma robusta.

### Evidencia de PoC

- Flujo validado con pruebas automatizadas en frontend:
  - `npm test -- --runTestsByPath src/__tests__/planeaciones/useCrearPlaneacionViewModel.test.tsx`
  - Caso de éxito cubierto: `genera planeación con IA y mapea respuesta al modelo`
  - Resultado actual: `6 passed, 6 total`

## 📋 Estructura

```
backend/
├── api/
│   ├── health.js       # GET /api/health - Health check
│   ├── planeaciones.js # CRUD /api/planeaciones
│   ├── planeaciones/
│   │   └── generar.js  # POST /api/planeaciones/generar - IA
│   │   └── mejorar.js  # POST /api/planeaciones/mejorar - Sugerencias IA
│   └── sync.js         # POST /api/sync - Sincronización batch
├── lib/
│   ├── mongodb.js      # Conexión a MongoDB Atlas
│   └── auth.js         # Autenticación y utilidades
├── package.json
├── vercel.json         # Configuración de Vercel
└── README.md
```

## 🚀 Deploy en Vercel (5 minutos)

### Paso 1: Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Crea cuenta con GitHub (gratis)

### Paso 2: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 3: Login en Vercel

```bash
vercel login
```

### Paso 4: Configurar variables de entorno

Antes del deploy, necesitas configurar las variables de entorno:

```bash
# Navegar al directorio backend
cd backend

# Configurar MongoDB URI
vercel env add MONGODB_URI

# Cuando pregunte el valor, pega:
# mongodb+srv://planearia_user:ignacio11@planearia.thhgsor.mongodb.net/planeariaDB?retryWrites=true&w=majority

# Configurar API Secret
vercel env add API_SECRET

# Cuando pregunte el valor, usa:
# planearia-dev-secret-2025

# Configurar OpenAI API Key
vercel env add OPENAI_API_KEY

# Opcional: modelo de OpenAI
vercel env add OPENAI_MODEL

# Opcional: timeout en ms (default 20000)
vercel env add OPENAI_TIMEOUT_MS
```

### Paso 5: Deploy

```bash
# Desde el directorio backend
cd backend
vercel --prod
```

### Paso 6: Copiar la URL

Después del deploy, Vercel te dará una URL como:

```
https://planearia-api-xxxxx.vercel.app
```

### Paso 7: Actualizar la app

Configura en la app la variable pública para autenticación con backend:

```bash
EXPO_PUBLIC_API_SECRET=tu_api_secret
```

Luego verifica `src/sync/config/apiConfig.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: "https://tu-url-de-vercel.vercel.app", // ← Tu URL aquí
  apiSecret: process.env.EXPO_PUBLIC_API_SECRET,
  timeout: 15000,
};
```

---

## 🔧 Desarrollo Local

```bash
cd backend
npm install
vercel dev
```

La API estará en `http://localhost:3000`

---

## 📡 Endpoints

### Health Check

```
GET /api/health
```

### Planeaciones CRUD

```
GET    /api/planeaciones         # Listar todas
GET    /api/planeaciones?id=xxx  # Obtener una
POST   /api/planeaciones         # Crear/Upsert
PUT    /api/planeaciones         # Actualizar
DELETE /api/planeaciones?id=xxx  # Eliminar
```

### Generación con IA

```
POST /api/planeaciones/generar
Body: {
  prompt: string,
  nivelAcademico: "primaria" | "secundaria" | "preparatoria" | "universidad",
  contexto?: {
    asignatura?: string,
    grado?: string,
    grupo?: string,
    fecha?: string,
    horaInicio?: string
  }
}
```

### Mejora de planeación con IA

```
POST /api/planeaciones/mejorar
Body: {
  planeacion: Planeacion,
  maxSugerencias?: number
}

Response: {
  sugerencias: [
    {
      campo: string,
      categoria: "ortografia" | "redaccion" | "contenido",
      original: string,
      mejorado: string,
      justificacion: string
    }
  ]
}
```

### Sincronización Batch

```
POST /api/sync
Body: {
  deviceId: string,
  lastSync: string (ISO date),
  operations: [
    { type: 'create' | 'update' | 'delete', data: Planeacion }
  ]
}
```

---

## 🔐 Autenticación

Todas las requests requieren el header:

```
X-API-Key: planearia-dev-secret-2025
```

---

## 🆓 Límites Gratuitos

| Servicio         | Límite                   |
| ---------------- | ------------------------ |
| Vercel Functions | 100,000 invocaciones/mes |
| Vercel Bandwidth | 100 GB/mes               |
| MongoDB M0       | 512 MB storage           |

Más que suficiente para uso personal/desarrollo.

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'mongodb'"

```bash
cd backend
npm install
```

### Error 500 en API

- Verifica que `MONGODB_URI` esté configurado en Vercel
- Revisa los logs: `vercel logs`

### Error de conexión a MongoDB

- Verifica que IP 0.0.0.0/0 esté permitida en Atlas
- Revisa usuario y contraseña
