import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import WebScrollView from "../../components/WebScrollView";
import { useAlumnos } from "../../context/AlumnosContext";

type Nav = StackNavigationProp<RootStackParamList, "DetalleAlumno">;
type Route = RouteProp<RootStackParamList, "DetalleAlumno">;

const DetalleAlumnoScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { obtenerAlumno } = useAlumnos();
  const { alumnoId } = route.params;

  const alumno = obtenerAlumno(alumnoId);

  if (!alumno) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Alumno no encontrado</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Detalle alumno</Text>
          <Text style={styles.subtitle}>{`${alumno.nombre} ${alumno.apellidos}`.trim()}</Text>
        </View>

        <WebScrollView style={styles.content}>
          <View style={styles.card}>
            <Row label="Número de control" value={alumno.numeroControl} />
            <Row label="Carrera" value={alumno.carrera} />
            <Row label="Email" value={alumno.email || "No definido"} />
            <Row label="Teléfono" value={alumno.telefono || "No definido"} />
            <Row label="Estado" value={alumno.estado} />
            <Row label="Grupo" value={String(alumno.grupoId || "Sin grupo")} />
          </View>

          <TouchableOpacity
            style={styles.placeholderButton}
            onPress={() => navigation.navigate("CrearAlumno", { modo: "editar", alumnoId })}
          >
            <MaterialIcons name="edit" size={16} color="#1676D2" />
            <Text style={styles.placeholderButtonText}>Editar alumno</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.placeholderButton}
            onPress={() =>
              navigation.navigate("ReportesAlumno", {
                alumnoId,
                alumnoNombre: `${alumno.nombre} ${alumno.apellidos}`.trim(),
              })
            }
          >
            <MaterialIcons name="insights" size={16} color="#1676D2" />
            <Text style={styles.placeholderButtonText}>Ver reporte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.placeholderButton}
            onPress={() =>
              navigation.navigate("NotasAlumno", {
                alumnoId,
                alumnoNombre: `${alumno.nombre} ${alumno.apellidos}`.trim(),
              })
            }
          >
            <MaterialIcons name="chat" size={16} color="#1676D2" />
            <Text style={styles.placeholderButtonText}>Notas personales</Text>
          </TouchableOpacity>
        </WebScrollView>
      </SafeAreaView>
    </View>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF3FA" },
  safeArea: { flex: 1 },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E3EAF4",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#1E2A3A" },
  subtitle: { fontSize: 13, color: "#6E809A", marginTop: 4 },
  content: { paddingHorizontal: 16 },
  card: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE8F8",
    padding: 12,
  },
  row: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF3FA",
  },
  label: { fontSize: 12, color: "#70839D", marginBottom: 3 },
  value: { fontSize: 14, color: "#23354F", fontWeight: "700" },
  placeholderButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#CFE2F7",
    backgroundColor: "#F5FAFF",
    borderRadius: 10,
    paddingVertical: 10,
  },
  placeholderButtonText: { color: "#1676D2", fontSize: 13, fontWeight: "700" },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#2A3A52" },
  backButton: {
    backgroundColor: "#1676D2",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backButtonText: { color: "#FFFFFF", fontWeight: "700" },
});

export default DetalleAlumnoScreen;
