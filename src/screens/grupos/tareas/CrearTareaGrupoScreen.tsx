import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Switch,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, FONT_SIZES } from "../../../../types";
import WebScrollView from "../../../components/WebScrollView";
import { useCrearTareaGrupoViewModel } from "../../../hooks/useCrearTareaGrupoViewModel";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../navigation/StackNavigator";

let DateTimePicker: React.ComponentType<any> | null = null;
try {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
} catch {
  DateTimePicker = null;
}

/**
 * Pantalla para crear un nuevo entregable (View)
 * Diseño basado en Stitch screenshots — coincide con el diseño de Figma
 */
const CrearTareaGrupoScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, "CrearTareaGrupo">>();
  const navigation = useNavigation();
  const vm = useCrearTareaGrupoViewModel(route.params.grupoId, route.params.entregableId, route.params.unidadId);

  const isExamen = vm.tipo === "examen";

  const tituloLabel = isExamen ? "Título del Examen" : "TÍTULO DEL ENTREGABLE";
  const valorLabel = isExamen ? "Valor porcentual (%)" : "VALOR (PUNTOS)";
  const fechaEntregaLabel = isExamen ? "Fecha de Aplicación" : "FECHA DE ENTREGA";

  const headerText = vm.isEditMode ? "Editar\nEntregable" : "Crear\nEntregable";
  const saveText = vm.isEditMode ? "Guardar Cambios" : "Guardar Entregable";

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerText}</Text>
          <View style={{ flex: 1 }} />
          {vm.isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <TouchableOpacity style={styles.headerSaveButton} onPress={vm.handleGuardar}>
              <Text style={styles.headerSaveText}>{saveText}</Text>
            </TouchableOpacity>
          )}
        </View>

        <WebScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Type selector */}
            <Text style={styles.sectionLabel}>TIPO DE ENTREGABLE</Text>
            <View style={styles.tipoContainer}>
              {vm.tipoOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.tipoPill, vm.tipo === option.value && styles.tipoPillActive]}
                  onPress={() =>
                    vm.setTipo(option.value as "tarea" | "examen" | "proyecto" | "investigacion")
                  }
                >
                  <Text
                    style={[
                      styles.tipoPillText,
                      vm.tipo === option.value && styles.tipoPillTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form card */}
            <View style={styles.formCard}>
              {/* Grupo asignado */}
              <View style={styles.grupoCard}>
                <View style={styles.grupoIconContainer}>
                  <MaterialIcons name="groups" size={24} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.grupoLabel}>GRUPO ASIGNADO</Text>
                  <Text style={styles.grupoNombre}>{vm.grupoNombre}</Text>
                </View>
              </View>

              {/* Título */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{tituloLabel}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Ensayo sobre la Revolución Industrial"
                  value={vm.titulo}
                  onChangeText={vm.setTitulo}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              {/* Valor */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{valorLabel}</Text>
                <View style={styles.valorRow}>
                  <TextInput
                    style={[styles.input, styles.valorInput]}
                    placeholder={isExamen ? "30" : "100"}
                    value={vm.valor}
                    onChangeText={vm.setValor}
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                  {isExamen && <Text style={styles.valorSuffix}>%</Text>}
                </View>
              </View>

              {/* Descripción / Instrucciones */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {isExamen ? "Descripción e Instrucciones" : "DESCRIPCIÓN / INSTRUCCIONES"}
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe detalladamente los requisitos de la entrega..."
                  value={vm.descripcion}
                  onChangeText={vm.setDescripcion}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              {/* Dates */}
              {!isExamen && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>FECHA DE ASIGNACIÓN</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => vm.setShowFechaAsignacionPicker(true)}
                  >
                    <MaterialIcons name="event" size={20} color={COLORS.primary} />
                    <Text
                      style={[styles.dateInputText, !vm.fechaAsignacion && styles.datePlaceholder]}
                    >
                      {vm.fechaAsignacion || "dd/mm/aaaa"}
                    </Text>
                    <MaterialIcons name="calendar-today" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{fechaEntregaLabel}</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => vm.setShowFechaEntregaPicker(true)}
                >
                  <MaterialIcons
                    name={isExamen ? "event" : "event-busy"}
                    size={20}
                    color={isExamen ? COLORS.primary : COLORS.error}
                  />
                  <Text style={[styles.dateInputText, !vm.fechaEntrega && styles.datePlaceholder]}>
                    {vm.fechaEntrega || "dd/mm/aaaa"}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Late submission toggle */}
              <View style={styles.toggleContainer}>
                <View style={styles.toggleInfo}>
                  <MaterialIcons name="schedule" size={22} color={COLORS.text} />
                  <View style={styles.toggleTextContainer}>
                    <Text style={styles.toggleTitle}>Permitir entrega tardía</Text>
                    <Text style={styles.toggleSubtitle}>
                      {vm.permitirEntregaTardia
                        ? "El sistema marcará los envíos fuera de tiempo."
                        : 'SE MARCARÁ COMO "RETRASADA" EN EL CALIFICADOR'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={vm.permitirEntregaTardia}
                  onValueChange={vm.setPermitirEntregaTardia}
                  trackColor={{
                    false: COLORS.borderLight,
                    true: COLORS.primary,
                  }}
                  thumbColor="white"
                />
              </View>

              {/* Extended date when toggle is on */}
              {vm.permitirEntregaTardia && (
                <View style={styles.extendedDateContainer}>
                  <TouchableOpacity
                    style={styles.extendedDateRow}
                    onPress={() => vm.setShowFechaLimitePicker(true)}
                  >
                    <MaterialIcons name="event-busy" size={18} color={COLORS.primary} />
                    <Text style={styles.extendedDateLabel}>Fecha límite extendida:</Text>
                    <Text style={styles.extendedDateValue}>
                      {vm.fechaLimiteEntregaTardia || "dd/mm/aaaa"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Notas */}
              {!isExamen && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NOTAS ADICIONALES (OPCIONAL)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Recordatorios internos para el docente..."
                    value={vm.notas}
                    onChangeText={vm.setNotas}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
              )}
            </View>

            {/* Bottom buttons */}
            <TouchableOpacity
              style={[styles.saveButton, vm.isSaving && styles.saveButtonDisabled]}
              onPress={vm.handleGuardar}
              disabled={vm.isSaving}
            >
              {vm.isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.saveButtonText}>{saveText}</Text>
                  <MaterialIcons name="save" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={vm.handleCancelar}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            {vm.isEditMode && (
              <TouchableOpacity style={styles.deleteButton} onPress={vm.handleEliminar}>
                <MaterialIcons name="delete" size={20} color={COLORS.error} />
                <Text style={styles.deleteButtonText}>Eliminar Entregable</Text>
              </TouchableOpacity>
            )}
          </View>
        </WebScrollView>

        {/* Date Pickers */}
        {DateTimePicker && vm.showFechaAsignacionPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={vm.onFechaAsignacionChange}
          />
        )}
        {DateTimePicker && vm.showFechaEntregaPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={vm.onFechaEntregaChange}
          />
        )}
        {DateTimePicker && vm.showFechaLimitePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={vm.onFechaLimiteChange}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerBackButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    color: "white",
  },
  headerSaveButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerSaveText: {
    color: "white",
    fontSize: FONT_SIZES.small,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 110,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tipoContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  tipoPill: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  tipoPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tipoPillText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
  },
  tipoPillTextActive: {
    color: "white",
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  grupoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  grupoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  grupoLabel: {
    fontSize: FONT_SIZES.small,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  grupoNombre: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    color: COLORS.text,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    padding: 14,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  valorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  valorInput: {
    flex: 1,
  },
  valorSuffix: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginLeft: 10,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  dateInputText: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  datePlaceholder: {
    color: COLORS.textSecondary,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    color: COLORS.text,
  },
  toggleSubtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  extendedDateContainer: {
    backgroundColor: COLORS.backgroundSoft,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 14,
    marginBottom: 16,
  },
  extendedDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  extendedDateLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  extendedDateValue: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    color: COLORS.text,
    marginLeft: "auto",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: "#FFF5F5",
    marginTop: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
});

export default CrearTareaGrupoScreen;

