import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";

type PresentacionesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Presentaciones"
>;

interface PresentacionesScreenProps {
  navigation: PresentacionesScreenNavigationProp;
}

const PresentacionesScreen: React.FC<PresentacionesScreenProps> = ({
  navigation,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Crear Presentación</Text>
          <Text style={styles.subtitle}>Elige cómo crear tu presentación</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#9C27B020" }]}
              >
                <MaterialIcons name="auto-awesome" size={60} color="#9C27B0" />
              </View>
              <Text style={styles.optionTitle}>Generar con IA</Text>
              <Text style={styles.optionDescription}>
                La IA creará diapositivas basadas en tu tema
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#2196F320" }]}
              >
                <MaterialIcons name="dashboard" size={60} color="#2196F3" />
              </View>
              <Text style={styles.optionTitle}>Usar Plantilla</Text>
              <Text style={styles.optionDescription}>
                Elige un diseño profesional prediseñado
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#4CAF5020" }]}
              >
                <MaterialIcons name="edit" size={60} color="#4CAF50" />
              </View>
              <Text style={styles.optionTitle}>Crear Manualmente</Text>
              <Text style={styles.optionDescription}>
                Diseña tu presentación desde cero
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNavBar currentScreen="Presentaciones" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
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
  },
  optionsContainer: { gap: 20 },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    elevation: 4,
    shadowColor: COLORS.text,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
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
    marginBottom: 8,
    textAlign: "center",
  },
  optionDescription: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default PresentacionesScreen;
