import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import type { ClasesStackParamList } from "../types";

import ClassroomHomeScreen from "../../screens/classroom/ClassroomHomeScreen";
import ListaGruposScreen from "../../screens/grupos/ListaGruposScreen";
import CrearGrupoScreen from "../../screens/grupos/CrearGrupoScreen";
import DetalleGrupoScreen from "../../screens/grupos/DetalleGrupoScreen";
import ReportesGrupoScreen from "../../screens/grupos/ReportesGrupoScreen";
import ImportarGruposScreen from "../../screens/grupos/ImportarGruposScreen";
import ClassroomGroupScreen from "../../screens/classroom/ClassroomGroupScreen";
import DetalleActividadClassroomScreen from "../../screens/classroom/DetalleActividadClassroomScreen";
import AgregarContenidoClassroomScreen from "../../screens/classroom/AgregarContenidoClassroomScreen";
import DetalleRecursoClassroomScreen from "../../screens/classroom/DetalleRecursoClassroomScreen";
import CrearTareaGrupoScreen from "../../screens/grupos/tareas/CrearTareaGrupoScreen";
import AsignarRecursoScreen from "../../screens/grupos/tareas/AsignarRecursoScreen";
import DetalleTareaScreen from "../../screens/grupos/tareas/DetalleTareaScreen";
import CalificarEntregasScreen from "../../screens/grupos/tareas/CalificarEntregasScreen";
import ListaEntregablesScreen from "../../screens/tareas/ListaEntregablesScreen";
import RegistrarAsistenciaScreen from "../../screens/asistencia/RegistrarAsistenciaScreen";
import HistorialAsistenciaScreen from "../../screens/asistencia/HistorialAsistenciaScreen";
import CapturarCalificacionesScreen from "../../screens/calificaciones/CapturarCalificacionesScreen";
import PromediosCalificacionesScreen from "../../screens/calificaciones/PromediosCalificacionesScreen";
import CrearAlumnoScreen from "../../screens/alumnos/CrearAlumnoScreen";
import ListaAlumnosScreen from "../../screens/alumnos/ListaAlumnosScreen";
import ImportarAlumnosScreen from "../../screens/alumnos/ImportarAlumnosScreen";
import ExportarAlumnosScreen from "../../screens/alumnos/ExportarAlumnosScreen";
import DetalleAlumnoScreen from "../../screens/alumnos/DetalleAlumnoScreen";
import NotasAlumnoScreen from "../../screens/alumnos/NotasAlumnoScreen";
import ReportesAlumnoScreen from "../../screens/alumnos/ReportesAlumnoScreen";

const Stack = createStackNavigator<ClasesStackParamList>();

const SCREENS: Record<keyof ClasesStackParamList, React.ComponentType<any>> = {
  ClassroomHome: ClassroomHomeScreen,
  ListaGrupos: ListaGruposScreen,
  CrearGrupo: CrearGrupoScreen,
  DetalleGrupo: DetalleGrupoScreen,
  ClassroomGroup: ClassroomGroupScreen,
  ReportesGrupo: ReportesGrupoScreen,
  ImportarGrupos: ImportarGruposScreen,
  CrearTareaGrupo: CrearTareaGrupoScreen,
  AsignarRecurso: AsignarRecursoScreen,
  DetalleTarea: DetalleTareaScreen,
  CalificarEntregas: CalificarEntregasScreen,
  DetalleActividadClassroom: DetalleActividadClassroomScreen,
  AgregarContenidoClassroom: AgregarContenidoClassroomScreen,
  DetalleRecursoClassroom: DetalleRecursoClassroomScreen,
  ListaEntregables: ListaEntregablesScreen,
  RegistrarAsistencia: RegistrarAsistenciaScreen,
  HistorialAsistencia: HistorialAsistenciaScreen,
  CapturarCalificaciones: CapturarCalificacionesScreen,
  PromediosCalificaciones: PromediosCalificacionesScreen,
  CrearAlumno: CrearAlumnoScreen,
  ListaAlumnos: ListaAlumnosScreen,
  ImportarAlumnos: ImportarAlumnosScreen,
  ExportarAlumnos: ExportarAlumnosScreen,
  DetalleAlumno: DetalleAlumnoScreen,
  NotasAlumno: NotasAlumnoScreen,
  ReportesAlumno: ReportesAlumnoScreen,
};

const ROUTE_NAMES = Object.keys(SCREENS) as Array<keyof ClasesStackParamList>;

/** Hub Clases: Classroom como landing y toda la organizacion academica. */
const ClasesStack: React.FC = () => (
  <Stack.Navigator
    id={undefined}
    initialRouteName="ClassroomHome"
    screenOptions={{ headerShown: false }}
  >
    {ROUTE_NAMES.map((name) => (
      <Stack.Screen key={name} name={name} component={SCREENS[name]} />
    ))}
  </Stack.Navigator>
);

export default ClasesStack;
