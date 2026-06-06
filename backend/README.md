# 🚀 PlanearIA API - Backend Serverless

API serverless para sincronización de PlanearIA con MongoDB Atlas.
Diseñado para desplegarse en Vercel (100% gratis).

## 🤖 Integración IA (Gateway multi-provider)

- **Gateway:** `backend/lib/aiGateway.js`
- **Endpoints usados:** `POST /api/planeaciones/generar`, `mejorar`, `copiloto`, `escanear-plantilla`
- **Proveedores soportados:** OpenRouter, Groq, OpenAI, Together y cualquier endpoint OpenAI-compatible via `AI_GATEWAY_PROVIDERS`
- **API keys:** siempre en backend/Vercel, nunca en la app movil/web
- **Limite por accion:** `AI_MAX_REQUESTS_PER_ACTION` (default `10`) y `AI_LIMIT_WINDOW_MS` (default 24h)
- **Modo dev:** `AI_DEV_MODE=true` activa limite ampliado solo para token dev/admin-dev y devuelve `usage.warning` en cada uso.

### Criterio de seleccion (resumen)

- El gateway permite empezar con proveedores gratuitos/free-tier y cambiar automaticamente al siguiente proveedor si uno falla o agota cuota.
- OpenRouter puede usar `OPENROUTER_MODEL=openrouter/free`; Groq/Together requieren configurar un modelo vigente desde su dashboard.
- `copiloto`, `mejorar` y `escanear-plantilla` tienen fallback heuristico para no bloquear la UX si no hay keys.
- `generar` requiere al menos un proveedor IA configurado porque produce una planeacion completa nueva.

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

# Cuando pregunte el valor, pega tu URI real desde un gestor seguro.
# Ejemplo placeholder:
# mongodb+srv://replace_user:replace_password@replace_cluster.mongodb.net/planeariaDB?retryWrites=true&w=majority

# Configurar API Secret
vercel env add API_SECRET

# Cuando pregunte el valor, usa una cadena aleatoria segura.
# Debe coincidir con EXPO_PUBLIC_API_SECRET en la app para desarrollo/demo.

# Configurar al menos un proveedor IA del gateway
vercel env add OPENROUTER_API_KEY
vercel env add OPENROUTER_MODEL

# Opcionales: otros proveedores OpenAI-compatible
vercel env add GROQ_API_KEY
vercel env add GROQ_MODEL
vercel env add OPENAI_API_KEY
vercel env add OPENAI_MODEL
vercel env add TOGETHER_API_KEY
vercel env add TOGETHER_MODEL

# Opcional: limites y timeout
vercel env add AI_MAX_REQUESTS_PER_ACTION
vercel env add AI_DEV_MODE
vercel env add AI_DEV_MAX_REQUESTS_PER_ACTION
vercel env add AI_DEV_TOKEN
vercel env add AI_LIMIT_WINDOW_MS
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
npm run backend:install
npm run backend:dev
npm run backend:dev:local
```

La API estará en `http://localhost:3000`

---

## 📡 Endpoints

Smoke test desde otra terminal:

```bash
npm run backend:health
```

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

### Grupos CRUD

```
GET    /api/grupos         # Listar todos
GET    /api/grupos?id=xxx  # Obtener uno
POST   /api/grupos         # Crear
PUT    /api/grupos         # Actualizar
DELETE /api/grupos?id=xxx  # Eliminar
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
X-API-Key: replace_with_same_value_as_backend_API_SECRET
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
