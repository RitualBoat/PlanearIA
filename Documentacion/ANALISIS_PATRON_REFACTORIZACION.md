# Análisis de Patrón y Refactorización (MVC y MVVM)

**Programación Móvil II - Unidad 1 - Actividad 5**
**Estudiante:** Ignacio Barboza Espinoza
**Proyecto:** PlanearIA
**Fecha:** 18 de Febrero, 2026

---

## Parte 1 – Diagnóstico del Patrón Actual

### 1. ¿Tu proyecto se parece más a MVC o MVVM?

Mi proyecto tiene características mixtas entre MVC y MVVM LIGERO, con tendencia a MVVM en algunas áreas pero sin una implementación consistente en todas las pantallas.

**Justificación:**

- **Elementos MVVM identificados:**
 - Tengo un módulo `/sync` con separación clara: `services` (datos), `hooks` (ViewModel), `providers` (contexto)
 - El hook `useSync` actúa como ViewModel para la sincronización
 - Algunas pantallas usan Context para separar lógica de UI

- **Elementos MVC o sin patrón definido:**
 - Muchas pantallas mezclan UI + lógica + datos directamente
 - No hay consistencia en toda la aplicación
 - Datos hardcodeados dentro de componentes de UI
 - Lógica de negocio (filtros, transformaciones) dentro de las pantallas

**Conclusión:** Mi proyecto está en **transición hacia MVVM** pero no está completamente implementado. La arquitectura es muy inconsistente.

---

### 2. Evidencias del código

#### **Evidencia #1: Módulo /sync implementa MVVM correctamente**

**Ruta:** `src/sync/`

**Estructura:**

```
/sync
 /services → syncService.ts (acceso a datos, API, AsyncStorage)
 /hooks → useSync.ts (ViewModel - maneja estado y lógica)
 /providers → SyncProvider.tsx (contexto global)
 /config → apiConfig.ts (configuración)
```

**Fragmento de código - useSync.ts (ViewModel):**

```typescript
export const useSync = (): UseSyncResult => {
 const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
 const [isOnline, setIsOnline] = useState(true);
 const [pendingCount, setPendingCount] = useState(0);

 const performSync = useCallback(async (): Promise<SyncResult> => {
 const online = await checkConnectivity();
 if (!online) {
 setSyncStatus("offline");
 return {
 success: false,
 uploaded: 0,
 downloaded: 0,
 errors: ["Sin conexión"],
 };
 }
 // Más lógica de sincronización...
 }, []);

 return {
 syncStatus,
 isOnline,
 pendingCount,
 forceSync,
 isSyncConfigured,
 };
};
```

**Análisis:** Separación correcta - el hook maneja estado y lógica, el servicio maneja datos, la UI solo consume.

---

#### **Evidencia #2: Context mezcla responsabilidades (patrón mixto)**

**Ruta:** `src/context/PlaneacionesContext.tsx`

**Fragmento de código:**

```typescript
export const PlaneacionesProvider: React.FC<PlaneacionesProviderProps> = ({ children }) => {
 const [planeaciones, setPlaneaciones] = useState<Planeacion[]>([]);
 const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");

 // [MEZCLA] Acceso directo a AsyncStorage (debería estar en un service)
 const loadFromStorage = async () => {
 try {
 const stored = await AsyncStorage.getItem(STORAGE_KEYS.PLANEACIONES);
 if (stored) {
 const data: Planeacion[] = JSON.parse(stored);
 setPlaneaciones(data);
 }
 } catch (error) {
 console.error(" Error cargando planeaciones:", error);
 }
 };

 // [MEZCLA] Lógica de negocio mezclada con estado
 const clonarPlaneacion = async (id: string) => {
 const planeacionOriginal = obtenerPlaneacion(id);
 if (planeacionOriginal) {
 const nuevaPlaneacion: Planeacion = {
 ...planeacionOriginal,
 id: Date.now().toString(),
 temaSesion: `${planeacionOriginal.temaSesion} (Copia)`,
 };
 await agregarPlaneacion(nuevaPlaneacion);
 }
 };
```

**Análisis:** Mezcla de responsabilidades - funciona como Controller + Model + Service al mismo tiempo.

---

#### **Evidencia #3: Pantallas con código mezclado (UI + datos + lógica)**

