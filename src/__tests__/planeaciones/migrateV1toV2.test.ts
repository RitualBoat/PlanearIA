import { migrateV1toV2 } from "../../utils/migrateV1toV2";
import { NivelAcademico as NivelV1 } from "../../../types/planeacion";
import { NivelAcademico as NivelV2 } from "../../../types/planeacionV2";

describe("migrateV1toV2", () => {
  const mockUserId = "user_123456";

  it("should migrate a basic Primaria lesson plan", () => {
    const v1Plan = {
      id: "plan_primaria",
      nivelAcademico: NivelV1.PRIMARIA as const,
      asignatura: "Español",
      grado: "3°",
      grupo: "A",
      fecha: "2026-05-27T00:00:00.000Z",
      horaInicio: "08:00",
      duracionTotal: 50,
      unidadTematica: "Fábulas y leyendas",
      temaSesion: "Identificar moralejas",
      aprendizajesEsperados: ["Reconoce la moraleja en fábulas", "Identifica características de la fábula"],
      actividades: [
        { tipo: "inicio" as const, descripcion: "Leer en plenaria la fábula del león", duracion: 10 },
        { tipo: "desarrollo" as const, descripcion: "Contestar preguntas en el cuaderno sobre el texto", duracion: 30 },
        { tipo: "cierre" as const, descripcion: "Discutir la moraleja grupalmente", duracion: 10 }
      ],
      recursos: ["Libro de texto", "Cuaderno"],
      evaluacion: "Lista de cotejo sobre la fábula",
      evidencias: ["Preguntas contestadas en cuaderno"],
      observaciones: "Ajuste razonable para alumno con USAER",
      fechaCreacion: "2026-05-27T10:00:00.000Z",
      fechaModificacion: "2026-05-27T12:00:00.000Z",
      campoFormativo: "Lenguajes"
    };

    const v2Plan = migrateV1toV2(v1Plan, mockUserId);

    expect(v2Plan.id).toBe(v1Plan.id);
    expect(v2Plan.version).toBe(2);
    expect(v2Plan.userId).toBe(mockUserId);
    expect(v2Plan.nivelAcademico).toBe(NivelV2.PRIMARIA);

    // Datos Generales
    expect(v2Plan.datosGenerales.asignatura).toBe("Español");
    expect(v2Plan.datosGenerales.grado).toBe("3°");
    expect(v2Plan.datosGenerales.grupos).toEqual(["A"]);

    // Elementos Curriculares
    expect(v2Plan.elementosCurriculares.proposito).toContain("Reconoce la moraleja");
    expect(v2Plan.elementosCurriculares.contenido).toBe("Fábulas y leyendas");
    expect(v2Plan.elementosCurriculares.pda).toBe("Identificar moralejas");
    expect(v2Plan.elementosCurriculares.campoFormativo).toBe("Lenguajes");

    // Sesión
    expect(v2Plan.sesiones.length).toBe(1);
    expect(v2Plan.sesiones[0].numero).toBe(1);
    expect(v2Plan.sesiones[0].inicio).toContain("Leer en plenaria");
    expect(v2Plan.sesiones[0].desarrollo).toContain("Contestar preguntas");
    expect(v2Plan.sesiones[0].cierre).toContain("Discutir la moraleja");

    // Observaciones
    expect(v2Plan.observaciones.length).toBe(1);
    expect(v2Plan.observaciones[0].texto).toBe("Ajuste razonable para alumno con USAER");
  });

  it("should migrate a university lesson plan with detailed weeks", () => {
    const v1Plan = {
      id: "plan_universidad",
      nivelAcademico: NivelV1.UNIVERSIDAD as const,
      asignatura: "Matemáticas Discretas I",
      grado: "1er Semestre",
      grupo: "A",
      fecha: "2026-05-27T00:00:00.000Z",
      horaInicio: "10:00",
      duracionTotal: 120,
      unidadTematica: "Lógica Matemática",
      temaSesion: "Tablas de verdad",
      aprendizajesEsperados: ["Evalúa proposiciones lógicas"],
      actividades: [],
      recursos: ["Diapositivas", "Pintarrón"],
      evaluacion: "Examen parcial 1",
      evidencias: ["Examen resuelto"],
      observaciones: "Ninguna",
      fechaCreacion: "2026-05-27T10:00:00.000Z",
      fechaModificacion: "2026-05-27T12:00:00.000Z",
      competenciasProfesionales: ["Aplica lógica matemática en computación"],
      objetivosAprendizaje: ["Evalúa proposiciones lógicas usando tablas de verdad"],
      bibliografia: ["Discrete Mathematics and its Applications - Kenneth H. Rosen"],
      modalidad: "presencial" as const,
      semanas: [
        {
          numero: 1,
          unidadTematica: "Unidad I: Lógica",
          temas: ["Proposiciones", "Conectores"],
          objetivos: ["Comprender proposiciones simples y compuestas"],
          actividadesPresenciales: [
            { metodologia: "Clase magistral", descripcion: "Explicación de proposiciones lógicas", duracion: 60 },
            { metodologia: "Trabajo en equipo", descripcion: "Resolución de ejercicios prácticos", duracion: 60 }
          ],
          actividadesAutonomas: ["Estudiar apuntes", "Resolver problemas de tarea"],
          recursos: ["Libro de texto"],
          entregables: "Tarea 1: Ejercicios lógicos",
          evaluacion: "Examen 1"
        }
      ]
    };

    const v2Plan = migrateV1toV2(v1Plan, mockUserId);

    expect(v2Plan.nivelAcademico).toBe(NivelV2.UNIVERSIDAD);
    expect(v2Plan.sesiones.length).toBe(1);
    
    const sesion1 = v2Plan.sesiones[0];
    expect(sesion1.numero).toBe(1);
    expect(sesion1.inicio).toContain("Comprender proposiciones");
    expect(sesion1.desarrollo).toContain("Explicación de proposiciones");
    expect(sesion1.cierre).toContain("Resolver problemas de tarea");
    expect(sesion1.tarea).toBe("Tarea 1: Ejercicios lógicos");
  });
});
