import React from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS } from "../../../types";
import { isWeb } from "../../utils/responsive";
import AnimatedTopPill from "../../components/AnimatedTopPill";

/**
 * Tipo para las props de navegación
 */
type GruposScreenNavigationProp = StackNavigationProp<RootStackParamList, "Grupos">;

/**
 * Props del componente
 */
interface GruposScreenProps {
  navigation: GruposScreenNavigationProp;
}

/**
 * Pantalla principal de Grupos
 * Menú central para gestionar grupos de alumnos
 */
const GruposScreen: React.FC<GruposScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 920;
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const mobilePillOpacity = scrollY.interpolate({
    inputRange: [0, 22, 56],
    outputRange: [1, 0.55, 0],
    extrapolate: "clamp",
  });
  const mobilePillTranslateY = scrollY.interpolate({
    inputRange: [0, 56],
    outputRange: [0, -16],
    extrapolate: "clamp",
  });

  /**
   * Navega a crear nuevo grupo
   */
  const handleCrearGrupo = (): void => {
    navigation.navigate("CrearGrupo");
  };

  /**
   * Navega a ver lista de grupos
   */
  const handleVerGrupos = (): void => {
    navigation.navigate("ListaGrupos");
  };

  const handleImportarGrupos = (): void => {
    navigation.navigate("ImportarGrupos");
  };

  const handleExportarGrupos = (): void => {
    navigation.navigate("ListaGrupos");
  };

  const handleCrearAlumno = (): void => {
    navigation.navigate("CrearAlumno");
  };

  const handleVerAlumnos = (): void => {
    navigation.navigate("ListaAlumnos");
  };

  const handleImportarAlumnos = (): void => {
    alert("Esta funcion se implementara proximamente.");
  };

  const handleExportarAlumnos = (): void => {
    alert("Esta funcion se implementara proximamente.");
  };

  const quickStats = [
    {
      id: "grupos",
      label: "Grupos activos",
      value: "8",
      icon: "groups" as const,
      tone: COLORS.primary,
    },
    {
      id: "alumnos",
      label: "Alumnos",
      value: "246",
      icon: "school" as const,
      tone: COLORS.tealLight,
    },
    {
      id: "pendientes",
      label: "Pendientes",
      value: "14",
      icon: "assignment-late" as const,
      tone: "#F59E0B",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
        >
          <View style={styles.headerBlock}>
            <Animated.View
              style={{
                opacity: mobilePillOpacity,
                transform: [{ translateY: mobilePillTranslateY }],
              }}
            >
              <AnimatedTopPill
                icon="groups"
                title="Grupos"
                subtitle="Administra grupos, alumnos y tareas."
              />
            </Animated.View>
          </View>

          <View style={[styles.statsGrid, wideLayout && styles.statsGridWide]}>
            {quickStats.map((stat) => (
              <View key={stat.id} style={[styles.statCard, wideLayout && styles.statCardWide]}>
                <View style={[styles.statIconWrap, { backgroundColor: `${stat.tone}1A` }]}>
                  <MaterialIcons name={stat.icon} size={20} color={stat.tone} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>ACCIONES PRINCIPALES</Text>

          <View style={[styles.optionsContainer, wideLayout && styles.optionsContainerWide]}>
            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleCrearGrupo}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primary }]}>
                <MaterialIcons name="group-add" size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.optionTitle}>Crear Nuevo Grupo</Text>
              <Text style={styles.optionDescription}>
                Registra un nuevo grupo con periodo, materia y configuración inicial.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Crear grupo</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleVerGrupos}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.tealLight }]}>
                <MaterialIcons name="groups" size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.optionTitle}>Mis Grupos</Text>
              <Text style={styles.optionDescription}>
                Consulta tus grupos existentes y entra a su detalle para gestionar alumnos y tareas.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Ver grupos</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleImportarGrupos}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryDark }]}>
                <MaterialIcons name="file-upload" size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.optionTitle}>Importar Grupos</Text>
              <Text style={styles.optionDescription}>
                Carga CSV o Excel, valida filas y agrega grupos válidos en un solo flujo.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Importar archivo</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleExportarGrupos}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#6A8FDD" }]}>
                <MaterialIcons name="file-download" size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.optionTitle}>Exportar Grupos</Text>
              <Text style={styles.optionDescription}>
                Abre la lista de grupos para exportar el grupo seleccionado en PDF o Excel.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Ir a exportación</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.tipCard}>
            <MaterialIcons name="tips-and-updates" size={18} color={COLORS.teal} />
            <Text style={styles.tipText}>
              Consejo: desde el detalle de cada grupo puedes crear tareas, asignar recursos y
              calificar entregas.
            </Text>
          </View>

          <View style={styles.headerBlockSecondary}>
            <AnimatedTopPill
              icon="school"
              title="Alumnos"
              subtitle="Administra expediente, importacion y control academico"
            />
          </View>

          <Text style={styles.sectionLabel}>ACCIONES DE ALUMNOS</Text>

          <View style={[styles.optionsContainer, wideLayout && styles.optionsContainerWide]}>
            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleCrearAlumno}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primary }]}>
                <MaterialIcons name="person-add" size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.optionTitle}>Crear Nuevo Alumno</Text>
              <Text style={styles.optionDescription}>
                Registra un nuevo alumno con datos personales, academicos y de contacto.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Crear alumno</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleVerAlumnos}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.tealLight }]}>
                <MaterialIcons name="groups" size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.optionTitle}>Mis Alumnos</Text>
              <Text style={styles.optionDescription}>
                Consulta la lista, filtra por grupo o carrera y edita cada perfil rapidamente.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Ver alumnos</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleImportarAlumnos}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryDark }]}>
                <MaterialIcons name="file-upload" size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.optionTitle}>Importar Alumnos</Text>
              <Text style={styles.optionDescription}>
                Carga lotes desde CSV o Excel para acelerar altas masivas por ciclo escolar.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Importar archivo</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleExportarAlumnos}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#7A57D1" }]}>
                <MaterialIcons name="file-download" size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.optionTitle}>Exportar Alumnos</Text>
              <Text style={styles.optionDescription}>
                Genera reportes de alumnos para compartirlos en PDF o formatos de oficina.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Exportar archivo</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.tipCard}>
            <MaterialIcons name="auto-awesome" size={18} color={COLORS.teal} />
            <Text style={styles.tipText}>
              Consejo: mantendremos este flujo continuo para que Grupos y Alumnos se gestionen en
              una sola experiencia de scroll.
            </Text>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
};

/**
 * Estilos del componente
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: isWeb() ? 28 : 110,
    gap: 14,
    width: "100%",
    alignSelf: "center",
    maxWidth: 1220,
  },
  headerBlock: {
    marginBottom: 2,
  },
  headerBlockSecondary: {
    marginTop: 6,
    marginBottom: 2,
  },
  statsGrid: {
    flexDirection: "column",
    gap: 10,
  },
  statsGridWide: {
    flexDirection: "row",
  },
  statCard: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  statCardWide: {
    width: "32%",
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 36,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.textTertiary,
    fontWeight: "600",
  },
  sectionLabel: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  optionsContainer: {
    gap: 12,
  },
  optionsContainerWide: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionCard: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    boxShadow: "0px 10px 22px rgba(33, 60, 109, 0.08)",
  },
  optionCardWide: {
    width: "49%",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  optionFooter: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionCta: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  tipCard: {
    marginTop: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryTint,
    backgroundColor: COLORS.primaryTint,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.teal,
    lineHeight: 18,
  },
});

export default GruposScreen;
