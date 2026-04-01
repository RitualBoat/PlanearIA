import { useState, useCallback } from "react";
import type { Alumno } from "../../types";

export interface UseRemoveStudentModalResult {
  removeStudentModalVisible: boolean;
  studentToRemove: Alumno | null;
  isUnlinkingStudent: boolean;
  removeStudentError: string;
  openRemoveStudentModal: (student: Alumno) => void;
  closeRemoveStudentModal: () => void;
  confirmRemoveStudentFromGroup: () => Promise<void>;
}

export const useRemoveStudentModal = (
  allAlumnos: Alumno[],
  persistAlumnosAndCount: (nextAlumnos: Alumno[]) => Promise<void>
): UseRemoveStudentModalResult => {
  const [removeStudentModalVisible, setRemoveStudentModalVisible] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<Alumno | null>(null);
  const [isUnlinkingStudent, setIsUnlinkingStudent] = useState(false);
  const [removeStudentError, setRemoveStudentError] = useState("");

  const openRemoveStudentModal = useCallback((student: Alumno) => {
    setStudentToRemove(student);
    setRemoveStudentError("");
    setRemoveStudentModalVisible(true);
  }, []);

  const closeRemoveStudentModal = useCallback(() => {
    if (isUnlinkingStudent) return;
    setRemoveStudentModalVisible(false);
    setStudentToRemove(null);
    setRemoveStudentError("");
  }, [isUnlinkingStudent]);

  const confirmRemoveStudentFromGroup = useCallback(async () => {
    if (!studentToRemove) {
      setRemoveStudentError("No se encontró el alumno para desvincular.");
      return;
    }

    try {
      setIsUnlinkingStudent(true);
      setRemoveStudentError("");

      const nextAlumnos = allAlumnos.map((alumno) =>
        alumno.id === studentToRemove.id ? { ...alumno, grupoId: undefined } : alumno
      );

      await persistAlumnosAndCount(nextAlumnos);
      setRemoveStudentModalVisible(false);
      setStudentToRemove(null);
    } catch {
      setRemoveStudentError("No se pudo quitar al alumno del grupo. Intenta nuevamente.");
    } finally {
      setIsUnlinkingStudent(false);
    }
  }, [allAlumnos, persistAlumnosAndCount, studentToRemove]);

  return {
    removeStudentModalVisible,
    studentToRemove,
    isUnlinkingStudent,
    removeStudentError,
    openRemoveStudentModal,
    closeRemoveStudentModal,
    confirmRemoveStudentFromGroup,
  };
};
