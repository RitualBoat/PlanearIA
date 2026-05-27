import { mergeWithLocal } from "../../sync/services/syncEngine";
import { calcularPromediosAlumnos, calcularPromedioGrupal } from "../../services/promediosService";
import { Post, Conversacion, Alumno, Calificacion } from "../../../types";

// Mock AsyncStorage correctly
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock NetInfo
jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(() =>
    Promise.resolve({ isConnected: true, isInternetReachable: true })
  ),
}));


describe("Pruebas de Rendimiento y Estres - Sprint 8", () => {
  // 1. Estres de Feed con 100+ publicaciones
  it("carga, procesa y ordena 100+ publicaciones en el Feed Social en menos de 10ms", () => {
    const postCount = 150;
    const posts: Post[] = [];

    // Generar datos ficticios de publicaciones con fechas desordenadas
    const baseTime = Date.now();
    for (let i = 0; i < postCount; i++) {
      // Variar la fecha de creacion para forzar ordenamiento
      const offset = (i % 2 === 0 ? 1 : -1) * i * 1000 * 60;
      posts.push({
        id: i + 1,
        autorId: `user_${i}`,
        autorNombre: `Docente ${i}`,
        autorRol: "docente",
        contenido: `Este es el contenido de la publicacion numero ${i}`,
        attachments: [],
        likes: i,
        likedBy: [],
        commentsCount: i * 2,
        savedBy: [],
        fechaCreacion: new Date(baseTime + offset).toISOString(),
        fechaModificacion: new Date(baseTime + offset).toISOString(),
        syncStatus: "synced",
      });
    }

    const start = Date.now();

    // Ordenar por fechaCreacion descendente (comportamiento tipico de feed)
    const sortedPosts = [...posts].sort(
      (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );

    const end = Date.now();
    const duration = end - start;

    expect(sortedPosts).toHaveLength(postCount);
    expect(sortedPosts[0].id).toBeDefined();
    // Validar orden descendente
    for (let i = 0; i < sortedPosts.length - 1; i++) {
      const current = new Date(sortedPosts[i].fechaCreacion).getTime();
      const next = new Date(sortedPosts[i + 1].fechaCreacion).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }

    // Asercion de tiempo (< 10ms)
    expect(duration).toBeLessThan(10);
  });

  // 2. Estres de Chat con 50+ conversaciones en MensajesContext
  it("procesa y fusiona el delta de 50+ conversaciones mediante Last-Write-Wins en menos de 100ms", () => {
    const conversationCount = 60;
    const localConversations: Conversacion[] = [];
    const remoteConversations: Conversacion[] = [];

    const baseTime = Date.now();

    // Generar conversaciones locales
    for (let i = 0; i < conversationCount; i++) {
      localConversations.push({
        id: i + 1,
        participantes: ["user_1", `user_${i + 2}`],
        contactoId: i + 2,
        contactoNombre: `Contacto ${i}`,
        contactoColor: "#1676D2",
        contactoEnLinea: i % 2 === 0,
        mensajesNoLeidos: 0,
        fechaCreacion: new Date(baseTime).toISOString(),
        fechaModificacion: new Date(baseTime).toISOString(),
        syncStatus: "synced",
      });
    }

    // Generar actualizaciones remotas
    for (let i = 0; i < conversationCount; i++) {
      // 50% actualizadas (fechaModificacion mas reciente), 50% igual
      const isUpdated = i % 2 === 0;
      const modTime = isUpdated ? baseTime + 1000 * 60 * 10 : baseTime;

      remoteConversations.push({
        id: i + 1,
        participantes: ["user_1", `user_${i + 2}`],
        contactoId: i + 2,
        contactoNombre: `Contacto ${i} Modificado`,
        contactoColor: "#1676D2",
        contactoEnLinea: !isUpdated,
        ultimoMensaje: isUpdated ? "Ultimo mensaje remoto" : undefined,
        mensajesNoLeidos: isUpdated ? 1 : 0,
        fechaCreacion: new Date(baseTime).toISOString(),
        fechaModificacion: new Date(modTime).toISOString(),
        syncStatus: "synced",
      });
    }

    // Agregar conversaciones adicionales unicamente en el servidor
    for (let i = conversationCount; i < conversationCount + 20; i++) {
      remoteConversations.push({
        id: i + 1,
        participantes: ["user_1", `user_${i + 2}`],
        contactoId: i + 2,
        contactoNombre: `Nuevo Contacto Remoto ${i}`,
        contactoColor: "#4CAF50",
        contactoEnLinea: true,
        mensajesNoLeidos: 2,
        fechaCreacion: new Date(baseTime).toISOString(),
        fechaModificacion: new Date(baseTime).toISOString(),
        syncStatus: "synced",
      });
    }

    const start = Date.now();

    // Fusionar listas
    const merged = mergeWithLocal(localConversations, remoteConversations);

    const end = Date.now();
    const duration = end - start;

    expect(merged.length).toBe(conversationCount + 20);

    // Validar fusion Last-Write-Wins
    for (const item of merged) {
      const id = item.id;
      if (id <= conversationCount) {
        const isUpdated = (id - 1) % 2 === 0;
        if (isUpdated) {
          expect(item.contactoNombre).toBe(`Contacto ${id - 1} Modificado`);
          expect(item.ultimoMensaje).toBe("Ultimo mensaje remoto");
        } else {
          expect(item.contactoNombre).toBe(`Contacto ${id - 1}`);
          expect(item.ultimoMensaje).toBeUndefined();
        }
      } else {
        expect(item.contactoNombre).toContain("Nuevo Contacto Remoto");
      }
    }

    // Asercion de tiempo (< 100ms)
    expect(duration).toBeLessThan(100);
  });

  // 3. Estres de Dashboard con 20+ grupos simultaneos
  it("calcula las calificaciones y KPIs agregados de 20+ grupos (30 alumnos c/u) en menos de 50ms", () => {
    const groupCount = 25;
    const studentsPerGroup = 30;

    interface GrupoKPI {
      grupoId: number;
      aprobados: number;
      reprobados: number;
      promedio: number;
    }

    const gruposKPIs: GrupoKPI[] = [];

    // Generar 25 grupos
    const allAlumnos: Alumno[][] = [];
    const allCalificaciones: Calificacion[][] = [];

    for (let g = 0; g < groupCount; g++) {
      const grupoId = g + 1;
      const alumnos: Alumno[] = [];
      const calificaciones: Calificacion[] = [];

      for (let s = 0; s < studentsPerGroup; s++) {
        const alumnoId = g * studentsPerGroup + s + 1;
        alumnos.push({
          id: alumnoId,
          nombre: `Alumno ${s}`,
          apellidos: `Apellido ${g}`,
          numeroControl: `N${grupoId}_${s}`,
          grupoId: grupoId,
          carrera: "ISC",
          fechaIngreso: new Date(),
          estado: "activo",
        });

        calificaciones.push({
          id: alumnoId,
          alumnoId: alumnoId,
          grupoId: grupoId,
          periodo: "Enero-Junio 2026",
          parcial1: 70 + (s % 31), // 70 a 100
          parcial2: 60 + (s % 41), // 60 a 100
          parcial3: 50 + (s % 51), // 50 a 100
          promedio: 0,
          estado: "pendiente",
          fechaRegistro: new Date(),
        });
      }

      allAlumnos.push(alumnos);
      allCalificaciones.push(calificaciones);
    }

    const start = Date.now();

    // Procesar los KPIs de todos los grupos simultaneamente
    for (let g = 0; g < groupCount; g++) {
      const grupoId = g + 1;
      const alumnos = allAlumnos[g];
      const calificaciones = allCalificaciones[g];

      const promediosAlumnos = calcularPromediosAlumnos(calificaciones, alumnos);
      const promedioGrupal = calcularPromedioGrupal(promediosAlumnos);

      gruposKPIs.push({
        grupoId: grupoId,
        aprobados: promedioGrupal.aprobados,
        reprobados: promedioGrupal.reprobados,
        promedio: promedioGrupal.promedioGeneral,
      });
    }

    const end = Date.now();
    const duration = end - start;

    expect(gruposKPIs).toHaveLength(groupCount);
    expect(gruposKPIs[0].promedio).toBeGreaterThan(0);

    // Asercion de tiempo (< 50ms)
    expect(duration).toBeLessThan(50);
  });
});
