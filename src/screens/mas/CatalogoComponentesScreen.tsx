import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../themes/useAppTheme";
import { scaleType, spacing, typography } from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import {
  Banner,
  Button,
  Card,
  Chip,
  EmptyState,
  Input,
  Screen,
  Sheet,
  Skeleton,
  Toast,
} from "../../components/base";

/**
 * Catalogo de la biblioteca base (change componentes-base, #82).
 *
 * Existe para que cada componente y cada estado sean revisables sin abrir una pantalla de
 * produccion, y para dar a la QA visual por breakpoint una superficie real: medir una
 * maqueta HTML no probaria el comportamiento de los componentes de React Native.
 *
 * Solo se monta bajo `__DEV__` (ver MasStack). No es una pantalla de producto y no debe
 * recibir datos reales del docente.
 */
const CatalogoComponentesScreen: React.FC = () => {
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const [texto, setTexto] = useState("");
  const [chipSeleccionado, setChipSeleccionado] = useState(true);
  const [chipsVisibles, setChipsVisibles] = useState(["Primaria", "Secundaria"]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  return (
    <Screen testID="catalogo">
      <Text style={styles.tituloPantalla}>Catalogo de componentes base</Text>
      <Text style={styles.introPantalla}>
        Superficie de revision de la biblioteca base. Solo visible en desarrollo.
      </Text>

      <Seccion titulo="Button" styles={styles}>
        <View style={styles.fila}>
          <Button label="Primario" onPress={() => setToastVisible(true)} />
          <Button label="Secundario" variant="secondary" onPress={() => undefined} />
          <Button label="Fantasma" variant="ghost" onPress={() => undefined} />
          <Button label="Destructivo" variant="destructive" icon="delete" onPress={() => undefined} />
        </View>
        <View style={styles.fila}>
          <Button label="Deshabilitado" disabled onPress={() => undefined} />
          <Button label="Cargando" loading onPress={() => undefined} />
          <Button label="Con icono" icon="save" onPress={() => undefined} />
        </View>
      </Seccion>

      <Seccion titulo="Input" styles={styles}>
        <Input
          label="Nombre del grupo"
          ayuda="Como lo veran tus alumnos"
          value={texto}
          onChangeText={setTexto}
          placeholder="3o A"
          required
        />
        <View style={styles.espacio} />
        <Input label="Correo" error="Ese correo no es valido" value="hola@" onChangeText={() => undefined} />
        <View style={styles.espacio} />
        <Input label="Materia" disabled value="Matematicas" onChangeText={() => undefined} />
      </Seccion>

      <Seccion titulo="Chip" styles={styles}>
        <View style={styles.fila}>
          <Chip
            label="Seleccionable"
            selected={chipSeleccionado}
            onPress={() => setChipSeleccionado((valor) => !valor)}
          />
          <Chip label="Con icono" icon="school" onPress={() => undefined} />
          <Chip label="Deshabilitado" disabled onPress={() => undefined} />
        </View>
        <View style={styles.fila}>
          {chipsVisibles.map((etiqueta) => (
            <Chip
              key={etiqueta}
              label={etiqueta}
              onDismiss={() =>
                setChipsVisibles((actuales) => actuales.filter((item) => item !== etiqueta))
              }
            />
          ))}
          {chipsVisibles.length === 0 ? (
            <Button
              label="Restaurar chips"
              variant="ghost"
              onPress={() => setChipsVisibles(["Primaria", "Secundaria"])}
            />
          ) : null}
        </View>
      </Seccion>

      <Seccion titulo="Card" styles={styles}>
        <Card elevation="level1">
          <Text style={styles.textoCard}>Nivel 1: superficie de reposo</Text>
        </Card>
        <View style={styles.espacio} />
        <Card elevation="level2" onPress={() => undefined} accessibilityLabel="Tarjeta presionable">
          <Text style={styles.textoCard}>Nivel 2: presionable, responde con escala</Text>
        </Card>
        <View style={styles.espacio} />
        <Card elevation="level3">
          <Text style={styles.textoCard}>Nivel 3: capa flotante</Text>
        </Card>
      </Seccion>

      <Seccion titulo="Banner" styles={styles}>
        <Banner tone="info" titulo="Sugerencia de la IA lista" mensaje="Revisa antes de aplicarla." />
        <View style={styles.espacio} />
        <Banner tone="success" titulo="Planeacion guardada" />
        <View style={styles.espacio} />
        <Banner
          tone="warning"
          titulo="Cambios sin sincronizar"
          mensaje="Se guardaron en este dispositivo."
          accion={{ label: "Sincronizar", onPress: () => undefined }}
        />
        <View style={styles.espacio} />
        <Banner
          tone="error"
          titulo="No se pudo exportar"
          mensaje="El archivo quedo incompleto."
          onDismiss={() => undefined}
        />
      </Seccion>

      <Seccion titulo="Skeleton (estado de carga)" styles={styles}>
        <Skeleton width="60%" height={22} />
        <View style={styles.espacio} />
        <Skeleton width="90%" />
        <View style={styles.espacio} />
        <Skeleton width="75%" />
        <View style={styles.espacio} />
        <Skeleton height={96} shape="card" />
      </Seccion>

      <Seccion titulo="EmptyState: vacio" styles={styles}>
        <EmptyState variant="empty" accion={{ label: "Crear planeacion", onPress: () => undefined }} />
      </Seccion>

      <Seccion titulo="EmptyState: error" styles={styles}>
        <EmptyState variant="error" accion={{ label: "Reintentar", onPress: () => undefined }} />
      </Seccion>

      <Seccion titulo="EmptyState: sin conexion" styles={styles}>
        <EmptyState variant="offline" accion={{ label: "Reintentar", onPress: () => undefined }} />
      </Seccion>

      <Seccion titulo="Capas" styles={styles}>
        <View style={styles.fila}>
          <Button label="Abrir hoja" onPress={() => setSheetVisible(true)} />
          <Button label="Mostrar toast" variant="secondary" onPress={() => setToastVisible(true)} />
        </View>
        <View style={styles.espacio} />
        <Toast
          visible={toastVisible}
          tone="success"
          mensaje="Planeacion guardada en este dispositivo."
          onDismiss={() => setToastVisible(false)}
        />
      </Seccion>

      <Sheet
        visible={sheetVisible}
        titulo="Hoja de ejemplo"
        onClose={() => setSheetVisible(false)}
        footer={
          <>
            <Button label="Cancelar" variant="ghost" onPress={() => setSheetVisible(false)} />
            <Button label="Aplicar" onPress={() => setSheetVisible(false)} />
          </>
        }
      >
        <Text style={styles.textoCard}>
          En movil nace del borde inferior; en tablet y escritorio se centra como dialogo.
        </Text>
      </Sheet>
    </Screen>
  );
};

interface SeccionProps {
  titulo: string;
  styles: ReturnType<typeof getStyles>;
  children: React.ReactNode;
}

const Seccion: React.FC<SeccionProps> = ({ titulo, styles, children }) => (
  <View style={styles.seccion}>
    <Text style={styles.tituloSeccion}>{titulo}</Text>
    {children}
  </View>
);

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) =>
  StyleSheet.create({
    tituloPantalla: {
      ...scaleType(typography.title, scaled),
      color: colors.text,
    },
    introPantalla: {
      ...scaleType(typography.body, scaled),
      color: highContrast ? colors.text : colors.textSecondary,
      marginTop: spacing.xs,
    },
    seccion: {
      marginTop: spacing.xxl,
    },
    tituloSeccion: {
      ...scaleType(typography.overline, scaled),
      color: highContrast ? colors.text : colors.textTertiary,
      textTransform: "uppercase",
      marginBottom: spacing.md,
    },
    fila: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    espacio: {
      height: spacing.md,
    },
    textoCard: {
      ...scaleType(typography.body, scaled),
      color: colors.text,
    },
  });

export default CatalogoComponentesScreen;
