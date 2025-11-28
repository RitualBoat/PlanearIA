import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { COLORS } from "../../types";
import { NivelAcademico } from "../../types/planeacion";

// Importación de pantallas de autenticación
import LoginScreen from "../screens/auth/LoginScreen";
import HomeScreen from "../screens/home/HomeScreen";

// Importación de pantallas de Planeaciones
import PlaneacionesScreen from "../screens/planeaciones/PlaneacionesScreen";
import CrearPlaneacionScreen from "../screens/planeaciones/CrearPlaneacionScreen";
import EditorPlaneacionScreen from "../screens/planeaciones/EditorPlaneacionScreen";
import ListaPlaneacionesScreen from "../screens/planeaciones/ListaPlaneacionesScreen";

// Importación de pantallas de Grupos (NUEVA ARQUITECTURA)
import GruposScreen from "../screens/grupos/GruposScreen";
import ListaGruposScreen from "../screens/grupos/ListaGruposScreen";
import CrearGrupoScreen from "../screens/grupos/CrearGrupoScreen";
import DetalleGrupoScreen from "../screens/grupos/DetalleGrupoScreen";

// Importación de pantallas de Tareas dentro de Grupos ⭐ NUEVO
import CrearTareaGrupoScreen from "../screens/grupos/tareas/CrearTareaGrupoScreen";
import AsignarRecursoScreen from "../screens/grupos/tareas/AsignarRecursoScreen";
import DetalleTareaScreen from "../screens/grupos/tareas/DetalleTareaScreen";
import CalificarEntregasScreen from "../screens/grupos/tareas/CalificarEntregasScreen";

// Importación de pantallas de Tareas (deprecated - será eliminado)
import TareasScreen from "../screens/tareas/TareasScreen";

// Importación de pantallas de Biblioteca de Recursos
import RecursosDidacticosScreen from "../screens/biblioteca/RecursosDidacticosScreen";
import ExamenesScreen from "../screens/biblioteca/ExamenesScreen";
import PresentacionesScreen from "../screens/biblioteca/PresentacionesScreen";
import MapasMentalesScreen from "../screens/biblioteca/MapasMentalesScreen";
import LineasTiempoScreen from "../screens/biblioteca/LineasTiempoScreen";
import ListaRecursosScreen from "../screens/biblioteca/ListaRecursosScreen";

// Importación de pantallas de Cuenta
import CuentaScreen from "../screens/cuenta/CuentaScreen";

// Pantallas antiguas mantenidas por compatibilidad (deprecated)
import AlumnosScreen from "../screens/alumnos/AlumnosScreen";
import CalificacionesScreen from "../screens/calificaciones/CalificacionesScreen";

/**
 * Definición de los tipos para los parámetros de navegación
 * Esto ayuda a TypeScript a entender qué parámetros espera cada pantalla
 */
export type RootStackParamList = {
  // Autenticación
  Login: undefined;
  Home: undefined;

  // Planeaciones (se mantiene igual)
  Planeaciones: undefined;
  CrearPlaneacion: undefined;
  EditorPlaneacion: {
    nivel: NivelAcademico;
    modo: "crear" | "editar";
    planeacionId?: string;
  };
  ListaPlaneaciones: undefined;

  // NUEVA ARQUITECTURA: Grupos (reemplaza Alumnos y Calificaciones)
  Grupos: undefined;
  ListaGrupos: undefined;
  CrearGrupo: undefined;
  DetalleGrupo: {
    grupoId: number;
    grupoNombre: string;
  };

  // ⭐ NUEVO: Tareas dentro de Grupos (v3.0)
  CrearTareaGrupo: { grupoId: number };
  AsignarRecurso: { grupoId: number };
  DetalleTarea: { tareaId: number; grupoId: number };
  CalificarEntregas: { tareaId: number; grupoId: number };

  // Tareas (deprecated - módulo standalone eliminado)
  Tareas: undefined;

  // NUEVA ARQUITECTURA: Recursos Didácticos (reemplaza Recursos)
  RecursosDidacticos: undefined;
  Examenes: undefined;
  Presentaciones: undefined;
  MapasMentales: undefined;
  LineasTiempo: undefined;
  ListaRecursos: undefined;

  // Cuenta y Seguridad (se mantiene)
  Cuenta: undefined;

  // Rutas antiguas mantenidas por compatibilidad (deprecated)
  Alumnos: undefined;
  Calificaciones: undefined;
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
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
      }}
    >
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

      {/* ========== TAREAS (Deprecated) ========== */}
      <Stack.Screen
        name="Tareas"
        component={TareasScreen}
        options={{
          title: "Tareas",
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
        name="Examenes"
        component={ExamenesScreen}
        options={{
          title: "Exámenes",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Presentaciones"
        component={PresentacionesScreen}
        options={{
          title: "Presentaciones",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="MapasMentales"
        component={MapasMentalesScreen}
        options={{
          title: "Mapas Mentales",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="LineasTiempo"
        component={LineasTiempoScreen}
        options={{
          title: "Líneas de Tiempo",
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

      {/* ========== CUENTA Y SEGURIDAD ========== */}
      <Stack.Screen
        name="Cuenta"
        component={CuentaScreen}
        options={{
          title: "Cuenta y Seguridad",
          headerShown: false,
        }}
      />

      {/* ========== PANTALLAS ANTIGUAS (Deprecated) ========== */}
      <Stack.Screen
        name="Alumnos"
        component={AlumnosScreen}
        options={{
          title: "Alumnos",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Calificaciones"
        component={CalificacionesScreen}
        options={{
          title: "Calificaciones",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Recursos"
        component={RecursosScreen}
        options={{
          title: "Recursos",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
export default StackNavigator;
