import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAppTheme } from "../../themes/useAppTheme";
import {
  radii,
  scaleType,
  spacing,
  typography,
} from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import Sheet from "../base/Sheet";
import Button from "../base/Button";
import Banner from "../base/Banner";
import EmptyState from "../base/EmptyState";
import Skeleton from "../base/Skeleton";
import { MIN_TOUCH_TARGET, useFocusRing } from "../base/primitives";
import WebScrollView from "../WebScrollView";
import { useSyncPresentation } from "../../hooks/useSyncPresentation";
import {
  useAssignSheet,
  type ElementoAsignable,
  type OpcionDestino,
  type ResultadoAsignacion,
} from "../../hooks/useAssignSheet";

export interface AssignSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Lo que se va a asignar. El contrato es esto y no una pantalla concreta: por eso la hoja es transversal. */
  elementos: ElementoAsignable[];
  /** Salida cuando el docente no tiene ninguna clase todavia. */
  onCrearClase?: () => void;
  onAsignado?: (resultado: ResultadoAsignacion) => void;
  testID?: string;
}

/**
 * Selector transversal de asignar y adjuntar (change assign-sheet, #84).
 *
 * Renderiza lo que resuelve `useAssignSheet()`; no decide destinos ni escribe. El estado de
 * sincronizacion se expresa con el vocabulario de `useSyncPresentation()` (#83): esta hoja
 * no puede inventar copy de falta de conexion, porque eso reintroduciria la derivacion
 * duplicada que ese change cerro.
 */
