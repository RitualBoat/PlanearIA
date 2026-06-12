# PlanearIA - Plataforma Inteligente para Docentes

<div align="center">

![Version](https://img.shields.io/badge/version-4.1-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb.svg)
![Expo](https://img.shields.io/badge/Expo-54.0-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)

**La plataforma educativa diseñada para funcionar donde el internet no llega.**

</div>

---

## ¿Qué es PlanearIA?

**PlanearIA** es una plataforma educativa integral diseñada por y para docentes. Permite estructurar clases, gestionar alumnos, organizar materiales y redactar planeaciones didácticas asistidas por Inteligencia Artificial. 

El mayor diferenciador de PlanearIA es su arquitectura **Offline-First**. Entendiendo la realidad de los planteles educativos, la aplicación permite a los profesores trabajar fluidamente sin conexión a internet, guardando los datos localmente y sincronizándolos de forma automática con la nube en cuanto se restablece la red.

##  Nuestra Visión: "Cero Fricción"

PlanearIA se construye bajo una regla central: **Un profesor no debería sentir que aprende software nuevo.** En lugar de crear interfaces complejas, unificamos herramientas que el docente ya conoce dentro de un solo ecosistema:

* **Planeaciones = Experiencia Word/Docs:** Editor de texto enriquecido para redactar y exportar planeaciones con asistencia de IA pedagógica.
* **Grupos y Alumnos = Experiencia Classroom:** Gestión de aulas, unidades temáticas, materiales y estudiantes.
* **Persistencia = Experiencia Ininterrumpida:** Al igual que en apps modernas, si se pierde la conexión, el docente puede seguir escribiendo y guardando su trabajo de forma local.

---

##  Vistazo a la Plataforma

> <img width="2542" height="1434" alt="image" src="https://github.com/user-attachments/assets/004abb23-00ae-41ef-b9eb-b998464d247a" />


### 1. Panel de Gestión de Clases (Módulo Classroom)

> <img width="2548" height="1434" alt="image" src="https://github.com/user-attachments/assets/6d2f8c2e-4d95-4ac7-9a50-1c8a2b2b4ca0" />


### 2. Editor de Planeaciones Asistido por IA

> <img width="2544" height="1434" alt="image" src="https://github.com/user-attachments/assets/c978f35c-57be-4922-9ff3-b914eeca339d" />

---

##  Alcance Actual del Proyecto

En su estado actual, la plataforma es un producto funcional que incluye:

* **Sistema de Autenticación y Cuentas:** Registro e inicio de sesión con aislamiento de datos por usuario (`userId`). Las sesiones persisten correctamente.
* **Módulo Classroom Integrado:** Creación de clases, gestión de secciones temáticas y asignación de materiales. 
* **Editor de Planeaciones (Fase 9):** Procesador de texto integrado con capacidades de exportación y asistencia para la redacción de secuencias didácticas.
* **Motor de Sincronización Local-First:** Integración de una cola de operaciones (`op_queue`) que retiene las acciones del docente en una caché local (SQLite/AsyncStorage) cuando no hay red y las empuja al servidor (MongoDB) al recuperar la conexión.
* **Diseño Responsivo Web/Móvil:** Un diseño base adaptativo (One Codebase) que funciona tanto en la pantalla de un celular como en el monitor de una PC.

---

##  Stack Tecnológico y Arquitectura

PlanearIA se sostiene sobre una arquitectura de **Monolito Modular** y **Funciones Serverless**, diseñada para mantener los costos bajos, facilitar el desarrollo solitario y maximizar la resiliencia:

* **Frontend (Móvil y Web):** React Native, Expo, TypeScript.
* **Patrón de Diseño:** MVVM (Model-View-ViewModel).
* **Almacenamiento Local:** SQLite + AsyncStorage (Caché y Cola de transacciones).
* **Backend y API:** Node.js desplegado como *Serverless Functions* en **Vercel**.
* **Base de Datos Remota:** Clúster NoSQL en **MongoDB Atlas** (Free Tier).
* **CI/CD y DevOps:** GitHub Actions (Validación de tipos, ESLint y suite de +500 pruebas Jest).

---

##  ¿Dónde probar PlanearIA?

PlanearIA es un desarrollo multiplataforma. Puedes acceder a ella a través de la web o instalarla directamente en tu dispositivo Android.

###  Acceso Vía Web (Despliegue en Vercel)
La plataforma está hosteada y operativa directamente desde el navegador. Puedes ingresar, registrarte y sincronizar tus datos accediendo al siguiente enlace:
👉 https://planearia-web.vercel.app/

###  Descarga para Android (APK)
Para la experiencia nativa con soporte completo fuera de línea, puedes instalar la aplicación en tu celular Android.
1. Dirígete a la pestaña de https://github.com/RitualBoat/PlanearIA/releases en este repositorio.
2. Descarga la versión más reciente del archivo `.apk` disponible.
3. Instálalo en tu dispositivo Android (asegúrate de permitir la instalación desde orígenes desconocidos si tu teléfono lo solicita).

---

##  Documentación del Proyecto

El proyecto cuenta con una documentación exhaustiva que detalla las decisiones arquitectónicas, los flujos de sincronización y los reportes de calidad:

* 🏛️ **[Arquitectura y Fundamentos](./Documentacion/00-fundamentos/ARQUITECTURA.md)**
* 🔄 **[Flujo de Sincronización Offline-First](./Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md)**
* 📋 **[Planes Maestros y Metodología (SDD)](./Documentacion/01-planes-maestros/README.md)**
* ⚙️ **[Guía para levantar el Entorno Local](./Documentacion/02-operacion/ENTORNO_LOCAL.md)**

---
*Desarrollado con ♥ por Ignacio Barboza Espinoza para la comunidad docente.*
