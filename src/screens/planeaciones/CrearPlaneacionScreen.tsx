import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useCrearPlaneacionViewModel } from "../../hooks/useCrearPlaneacionViewModel";

const CrearPlaneacionScreen: React.FC = () => {
  const { colors } = useTheme();
  const vm = useCrearPlaneacionViewModel();

  const StepHeader = (
    <View style={styles.stepHeader}>
      {[1, 2, 3].map((stepNumber) => {
        const active = vm.step === stepNumber;
        const done = vm.step > stepNumber;
        return (
          <View key={stepNumber} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                {
                  borderColor: active || done ? colors.primary : colors.borderLight,
                  backgroundColor: done ? colors.primary : active ? colors.primaryContainer : colors.surfaceContainerLow,
                },
              ]}
            >
              {done ? (
                <MaterialIcons name="check" size={16} color={colors.surface} />
              ) : (
                <Text style={[styles.stepText, { color: active ? colors.primary : colors.onSurfaceVariant }]}>
                  {stepNumber}
                </Text>
              )}
            </View>
            {stepNumber < 3 ? (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor: vm.step > stepNumber ? colors.primary : colors.borderLight,
                  },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Nueva planeacion</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Wizard en 3 pasos para abrir el nuevo DocEditor.
        </Text>
        {StepHeader}

        {vm.step === 1 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>1. Selecciona nivel academico</Text>
            <View style={styles.cardsGrid}>
              {vm.niveles.map((nivel) => {
                const selected = vm.nivelSeleccionado === nivel.nivel;
                return (
                  <Pressable
                    key={nivel.nivel}
                    style={[
                      styles.selectCard,
                      {
                        borderColor: selected ? colors.primary : colors.borderLight,
                        backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerLowest,
                      },
                    ]}
                    onPress={() => vm.seleccionarNivel(nivel.nivel)}
                  >
                    <MaterialIcons name={nivel.icon as any} size={26} color={selected ? colors.primary : colors.onSurfaceVariant} />
                    <Text style={[styles.cardTitle, { color: selected ? colors.primary : colors.onSurface }]}>
                      {nivel.titulo}
                    </Text>
                    <Text style={[styles.cardDescription, { color: colors.onSurfaceVariant }]}>{nivel.descripcion}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {vm.step === 2 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>2. Elige metodo de creacion</Text>
            <View style={styles.cardsGrid}>
              {vm.metodos.map((metodo) => {
                const selected = vm.metodoSeleccionado === metodo.id;
                return (
                  <Pressable
                    key={metodo.id}
                    style={[
                      styles.selectCard,
                      {
                        borderColor: selected ? colors.primary : colors.borderLight,
                        backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerLowest,
                      },
                    ]}
                    onPress={() => vm.seleccionarMetodo(metodo.id)}
                  >
                    <MaterialIcons name={metodo.icon as any} size={26} color={selected ? colors.primary : colors.onSurfaceVariant} />
                    <Text style={[styles.cardTitle, { color: selected ? colors.primary : colors.onSurface }]}>
                      {metodo.titulo}
                    </Text>
                    <Text style={[styles.cardDescription, { color: colors.onSurfaceVariant }]}>
                      {metodo.descripcion}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {vm.step === 3 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>3. Configuracion inicial</Text>
            <Text style={[styles.helper, { color: colors.onSurfaceVariant }]}>
              {vm.metodoSeleccionado === "ia" || vm.metodoSeleccionado === "importar"
                ? "Este metodo te llevara al flujo especializado."
                : "Estos datos se precargan en el documento antes de abrir DocEditor."}
            </Text>

            {vm.metodoSeleccionado !== "ia" && vm.metodoSeleccionado !== "importar" ? (
              <>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Asignatura</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: colors.borderLight,
                      backgroundColor: colors.surfaceContainerLowest,
                      color: colors.onSurface,
                    },
                  ]}
                  value={vm.asignatura}
                  placeholder="Ej. Espanol"
                  placeholderTextColor={colors.textMuted}
                  onChangeText={vm.setAsignatura}
                />

                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Grado</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: colors.borderLight,
                      backgroundColor: colors.surfaceContainerLowest,
                      color: colors.onSurface,
                    },
                  ]}
                  value={vm.grado}
                  placeholder="Ej. 2do, 3A"
                  placeholderTextColor={colors.textMuted}
                  onChangeText={vm.setGrado}
                />

                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Grupos (coma separada, opcional)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: colors.borderLight,
                      backgroundColor: colors.surfaceContainerLowest,
                      color: colors.onSurface,
                    },
                  ]}
                  value={vm.gruposInput}
                  placeholder="A, B, C"
                  placeholderTextColor={colors.textMuted}
                  onChangeText={vm.setGruposInput}
                />
              </>
            ) : null}
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable
            style={[
              styles.actionButton,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
                opacity: vm.step === 1 ? 0.45 : 1,
              },
            ]}
            disabled={vm.step === 1}
            onPress={vm.irAnterior}
          >
            <Text style={[styles.actionButtonText, { color: colors.onSurfaceVariant }]}>Atras</Text>
          </Pressable>

          {vm.step < 3 ? (
            <Pressable
              style={[
                styles.actionButton,
                {
                  borderColor: colors.primary,
                  backgroundColor: colors.primary,
                  opacity: vm.puedeAvanzar ? 1 : 0.45,
                },
              ]}
              disabled={!vm.puedeAvanzar}
              onPress={vm.irSiguiente}
            >
              <Text style={[styles.actionButtonText, { color: colors.surface }]}>Siguiente</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.actionButton,
                {
                  borderColor: colors.primary,
                  backgroundColor: colors.primary,
                  opacity: vm.puedeAvanzar ? 1 : 0.45,
                },
              ]}
              disabled={!vm.puedeAvanzar || vm.isSubmitting}
              onPress={() => {
                void vm.finalizar();
              }}
            >
              {vm.isSubmitting ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <Text style={[styles.actionButtonText, { color: colors.surface }]}>Finalizar</Text>
              )}
            </Pressable>
          )}
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
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stepText: {
    fontSize: 13,
    fontWeight: "700",
  },
  stepLine: {
    width: 48,
    height: 2,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  helper: {
    fontSize: 12,
    lineHeight: 17,
  },
  cardsGrid: {
    gap: 8,
  },
  selectCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});

export default CrearPlaneacionScreen;

