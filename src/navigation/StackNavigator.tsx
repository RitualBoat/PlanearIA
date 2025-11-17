import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { COLORS } from "../../types";
// Importación de pantallas
import LoginScreen from "../screens/auth/LoginScreen";
import HomeScreen from "../screens/home/HomeScreen";
import PlaneacionesScreen from "../screens/planeaciones/PlaneacionesScreen";
import CrearPlaneacionScreen from "../screens/planeaciones/CrearPlaneacionScreen";
import AlumnosScreen from "../screens/alumnos/AlumnosScreen";
import CalificacionesScreen from "../screens/calificaciones/CalificacionesScreen";
import TareasScreen from "../screens/tareas/TareasScreen";
import RecursosScreen from "../screens/recursos/RecursosScreen";
import CuentaScreen from "../screens/cuenta/CuentaScreen";

/**
 * Definición de los tipos para los parámetros de navegación
 * Esto ayuda a TypeScript a entender qué parámetros espera cada pantalla
 */
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Planeaciones: undefined;
  CrearPlaneacion: undefined;
  Alumnos: undefined;
  Calificaciones: undefined;
  Tareas: undefined;
  Recursos: undefined;
  Cuenta: undefined;
  AlumnoList: undefined;
  AlumnoDetails: {
    nombre: string;
    id?: number;
  };
  ProfesorList: undefined;
  ProfesorDetails: {
    nombre: string;
    id?: number;
  };
  MateriaList: undefined;
  MateriaDetails: {
    nombre: string;
    id?: number;
  };
  GrupoList: undefined;
  GrupoDetails: {
    nombre: string;
    id?: number;
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
      {/* Pantalla de Login */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Iniciar Sesión",
          headerShown: false, // Ocultamos el header en login
        }}
      />
      {/* Pantalla Principal */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Sistema de planeación",
          headerLeft: () => null, // Evitamos el botón de regreso
          headerShown: false, // Ocultamos el header en home
        }}
      />

      {/* Pantalla de Planeaciones */}
      <Stack.Screen
        name="Planeaciones"
        component={PlaneacionesScreen}
        options={{
          title: "Planeaciones",
          headerShown: false,
        }}
      />

      {/* Pantalla de Crear Planeación */}
      <Stack.Screen
        name="CrearPlaneacion"
        component={CrearPlaneacionScreen}
        options={{
          title: "Crear Planeación",
          headerShown: false,
        }}
      />

      {/* Pantalla de Alumnos */}
      <Stack.Screen
        name="Alumnos"
        component={AlumnosScreen}
        options={{
          title: "Alumnos",
          headerShown: false,
        }}
      />

      {/* Pantalla de Calificaciones */}
      <Stack.Screen
        name="Calificaciones"
        component={CalificacionesScreen}
        options={{
          title: "Calificaciones",
          headerShown: false,
        }}
      />

      {/* Pantalla de Tareas */}
      <Stack.Screen
        name="Tareas"
        component={TareasScreen}
        options={{
          title: "Tareas",
          headerShown: false,
        }}
      />

      {/* Pantalla de Recursos */}
      <Stack.Screen
        name="Recursos"
        component={RecursosScreen}
        options={{
          title: "Recursos",
          headerShown: false,
        }}
      />

      {/* Pantalla de Cuenta */}
      <Stack.Screen
        name="Cuenta"
        component={CuentaScreen}
        options={{
          title: "Cuenta y Seguridad",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
export default StackNavigator;
