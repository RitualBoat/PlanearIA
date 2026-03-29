import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../../types";
import WebScrollView from "../../../components/WebScrollView";

type AsignarRecursoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AsignarRecurso"
>;

type AsignarRecursoScreenRouteProp = RouteProp<
  RootStackParamList,
  "AsignarRecurso"
>;

interface AsignarRecursoScreenProps {
  navigation: AsignarRecursoScreenNavigationProp;
  route: AsignarRecursoScreenRouteProp;
}

/**
 * Pantalla para asignar un recurso existente (examen) a un grupo
 */
const AsignarRecursoScreen: React.FC<AsignarRecursoScreenProps> = ({
  navigation,
  route,
}) => {
  const { grupoId } = route.params;

  // Recursos de ejemplo (tipo examen)
  const recursosExamen = [
    {
      id: 1,
      titulo: "Examen de Álgebra Lineal",
      tipo: "examen",
      fecha: "15 Nov 2025",
      preguntas: 20,
    },
    {
      id: 2,
      titulo: "Evaluación de Cálculo Diferencial",
      tipo: "examen",
      fecha: "10 Nov 2025",
      preguntas: 15,
    },
    {
      id: 3,
      titulo: "Quiz de Programación Orientada a Objetos",
      tipo: "examen",
      fecha: "8 Nov 2025",
      preguntas: 10,
    },
  ];

  const handleAsignar = (recursoId: number) => {
    // TODO: Implementar lógica de asignación
    console.log("Asignando recurso", recursoId, "al grupo", grupoId);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <WebScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Asignar Examen al Grupo</Text>
            <Text style={styles.pageSubtitle}>
              Selecciona un examen de tu biblioteca
            </Text>
            <Text style={styles.info}>Grupo ID: {grupoId}</Text>
          </View>

          <View style={styles.listaContainer}>
            {recursosExamen.map((recurso) => (
              <TouchableOpacity
                key={recurso.id}
                style={styles.recursoItem}
                onPress={() => handleAsignar(recurso.id)}
              >
                <MaterialIcons name="quiz" size={40} color="#2196F3" />
                <View style={styles.recursoInfo}>
                  <Text style={styles.recursoTitulo}>{recurso.titulo}</Text>
                  <Text style={styles.recursoMetadata}>
                    {recurso.preguntas} preguntas • Creado: {recurso.fecha}
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.emptyStateContainer}>
            <MaterialIcons
              name="info-outline"
              size={48}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyStateText}>
              Aquí se mostrarán los exámenes que hayas creado en la sección de
              Recursos Didácticos
            </Text>
          </View>
        </WebScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF3FA",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  info: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  listaContainer: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110,
  },
  recursoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: "0px 8px 18px rgba(18, 44, 86, 0.08)",
  },
  recursoInfo: {
    flex: 1,
    marginLeft: 15,
  },
  recursoTitulo: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  recursoMetadata: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 15,
    lineHeight: 22,
  },
});

export default AsignarRecursoScreen;
