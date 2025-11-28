import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Planeacion,
  NivelAcademico,
  PlaneacionBase,
  FiltrosPlaneacion,
} from "../../types/planeacion";

/**
 * Interfaz para el contexto de planeaciones
 */
interface PlaneacionesContextData {
  planeaciones: Planeacion[];
  planeacionActual: Planeacion | null;
  agregarPlaneacion: (planeacion: Planeacion) => void;
  actualizarPlaneacion: (id: string, planeacion: Partial<Planeacion>) => void;
  eliminarPlaneacion: (id: string) => void;
  obtenerPlaneacion: (id: string) => Planeacion | undefined;
  clonarPlaneacion: (id: string) => void;
  filtrarPlaneaciones: (filtros: FiltrosPlaneacion) => Planeacion[];
  setPlaneacionActual: (planeacion: Planeacion | null) => void;
  limpiarPlaneaciones: () => void;
}

/**
 * Contexto de planeaciones
 */
const PlaneacionesContext = createContext<PlaneacionesContextData | undefined>(
  undefined
);

/**
 * Props del provider
 */
interface PlaneacionesProviderProps {
  children: ReactNode;
}

/**
 * Provider del contexto de planeaciones
 * Maneja el estado global de todas las planeaciones
 */
export const PlaneacionesProvider: React.FC<PlaneacionesProviderProps> = ({
  children,
}) => {
  const [planeaciones, setPlaneaciones] = useState<Planeacion[]>([]);
  const [planeacionActual, setPlaneacionActual] = useState<Planeacion | null>(
    null
  );

  /**
   * Agrega una nueva planeación
   */
  const agregarPlaneacion = (planeacion: Planeacion) => {
    setPlaneaciones((prev) => [...prev, planeacion]);
  };

  /**
   * Actualiza una planeación existente
   */
  const actualizarPlaneacion = (
    id: string,
    actualizacion: Partial<Planeacion>
  ) => {
    setPlaneaciones((prev) =>
      prev.map((p) =>
        p.id === id
          ? ({
              ...p,
              ...actualizacion,
              fechaModificacion: new Date().toISOString(),
            } as Planeacion)
          : p
      )
    );
  };

  /**
   * Elimina una planeación
   */
  const eliminarPlaneacion = (id: string) => {
    setPlaneaciones((prev) => prev.filter((p) => p.id !== id));
  };

  /**
   * Obtiene una planeación por ID
   */
  const obtenerPlaneacion = (id: string): Planeacion | undefined => {
    return planeaciones.find((p) => p.id === id);
  };

  /**
   * Clona una planeación existente
   */
  const clonarPlaneacion = (id: string) => {
    const planeacionOriginal = obtenerPlaneacion(id);
    if (planeacionOriginal) {
      const nuevaPlaneacion: Planeacion = {
        ...planeacionOriginal,
        id: Date.now().toString(),
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
        temaSesion: `${planeacionOriginal.temaSesion} (Copia)`,
      };
      agregarPlaneacion(nuevaPlaneacion);
    }
  };

  /**
   * Filtra planeaciones según criterios
   */
  const filtrarPlaneaciones = (filtros: FiltrosPlaneacion): Planeacion[] => {
    return planeaciones.filter((planeacion) => {
      if (
        filtros.nivelAcademico &&
        planeacion.nivelAcademico !== filtros.nivelAcademico
      ) {
        return false;
      }
      if (
        filtros.asignatura &&
        !planeacion.asignatura
          .toLowerCase()
          .includes(filtros.asignatura.toLowerCase())
      ) {
        return false;
      }
      if (filtros.grado && planeacion.grado !== filtros.grado) {
        return false;
      }
      if (filtros.fechaInicio && planeacion.fecha < filtros.fechaInicio) {
        return false;
      }
      if (filtros.fechaFin && planeacion.fecha > filtros.fechaFin) {
        return false;
      }
      return true;
    });
  };

  /**
   * Limpia todas las planeaciones (útil para testing)
   */
  const limpiarPlaneaciones = () => {
    setPlaneaciones([]);
    setPlaneacionActual(null);
  };

  const value: PlaneacionesContextData = {
    planeaciones,
    planeacionActual,
    agregarPlaneacion,
    actualizarPlaneacion,
    eliminarPlaneacion,
    obtenerPlaneacion,
    clonarPlaneacion,
    filtrarPlaneaciones,
    setPlaneacionActual,
    limpiarPlaneaciones,
  };

  return (
    <PlaneacionesContext.Provider value={value}>
      {children}
    </PlaneacionesContext.Provider>
  );
};

/**
 * Hook para usar el contexto de planeaciones
 */
export const usePlaneaciones = (): PlaneacionesContextData => {
  const context = useContext(PlaneacionesContext);
  if (context === undefined) {
    throw new Error(
      "usePlaneaciones debe ser usado dentro de PlaneacionesProvider"
    );
  }
  return context;
};
