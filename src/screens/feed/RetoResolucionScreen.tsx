import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "../../context/ThemeContext";

interface RetoResolucionScreenProps {
  route?: {
    params?: {
      titulo?: string;
      descripcion?: string;
      tiempoLimite?: number;
      preguntas?: number;
    };
  };
  navigation?: { goBack: () => void };
}

const RetoResolucionScreen: React.FC<RetoResolucionScreenProps> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const params = route?.params;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
          {params?.titulo || "Resolver Reto"}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceContainerHigh }]}>
          <MaterialIcons name="military-tech" size={64} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.onSurface }]}>Resolución de Retos</Text>
        <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
          El flujo completo de resolución con timer, preguntas interactivas y resultado inmediato se
          implementará próximamente.
        </Text>
        {params?.descripcion && (
          <Text style={[styles.retoDesc, { color: colors.onSurface }]}>{params.descripcion}</Text>
        )}
        {(params?.tiempoLimite || params?.preguntas) && (
          <View style={styles.infoRow}>
            {params?.tiempoLimite && (
              <View style={[styles.infoBadge, { backgroundColor: colors.surfaceContainerLow }]}>
                <MaterialIcons name="timer" size={16} color={colors.primary} />
                <Text style={{ color: colors.onSurface, fontSize: 13, fontWeight: "600" }}>
                  {params.tiempoLimite} min
                </Text>
              </View>
            )}
            {params?.preguntas && (
              <View style={[styles.infoBadge, { backgroundColor: colors.surfaceContainerLow }]}>
                <MaterialIcons name="quiz" size={16} color={colors.primary} />
                <Text style={{ color: colors.onSurface, fontSize: 13, fontWeight: "600" }}>
                  {params.preguntas} preguntas
                </Text>
              </View>
            )}
          </View>
        )}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>Volver al Feed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  retoDesc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  backButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default RetoResolucionScreen;