**Ruta:** `src/screens/grupos/ListaGruposScreen.tsx` (ANTES DE REFACTORIZAR)

**Fragmento de código:**

```typescript
const ListaGruposScreen: React.FC<ListaGruposScreenProps> = ({ navigation }) => {
 const [searchQuery, setSearchQuery] = useState<string>("");

 // [MEZCLA] Datos hardcodeados directamente en la UI
 const gruposEjemplo: Partial<Grupo>[] = [
 {
 id: 1,
 nombre: "7A - Matemáticas Avanzadas",
 materia: "Matemáticas Avanzadas",
 carrera: "ISC",
 semestre: 7,
 cantidadAlumnos: 28,
 estado: "activo",
 periodo: "Enero-Junio 2024",
 },
 // ... más datos
 ];

 // [MEZCLA] Lógica de filtrado dentro de la pantalla
 const gruposFiltrados = gruposEjemplo.filter((grupo) =>
 grupo.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <View style={styles.container}>
 {/* Renderizado mezclado con lógica */}
 <Text>{gruposEjemplo.length} grupos activos</Text>
 {gruposFiltrados.map((grupo) => (
 <TouchableOpacity key={grupo.id} onPress={() => handleGrupoPress(grupo)}>
 {/* ... */}
 </TouchableOpacity>
 ))}
 </View>
 );
};
```

**Análisis:** Todo mezclado - la pantalla tiene datos, lógica de filtrado y presentación. No sigue ningún patrón definido.

---

### 3. Pantalla con "código mezclado" identificada

**Pantalla seleccionada:** `ListaGruposScreen.tsx`

**Problemas detectados:**

1. **Datos hardcodeados** dentro del componente
2. **Lógica de negocio** (filtrado) en la UI
3. **Sin separación** de responsabilidades
4. **No hay persistencia** de datos
5. **No hay manejo** de estados (loading, error)

**Ejemplos del código mezclado:**

```typescript
// TODO: Datos + Lógica + UI todo en un solo archivo
const ListaGruposScreen = ({ navigation }) => {
 const [searchQuery, setSearchQuery] = useState<string>("");

 // DATOS (debería estar en un servicio)
 const gruposEjemplo: Partial<Grupo>[] = [ /* ... */ ];

 // LÓGICA (debería estar en un hook/ViewModel)
 const gruposFiltrados = gruposEjemplo.filter((grupo) =>
 grupo.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
 );

 // UI (lo único que debería estar aquí)
 return <View>{/* ... */}</View>;
};
```

---

## Parte 2 – Refactorización con Separación de Responsabilidades

### Estrategia aplicada: **MVVM (Model-View-ViewModel)**

Tuve que separar la pantalla `ListaGruposScreen.tsx` en 3 capas distintas para poder implementar MVVM de manera correcta:

```
┌─────────────────────────────────────┐
│ VIEW (ListaGruposScreen.tsx) │ ← Solo renderiza UI
│ - Renderiza loading, error, data │
│ - Maneja eventos de usuario │
│ - NO tiene lógica de negocio │
└──────────────┬──────────────────────┘
 │ usa
 ↓
┌─────────────────────────────────────┐
│ VIEWMODEL (useGrupos.ts) │ ← Hook personalizado
│ - Maneja estado (grupos, loading) │
│ - Ejecuta lógica de negocio │
│ - Coordina llamadas al servicio │
└──────────────┬──────────────────────┘
 │ usa
 ↓
┌─────────────────────────────────────┐
│ MODEL/SERVICE (gruposService.ts) │ ← Acceso a datos
│ - AsyncStorage / API calls │
│ - CRUD operations │
│ - Persistencia de datos │
└─────────────────────────────────────┘
```

---

### Archivos creados/modificados:

####1. Servicio de datos: `/src/services/gruposService.ts`

**Responsabilidad:** Acceso a datos (AsyncStorage, API)

**Funciones implementadas:**

- `obtenerGrupos()` - Carga grupos desde AsyncStorage o retorna datos default
- `obtenerGrupoPorId(id)` - Busca un grupo específico
- `guardarGrupos(grupos)` - Persiste en AsyncStorage
- `agregarGrupo(grupo)` - Agrega nuevo grupo
- `actualizarGrupo(id, data)` - Actualiza grupo existente
- `eliminarGrupo(id)` - Elimina un grupo
- `filtrarGruposPorBusqueda(grupos, query)` - Lógica de filtrado

