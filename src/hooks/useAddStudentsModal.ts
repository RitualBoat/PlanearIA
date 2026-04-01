import { useState, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Alumno } from "../../types";

export interface UseAddStudentsModalResult {
  addStudentsModalVisible: boolean;
  createStudentMode: boolean;
  studentSearchQuery: string;
  selectedStudentIds: number[];
  availableStudents: Alumno[];
  isLinkingStudents: boolean;
  addStudentsError: string;
  addStudentsSuccessVisible: boolean;
  createdAndAddedCount: number;
  newStudentNombre: string;
  newStudentApellidos: string;
  newStudentNumeroControl: string;
  newStudentCarrera: string;
  setStudentSearchQuery: (value: string) => void;
  openAddStudentsModal: () => void;
  closeAddStudentsModal: () => void;
  openCreateStudentMode: () => void;
  closeCreateStudentMode: () => void;
  toggleStudentSelection: (studentId: number) => void;
  confirmAddSelectedStudents: () => Promise<void>;
  setNewStudentNombre: (value: string) => void;
  setNewStudentApellidos: (value: string) => void;
  setNewStudentNumeroControl: (value: string) => void;
  setNewStudentCarrera: (value: string) => void;
  createAndAddStudent: () => Promise<void>;
  closeAddStudentsSuccess: () => void;
}

export const useAddStudentsModal = (
  grupoId: number,
  allAlumnos: Alumno[],
  persistAlumnosAndCount: (nextAlumnos: Alumno[]) => Promise<void>
): UseAddStudentsModalResult => {
  const [addStudentsModalVisible, setAddStudentsModalVisible] = useState(false);
  const [createStudentMode, setCreateStudentMode] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [isLinkingStudents, setIsLinkingStudents] = useState(false);
  const [addStudentsError, setAddStudentsError] = useState("");
  const [addStudentsSuccessVisible, setAddStudentsSuccessVisible] = useState(false);
  const [createdAndAddedCount, setCreatedAndAddedCount] = useState(0);
  const [newStudentNombre, setNewStudentNombre] = useState("");
  const [newStudentApellidos, setNewStudentApellidos] = useState("");
  const [newStudentNumeroControl, setNewStudentNumeroControl] = useState("");
  const [newStudentCarrera, setNewStudentCarrera] = useState("");

  const availableStudents = useMemo(() => {
    const query = studentSearchQuery.trim().toLowerCase();
    return allAlumnos
      .filter((alumno) => alumno.grupoId !== grupoId)
      .filter((alumno) => {
        if (!query) return true;
        return (
          `${alumno.nombre} ${alumno.apellidos}`.toLowerCase().includes(query) ||
          alumno.numeroControl.toLowerCase().includes(query)
        );
      });
  }, [allAlumnos, grupoId, studentSearchQuery]);

  const openAddStudentsModal = useCallback(() => {
    setAddStudentsError("");
    setStudentSearchQuery("");
    setSelectedStudentIds([]);
    setCreateStudentMode(false);
    setAddStudentsModalVisible(true);
  }, []);

  const closeAddStudentsModal = useCallback(() => {
    if (isLinkingStudents) return;
    setAddStudentsModalVisible(false);
    setCreateStudentMode(false);
    setAddStudentsError("");
  }, [isLinkingStudents]);

  const openCreateStudentMode = useCallback(() => {
    setCreateStudentMode(true);
    setAddStudentsError("");
  }, []);

  const closeCreateStudentMode = useCallback(() => {
    if (isLinkingStudents) return;
    setCreateStudentMode(false);
    setAddStudentsError("");
  }, [isLinkingStudents]);

  const toggleStudentSelection = useCallback((studentId: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
    setAddStudentsError("");
  }, []);

  const confirmAddSelectedStudents = useCallback(async () => {
    if (selectedStudentIds.length === 0) {
      setAddStudentsError("Selecciona al menos un alumno para agregar.");
      return;
    }

    try {
      setIsLinkingStudents(true);
      setAddStudentsError("");
      const nextAlumnos = allAlumnos.map((alumno) =>
        selectedStudentIds.includes(alumno.id) ? { ...alumno, grupoId } : alumno
      );

      await persistAlumnosAndCount(nextAlumnos);
      setAddStudentsModalVisible(false);
      setAddStudentsSuccessVisible(true);
      setSelectedStudentIds([]);
    } catch {
      setAddStudentsError("No se pudieron agregar los alumnos. Intenta nuevamente.");
    } finally {
      setIsLinkingStudents(false);
    }
  }, [allAlumnos, grupoId, persistAlumnosAndCount, selectedStudentIds]);

  const createAndAddStudent = useCallback(async () => {
    if (
      !newStudentNombre.trim() ||
      !newStudentApellidos.trim() ||
      !newStudentNumeroControl.trim()
    ) {
      setAddStudentsError("Completa nombre, apellidos y número de control.");
      return;
    }

    try {
      setIsLinkingStudents(true);
      setAddStudentsError("");
      const maxId = allAlumnos.reduce((max, alumno) => Math.max(max, alumno.id), 0);
      const nuevoAlumno: Alumno = {
        id: maxId + 1,
        nombre: newStudentNombre.trim(),
        apellidos: newStudentApellidos.trim(),
        numeroControl: newStudentNumeroControl.trim(),
        grupoId,
        carrera: (newStudentCarrera || "ISC") as Alumno["carrera"],
        fechaIngreso: new Date(),
        estado: "activo",
      };

      const nextAlumnos = [...allAlumnos, nuevoAlumno];
      await persistAlumnosAndCount(nextAlumnos);

      setNewStudentNombre("");
      setNewStudentApellidos("");
      setNewStudentNumeroControl("");
      setNewStudentCarrera("");
      setCreateStudentMode(false);
      setAddStudentsModalVisible(false);
      setAddStudentsSuccessVisible(true);
    } catch {
      setAddStudentsError("No se pudo crear y agregar el alumno.");
    } finally {
      setIsLinkingStudents(false);
    }
  }, [
    allAlumnos,
    grupoId,
    newStudentApellidos,
    newStudentCarrera,
    newStudentNombre,
    newStudentNumeroControl,
    persistAlumnosAndCount,
  ]);

  const closeAddStudentsSuccess = useCallback(() => {
    setAddStudentsSuccessVisible(false);
  }, []);

  return {
    addStudentsModalVisible,
    createStudentMode,
    studentSearchQuery,
    selectedStudentIds,
    availableStudents,
    isLinkingStudents,
    addStudentsError,
    addStudentsSuccessVisible,
    createdAndAddedCount,
    newStudentNombre,
    newStudentApellidos,
    newStudentNumeroControl,
    newStudentCarrera,
    setStudentSearchQuery,
    openAddStudentsModal,
    closeAddStudentsModal,
    openCreateStudentMode,
    closeCreateStudentMode,
    toggleStudentSelection,
    confirmAddSelectedStudents,
    setNewStudentNombre,
    setNewStudentApellidos,
    setNewStudentNumeroControl,
    setNewStudentCarrera,
    createAndAddStudent,
    closeAddStudentsSuccess,
  };
};