const AssignSheet: React.FC<AssignSheetProps> = ({
  visible,
  onClose,
  elementos,
  onCrearClase,
  onAsignado,
  testID,
}) => {
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );
  const presentacion = useSyncPresentation();
  const vm = useAssignSheet(elementos);

  const cerrar = () => {
    vm.reiniciar();
    onClose();
  };

  const confirmar = async () => {
    await vm.asignar();
  };

  // El resultado se afirma cuando existe, no antes: la pantalla anterior decia
  // "Asignacion completada" incluso tras cero escrituras.
  const resultado = vm.resultado;
  if (resultado) {
    const sinCambios = resultado.asignados === 0;
    return (
      <Sheet
        visible={visible}
        titulo={sinCambios ? "No se asigno nada" : "Listo"}
        onClose={cerrar}
        testID={testID}
        footer={
          <Button
            label="Cerrar"
            onPress={() => {
              onAsignado?.(resultado);
              cerrar();
            }}
            testID={testID ? `${testID}-resultado-cerrar` : undefined}
          />
        }
      >
        <View style={styles.resultado} testID={testID ? `${testID}-resultado` : undefined}>
          <MaterialIcons
            name={sinCambios ? "info-outline" : "check-circle-outline"}
            size={32}
            color={sinCambios ? colors.textSecondary : colors.primary}
          />
          <Text style={styles.resultadoTitulo}>
            {sinCambios
              ? "Ningun elemento cambio de destino."
              : `${resultado.asignados} ${resultado.asignados === 1 ? "elemento asignado" : "elementos asignados"} a ${vm.resumenDestino}.`}
          </Text>
          {!sinCambios && !resultado.syncOk ? (
            <Text style={styles.resultadoDetalle}>
              {presentacion.titulo}. Se asignara en el servidor cuando vuelva la conexion.
            </Text>
          ) : null}
          {!sinCambios && resultado.syncOk ? (
            <Text style={styles.resultadoDetalle}>La asignacion ya esta sincronizada.</Text>
          ) : null}
        </View>
      </Sheet>
    );
  }

  const sinClases = !vm.cargando && vm.clases.length === 0;

  return (
    <Sheet
      visible={visible}
      titulo="Asignar a clase"
      onClose={cerrar}
      testID={testID}
      footer={
        sinClases ? undefined : (
          <>
            <Button
              label="Cancelar"
              variant="ghost"
              onPress={cerrar}
              testID={testID ? `${testID}-cancelar` : undefined}
            />
            <Button
              label={vm.ejecutando ? "Asignando" : "Asignar"}
              onPress={() => void confirmar()}
              disabled={!vm.puedeConfirmar}
              loading={vm.ejecutando}
              accessibilityHint={
                vm.resumenDestino
                  ? `Asignar ${resumenElementos(elementos)} a ${vm.resumenDestino}`
                  : "Elige una clase para continuar"
              }
              testID={testID ? `${testID}-confirmar` : undefined}
            />
          </>
        )
      }
    >
      {vm.cargando && vm.clases.length === 0 ? (
        <View style={styles.cargandoClases}>
          <Skeleton height={MIN_TOUCH_TARGET} shape="card" />
          <Skeleton height={MIN_TOUCH_TARGET} shape="card" />
        </View>
      ) : sinClases ? (
        <EmptyState
          variant="empty"
          titulo="Aun no tienes clases"
          mensaje="Crea una clase para poder asignar tus materiales."
          accion={{
            label: "Crear clase",
            onPress: () => {
              cerrar();
              onCrearClase?.();
            },
          }}
          testID={testID ? `${testID}-vacio` : undefined}
        />
      ) : (
        <WebScrollView style={styles.cuerpo}>
          <Text style={styles.resumenElementos}>{resumenElementos(elementos)}</Text>

          {/* Sin conexion se puede asignar igual: la operacion queda encolada. El aviso
              informa, no bloquea, y usa el vocabulario compartido de sincronizacion. */}
          {presentacion.estado === "sin-conexion" || presentacion.estado === "sin-servidor" ? (
            <Banner
              tone="info"
              titulo={presentacion.titulo}
              mensaje="Puedes asignar igual: se subira al reconectar."
              testID={testID ? `${testID}-offline` : undefined}
            />
          ) : null}

          {vm.error ? (
            <Banner
              tone="warning"
              titulo="No se pudieron cargar los destinos"
              mensaje={vm.error}
              accion={{ label: "Reintentar", onPress: vm.reintentar }}
              testID={testID ? `${testID}-error` : undefined}
            />
          ) : null}

          <Seccion titulo="Clase" styles={styles}>
            {vm.clases.map((opcion) => (
              <OpcionFila
                key={opcion.id}
                opcion={opcion}
                seleccionada={String(vm.destino.grupoId) === opcion.id}
                onPress={() =>
                  vm.elegirClase(
                    String(vm.destino.grupoId) === opcion.id ? null : Number(opcion.id)
                  )
                }
                styles={styles}
                colors={colors}
                testID={testID ? `${testID}-clase-${opcion.id}` : undefined}
              />
            ))}
          </Seccion>

          {vm.destino.grupoId !== null ? (
            <>
              <Seccion titulo="Unidad (opcional)" styles={styles}>
                {vm.cargando ? (
                  <Skeleton height={MIN_TOUCH_TARGET} shape="card" />
                ) : vm.unidades.length === 0 ? (
                  <Text style={styles.sinOpciones}>Esta clase aun no tiene unidades.</Text>
                ) : (
                  vm.unidades.map((opcion) => (
                    <OpcionFila
                      key={opcion.id}
                      opcion={opcion}
                      seleccionada={vm.destino.unidadId === opcion.id}
                      onPress={() =>
                        vm.elegirUnidad(vm.destino.unidadId === opcion.id ? null : opcion.id)
                      }
                      styles={styles}
                      colors={colors}
                      testID={testID ? `${testID}-unidad-${opcion.id}` : undefined}
                    />
                  ))
                )}
              </Seccion>

              {/* El nivel de actividad no se ofrece cuando algun elemento no puede
                  referenciarla: mostrarlo dejaria elegir un destino que no se aplica. */}
              {vm.admiteActividad ? (
                <Seccion titulo="Actividad (opcional)" styles={styles}>
                  {vm.cargando ? (
                    <Skeleton height={MIN_TOUCH_TARGET} shape="card" />
                  ) : vm.actividades.length === 0 ? (
                    <Text style={styles.sinOpciones}>Esta clase aun no tiene actividades.</Text>
                  ) : (
                    vm.actividades.map((opcion) => (
                      <OpcionFila
                        key={opcion.id}
                        opcion={opcion}
                        seleccionada={String(vm.destino.tareaId) === opcion.id}
                        onPress={() =>
                          vm.elegirActividad(
                            String(vm.destino.tareaId) === opcion.id ? null : Number(opcion.id)
                          )
                        }
                        styles={styles}
                        colors={colors}
                        testID={testID ? `${testID}-actividad-${opcion.id}` : undefined}
                      />
                    ))
                  )}
                </Seccion>
              ) : null}
            </>
          ) : null}

          {vm.resumenDestino ? (
            <Text style={styles.destinoElegido} testID={testID ? `${testID}-destino` : undefined}>
              Destino: {vm.resumenDestino}
            </Text>
          ) : null}
        </WebScrollView>
      )}
    </Sheet>
  );
};