**Código clave:**

```typescript
export const obtenerGrupos = async (): Promise<Partial<Grupo>[]> => {
 try {
 const stored = await AsyncStorage.getItem(STORAGE_KEY);
 if (stored) {
 return JSON.parse(stored);
 }
 // Retorna datos default si no hay almacenados
 return gruposDefault;
 } catch (error) {
 console.error(" Error obteniendo grupos:", error);
 throw new Error("No se pudieron cargar los grupos");
 }
};
```

---

#### 2. ViewModel (Hook): `/src/hooks/useGrupos.ts`

**Responsabilidad:** Lógica de negocio y manejo de estado

**Estado que maneja:**

```typescript
- grupos: Partial<Grupo>[] // Todos los grupos
- gruposFiltrados: Partial<Grupo>[] // Grupos después de filtrar
- status: GruposStatus // idle | loading | success | error
- error: string | null // Mensaje de error
- searchQuery: string // Búsqueda actual
```

**Acciones que expone:**

```typescript
-recargarGrupos() -
 agregarNuevoGrupo(grupo) -
 actualizarGrupoExistente(id, data) -
 eliminarGrupoExistente(id) -
 setSearchQuery(query);
```

**Código clave:**

```typescript
export const useGrupos = (): UseGruposResult => {
 const [grupos, setGrupos] = useState<Partial<Grupo>[]>([]);
 const [status, setStatus] = useState<GruposStatus>("idle");

 useEffect(() => {
 cargarGrupos();
 }, []);

 useEffect(() => {
 const filtrados = filtrarGruposPorBusqueda(grupos, searchQuery);
 setGruposFiltrados(filtrados);
 }, [searchQuery, grupos]);

 const cargarGrupos = async () => {
 try {
 setStatus("loading");
 const gruposCargados = await obtenerGrupos();
 setGrupos(gruposCargados);
 setStatus("success");
 } catch (err) {
 setError(err.message);
 setStatus("error");
 }
 };

 return { grupos, gruposFiltrados, status, error, ... };
};
```

---

#### 3. Vista refactorizada: `/src/screens/grupos/ListaGruposScreen.tsx`

**Responsabilidad:** SOLO renderizar UI

**Cambios principales:**

**ANTES (código mezclado):**

```typescript
const ListaGruposScreen = ({ navigation }) => {
 const [searchQuery, setSearchQuery] = useState<string>("");

 // Datos hardcodeados
 const gruposEjemplo: Partial<Grupo>[] = [ /* ... */ ];

 // Lógica de filtrado
 const gruposFiltrados = gruposEjemplo.filter((grupo) =>
 grupo.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return <View>{/* render */}</View>;
};
```

**DESPUÉS (solo UI):**

```typescript
const ListaGruposScreen = ({ navigation }) => {
 // Ahora el ViewModel (hook) proporciona todo
 const {
 gruposFiltrados,
 isLoading,
 error,
 searchQuery,
 setSearchQuery,
 conteoGrupos,
 } = useGrupos();

 // Renderizado de estados
 if (isLoading) {
 return <LoadingView />;
 }

 if (error) {
 return <ErrorView message={error} />;
 }

 // Solo renderizado de datos
 return (
 <View>
 <SearchBar value={searchQuery} onChange={setSearchQuery} />
 {gruposFiltrados.map((grupo) => (
 <GrupoCard key={grupo.id} grupo={grupo} onPress={handleGrupoPress} />
 ))}
 </View>
 );
};
```

**Mejoras implementadas:**

- Manejo de estados (loading, error, success)
- Sin datos hardcodeados
- Sin lógica de negocio
- Componente reutilizable y testeable
- Fácil de mantener

---

## Parte 3 – Reflexión Técnica

### 1. ¿Qué ganaste con esta refactorización?

**Ganancias técnicas:**

1. **Separación de responsabilidades**: Ahora cada archivo tiene UN solo propósito claro
2. **Reutilización**: El hook `useGrupos` puede usarse en otras pantallas (ej: crear grupo, buscar grupos)
3. **Mantenibilidad**: Si necesito cambiar la fuente de datos (API en vez de AsyncStorage), solo modifico el servicio
4. **Testabilidad**: Puedo probar la lógica (hook) y la UI por separado
5. **Consistencia**: Ahora `ListaGruposScreen` sigue el mismo patrón que el módulo `/sync`

