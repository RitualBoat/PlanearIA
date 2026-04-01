# Plan de Migración: Vercel → Docker (Self-Hosted)

> **Estado:** 📋 PLANIFICADO (No implementar aún)  
> **Fecha:** Junio 2025  
> **Prerequisito:** Completar Sprint 4+ del roadmap actual con Vercel + MongoDB Atlas

---

## 1. Motivación

- **Control total** sobre la infraestructura y datos
- **Costo predecible** (vs. consumo variable en Vercel/Atlas)
- **Sin límites** de la capa gratuita (M0 Atlas: 512MB, Vercel: 100GB bandwidth)
- **Latencia reducida** al tener todo en un mismo servidor/red

---

## 2. Arquitectura Propuesta

```
┌─────────────────────────────────────────────┐
│              Docker Compose                 │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  nginx   │  │  api      │  │ mongodb  │  │
│  │ (proxy)  │→ │ (node.js) │→ │ (data)   │  │
│  │ :80/443  │  │ :3000     │  │ :27017   │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  Volumes: mongodb_data, api_logs            │
└─────────────────────────────────────────────┘
```

### Servicios

| Servicio  | Imagen           | Puerto  | Propósito                               |
| --------- | ---------------- | ------- | --------------------------------------- |
| `nginx`   | `nginx:alpine`   | 80, 443 | Reverse proxy, SSL, rate limiting       |
| `api`     | Custom (Node 20) | 3000    | Backend Express (migrado de serverless) |
| `mongodb` | `mongo:7`        | 27017   | Base de datos local                     |

---

## 3. Fases de Migración

### Fase 1: Convertir Serverless → Express Server

**Esfuerzo estimado:** 2-3 días

Actualmente cada archivo en `backend/api/` es una función serverless de Vercel. Hay que consolidarlos en un Express server:

```
backend/
├── server.js              ← NUEVO: Entry point Express
├── routes/
│   ├── planeaciones.js    ← Adaptado de api/planeaciones.js
│   ├── grupos.js
│   ├── alumnos.js
│   ├── sync.js
│   ├── health.js
│   └── planeaciones/
│       ├── generar.js
│       └── mejorar.js
├── middleware/
│   ├── auth.js            ← Adaptado de lib/auth.js
│   ├── cors.js
│   └── errorHandler.js
├── lib/
│   └── mongodb.js         ← Cambiar connection string
├── Dockerfile
└── package.json           ← Agregar express, helmet, compression
```

**Cambios clave:**

- Cada `module.exports = async (req, res) => {}` → `router.METHOD(path, handler)`
- Eliminar Vercel-specific: `vercel.json`, `applyCors()` manual → `cors()` middleware
- Agregar `helmet()`, `compression()`, `express.json({ limit: '10mb' })`
- Connection string: `process.env.MONGODB_URI` → `mongodb://mongodb:27017/planeariaDB`

### Fase 2: Crear Dockerfiles

**Esfuerzo estimado:** 1 día

```dockerfile
# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

### Fase 3: Docker Compose

**Esfuerzo estimado:** 1 día

```yaml
# docker-compose.yml
version: "3.8"

services:
  mongodb:
    image: mongo:7
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: planeariaDB
    healthcheck:
      test: mongosh --eval "db.adminCommand('ping')"
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: ./backend
    restart: unless-stopped
    depends_on:
      mongodb:
        condition: service_healthy
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://mongodb:27017/planeariaDB
      API_SECRET: ${API_SECRET}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "3000:3000"

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    depends_on:
      - api
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro

volumes:
  mongodb_data:
```

### Fase 4: Migrar Datos de Atlas → Docker MongoDB

**Esfuerzo estimado:** 0.5 días

```bash
# Exportar de Atlas
mongodump --uri="mongodb+srv://..." --db=planeariaDB --out=./dump

# Importar a Docker MongoDB
docker cp ./dump mongodb:/dump
docker exec mongodb mongorestore /dump
```

### Fase 5: Actualizar App (connection string)

**Esfuerzo estimado:** 0.5 días

- Cambiar `SYNC_CONFIG.BACKEND_URL` de `https://backend-eight-chi-54.vercel.app` → URL del servidor Docker
- Actualizar variables de entorno en la configuración de sync

### Fase 6: SSL y Dominio

**Esfuerzo estimado:** 1 día

- Configurar Let's Encrypt con certbot
- Configurar nginx reverse proxy con HTTPS
- Apuntar dominio al servidor

---

## 4. Requisitos del Servidor

| Recurso | Mínimo        | Recomendado      |
| ------- | ------------- | ---------------- |
| RAM     | 1 GB          | 2 GB             |
| CPU     | 1 vCPU        | 2 vCPU           |
| Disco   | 10 GB SSD     | 20 GB SSD        |
| SO      | Ubuntu 22.04+ | Ubuntu 24.04 LTS |

**Costo estimado:** $5-10 USD/mes en DigitalOcean, Hetzner, o Contabo

---

## 5. Backups

```bash
# Cron job diario (agregar a crontab)
0 3 * * * docker exec mongodb mongodump --db=planeariaDB --archive=/backup/$(date +\%Y\%m\%d).gz --gzip
```

---

## 6. Checklist Pre-Migración

- [ ] Completar Sprint 4 del roadmap (todos los endpoints CRUD funcionando en Vercel)
- [ ] Tener al menos 10 usuarios de prueba con datos reales
- [ ] Servidor contratado y accesible por SSH
- [ ] Dominio apuntando al servidor
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] Tests de integración del backend pasando
- [ ] Script de migración de datos probado

---

## 7. Riesgos y Mitigaciones

| Riesgo                     | Mitigación                                          |
| -------------------------- | --------------------------------------------------- |
| Downtime durante migración | Mantener Vercel como fallback 2 semanas             |
| Pérdida de datos           | Backup completo antes de migrar + app offline-first |
| Problemas de rendimiento   | Monitoreo con docker stats + alertas                |
| SSL expira                 | certbot auto-renewal via cron                       |
