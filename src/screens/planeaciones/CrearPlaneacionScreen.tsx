import React from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useCrearPlaneacionViewModel } from "../../hooks/useCrearPlaneacionViewModel";

const CrearPlaneacionScreen: React.FC = () => {
  const { colors } = useTheme();
  const vm = useCrearPlaneacionViewModel();
  const isWeb = Platform.OS === "web";

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }, isWeb && styles.webScreen]}>
      <ScrollView
        contentContainerStyle={[styles.content, isWeb && styles.webContent]}
        showsVerticalScrollIndicator={isWeb}
        keyboardShouldPersistTaps="handled"
        style={[styles.scrollView, isWeb && styles.webScrollView]}
      >
        <Text style={[styles.title, { color: colors.onSurface }]}>Crear planeacion</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Selecciona una plantilla y abre directamente el documento en DocEditor.
        </Text>

        <View style={styles.levelRow}>
          {vm.niveles.map((item) => {
            const selected = vm.nivelSeleccionado === item.nivel;
            return (
              <Pressable
                key={item.nivel}
                style={[
                  styles.levelChip,
                  {
                    borderColor: selected ? colors.primary : colors.borderLight,
                    backgroundColor: selected ? colors.primary : colors.surfaceContainerLowest,
                  },
                ]}
                onPress={() => vm.setNivelSeleccionado(item.nivel)}
              >
                <Text style={[styles.levelChipText, { color: selected ? colors.surface : colors.onSurfaceVariant }]}>
                  {item.titulo}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {vm.sections.map((section) => (
          <View key={section.id} style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{section.title}</Text>

            {section.items.length > 0 ? (
              section.items.map((item) => {
                const selected = vm.selectedTemplateId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.templateCard,
                      {
                        borderColor: selected ? colors.primary : colors.borderLight,
                        backgroundColor: colors.surfaceContainerLowest,
                        opacity: item.disabled ? 0.7 : 1,
                      },
                    ]}
                    onPress={() => vm.seleccionarPlantilla(item.id)}
                  >
                    <View style={styles.templateIcon}>
                      <MaterialIcons
                        name={selected ? "check-circle" : item.source === "online" ? "public" : "description"}
                        size={20}
                        color={selected ? colors.primary : colors.onSurfaceVariant}
                      />
                    </View>
                    <View style={styles.templateText}>
                      <Text style={[styles.templateTitle, { color: colors.onSurface }]}>
                        {item.nombre}
                      </Text>
                      <Text style={[styles.templateDesc, { color: colors.onSurfaceVariant }]}>{item.descripcion}</Text>
                      {item.etiquetas?.length ? (
                        <View style={styles.templateTagsRow}>
                          {item.etiquetas.slice(0, 4).map((tag) => (
                            <View
                              key={`${item.id}_${tag}`}
                              style={[
                                styles.templateTag,
                                {
                                  borderColor: colors.borderLight,
                                  backgroundColor: colors.surfaceContainerLow,
                                },
                              ]}
                            >
                              <Text style={[styles.templateTagText, { color: colors.onSurfaceVariant }]}>
                                {tag}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                      {item.compatibilidad ? (
                        <Text style={[styles.templateMeta, { color: colors.onSurfaceVariant }]}>
                          Compatibilidad:{" "}
                          {[
                            item.compatibilidad.web ? "Web" : null,
                            item.compatibilidad.android ? "Android" : null,
                            item.compatibilidad.ios ? "iOS" : null,
                          ]
                            .filter(Boolean)
                            .join(" / ")}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View
                style={[
                  styles.emptyCard,
                  {
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceContainerLowest,
                  },
                ]}
              >
                <MaterialIcons name="folder-open" size={18} color={colors.onSurfaceVariant} />
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                  {section.emptyText || "Sin plantillas disponibles."}
                </Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.actions}>
          <Pressable
            style={[
              styles.primaryButton,
              {
                borderColor: colors.primary,
                backgroundColor: colors.primary,
                opacity: vm.isSubmitting ? 0.7 : 1,
              },
            ]}
            disabled={vm.isSubmitting}
            onPress={() => {
              void vm.crearDesdePlantillaSeleccionada();
            }}
          >
            {vm.isSubmitting ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <>
                <MaterialIcons name="description" size={18} color={colors.surface} />
                <Text style={[styles.primaryButtonText, { color: colors.surface }]}>Abrir en DocEditor</Text>
              </>
            )}
          </Pressable>

          <View style={styles.secondaryActions}>
            <Pressable
              style={[
                styles.secondaryButton,
                {
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceContainerLow,
                },
              ]}
              onPress={vm.handleEscanearPlantilla}
            >
              <MaterialIcons name="document-scanner" size={16} color={colors.onSurfaceVariant} />
              <Text style={[styles.secondaryButtonText, { color: colors.onSurfaceVariant }]}>Importar plantilla</Text>
            </Pressable>

            <Pressable
              style={[
                styles.secondaryButton,
                {
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceContainerLow,
                },
              ]}
              onPress={vm.handleImportarPlaneacion}
            >
              <MaterialIcons name="file-upload" size={16} color={colors.onSurfaceVariant} />
              <Text style={[styles.secondaryButtonText, { color: colors.onSurfaceVariant }]}>Importar contenido</Text>
            </Pressable>

            <Pressable
              style={[
                styles.secondaryButton,
                {
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceContainerLow,
                  opacity: vm.isSubmitting ? 0.7 : 1,
                },
              ]}
              disabled={vm.isSubmitting}
              onPress={() => {
                void vm.handleGenerarConIADesdeSelector();
              }}
            >
              <MaterialIcons name="auto-awesome" size={16} color={colors.onSurfaceVariant} />
              <Text style={[styles.secondaryButtonText, { color: colors.onSurfaceVariant }]}>
                Abrir con IA
              </Text>
            </Pressable>
          </View>
        </View>

        {vm.isLoadingPlantillas ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Cargando plantillas guardadas...</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  webScreen: {
    height: "100vh" as never,
    maxHeight: "100vh" as never,
    overflow: "hidden" as never,
  },
  scrollView: {
    flex: 1,
  },
  webScrollView: {
    height: "100%" as never,
    overflow: "scroll" as never,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
    flexGrow: 1,
  },
  webContent: {
    minHeight: "100%" as never,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  levelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  levelChip: {
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 34,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionBlock: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  templateCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 10,
  },
  templateIcon: {
    width: 24,
    alignItems: "center",
    paddingTop: 2,
  },
  templateText: {
    flex: 1,
    gap: 4,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  templateDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  templateTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  templateTag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    minHeight: 22,
    justifyContent: "center",
  },
  templateTagText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  templateMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 46,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
  },
  actions: {
    marginTop: 8,
    gap: 8,
  },
  primaryButton: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryActions: {
    gap: 8,
  },
  secondaryButton: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  loadingRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
  },
});

export default CrearPlaneacionScreen;
