/**
 * Servicio de Grupos
 * Maneja el acceso a datos de grupos (API, AsyncStorage, etc.)
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Grupo } from "../../types";

const STORAGE_KEY = "@planearia:grupos";

/**
 * Interfaz para el servicio de grupos
 */
export interface GruposService {
  obtenerGrupos: () => Promise<Grupo[]>;
  obtenerGrupoPorId: (id: number) => Promise<Grupo | null>;
  guardarGrupo: (grupo: Grupo) => Promise<void>;
  eliminarGrupo: (id: number) => Promise<void>;
}

/**
 * Obtiene todos los grupos desde el almacenamiento local
 * En producción, esto haría una llamada a la API
 */
export const obtenerGrupos = async (): Promise<Partial<Grupo>[]> => {
  try {
    // Primero intentar cargar desde AsyncStorage
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const grupos: Partial<Grupo>[] = JSON.parse(stored);
      console.log(`[grupos] Loaded ${grupos.length} from storage`);
      return grupos;
    }

    // Si no hay datos guardados, devolver datos de ejemplo
    // En producción, aquí se haría una llamada a la API
    const gruposDefault: Partial<Grupo>[] = [
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
      {
        id: 2,
        nombre: "5B - Programación Web",
        materia: "Programación Web",
        carrera: "ITICS",
        semestre: 5,
        cantidadAlumnos: 32,
        estado: "activo",
        periodo: "Enero-Junio 2024",
      },
      {
        id: 3,
        nombre: "3A - Estructuras de Datos",
        materia: "Estructuras de Datos",
        carrera: "ISC",
        semestre: 3,
        cantidadAlumnos: 25,
        estado: "activo",
        periodo: "Enero-Junio 2024",
      },
    ];

    // Guardar los datos de ejemplo en storage
    await guardarGrupos(gruposDefault);
    
    return gruposDefault;
  } catch (error) {
    console.error(" Error obteniendo grupos:", error);
    throw new Error("No se pudieron cargar los grupos");
  }
};

/**
 * Obtiene un grupo específico por ID
 */
export const obtenerGrupoPorId = async (
  id: number
): Promise<Partial<Grupo> | null> => {
  try {
    const grupos = await obtenerGrupos();
    return grupos.find((g) => g.id === id) || null;
  } catch (error) {
    console.error(` Error obteniendo grupo ${id}:`, error);
    return null;
  }
};

/**
 * Guarda la lista completa de grupos en AsyncStorage
 */
export const guardarGrupos = async (grupos: Partial<Grupo>[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(grupos));
    console.log(` Guardados ${grupos.length} grupos en storage`);
  } catch (error) {
    console.error(" Error guardando grupos:", error);
    throw new Error("No se pudieron guardar los grupos");
  }
};

/**
 * Agrega un nuevo grupo
 */
export const agregarGrupo = async (grupo: Partial<Grupo>): Promise<void> => {
  try {
    const grupos = await obtenerGrupos();
    const nuevoId = Math.max(...grupos.map((g) => g.id || 0), 0) + 1;
    const nuevoGrupo = { ...grupo, id: nuevoId };
    
    await guardarGrupos([...grupos, nuevoGrupo]);
    console.log(` Grupo agregado: ${nuevoGrupo.nombre}`);
  } catch (error) {
    console.error(" Error agregando grupo:", error);
    throw new Error("No se pudo agregar el grupo");
  }
};

/**
 * Actualiza un grupo existente
 */
export const actualizarGrupo = async (
  id: number,
  actualizacion: Partial<Grupo>
): Promise<void> => {
  try {
    const grupos = await obtenerGrupos();
    const nuevosGrupos = grupos.map((g) =>
      g.id === id ? { ...g, ...actualizacion } : g
    );
    
    await guardarGrupos(nuevosGrupos);
    console.log(` Grupo actualizado: ${id}`);
  } catch (error) {
    console.error(" Error actualizando grupo:", error);
    throw new Error("No se pudo actualizar el grupo");
  }
};

/**
 * Elimina un grupo
 */
export const eliminarGrupo = async (id: number): Promise<void> => {
  try {
    const grupos = await obtenerGrupos();
    const nuevosGrupos = grupos.filter((g) => g.id !== id);
    
    await guardarGrupos(nuevosGrupos);
    console.log(` Grupo eliminado: ${id}`);
  } catch (error) {
    console.error(" Error eliminando grupo:", error);
    throw new Error("No se pudo eliminar el grupo");
  }
};

/**
 * Filtra grupos por búsqueda (lógica de negocio)
 */
export const filtrarGruposPorBusqueda = (
  grupos: Partial<Grupo>[],
  busqueda: string
): Partial<Grupo>[] => {
  if (!busqueda || busqueda.trim() === "") {
    return grupos;
  }

  const busquedaLower = busqueda.toLowerCase().trim();

  return grupos.filter(
    (grupo) =>
      grupo.nombre?.toLowerCase().includes(busquedaLower) ||
      grupo.materia?.toLowerCase().includes(busquedaLower) ||
      grupo.carrera?.toLowerCase().includes(busquedaLower)
  );
};
