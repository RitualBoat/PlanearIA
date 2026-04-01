import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";

type PresentacionesScreenNavigationProp = StackNavigationProp<RootStackParamList, "Presentaciones">;

interface PresentacionesScreenProps {
  navigation: PresentacionesScreenNavigationProp;
}

const PresentacionesScreen: React.FC<PresentacionesScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Crear Presentación</Text>
          <Text style={styles.subtitle}>Elige cómo crear tu presentación</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: "#9C27B020" }]}>
                <MaterialIcons name="auto-awesome" size={60} color={COLORS.purple} />
              </View>
              <Text style={styles.optionTitle}>Generar con IA</Text>
              <Text style={styles.optionDescription}>
                La IA creará diapositivas basadas en tu tema
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: "#2196F320" }]}>
                <MaterialIcons name="dashboard" size={60} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.optionTitle}>Usar Plantilla</Text>
              <Text style={styles.optionDescription}>Elige un diseño profesional prediseñado</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: "#4CAF5020" }]}>
                <MaterialIcons name="edit" size={60} color={COLORS.success} />
              </View>
              <Text style={styles.optionTitle}>Crear Manualmente</Text>
              <Text style={styles.optionDescription}>Diseña tu presentación desde cero</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  scrollContent: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
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
  },
  optionsContainer: { gap: 20 },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    alignItems: "center",
    boxShadow: "0px 10px 22px rgba(33, 60, 109, 0.08)",
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
