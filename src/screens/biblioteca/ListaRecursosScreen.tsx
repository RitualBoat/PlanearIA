import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, Recurso } from "../../../types";
import { useListaRecursosViewModel } from "../../hooks/useListaRecursosViewModel";
import { isWeb } from "../../utils/responsive";

const ListaRecursosScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 920;

  const { searchQuery, setSearchQuery, getIconByTipo, getColorByTipo } = useListaRecursosViewModel();

  const recursosEjemplo: Partial<Recurso>[] = [
    {
      id: 1,
      titulo: "Examen de Álgebra - Parcial 2",
      tipo: "examen",
      descripcion: "Ecuaciones de segundo grado",
      origen: "ia",
      fechaCreacion: new Date(),
    },
    {
      id: 2,
      titulo: "Presentación: Revolución Mexicana",
      tipo: "presentacion",
      descripcion: "20 diapositivas con imágenes",
      origen: "plantilla",
      fechaCreacion: new Date(),
    },
    {
      id: 3,
      titulo: "Mapa Mental: Sistema Nervioso",
      tipo: "mapa_mental",
      descripcion: "Anatomía y funciones",
      origen: "manual",
      fechaCreacion: new Date(),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Recursos</Text>
          <Text style={styles.subtitle}>{recursosEjemplo.length} recursos disponibles</Text>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#6B7D96" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar recurso..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#6B7D96"
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, wideLayout && styles.scrollContentWide]}>
          {recursosEjemplo.map((recurso) => (
            <TouchableOpacity key={recurso.id} style={[styles.recursoCard, wideLayout && styles.recursoCardWide]} activeOpacity={0.9}>
              <View style={styles.recursoHeader}>
                <View
                  style={[
                    styles.recursoIcon,
                    { backgroundColor: `${getColorByTipo(recurso.tipo!)}20` },
                  ]}
                >
                  <MaterialIcons
                    name={getIconByTipo(recurso.tipo!) as any}
                    size={24}
                    color={getColorByTipo(recurso.tipo!)}
                  />
                </View>

                <View style={styles.recursoInfo}>
                  <Text style={styles.recursoTitulo}>{recurso.titulo}</Text>
                  <Text style={styles.recursoDescripcion}>{recurso.descripcion}</Text>

                  <View style={styles.recursoBadges}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{recurso.tipo?.replace("_", " ")}</Text>
                    </View>
                    <View style={[styles.badge, styles.origenBadge]}>
                      <MaterialIcons
                        name={
                          recurso.origen === "ia"
                            ? "auto-awesome"
                            : recurso.origen === "plantilla"
                              ? "dashboard"
                              : "edit"
                        }
                        size={12}
                        color="#1676D2"
                      />
                      <Text style={styles.badgeText}>{recurso.origen}</Text>
                    </View>
                  </View>
                </View>

                <MaterialIcons name="chevron-right" size={22} color="#8A9AB1" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    width: "100%",
    alignSelf: "center",
    maxWidth: 1220,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1E2A3A",
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 15,
    color: "#5C6E86",
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E3EAF4",
    minHeight: 48,
    boxShadow: "0px 8px 14px rgba(18, 44, 86, 0.06)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#1E2A3A",
    paddingVertical: 0,
  },
  scrollContent: {
    width: "100%",
    maxWidth: 1220,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: isWeb() ? 28 : 110,
    gap: 10,
  },
  scrollContentWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  recursoCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 14,
    boxShadow: "0px 10px 22px rgba(33, 60, 109, 0.08)",
  },
  recursoCardWide: {
    width: "49%",
  },
  recursoHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  recursoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  recursoInfo: {
    flex: 1,
  },
  recursoTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E2A3A",
    marginBottom: 3,
  },
  recursoDescripcion: {
    fontSize: 13,
    color: "#5C6E86",
    marginBottom: 7,
  },
  recursoBadges: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF4FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  origenBadge: {
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    color: "#1676D2",
    fontWeight: "700",
    textTransform: "capitalize",
  },
});

export default ListaRecursosScreen;
