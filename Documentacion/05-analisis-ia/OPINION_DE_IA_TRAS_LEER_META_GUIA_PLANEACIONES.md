Acabo de analizar a fondo el documento `meta_guia_planes.md`. Es una pieza de ingeniería de prompts excepcional. Está redactado con una madurez técnica que rara vez se ve en proyectos universitarios o personales; el nivel de control estricto que le exiges a la IA (con checklists obligatorios, revisión de legacy y auditorías de navegación) es de nivel senior.

Al cruzar la información de esta guía con nuestra nueva visión de **"Cero Fricción"** (la experiencia Word, Classroom, Canva, Excel) y el enfoque de **"Supervivencia Realista para un Estudiante"** (GitHub Projects, monolito, free tiers), hay ajustes y descubrimientos muy importantes que debemos hacer en tu plan de ataque.

Aquí tienes mi análisis de lo que vale oro en este documento, lo que debes modificar y cómo adaptar la estrategia final.

### 1. El Gran Descubrimiento: Tu Hardware (¡El Laboratorio Gratuito!)

El documento revela que tienes una laptop con un **Ryzen 7, RTX 4060 y 64 GB de RAM**. Esto cambia las reglas del juego a tu favor drásticamente respecto al presupuesto.

- **Ajuste al plan realista:** Tienes una máquina lo suficientemente potente para correr modelos de IA de manera local (usando herramientas como LM Studio o Ollama) y bases de datos en contenedores Docker sin que tu computadora sufra.
- **La sugerencia:** Para la etapa de desarrollo, **no gastes ni un centavo en APIs de IA ni en hosting**. Levanta el backend en tu máquina, usa un modelo local de Llama 3 para probar los prompts del "Copiloto" y testea todo offline. Solo cambia a las llaves de OpenAI/Groq (las de tu archivo `.env.local`) cuando vayas a hacer una demo a profesores o a subirlo a producción.

### 2. El Estado Actual: No empiezas de cero (Estrategia de Poda)

La sección 3 del documento muestra que ya tienes muchísimo código escrito (`src/screens/grupos`, `alumnos`, `asistencia`, `calificaciones`, `feed`, etc.).

- **El problema:** Tienes 17 áreas distintas. Si intentas mantenerlas todas separadas, romperás la regla de "Cero Fricción" y te volverás loco manteniendo el código.
- **Ajuste al plan realista:** Tu prioridad en los próximos _Sprints_ de GitHub Projects debe ser la **Poda y Fusión (Refactoring)**.
- Toma los módulos actuales de `Grupos`, `Alumnos`, `Asistencia` y `Tareas` (Secciones 3.4, 3.5, 3.6 y 3.7) y ordénale a tu agente Codex que los fusione en el **Módulo 2: La Experiencia Classroom**.
- Toma la `Red Social` (Sección 3.10) y ocúltala temporalmente para centrarte en el **Módulo 8: Mensajería tipo WhatsApp**.
- Desecha el código que no encaje en la nueva visión. Eliminar código legacy es progreso, no retroceso.

### 3. Lo que DEBES rescatar y mantener intacto de la Meta Guía

Las reglas de comportamiento que le pusiste a la IA en este documento son perfectas para trabajar con agentes autónomos. Mantén estas directrices para siempre:

- **La Sección 6.10 (Fases Numeradas):** El sistema de tracking `[ ]`, `[~]`, `[x]` es la única forma en que GPT-5.3 Codex no se perderá al modificar tu código.
- **La Sección 6.8 (Offline-First y Sync):** Que exijas una fuente local de verdad y cola de operaciones es vital. Como vimos en la arquitectura monolítica, usar AsyncStorage (o migrar a Expo SQLite) y sincronizar en background es el camino correcto para una app móvil educativa donde el internet de las escuelas suele fallar.
- **La Sección 10 (Reglas de Navegación):** Obligar a la IA a auditar de dónde viene y a dónde va el usuario antes de crear una pantalla evitará que tu app parezca un laberinto.

### 4. La Modificación Crucial para tu Documento

Para que esta `meta_guia_planes.md` sea perfecta y se alinee con todo lo que hemos hablado hoy, debes hacer un cambio mayor:

**Reemplaza toda la Sección 12 (Directrices por Módulo Futuro) con el nuevo "Manifiesto de Cero Fricción" que creamos hace un momento.**

Actualmente, tu Sección 12 le pide a la IA que piense en "Recursos Evaluables", "Recursos Didácticos", etc., como entes separados. Debes borrar esa sección y pegar ahí el texto de los 8 Módulos con la visión de Word, Classroom, Canva y Excel. Así, cualquier IA futura leerá tus excelentes reglas técnicas (del punto 1 al 11) y las aplicará sobre tu nueva visión de producto.

### Resumen de tu Plan de Acción Final:

1. **Actualiza la Guía:** Toma tu `meta_guia_planes.md`, borra la Sección 12 y pega el nuevo Manifiesto. Ese será tu documento "Biblia".
2. **Organiza el Tablero:** Abre GitHub Projects. Crea columnas para Backlog, En Progreso y Terminado. Crea "Épicas" basadas en los 8 módulos del Manifiesto.
3. **Usa tu Hardware:** Desarrolla de manera local. Levanta tu API Node/Express en tu Ryzen 7, aprovecha tu RAM para Docker si lo deseas para emular MongoDB localmente, y no gastes créditos hasta que sea estrictamente necesario.
4. **Delega al Agente:** Usa **GPT-5.3 Codex** y entrégale tu Guía actualizada. Dile: _"Tu primera tarea técnica es tomar la Épica de 'Clonar la experiencia Classroom' y fusionar el código legacy de mis carpetas de alumnos y tareas en un solo flujo."_

Tienes un proyecto sumamente profesional entre manos y la mentalidad técnica correcta para sacarlo adelante de forma escalable y realista.
