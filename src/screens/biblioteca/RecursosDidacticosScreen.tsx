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
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS } from "../../../types";
import { isWeb } from "../../utils/responsive";
import AnimatedTopPill from "../../components/AnimatedTopPill";

/**
 * Tipo para las props de navegación
 */
type RecursosDidacticosScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RecursosDidacticos"
>;

/**
 * Props del componente
 */
interface RecursosDidacticosScreenProps {
  navigation: RecursosDidacticosScreenNavigationProp;
}

/**
 * Interfaz para las opciones de recursos
 */
interface RecursoOption {
  id: string;
  title: string;
  icon: string;
  iconLibrary: "MaterialIcons" | "FontAwesome5";
  color: string;
  route: keyof RootStackParamList;
}

/**
 * Componente para renderizar el icono de un recurso didáctico
 */
const RecursoIcon: React.FC<{ option: RecursoOption }> = React.memo(({ option }) => {
  if (option.iconLibrary === "FontAwesome5") {
    return <FontAwesome5 name={option.icon} size={50} color={option.color} />;
  }
  return <MaterialIcons name={option.icon as any} size={60} color={option.color} />;
});

/**
 * Pantalla principal de Recursos Didácticos
 * Menú central para crear y gestionar recursos educativos
 */
const RecursosDidacticosScreen: React.FC<RecursosDidacticosScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 920;
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const mobilePillOpacity = scrollY.interpolate({
    inputRange: [0, 12, 34],
    outputRange: [1, 0.45, 0],
    extrapolate: "clamp",
  });
  const mobilePillTranslateY = scrollY.interpolate({
    inputRange: [0, 34],
    outputRange: [0, -14],
    extrapolate: "clamp",
  });

  /**
   * Opciones de recursos didácticos
   */
  const recursosOptions: RecursoOption[] = [
    {
      id: "examenes",
      title: "Exámenes",
      icon: "assignment",
      iconLibrary: "MaterialIcons",
      color: "#FF9800",
      route: "Examenes",
    },
    {
      id: "presentaciones",
      title: "Presentaciones",
      icon: "slideshow",
      iconLibrary: "MaterialIcons",
      color: "#2196F3",
      route: "Presentaciones",
    },
    {
      id: "mapas_mentales",
      title: "Mapas Mentales",
      icon: "brain",
      iconLibrary: "FontAwesome5",
      color: "#9C27B0",
      route: "MapasMentales",
    },
    {
      id: "lineas_tiempo",
      title: "Líneas de Tiempo",
      icon: "timeline",
      iconLibrary: "MaterialIcons",
      color: "#4CAF50",
      route: "LineasTiempo",
    },
  ];

  /**
   * Maneja la navegación a cada tipo de recurso
   */
  const handleRecursoPress = (route: keyof RootStackParamList): void => {
    navigation.navigate(route as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
                icon="menu-book"
                title="Recursos"
                subtitle="Crea y organiza trabajos o materiales"
              />
            </Animated.View>
          </View>

          <View style={[styles.quickPanel, wideLayout && styles.quickPanelWide]}>
            <View style={styles.quickCard}>
              <Text style={styles.quickValue}>46</Text>
              <Text style={styles.quickLabel}>Recursos activos</Text>
            </View>
            <View style={styles.quickCard}>
              <Text style={styles.quickValue}>12</Text>
              <Text style={styles.quickLabel}>Generados con IA</Text>
            </View>
            <View style={styles.quickCard}>
              <Text style={styles.quickValue}>8</Text>
              <Text style={styles.quickLabel}>Asignados esta semana</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>TIPOS DE RECURSOS</Text>

          <View style={[styles.optionsContainer, wideLayout && styles.optionsContainerWide]}>
            {recursosOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionCard, wideLayout && styles.optionCardWide]}
                onPress={() => handleRecursoPress(option.route)}
                activeOpacity={0.85}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
                  <RecursoIcon option={option} />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>
                  Disponible en IA, plantillas y modo manual.
                </Text>
                <View style={styles.methodsContainer}>
                  <View style={styles.methodBadge}>
                    <MaterialIcons name="auto-awesome" size={14} color={COLORS.primary} />
                    <Text style={styles.methodText}>IA</Text>
                  </View>
                  <View style={styles.methodBadge}>
                    <MaterialIcons name="dashboard" size={14} color={COLORS.primary} />
                    <Text style={styles.methodText}>Plantillas</Text>
                  </View>
                  <View style={styles.methodBadge}>
                    <MaterialIcons name="edit" size={14} color={COLORS.primary} />
                    <Text style={styles.methodText}>Manual</Text>
                  </View>
                </View>
                <View style={styles.optionFooter}>
                  <Text style={styles.optionCta}>Abrir módulo</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#1676D2" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Botón para ver todos los recursos */}
          <TouchableOpacity
            style={styles.verTodosButton}
            onPress={() => navigation.navigate("ListaRecursos")}
            activeOpacity={0.8}
          >
            <MaterialIcons name="folder-open" size={24} color="white" />
            <Text style={styles.verTodosText}>Ver Todos Mis Recursos</Text>
          </TouchableOpacity>

          <View style={styles.tipCard}>
            <MaterialIcons name="tips-and-updates" size={18} color="#0B6F86" />
            <Text style={styles.tipText}>
              Consejo: los módulos no implementados mantienen pantalla esqueleto y mostrarán aviso
              de próxima actualización.
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
    backgroundColor: "#EEF3FA",
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
  quickPanel: {
    gap: 10,
  },
  quickPanelWide: {
    flexDirection: "row",
  },
  quickCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 14,
    flex: 1,
  },
  quickValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1E2A3A",
    lineHeight: 36,
  },
  quickLabel: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7D96",
    fontWeight: "600",
  },
  sectionLabel: {
    marginTop: 4,
    fontSize: 13,
    color: "#5D6F86",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E3EAF4",
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
    color: "#1E2A3A",
  },
  optionDescription: {
    fontSize: 14,
    color: "#5C6E86",
    lineHeight: 20,
  },
  methodsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
  },
  methodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF4FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  methodText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: "600",
  },
  optionFooter: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E8EEF6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionCta: {
    color: "#1676D2",
    fontSize: 14,
    fontWeight: "700",
  },
  verTodosButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1676D2",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 14,
    boxShadow: "0px 8px 18px rgba(22, 118, 210, 0.32)",
  },
  verTodosText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  tipCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBE7F0",
    backgroundColor: "#EAF8FB",
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#0B6F86",
    lineHeight: 18,
  },
});

export default RecursosDidacticosScreen;
