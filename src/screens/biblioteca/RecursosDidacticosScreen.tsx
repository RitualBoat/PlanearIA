import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";
import WebScrollView from "../../components/WebScrollView";

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
const RecursoIcon: React.FC<{ option: RecursoOption }> = React.memo(
  ({ option }) => {
    if (option.iconLibrary === "FontAwesome5") {
      return <FontAwesome5 name={option.icon} size={50} color={option.color} />;
    }
    return (
      <MaterialIcons name={option.icon as any} size={60} color={option.color} />
    );
  },
);

/**
 * Pantalla principal de Recursos Didácticos
 * Menú central para crear y gestionar recursos educativos
 */
const RecursosDidacticosScreen: React.FC<RecursosDidacticosScreenProps> = ({
  navigation,
}) => {
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
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        <WebScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Recursos Didácticos</Text>
          <Text style={styles.subtitle}>
            Crea recursos educativos con IA, plantillas o desde cero
          </Text>

          <View style={styles.optionsContainer}>
            {recursosOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => handleRecursoPress(option.route)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${option.color}20` },
                  ]}
                >
                  <RecursoIcon option={option} />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <View style={styles.methodsContainer}>
                  <View style={styles.methodBadge}>
                    <MaterialIcons
                      name="auto-awesome"
                      size={14}
                      color={COLORS.primary}
                    />
                    <Text style={styles.methodText}>IA</Text>
                  </View>
                  <View style={styles.methodBadge}>
                    <MaterialIcons
                      name="dashboard"
                      size={14}
                      color={COLORS.primary}
                    />
                    <Text style={styles.methodText}>Plantillas</Text>
                  </View>
                  <View style={styles.methodBadge}>
                    <MaterialIcons
                      name="edit"
                      size={14}
                      color={COLORS.primary}
                    />
                    <Text style={styles.methodText}>Manual</Text>
                  </View>
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
        </WebScrollView>
      </SafeAreaView>

      <BottomNavBar currentScreen="Recursos Didácticos" />
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    boxShadow: "0px 2px 8px rgba(26, 26, 26, 0.2)",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  optionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  methodsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  methodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  methodText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: "600",
  },
  verTodosButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    boxShadow: "0px 2px 8px rgba(33, 150, 243, 0.3)",
  },
  verTodosText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default RecursosDidacticosScreen;
