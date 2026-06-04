import type { ID } from "./index";
import type { ClassroomSyncStatus } from "./classroom";

export interface UnidadClassroom {
  id: string;
  grupoId: ID;
  nombre: string;
  descripcion?: string;
  posicion: number;
  colapsada: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
  syncStatus?: ClassroomSyncStatus;
}
