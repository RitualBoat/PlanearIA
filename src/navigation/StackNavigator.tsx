import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigatorScreenParams } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../types";
import { NivelAcademico } from "../../types/planeacion";
import AppTabsNavigator, { MainTabParamList } from "./AppTabsNavigator";
import { useAuth } from "../context/AuthContext";

// Importación de pantallas de autenticación
import LoginScreen from "../screens/auth/LoginScreen";
import RegistroScreen from "../screens/auth/RegistroScreen";
import RecuperarContrasenaScreen from "../screens/auth/RecuperarContrasenaScreen";
import HomeScreen from "../screens/home/HomeScreen";

// Importación de pantallas de Planeaciones
import PlaneacionesScreen from "../screens/planeaciones/PlaneacionesScreen";
import CrearPlaneacionScreen from "../screens/planeaciones/CrearPlaneacionScreen";
import GenerarPlaneacionIAScreen from "../screens/planeaciones/GenerarPlaneacionIAScreen";
import ImportarPlaneacionScreen from "../screens/planeaciones/ImportarPlaneacionScreen";
import ExportarPlaneacionScreen from "../screens/planeaciones/ExportarPlaneacionScreen";
import EditorPlaneacionScreen from "../screens/planeaciones/EditorPlaneacionScreen";
import ListaPlaneacionesScreen from "../screens/planeaciones/ListaPlaneacionesScreen";

// Importación de pantallas de Grupos (NUEVA ARQUITECTURA)
import GruposScreen from "../screens/grupos/GruposScreen";
import ListaGruposScreen from "../screens/grupos/ListaGruposScreen";
import CrearGrupoScreen from "../screens/grupos/CrearGrupoScreen";
import DetalleGrupoScreen from "../screens/grupos/DetalleGrupoScreen";
import ReportesGrupoScreen from "../screens/grupos/ReportesGrupoScreen";
import ImportarGruposScreen from "../screens/grupos/ImportarGruposScreen";

// Pantallas de Tareas dentro de Grupos
import CrearTareaGrupoScreen from "../screens/grupos/tareas/CrearTareaGrupoScreen";
import AsignarRecursoScreen from "../screens/grupos/tareas/AsignarRecursoScreen";
import DetalleTareaScreen from "../screens/grupos/tareas/DetalleTareaScreen";
import CalificarEntregasScreen from "../screens/grupos/tareas/CalificarEntregasScreen";

// Pantalla de Entregables
import ListaEntregablesScreen from "../screens/tareas/ListaEntregablesScreen";

// Pantalla de Asistencia
import RegistrarAsistenciaScreen from "../screens/asistencia/RegistrarAsistenciaScreen";
import HistorialAsistenciaScreen from "../screens/asistencia/HistorialAsistenciaScreen";

// Pantalla de Calificaciones
import CapturarCalificacionesScreen from "../screens/calificaciones/CapturarCalificacionesScreen";
import PromediosCalificacionesScreen from "../screens/calificaciones/PromediosCalificacionesScreen";

// Pantallas de Alumnos
import CrearAlumnoScreen from "../screens/alumnos/CrearAlumnoScreen";
import ListaAlumnosScreen from "../screens/alumnos/ListaAlumnosScreen";
import DetalleAlumnoScreen from "../screens/alumnos/DetalleAlumnoScreen";
import ReportesAlumnoScreen from "../screens/alumnos/ReportesAlumnoScreen";
import NotasAlumnoScreen from "../screens/alumnos/NotasAlumnoScreen";
import ImportarAlumnosScreen from "../screens/alumnos/ImportarAlumnosScreen";
import ExportarAlumnosScreen from "../screens/alumnos/ExportarAlumnosScreen";

// Importación de pantallas de Biblioteca de Recursos
import RecursosDidacticosScreen from "../screens/biblioteca/RecursosDidacticosScreen";
import ListaRecursosScreen from "../screens/biblioteca/ListaRecursosScreen";
import CrearRecursoScreen from "../screens/biblioteca/CrearRecursoScreen";

