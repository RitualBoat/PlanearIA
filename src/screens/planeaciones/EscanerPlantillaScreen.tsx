import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useEscanerPlantillaViewModel } from "../../hooks/useEscanerPlantillaViewModel";
import { NivelAcademico } from "../../../types/planeacionV2";

const NIVELES = [
  { id: NivelAcademico.PRIMARIA, label: "Primaria" },
  { id: NivelAcademico.SECUNDARIA, label: "Secundaria" },
  { id: NivelAcademico.PREPARATORIA, label: "Preparatoria" },
  { id: NivelAcademico.UNIVERSIDAD, label: "Universidad" },
];

const EscanerPlantillaScreen: React.FC = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const vm = useEscanerPlantillaViewModel();
  const isWide = width >= 960;

  const renderProgress = () => (
    <View style={styles.progressRow}>
      {[1, 2, 3, 4, 5].map((step) => {
        const active = vm.paso === step;
        const done = vm.paso > step;
        return (
          <View key={step} style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                {
                  borderColor: active || done ? colors.primary : colors.borderLight,
                  backgroundColor: done ? colors.primary : active ? colors.primaryContainer : colors.surfaceContainerLow,
                },
              ]}
            >
              {done ? (
                <MaterialIcons name="check" size={14} color={colors.surface} />
              ) : (
                <Text style={[styles.progressDotText, { color: active ? colors.primary : colors.onSurfaceVariant }]}>
                  {step}
                </Text>
              )}
            </View>
            {step < 5 ? (
              <View
                style={[
                  styles.progressLine,
                  { backgroundColor: done ? colors.primary : colors.borderLight },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );

  const renderNivelSelector = () => (
    <View style={styles.chipsRow}>
      {NIVELES.map((nivel) => {
        const selected = vm.nivelAcademico === nivel.id;
        return (
          <Pressable
            key={nivel.id}
            style={[
              styles.chip,
              {
                borderColor: selected ? colors.primary : colors.borderLight,
                backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerLowest,
              },
            ]}
            onPress={() => vm.setNivelAcademico(nivel.id)}
          >
            <Text style={[styles.chipText, { color: selected ? colors.primary : colors.onSurfaceVariant }]}>
              {nivel.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderStepContent = () => {
    if (vm.paso === 1) {
      return (
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.borderLight }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primaryContainer }]}>
            <MaterialIcons name="document-scanner" size={34} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Sube una plantilla real</Text>
          <Text style={[styles.cardText, { color: colors.onSurfaceVariant }]}>
            El escaner lee PDF/DOCX, extrae el texto y detecta secciones reutilizables para DocEditor.
          </Text>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              void vm.seleccionarArchivo();
            }}
            disabled={vm.isExtracting}
          >
            {vm.isExtracting ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <MaterialIcons name="upload-file" size={20} color={colors.surface} />
            )}
            <Text style={[styles.primaryButtonText, { color: colors.surface }]}>
              {vm.isExtracting ? "Extrayendo..." : "Seleccionar PDF o DOCX"}
            </Text>
          </Pressable>
        </View>
      );
    }

    if (vm.paso === 2) {
      return (
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Texto extraido</Text>
          <Text style={[styles.cardText, { color: colors.onSurfaceVariant }]}>
            Revisa que el texto tenga sentido y ajusta el nivel si la inferencia no fue exacta.
          </Text>
          {renderNivelSelector()}
          <View style={[styles.previewBox, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.borderLight }]}>
            <Text style={[styles.previewText, { color: colors.onSurfaceVariant }]}>
              {vm.textoPreview || "Sin texto disponible."}
            </Text>
          </View>
          <Pressable
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.primary,
                opacity: vm.puedeAnalizar ? 1 : 0.45,
              },
            ]}
            onPress={() => {
              void vm.analizarPlantilla();
            }}
            disabled={!vm.puedeAnalizar}
          >
            <MaterialIcons name="auto-awesome" size={20} color={colors.surface} />
            <Text style={[styles.primaryButtonText, { color: colors.surface }]}>Analizar estructura</Text>
          </Pressable>
        </View>
      );
    }

    if (vm.paso === 3) {
      return (
        <View style={[styles.card, styles.centerCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.borderLight }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>La IA esta leyendo el formato</Text>
          <Text style={[styles.cardText, { color: colors.onSurfaceVariant }]}>
            Estamos buscando campos, tablas, instrumentos de evaluacion y secciones custom.
          </Text>
        </View>
      );
    }

    if (vm.paso === 4) {
      return (
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Confirma la plantilla</Text>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Nombre</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
                color: colors.onSurface,
              },
            ]}
            value={vm.nombrePlantilla}
            onChangeText={vm.setNombrePlantilla}
            placeholder="Nombre de la plantilla"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Descripcion</Text>
          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
                color: colors.onSurface,
              },
            ]}
            value={vm.descripcionPlantilla}
            onChangeText={vm.setDescripcionPlantilla}
            placeholder="Para que tipo de planeacion sirve"
            placeholderTextColor={colors.textMuted}
            multiline
          />

          {renderNivelSelector()}

          <Pressable
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.primary,
                opacity: vm.puedeGuardar ? 1 : 0.45,
              },
            ]}
            onPress={() => {
              void vm.guardarPlantilla();
            }}
            disabled={!vm.puedeGuardar}
          >
            {vm.isSaving ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <MaterialIcons name="save" size={20} color={colors.surface} />
            )}
            <Text style={[styles.primaryButtonText, { color: colors.surface }]}>Guardar plantilla</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={[styles.card, styles.centerCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.borderLight }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.primaryContainer }]}>
          <MaterialIcons name="verified" size={34} color={colors.primary} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Plantilla lista</Text>
        <Text style={[styles.cardText, { color: colors.onSurfaceVariant }]}>
          La plantilla quedo guardada en el sistema V2. Puedes usarla desde "Nueva planeacion" y elegir
          "Desde plantilla".
        </Text>
        <View style={styles.successActions}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={vm.irACrearDesdePlantilla}
          >
            <MaterialIcons name="post-add" size={20} color={colors.surface} />
            <Text style={[styles.primaryButtonText, { color: colors.surface }]}>Crear desde plantilla</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, { borderColor: colors.borderLight, backgroundColor: colors.surfaceContainerLow }]}
            onPress={vm.reiniciar}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.onSurfaceVariant }]}>Escanear otra</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderPlantillaPreview = () => (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.borderLight }]}>
      <View style={styles.previewHeader}>
        <View>
          <Text style={[styles.sideTitle, { color: colors.onSurface }]}>Estructura detectada</Text>
          <Text style={[styles.sideSubtitle, { color: colors.onSurfaceVariant }]}>
            {vm.plantilla?.secciones.length || 0} secciones
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.primaryContainer }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {vm.plantilla?.nivelAcademico || vm.nivelAcademico}
          </Text>
        </View>
      </View>

      {vm.plantilla ? (
        <View style={styles.sectionsList}>
          {vm.plantilla.secciones.map((section) => (
            <View
              key={section.id}
              style={[styles.sectionPreview, { borderColor: colors.borderLight, backgroundColor: colors.surfaceContainerLow }]}
            >
              <View style={styles.sectionPreviewHeader}>
                <MaterialIcons name="view-agenda" size={18} color={colors.primary} />
                <Text style={[styles.sectionPreviewTitle, { color: colors.onSurface }]}>{section.titulo}</Text>
              </View>
              <Text style={[styles.sectionPreviewMeta, { color: colors.onSurfaceVariant }]}>
                {section.tipo} | {section.campos.length} campos
              </Text>
              <View style={styles.fieldsWrap}>
                {section.campos.slice(0, 6).map((field) => (
                  <View key={field.id} style={[styles.fieldPill, { backgroundColor: colors.surfaceContainerLowest }]}>
                    <Text style={[styles.fieldPillText, { color: colors.onSurfaceVariant }]}>
                      {field.etiqueta}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyPreview, { backgroundColor: colors.surfaceContainerLow }]}>
          <MaterialIcons name="schema" size={30} color={colors.onSurfaceVariant} />
          <Text style={[styles.emptyPreviewText, { color: colors.onSurfaceVariant }]}>
            La estructura aparecera aqui despues del analisis.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.iconButton, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.borderLight }]}
            onPress={vm.cancelar}
          >
            <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.onSurface }]}>Escaner de plantillas</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{vm.progresoLabel}</Text>
          </View>
        </View>

        {renderProgress()}

        {vm.error ? (
          <View style={styles.errorCard}>
            <MaterialIcons name="warning-amber" size={20} color="#b42318" />
            <Text style={styles.errorText}>{vm.error}</Text>
          </View>
        ) : null}

        {vm.archivo ? (
          <View style={[styles.fileCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.borderLight }]}>
            <MaterialIcons name="description" size={18} color={colors.primary} />
            <View style={styles.fileMeta}>
              <Text style={[styles.fileName, { color: colors.onSurface }]}>{vm.archivo.name}</Text>
              <Text style={[styles.fileDetails, { color: colors.onSurfaceVariant }]}>
                {vm.extraccion?.rawText.length || 0} caracteres extraidos
              </Text>
            </View>
          </View>
        ) : null}

        <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
          <View style={[styles.mainColumn, isWide && styles.leftColumn]}>{renderStepContent()}</View>
          <View style={[styles.mainColumn, isWide && styles.rightColumn]}>{renderPlantillaPreview()}</View>
        </View>

        <View style={styles.footerRow}>
          <Pressable
            style={[
              styles.secondaryButton,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
                opacity: vm.paso === 1 || vm.paso === 3 ? 0.45 : 1,
              },
            ]}
            onPress={vm.irPasoAnterior}
            disabled={vm.paso === 1 || vm.paso === 3}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.onSurfaceVariant }]}>Atras</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, { borderColor: colors.borderLight, backgroundColor: colors.surfaceContainerLow }]}
            onPress={vm.reiniciar}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.onSurfaceVariant }]}>Reiniciar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  progressDotText: {
    fontSize: 12,
    fontWeight: "800",
  },
  progressLine: {
    width: 34,
    height: 2,
  },
  errorCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecdca",
    backgroundColor: "#fffbfa",
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  errorText: {
    flex: 1,
    color: "#b42318",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  fileCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fileMeta: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: "800",
  },
  fileDetails: {
    fontSize: 12,
  },
  mainGrid: {
    gap: 12,
  },
  mainGridWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mainColumn: {
    gap: 12,
  },
  leftColumn: {
    flex: 0.92,
  },
  rightColumn: {
    flex: 1.08,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  centerCard: {
    alignItems: "center",
    minHeight: 250,
    justifyContent: "center",
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  cardText: {
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
  },
  previewBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    maxHeight: 270,
  },
  previewText: {
    fontSize: 12,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 86,
    textAlignVertical: "top",
  },
  successActions: {
    width: "100%",
    gap: 8,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sideTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sideSubtitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  sectionsList: {
    gap: 8,
  },
  sectionPreview: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  sectionPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionPreviewTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  sectionPreviewMeta: {
    fontSize: 11,
    fontWeight: "700",
  },
  fieldsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  fieldPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  fieldPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyPreview: {
    borderRadius: 12,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 8,
  },
  emptyPreviewText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    gap: 8,
  },
});

export default EscanerPlantillaScreen;