**Ganancias de código:**

- Estado de loading y errores manejados correctamente
- Persistencia de datos con AsyncStorage
- Código más limpio y legible
- Menos acoplamiento entre capas

---

### 2. ¿Qué parte te costó más entender?

**Retos encontrados:**

1. **La diferencia entre hook y servicio**: Al principio no tenia claro que se debia poner en services y que debia poner en el hook
 - **Solución:** El servicio es solo es para los datos y guardado (solo fetch/save), y el hook es para manejar cosas un poco mas complejas como (estados y lógica)

2. **Cuándo usar Context vs Hook**: Mi proyecto ya tiene `PlaneacionesContext` que mezcla todo
 - **Aprendizaje:** Context debe ser SOLO para estado global, delegar lógica a servicios/hooks

3. **El ciclo de vida de useEffect**: Coordinar la carga inicial + filtrado reactivo
 - **Solución:** Dos useEffect separados - uno para cargar, otro para filtrar

---

### 3. ¿En qué parte apoyaste con IA y qué parte hiciste tú?

**Con apoyo de IA (GitHub Copilot):**

- Generación del esqueleto inicial de `gruposService.ts` y `useGrupos.ts`
- Análisis del patrón actual del proyecto
- Identificación de "código mezclado" en las pantallas
- Creación de este documento de análisis estructurado para su posterion lectura y modificacion manual
- Implementación de manejo de estados (loading, error)

**Hecho por mí mismo:**

- Decisión de CUÁL pantalla refactorizar (elegí ListaGruposScreen por ser la que mas problemas tenia)
- Definición de qué funciones van en servicio vs hook
- Pruebas manuales y ajustes de la refactorización
- Comprensión de las diferencias MVC vs MVVM aplicadas a mi proyecto
- Reflexión sobre los aprendizajes y retos

---

## Comparación ANTES vs DESPUÉS

### Estructura del proyecto

**ANTES:**

```
src/
 screens/
 grupos/
 ListaGruposScreen.tsx [UI + Lógica + Datos mezclados]
```

**DESPUÉS:**

```
src/
 screens/
 grupos/
 ListaGruposScreen.tsx [SOLO UI - renderizado puro]

 hooks/
 useGrupos.ts [ViewModel - lógica y estado]

 services/
 gruposService.ts [Service - acceso a datos]
```

---

### Responsabilidades separadas

| Capa | Archivo | Responsabilidad | Ejemplo |
| ----------------- | ----------------------- | --------------- | -------------------------------------- |
| **View** | `ListaGruposScreen.tsx` | Renderizar UI | `{isLoading ? <Spinner /> : <List />}` |
| **ViewModel** | `useGrupos.ts` | Estado + Lógica | `const filtrados = filtrarGrupos(...)` |
| **Model/Service** | `gruposService.ts` | Datos | `await AsyncStorage.getItem(...)` |

---

## Próximos pasos a seguir

Para completar la transición a MVVM en todo el proyecto:

1. **Refactorizar `PlaneacionesContext`**: Separar en service + hook
2. **Crear `/src/services/planeacionesService.ts`**: Mover acceso a AsyncStorage
3. **Crear `/src/hooks/usePlaneaciones.ts`**: Mover lógica de estado
4. **Aplicar el mismo patrón** a otras pantallas (Alumnos, Tareas, etc.)
5. **Crear carpeta `/src/viewmodels`** si los hooks crecen demasiado

---

## Conclusión

Esta actividad me permitió entender profundamente la diferencia entre tener código que "funciona" vs código que está "bien estructurado". La separación de responsabilidades no es solo un concepto teórico - hace que el código sea:

- Más fácil de mantener(cambios aislados)
- Más fácil de probar (lógica separada de UI)
- Más escalable (nuevas pantallas reutilizan hooks/servicios)
- Más profesional (patrón reconocido por la industria)

El proyecto ahora tiene una base sólida para crecer de manera ordenada, ademas de que esto me ayuda a que coincida mejor con mi tablero de Azure DevOps, ya que ahora con estos conocimientos podre diseñar tareas tecnicas

---

**Fin del documento**