// Importación de pantallas de Cuenta
import CuentaScreen from "../screens/cuenta/CuentaScreen";
import EditarPerfilScreen from "../screens/cuenta/EditarPerfilScreen";
import AdminRolesScreen from "../screens/cuenta/AdminRolesScreen";
import TerminosScreen from "../screens/cuenta/TerminosScreen";

// Importación de pantallas de Plantillas
import BibliotecaPlantillasScreen from "../screens/plantillas/BibliotecaPlantillasScreen";
import ListaPlantillasScreen from "../screens/plantillas/ListaPlantillasScreen";
import DetallePlantillaScreen from "../screens/plantillas/DetallePlantillaScreen";
import EditorPlantillaScreen from "../screens/plantillas/EditorPlantillaScreen";

// Importación de pantalla de Perfil
import PerfilScreen from "../screens/perfil/PerfilScreen";

// Importación de pantalla de Reto
import RetoResolucionScreen from "../screens/feed/RetoResolucionScreen";

// Importación de pantalla de Detalle de Post
import PostDetailScreen from "../screens/feed/PostDetailScreen";

// Importación de pantalla de Onboarding
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";

/**
 * Definición de los tipos para los parámetros de navegación
 * Esto ayuda a TypeScript a entender qué parámetros espera cada pantalla
 */
const ONBOARDING_KEY = "HAS_SEEN_ONBOARDING";

export type RootStackParamList = {
  // Onboarding
  Onboarding: undefined;

  // Autenticación
  Login: undefined;
  Registro: undefined;
  RecuperarContrasena: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Home: undefined;

  // Planeaciones (se mantiene igual)
  Planeaciones: undefined;
  CrearPlaneacion: undefined;
  GenerarPlaneacionIA: undefined;
  ImportarPlaneacion: undefined;
  ExportarPlaneacion: { planeacionId?: string };
  EditorPlaneacion: {
    nivel: NivelAcademico;
    modo: "crear" | "editar";
    planeacionId?: string;
  };
  ListaPlaneaciones: undefined;

  // NUEVA ARQUITECTURA: Grupos (reemplaza Alumnos y Calificaciones)
  Grupos: undefined;
  ListaGrupos: undefined;
  CrearGrupo:
    | undefined
    | {
        modo?: "crear" | "editar";
        grupoId?: number;
      };
  DetalleGrupo: {
    grupoId: number;
    grupoNombre: string;
  };
  ReportesGrupo: {
    grupoId: number;
    grupoNombre: string;
  };
  ImportarGrupos: undefined;

  // Tareas dentro de Grupos (v3.0)
  CrearTareaGrupo: { grupoId: number; entregableId?: number };
  AsignarRecurso: { grupoId: number };
  DetalleTarea: { tareaId: number; grupoId: number };
  CalificarEntregas: { tareaId: number; grupoId: number };

  // Entregables
  ListaEntregables: undefined;

  // Asistencia
  RegistrarAsistencia: { grupoId: number };
  HistorialAsistencia: { grupoId: number };

  // Calificaciones
  CapturarCalificaciones: { grupoId: number };
  PromediosCalificaciones: { grupoId: number };

  // Alumnos (reemplaza ruta deprecated Alumnos)
  CrearAlumno:
    | undefined
    | {
        modo?: "crear" | "editar";
        alumnoId?: number;
      };
  ListaAlumnos: undefined;
  ImportarAlumnos: undefined;
  ExportarAlumnos: undefined;
  DetalleAlumno: { alumnoId: number };
  NotasAlumno: {
    alumnoId: number;
    alumnoNombre?: string;
  };
  ReportesAlumno: {
    alumnoId: number;
    alumnoNombre?: string;
  };

  // NUEVA ARQUITECTURA: Recursos Didácticos (reemplaza Recursos)
  RecursosDidacticos: undefined;
  ListaRecursos: { filtroTipo?: string } | undefined;
  CrearRecurso: { recursoId?: number } | undefined;

  // Plantillas
  BibliotecaPlantillas: undefined;
  ListaPlantillas: { filtroCategoria?: string } | undefined;
  DetallePlantilla: { plantillaId: number };
  EditorPlantilla: { plantillaId?: number } | undefined;

  // Cuenta y Seguridad (se mantiene)
  Cuenta: undefined;
  EditarPerfil: undefined;
  AdminRoles: undefined;
  Terminos: { tab?: "terminos" | "privacidad" } | undefined;

  // Perfil
  Perfil: undefined;

  // Reto / Examen
  RetoResolucion:
    | {
        titulo?: string;
        descripcion?: string;
        tiempoLimite?: number;
        preguntas?: number;
      }
    | undefined;

  // Detalle de Post
  PostDetail: {
    postId: number;
    userId?: string;
  };
};
/**
 * Creamos el Stack Navigator con tipado
 */
