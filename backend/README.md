# 🚀 PlanearIA API - Backend Serverless

API serverless para sincronización de PlanearIA con MongoDB Atlas.
Diseñado para desplegarse en Vercel (100% gratis).

## 📋 Estructura

```
backend/
├── api/
│   ├── health.js       # GET /api/health - Health check
│   ├── planeaciones.js # CRUD /api/planeaciones
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

Edita `src/sync/config/apiConfig.ts` y actualiza:

```typescript
export const API_CONFIG = {
  baseUrl: "https://tu-url-de-vercel.vercel.app", // ← Tu URL aquí
  apiSecret: "planearia-dev-secret-2025",
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
