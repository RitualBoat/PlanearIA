import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";

type LineasTiempoScreenNavigationProp = StackNavigationProp<RootStackParamList, "LineasTiempo">;

interface LineasTiempoScreenProps {
  navigation: LineasTiempoScreenNavigationProp;
}

const LineasTiempoScreen: React.FC<LineasTiempoScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Crear Línea de Tiempo</Text>
          <Text style={styles.subtitle}>Organiza eventos cronológicamente</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: "#9C27B020" }]}>
                <MaterialIcons name="auto-awesome" size={60} color="#9C27B0" />
              </View>
              <Text style={styles.optionTitle}>Generar con IA</Text>
              <Text style={styles.optionDescription}>
                La IA organizará eventos históricos automáticamente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: "#2196F320" }]}>
                <MaterialIcons name="dashboard" size={60} color="#2196F3" />
              </View>
              <Text style={styles.optionTitle}>Usar Plantilla</Text>
              <Text style={styles.optionDescription}>
                Plantillas para historia, proyectos y más
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: "#4CAF5020" }]}>
                <MaterialIcons name="edit" size={60} color="#4CAF50" />
              </View>
              <Text style={styles.optionTitle}>Crear Manualmente</Text>
              <Text style={styles.optionDescription}>Agrega eventos y fechas personalizadas</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF3FA" },
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
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3EAF4",
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

export default LineasTiempoScreen;