const resumenElementos = (elementos: ElementoAsignable[]): string =>
  elementos.length === 1
    ? elementos[0].titulo
    : `${elementos.length} ${elementos.length === 1 ? "elemento" : "elementos"}`;

const Seccion: React.FC<{
  titulo: string;
  styles: ReturnType<typeof getStyles>;
  children: React.ReactNode;
}> = ({ titulo, styles, children }) => (
  <View style={styles.seccion}>
    <Text style={styles.seccionTitulo}>{titulo}</Text>
    {children}
  </View>
);

const OpcionFila: React.FC<{
  opcion: OpcionDestino;
  seleccionada: boolean;
  onPress: () => void;
  styles: ReturnType<typeof getStyles>;
  colors: ThemedStylesInput["colors"];
  testID?: string;
}> = ({ opcion, seleccionada, onPress, styles, colors, testID }) => {
  const foco = useFocusRing();
  return (
    <Pressable
      onPress={onPress}
      onFocus={foco.onFocus}
      onBlur={foco.onBlur}
      style={[styles.opcion, seleccionada && styles.opcionSeleccionada, foco.focused && styles.focusRing]}
      accessibilityRole="radio"
      accessibilityLabel={opcion.label}
      accessibilityState={{ selected: seleccionada, checked: seleccionada }}
      // React Native Web no deriva aria-checked de accessibilityState (hallazgo de #82):
      // sin este prop la eleccion solo se comunica por color, que es justo lo prohibido.
      aria-checked={seleccionada}
      testID={testID}
    >
      <MaterialIcons
        name={seleccionada ? "radio-button-checked" : "radio-button-unchecked"}
        size={20}
        color={seleccionada ? colors.primary : colors.textSecondary}
      />
      <Text style={[styles.opcionLabel, seleccionada && styles.opcionLabelSeleccionada]} numberOfLines={2}>
        {opcion.label}
      </Text>
    </Pressable>
  );
};

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) =>
  StyleSheet.create({
    cuerpo: {
      maxHeight: 420,
    },
    cargandoClases: {
      gap: spacing.xs,
    },
    resumenElementos: {
      ...scaleType(typography.body, scaled),
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    seccion: {
      marginTop: spacing.md,
      gap: spacing.xs,
    },
    seccionTitulo: {
      ...scaleType(typography.caption, scaled),
      color: colors.textSecondary,
      textTransform: "uppercase",
      marginBottom: spacing.xs,
    },
    opcion: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      // Altura minima real: `hitSlop` extiende el area tactil pero no ensancha por debajo
      // del ancho, y una fila de lista debe cumplir el minimo por su propia forma (#83).
      minHeight: MIN_TOUCH_TARGET,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: highContrast ? colors.borderStrong : colors.borderLight,
      backgroundColor: colors.surface,
    },
    opcionSeleccionada: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryTint,
    },
    opcionLabel: {
      ...scaleType(typography.body, scaled),
      color: colors.text,
      flex: 1,
    },
    opcionLabelSeleccionada: {
      color: colors.primaryDark,
    },
    sinOpciones: {
      ...scaleType(typography.caption, scaled),
      color: colors.textSecondary,
      paddingVertical: spacing.xs,
    },
    destinoElegido: {
      ...scaleType(typography.body, scaled),
      color: colors.text,
      marginTop: spacing.lg,
    },
    resultado: {
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.md,
    },
    resultadoTitulo: {
      ...scaleType(typography.subtitle, scaled),
      color: colors.text,
      textAlign: "center",
    },
    resultadoDetalle: {
      ...scaleType(typography.body, scaled),
      color: colors.textSecondary,
      textAlign: "center",
    },
    focusRing: {
      boxShadow: `0px 0px 0px 3px ${colors.primary}`,
    },
  });

export default AssignSheet;
