import { useCallback, useMemo, useState } from "react";
import { useAlumnos } from "../context/AlumnosContext";
import type { Alumno } from "../../types";

type FormErrors = {
  nombre?: string;
  apellidos?: string;
  numeroControl?: string;
  carrera?: string;
  email?: string;
};

export type CarreraOption = "ISC" | "IGE" | "ARQ" | "ITICS";

const isValidEmail = (value: string): boolean => {
  if (!value.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

export interface CrearAlumnoViewModel {
  nombre: string;
  apellidos: string;
  numeroControl: string;
  carrera: CarreraOption | "";
  escuela: string;
  especialidad: string;
  email: string;
  telefono: string;
  errors: FormErrors;
  isSaving: boolean;
  lastSyncOk: boolean | null;
  canSubmit: boolean;
  setNombre: (value: string) => void;
  setApellidos: (value: string) => void;
  setNumeroControl: (value: string) => void;
  setCarrera: (value: CarreraOption | "") => void;
  setEscuela: (value: string) => void;
  setEspecialidad: (value: string) => void;
  setEmail: (value: string) => void;
  setTelefono: (value: string) => void;
  cargarFormularioDesdeAlumno: (alumno: Alumno) => void;
  guardarAlumno: (options?: {
    modo?: "crear" | "editar";
    alumnoId?: number;
    grupoId?: number;
    originalAlumno?: Alumno;
  }) => Promise<{ ok: boolean; syncOk: boolean | null; alumnoId?: number }>;
  resetForm: () => void;
}

export const useCrearAlumnoViewModel = (): CrearAlumnoViewModel => {
  const { agregarAlumno, actualizarAlumno } = useAlumnos();

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [numeroControl, setNumeroControl] = useState("");
  const [carrera, setCarrera] = useState<CarreraOption | "">("");
  const [escuela, setEscuela] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncOk, setLastSyncOk] = useState<boolean | null>(null);

  const canSubmit = useMemo(() => {
    return Boolean(nombre.trim() && apellidos.trim() && numeroControl.trim() && carrera);
  }, [apellidos, carrera, nombre, numeroControl]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!nombre.trim()) nextErrors.nombre = "El nombre es requerido";
    if (!apellidos.trim()) nextErrors.apellidos = "Los apellidos son requeridos";
    if (!numeroControl.trim()) nextErrors.numeroControl = "El número de control es requerido";
    if (!carrera) nextErrors.carrera = "Selecciona una carrera";
    if (!isValidEmail(email)) nextErrors.email = "Ingresa un email válido";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = useCallback(() => {
    setNombre("");
    setApellidos("");
    setNumeroControl("");
    setCarrera("");
    setEscuela("");
    setEspecialidad("");
    setEmail("");
    setTelefono("");
    setErrors({});
    setLastSyncOk(null);
  }, []);

  const cargarFormularioDesdeAlumno = useCallback((alumno: Alumno) => {
    setNombre(alumno.nombre || "");
    setApellidos(alumno.apellidos || "");
    setNumeroControl(alumno.numeroControl || "");
    setCarrera((alumno.carrera as CarreraOption) || "");
    setEscuela((alumno as Alumno & { escuela?: string }).escuela || "");
    setEspecialidad((alumno as Alumno & { especialidad?: string }).especialidad || "");
    setEmail(alumno.email || "");
    setTelefono(alumno.telefono || "");
    setErrors({});
    setLastSyncOk(null);
  }, []);

  const guardarAlumno = async (options?: {
    modo?: "crear" | "editar";
    alumnoId?: number;
    grupoId?: number;
    originalAlumno?: Alumno;
  }): Promise<{ ok: boolean; syncOk: boolean | null; alumnoId?: number }> => {
    if (!validate()) {
      return { ok: false, syncOk: lastSyncOk };
    }

    try {
      setIsSaving(true);

      if (options?.modo === "editar" && options.alumnoId) {
        const result = await actualizarAlumno(options.alumnoId, {
          nombre: nombre.trim(),
          apellidos: apellidos.trim(),
          numeroControl: numeroControl.trim(),
          carrera: carrera as Alumno["carrera"],
          escuela: escuela.trim() || undefined,
          especialidad: especialidad.trim() || undefined,
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          grupoId: options.originalAlumno?.grupoId ?? options.grupoId,
          fechaIngreso: options.originalAlumno?.fechaIngreso || new Date(),
          estado: options.originalAlumno?.estado || "activo",
        });
        setLastSyncOk(result.syncOk);
        return { ok: true, syncOk: result.syncOk, alumnoId: options.alumnoId };
      } else {
        const result = await agregarAlumno({
          nombre: nombre.trim(),
          apellidos: apellidos.trim(),
          numeroControl: numeroControl.trim(),
          carrera: carrera as Alumno["carrera"],
          escuela: escuela.trim() || undefined,
          especialidad: especialidad.trim() || undefined,
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          grupoId: options?.grupoId,
          fechaIngreso: new Date(),
          estado: "activo",
        });
        setLastSyncOk(result.syncOk);
        return { ok: true, syncOk: result.syncOk, alumnoId: result.alumno.id };
      }
    } catch {
      setLastSyncOk(false);
      return { ok: false, syncOk: false };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    nombre,
    apellidos,
    numeroControl,
    carrera,
    escuela,
    especialidad,
    email,
    telefono,
    errors,
    isSaving,
    lastSyncOk,
    canSubmit,
    setNombre,
    setApellidos,
    setNumeroControl,
    setCarrera,
    setEscuela,
    setEspecialidad,
    setEmail,
    setTelefono,
    cargarFormularioDesdeAlumno,
    guardarAlumno,
    resetForm,
  };
};