const Stack = createStackNavigator<RootStackParamList>();
/**
 * Componente principal de navegación
 * Gestiona todas las rutas de la aplicación
 */
const StackNavigator: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => setHasSeenOnboarding(v === "true"));
  }, []);

  if (authLoading || hasSeenOnboarding === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const initialRoute: keyof RootStackParamList = !hasSeenOnboarding
    ? "Onboarding"
    : isAuthenticated
      ? "MainTabs"
      : "Login";

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.surface,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
      }}
    >
      {/* ========== ONBOARDING ========== */}
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          headerShown: false,
        }}
      />
      {/* ========== AUTENTICACIÓN ========== */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Iniciar Sesión",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Registro"
        component={RegistroScreen}
        options={{
          title: "Crear cuenta",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RecuperarContrasena"
        component={RecuperarContrasenaScreen}
        options={{
          title: "Recuperar contraseña",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MainTabs"
        component={AppTabsNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Sistema de planeación",
          headerLeft: () => null,
          headerShown: false,
        }}
      />
      {/* ========== PLANEACIONES ========== */}
      <Stack.Screen
        name="Planeaciones"
        component={PlaneacionesScreen}
        options={{
          title: "Planeaciones",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CrearPlaneacion"
        component={CrearPlaneacionScreen}
        options={{
          title: "Crear Planeación",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GenerarPlaneacionIA"
        component={GenerarPlaneacionIAScreen}
        options={{
          title: "Generar Planeación IA",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ImportarPlaneacion"
        component={ImportarPlaneacionScreen}
        options={{
          title: "Importar Planeación",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ExportarPlaneacion"
        component={ExportarPlaneacionScreen}
        options={{
          title: "Exportar Planeación",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditorPlaneacion"
        component={EditorPlaneacionScreen}
        options={{
          title: "Editor de Planeación",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ListaPlaneaciones"
        component={ListaPlaneacionesScreen}
        options={{
          title: "Mis Planeaciones",
          headerShown: false,
        }}
      />
      {/* ========== GRUPOS (NUEVA ARQUITECTURA) ========== */}
      <Stack.Screen
        name="Grupos"
        component={GruposScreen}
        options={{
          title: "Grupos",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ListaGrupos"
        component={ListaGruposScreen}
        options={{
          title: "Mis Grupos",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CrearGrupo"
        component={CrearGrupoScreen}
        options={{
          title: "Crear Grupo",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DetalleGrupo"
        component={DetalleGrupoScreen}
        options={{
          title: "Detalle del Grupo",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ReportesGrupo"
        component={ReportesGrupoScreen}
        options={{
          title: "Reportes del Grupo",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ImportarGrupos"
        component={ImportarGruposScreen}
        options={{
          title: "Importar Grupos",
          headerShown: false,
        }}
      />
      {/* ========== TAREAS EN GRUPOS (NUEVA ARQUITECTURA v3.0) ========== */}
      <Stack.Screen
        name="CrearTareaGrupo"
        component={CrearTareaGrupoScreen}
        options={{
          title: "Crear Tarea",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AsignarRecurso"
        component={AsignarRecursoScreen}
        options={{
          title: "Asignar Recurso",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DetalleTarea"
        component={DetalleTareaScreen}
        options={{
          title: "Detalle de Tarea",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CalificarEntregas"
        component={CalificarEntregasScreen}
        options={{
          title: "Calificar Entregas",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ListaEntregables"
        component={ListaEntregablesScreen}
        options={{
          title: "Entregables",
          headerShown: false,
        }}
      />
      {/* ========== ASISTENCIA ========== */}
      <Stack.Screen
        name="RegistrarAsistencia"
        component={RegistrarAsistenciaScreen}
        options={{
          title: "Registrar Asistencia",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HistorialAsistencia"
        component={HistorialAsistenciaScreen}
        options={{
          title: "Historial de Asistencia",
          headerShown: false,
        }}
      />
      {/* ========== CALIFICACIONES ========== */}
      <Stack.Screen
        name="CapturarCalificaciones"
        component={CapturarCalificacionesScreen}
        options={{
          title: "Registro de Calificaciones",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PromediosCalificaciones"
        component={PromediosCalificacionesScreen}
        options={{
          title: "Promedios del Grupo",
          headerShown: false,
        }}
      />
      {/* ========== ALUMNOS ========== */}
      <Stack.Screen
        name="CrearAlumno"
        component={CrearAlumnoScreen}
        options={{
          title: "Crear Alumno",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ListaAlumnos"
        component={ListaAlumnosScreen}
        options={{
          title: "Lista de Alumnos",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ImportarAlumnos"
        component={ImportarAlumnosScreen}
        options={{
          title: "Importar Alumnos",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ExportarAlumnos"
        component={ExportarAlumnosScreen}
        options={{
          title: "Exportar Alumnos",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DetalleAlumno"
        component={DetalleAlumnoScreen}
        options={{
          title: "Detalle de Alumno",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="NotasAlumno"
        component={NotasAlumnoScreen}
        options={{
          title: "Notas Personales",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ReportesAlumno"
        component={ReportesAlumnoScreen}
        options={{
          title: "Reporte de Alumno",
          headerShown: false,
        }}
      />
      {/* ========== RECURSOS DIDÁCTICOS (NUEVA ARQUITECTURA) ========== */}
      <Stack.Screen
        name="RecursosDidacticos"
        component={RecursosDidacticosScreen}
        options={{
          title: "Recursos Didácticos",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ListaRecursos"
        component={ListaRecursosScreen}
        options={{
          title: "Mis Recursos",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CrearRecurso"
        component={CrearRecursoScreen}
        options={{
          title: "Crear Recurso",
          headerShown: false,
        }}
      />
      {/* ========== PLANTILLAS ========== */}
      <Stack.Screen
        name="BibliotecaPlantillas"
        component={BibliotecaPlantillasScreen}
        options={{
          title: "Biblioteca de Plantillas",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ListaPlantillas"
        component={ListaPlantillasScreen}
        options={{
          title: "Lista de Plantillas",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DetallePlantilla"
        component={DetallePlantillaScreen}
        options={{
          title: "Detalle de Plantilla",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditorPlantilla"
        component={EditorPlantillaScreen}
        options={{
          title: "Editor de Plantilla",
          headerShown: false,
        }}
      />
      {/* ========== CUENTA Y SEGURIDAD ========== */}
      <Stack.Screen
        name="Cuenta"
        component={CuentaScreen}
        options={{
          title: "Cuenta y Seguridad",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditarPerfil"
        component={EditarPerfilScreen}
        options={{
          title: "Editar Perfil",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AdminRoles"
        component={AdminRolesScreen}
        options={{
          title: "Administrar Roles",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Terminos"
        component={TerminosScreen}
        options={{
          title: "T\u00e9rminos y Condiciones",
          headerShown: false,
        }}
      />
      {/* ========== PERFIL ========== */}
      <Stack.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          title: "Mi Perfil",
          headerShown: false,
        }}
      />
      {/* ========== RETO ========== */}
      <Stack.Screen
        name="RetoResolucion"
        component={RetoResolucionScreen}
        options={{
          title: "Resolver Reto",
          headerShown: false,
        }}
      />
      {/* ========== DETALLE DE POST ========== */}
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          title: "Detalle del Post",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
export default StackNavigator;
