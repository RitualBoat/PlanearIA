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
type PlaneacionesScreenNavigationProp = StackNavigationProp<RootStackParamList, "Planeaciones">;

/**
 * Props del componente
 */
interface PlaneacionesScreenProps {
  navigation: PlaneacionesScreenNavigationProp;
}

/**
 * Pantalla de Planeaciones
 * Muestra las opciones para gestionar planeaciones
 */
const PlaneacionesScreen: React.FC<PlaneacionesScreenProps> = ({ navigation }) => {
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
   * Navega a crear nueva planeación
   */
  const handleCrearNueva = (): void => {
    navigation.navigate("CrearPlaneacion");
  };

  /**
   * Función para ver planeaciones guardadas
   */
  const handleVerPlaneaciones = (): void => {
    navigation.navigate("ListaPlaneaciones");
  };

  const handleImportarPlaneacion = (): void => {
    navigation.navigate("ImportarPlaneacion");
  };

  const handleExportarPlaneacion = (): void => {
    navigation.navigate("ExportarPlaneacion", {});
  };

  const quickStats = [
    {
      id: "totales",
      label: "Planeaciones",
      value: "24",
      icon: "event-note" as const,
      tone: COLORS.primary,
    },
    {
      id: "borradores",
      label: "Borradores",
      value: "7",
      icon: "drafts" as const,
      tone: "#F59E0B",
    },
    {
      id: "semana",
      label: "Esta semana",
      value: "12",
      icon: "calendar-month" as const,
      tone: COLORS.tealLight,
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
                icon="event-note"
                title="Planeaciones"
                subtitle="Organiza, crea e importa planeaciones."
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
              onPress={handleCrearNueva}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primary }]}>
                <MaterialIcons name="add-circle" size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.optionTitle}>Crear Nueva Planeación</Text>
              <Text style={styles.optionDescription}>
                Inicia una planeación desde cero o usa IA para acelerar el primer borrador.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Comenzar</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleVerPlaneaciones}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.tealLight }]}>
                <MaterialIcons name="folder-open" size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.optionTitle}>Mis Planeaciones</Text>
              <Text style={styles.optionDescription}>
                Consulta, filtra, duplica o edita planeaciones guardadas.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Abrir biblioteca</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleImportarPlaneacion}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primary }]}>
                <MaterialIcons name="upload-file" size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.optionTitle}>Importar Planeación</Text>
              <Text style={styles.optionDescription}>
                Importa un archivo PDF o DOCX para revisar y convertir tu formato al modelo
                PlanearIA.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Importar ahora</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleExportarPlaneacion}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#5B8BD5" }]}>
                <MaterialIcons name="download" size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.optionTitle}>Exportar Planeación</Text>
              <Text style={styles.optionDescription}>
                Genera PDF o DOCX de tus planeaciones para compartir, imprimir o respaldar.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Exportar ahora</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.tipCard}>
            <MaterialIcons name="tips-and-updates" size={18} color={COLORS.teal} />
            <Text style={styles.tipText}>
              Consejo: importa una planeación previa y usa la función de mejora IA para optimizarla
              antes de asignarla.
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
    paddingTop: 54,
    paddingBottom: isWeb() ? 28 : 110,
    gap: 14,
    width: "100%",
    alignSelf: "center",
    maxWidth: 1220,
  },
  headerBlock: {
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
    flexWrap: "wrap",
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
    width: "32%",
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

export default PlaneacionesScreen;
