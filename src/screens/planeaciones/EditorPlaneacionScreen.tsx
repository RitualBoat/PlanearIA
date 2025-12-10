import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";
import WebScrollView from "../../components/WebScrollView";
import SyncIndicator from "../../components/SyncIndicator";
import {
  NivelAcademico,
  Planeacion,
  PlaneacionBase,
  Actividad,
} from "../../../types/planeacion";
import { usePlaneaciones } from "../../context/PlaneacionesContext";

type EditorPlaneacionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EditorPlaneacion"
>;

type EditorPlaneacionScreenRouteProp = RouteProp<
  RootStackParamList,
  "EditorPlaneacion"
>;

interface EditorPlaneacionScreenProps {
  navigation: EditorPlaneacionScreenNavigationProp;
  route: EditorPlaneacionScreenRouteProp;
}

const EditorPlaneacionScreen: React.FC<EditorPlaneacionScreenProps> = ({
  navigation,
  route,
}) => {
  const { nivel, modo, planeacionId } = route.params;
  const { agregarPlaneacion, actualizarPlaneacion, obtenerPlaneacion } =
    usePlaneaciones();

  // Estado del formulario
  const [asignatura, setAsignatura] = useState("");
  const [grado, setGrado] = useState("");
  const [grupo, setGrupo] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [duracionTotal, setDuracionTotal] = useState("50");
  const [unidadTematica, setUnidadTematica] = useState("");
  const [temaSesion, setTemaSesion] = useState("");
  const [aprendizajesEsperados, setAprendizajesEsperados] = useState("");
  const [actividadInicio, setActividadInicio] = useState("");
  const [duracionInicio, setDuracionInicio] = useState("10");
  const [actividadDesarrollo, setActividadDesarrollo] = useState("");
  const [duracionDesarrollo, setDuracionDesarrollo] = useState("30");
  const [actividadCierre, setActividadCierre] = useState("");
  const [duracionCierre, setDuracionCierre] = useState("10");
  const [recursos, setRecursos] = useState("");
  const [evaluacion, setEvaluacion] = useState("");
  const [evidencias, setEvidencias] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Campos específicos por nivel
  const [campoFormativo, setCampoFormativo] = useState(""); // Primaria
  const [competenciasDisciplinares, setCompetenciasDisciplinares] =
    useState(""); // Secundaria/Preparatoria
  const [competenciasGenericas, setCompetenciasGenericas] = useState(""); // Preparatoria
  const [competenciasProfesionales, setCompetenciasProfesionales] =
    useState(""); // Universidad
  const [objetivosAprendizaje, setObjetivosAprendizaje] = useState(""); // Universidad
  const [bibliografia, setBibliografia] = useState(""); // Preparatoria/Universidad
  const [modalidad, setModalidad] = useState("presencial"); // Universidad

  /**
   * Carga datos si está en modo edición
   */
  useEffect(() => {
    if (modo === "editar" && planeacionId) {
      const planeacion = obtenerPlaneacion(planeacionId);
      if (planeacion) {
        cargarDatosPlaneacion(planeacion);
      }
    }
  }, [modo, planeacionId]);

  /**
   * Carga los datos de una planeación existente
   */
  const cargarDatosPlaneacion = (planeacion: Planeacion) => {
    setAsignatura(planeacion.asignatura);
    setGrado(planeacion.grado);
    setGrupo(planeacion.grupo);
    setFecha(planeacion.fecha.split("T")[0]);
    setHoraInicio(planeacion.horaInicio);
    setDuracionTotal(planeacion.duracionTotal.toString());
    setUnidadTematica(planeacion.unidadTematica);
    setTemaSesion(planeacion.temaSesion);
    setAprendizajesEsperados(planeacion.aprendizajesEsperados.join("\n"));

    if (planeacion.actividades.length >= 3) {
      setActividadInicio(planeacion.actividades[0].descripcion);
      setDuracionInicio(planeacion.actividades[0].duracion.toString());
      setActividadDesarrollo(planeacion.actividades[1].descripcion);
      setDuracionDesarrollo(planeacion.actividades[1].duracion.toString());
      setActividadCierre(planeacion.actividades[2].descripcion);
      setDuracionCierre(planeacion.actividades[2].duracion.toString());
    }

    setRecursos(planeacion.recursos.join("\n"));
    setEvaluacion(planeacion.evaluacion);
    setEvidencias(planeacion.evidencias.join("\n"));
    setObservaciones(planeacion.observaciones);

    // Cargar campos específicos según el nivel
    if (planeacion.nivelAcademico === NivelAcademico.PRIMARIA) {
      setCampoFormativo((planeacion as any).campoFormativo || "");
    } else if (planeacion.nivelAcademico === NivelAcademico.SECUNDARIA) {
      setCompetenciasDisciplinares(
        (planeacion as any).competenciasDisciplinares?.join("\n") || ""
      );
    } else if (planeacion.nivelAcademico === NivelAcademico.PREPARATORIA) {
      setCompetenciasGenericas(
        (planeacion as any).competenciasGenericas?.join("\n") || ""
      );
      setCompetenciasDisciplinares(
        (planeacion as any).competenciasDisciplinares?.join("\n") || ""
      );
      setBibliografia((planeacion as any).bibliografia?.join("\n") || "");
    } else if (planeacion.nivelAcademico === NivelAcademico.UNIVERSIDAD) {
      setCompetenciasProfesionales(
        (planeacion as any).competenciasProfesionales?.join("\n") || ""
      );
      setObjetivosAprendizaje(
        (planeacion as any).objetivosAprendizaje?.join("\n") || ""
      );
      setBibliografia((planeacion as any).bibliografia?.join("\n") || "");
      setModalidad((planeacion as any).modalidad || "presencial");
    }
  };

  /**
   * Valida el formulario
   */
  const validarFormulario = (): boolean => {
    if (!asignatura.trim()) {
      mostrarAlerta("Por favor ingresa la asignatura");
      return false;
    }
    if (!grado.trim()) {
      mostrarAlerta("Por favor ingresa el grado");
      return false;
    }
    if (!temaSesion.trim()) {
      mostrarAlerta("Por favor ingresa el tema de la sesión");
      return false;
    }
    return true;
  };

  /**
   * Muestra una alerta según la plataforma
   */
  const mostrarAlerta = (mensaje: string) => {
    if (Platform.OS === "web") {
      window.alert(mensaje);
    } else {
      Alert.alert("Atención", mensaje);
    }
  };

  /**
   * Guarda la planeación
   */
  /**
   * Guarda la planeación
   */
  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    const actividades: Actividad[] = [
      {
        tipo: "inicio",
        descripcion: actividadInicio,
        duracion: parseInt(duracionInicio) || 10,
      },
      {
        tipo: "desarrollo",
        descripcion: actividadDesarrollo,
        duracion: parseInt(duracionDesarrollo) || 30,
      },
      {
        tipo: "cierre",
        descripcion: actividadCierre,
        duracion: parseInt(duracionCierre) || 10,
      },
    ];

    const planeacionBase: PlaneacionBase = {
      id:
        modo === "editar" && planeacionId
          ? planeacionId
          : Date.now().toString(),
      nivelAcademico: nivel,
      asignatura,
      grado,
      grupo,
      fecha: new Date(fecha).toISOString(),
      horaInicio,
      duracionTotal: parseInt(duracionTotal) || 50,
      unidadTematica,
      temaSesion,
      aprendizajesEsperados: aprendizajesEsperados
        .split("\n")
        .filter((a) => a.trim()),
      actividades,
      recursos: recursos.split("\n").filter((r) => r.trim()),
      evaluacion,
      evidencias: evidencias.split("\n").filter((e) => e.trim()),
      observaciones,
      fechaCreacion:
        modo === "editar" && planeacionId
          ? obtenerPlaneacion(planeacionId)?.fechaCreacion ||
            new Date().toISOString()
          : new Date().toISOString(),
      fechaModificacion: new Date().toISOString(),
    };

    let planeacion: Planeacion;

    // Construir objeto específico según el nivel
    switch (nivel) {
      case NivelAcademico.PRIMARIA:
        planeacion = {
          ...planeacionBase,
          nivelAcademico: NivelAcademico.PRIMARIA,
          campoFormativo,
        };
        break;
      case NivelAcademico.SECUNDARIA:
        planeacion = {
          ...planeacionBase,
          nivelAcademico: NivelAcademico.SECUNDARIA,
          competenciasDisciplinares: competenciasDisciplinares
            .split("\n")
            .filter((c) => c.trim()),
        };
        break;
      case NivelAcademico.PREPARATORIA:
        planeacion = {
          ...planeacionBase,
          nivelAcademico: NivelAcademico.PREPARATORIA,
          competenciasGenericas: competenciasGenericas
            .split("\n")
            .filter((c) => c.trim()),
          competenciasDisciplinares: competenciasDisciplinares
            .split("\n")
            .filter((c) => c.trim()),
          bibliografia: bibliografia.split("\n").filter((b) => b.trim()),
        };
        break;
      case NivelAcademico.UNIVERSIDAD:
        planeacion = {
          ...planeacionBase,
          nivelAcademico: NivelAcademico.UNIVERSIDAD,
          competenciasProfesionales: competenciasProfesionales
            .split("\n")
            .filter((c) => c.trim()),
          objetivosAprendizaje: objetivosAprendizaje
            .split("\n")
            .filter((o) => o.trim()),
          bibliografia: bibliografia.split("\n").filter((b) => b.trim()),
          modalidad: modalidad as any,
        };
        break;
      default:
        return;
    }

    try {
      if (modo === "editar" && planeacionId) {
        await actualizarPlaneacion(planeacionId, planeacion);
        mostrarAlerta("Planeación actualizada exitosamente");
      } else {
        await agregarPlaneacion(planeacion);
        mostrarAlerta("Planeación guardada exitosamente");
      }

      navigation.navigate("ListaPlaneaciones");
    } catch (error) {
      mostrarAlerta("Error al guardar la planeación");
      console.error(error);
    }
  };

  /**
   * Obtiene el título según el nivel
   */
  const obtenerTitulo = (): string => {
    const accion = modo === "editar" ? "Editar" : "Nueva";
    const nivelTexto = {
      [NivelAcademico.PRIMARIA]: "Primaria",
      [NivelAcademico.SECUNDARIA]: "Secundaria",
      [NivelAcademico.PREPARATORIA]: "Preparatoria",
      [NivelAcademico.UNIVERSIDAD]: "Universidad",
    };
    return `${accion} Planeación - ${nivelTexto[nivel]}`;
  };

  // Obtener dimensiones de la ventana
  const windowHeight = Dimensions.get("window").height;
  const navBarHeight = 80; // Altura aproximada del BottomNavBar

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <WebScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        nestedScrollEnabled={true}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.title}>{obtenerTitulo()}</Text>
            <SyncIndicator />
          </View>
          <Text style={styles.subtitle}>
            Completa todos los campos de tu planeación
          </Text>

          {/* Datos Generales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="info" size={20} /> Datos Generales
            </Text>

            <Text style={styles.label}>Asignatura / Materia *</Text>
            <TextInput
              style={styles.input}
              value={asignatura}
              onChangeText={setAsignatura}
              placeholder="Ej: Matemáticas"
              placeholderTextColor={COLORS.textSecondary}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Grado *</Text>
                <TextInput
                  style={styles.input}
                  value={grado}
                  onChangeText={setGrado}
                  placeholder="Ej: 3°"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>Grupo</Text>
                <TextInput
                  style={styles.input}
                  value={grupo}
                  onChangeText={setGrupo}
                  placeholder="Ej: A"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Fecha</Text>
                <TextInput
                  style={styles.input}
                  value={fecha}
                  onChangeText={setFecha}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>Hora Inicio</Text>
                <TextInput
                  style={styles.input}
                  value={horaInicio}
                  onChangeText={setHoraInicio}
                  placeholder="HH:MM"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>

            <Text style={styles.label}>Duración Total (minutos)</Text>
            <TextInput
              style={styles.input}
              value={duracionTotal}
              onChangeText={setDuracionTotal}
              placeholder="Ej: 50"
              keyboardType="numeric"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Campos Específicos por Nivel */}
          {nivel === NivelAcademico.PRIMARIA && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <MaterialIcons name="category" size={20} /> Primaria
              </Text>
              <Text style={styles.label}>Campo Formativo</Text>
              <TextInput
                style={styles.input}
                value={campoFormativo}
                onChangeText={setCampoFormativo}
                placeholder="Ej: Lenguaje y Comunicación"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          )}

          {nivel === NivelAcademico.SECUNDARIA && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <MaterialIcons name="workspace-premium" size={20} /> Secundaria
              </Text>
              <Text style={styles.label}>
                Competencias Disciplinares (una por línea)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={competenciasDisciplinares}
                onChangeText={setCompetenciasDisciplinares}
                placeholder="Lista de competencias..."
                multiline
                numberOfLines={4}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          )}

          {nivel === NivelAcademico.PREPARATORIA && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <MaterialIcons name="school" size={20} /> Preparatoria
              </Text>
              <Text style={styles.label}>
                Competencias Genéricas (una por línea)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={competenciasGenericas}
                onChangeText={setCompetenciasGenericas}
                placeholder="Lista de competencias genéricas..."
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>
                Competencias Disciplinares (una por línea)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={competenciasDisciplinares}
                onChangeText={setCompetenciasDisciplinares}
                placeholder="Lista de competencias disciplinares..."
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Bibliografía (una por línea)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bibliografia}
                onChangeText={setBibliografia}
                placeholder="Referencias bibliográficas..."
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          )}

          {nivel === NivelAcademico.UNIVERSIDAD && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <MaterialIcons name="account-balance" size={20} /> Universidad
              </Text>

              <Text style={styles.label}>Modalidad</Text>
              <View style={styles.modalidadContainer}>
                {["presencial", "hibrida", "virtual"].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.modalidadButton,
                      modalidad === m && styles.modalidadButtonActive,
                    ]}
                    onPress={() => setModalidad(m)}
                  >
                    <Text
                      style={[
                        styles.modalidadText,
                        modalidad === m && styles.modalidadTextActive,
                      ]}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>
                Competencias Profesionales (una por línea)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={competenciasProfesionales}
                onChangeText={setCompetenciasProfesionales}
                placeholder="Lista de competencias profesionales..."
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>
                Objetivos de Aprendizaje (uno por línea)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={objetivosAprendizaje}
                onChangeText={setObjetivosAprendizaje}
                placeholder="Lista de objetivos..."
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Bibliografía (una por línea)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bibliografia}
                onChangeText={setBibliografia}
                placeholder="Referencias bibliográficas..."
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          )}

          {/* Contenido */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="book" size={20} /> Contenido
            </Text>

            <Text style={styles.label}>Unidad / Bloque Temático</Text>
            <TextInput
              style={styles.input}
              value={unidadTematica}
              onChangeText={setUnidadTematica}
              placeholder="Ej: Unidad 2 - Álgebra"
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.label}>Tema de la Sesión *</Text>
            <TextInput
              style={styles.input}
              value={temaSesion}
              onChangeText={setTemaSesion}
              placeholder="Ej: Ecuaciones de primer grado"
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.label}>
              Aprendizajes Esperados (uno por línea)
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={aprendizajesEsperados}
              onChangeText={setAprendizajesEsperados}
              placeholder="Lista de aprendizajes esperados..."
              multiline
              numberOfLines={4}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Actividades */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="play-circle-outline" size={20} /> Actividades
            </Text>

            <View style={styles.actividadCard}>
              <Text style={styles.actividadTitulo}>Inicio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={actividadInicio}
                onChangeText={setActividadInicio}
                placeholder="Descripción de la actividad de inicio..."
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textSecondary}
              />
              <Text style={styles.label}>Duración (minutos)</Text>
              <TextInput
                style={styles.input}
                value={duracionInicio}
                onChangeText={setDuracionInicio}
                placeholder="10"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={styles.actividadCard}>
              <Text style={styles.actividadTitulo}>Desarrollo</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={actividadDesarrollo}
                onChangeText={setActividadDesarrollo}
                placeholder="Descripción de la actividad de desarrollo..."
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textSecondary}
              />
              <Text style={styles.label}>Duración (minutos)</Text>
              <TextInput
                style={styles.input}
                value={duracionDesarrollo}
                onChangeText={setDuracionDesarrollo}
                placeholder="30"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={styles.actividadCard}>
              <Text style={styles.actividadTitulo}>Cierre</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={actividadCierre}
                onChangeText={setActividadCierre}
                placeholder="Descripción de la actividad de cierre..."
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textSecondary}
              />
              <Text style={styles.label}>Duración (minutos)</Text>
              <TextInput
                style={styles.input}
                value={duracionCierre}
                onChangeText={setDuracionCierre}
                placeholder="10"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          {/* Recursos y Evaluación */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="inventory" size={20} /> Recursos y Evaluación
            </Text>

            <Text style={styles.label}>
              Recursos / Materiales (uno por línea)
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={recursos}
              onChangeText={setRecursos}
              placeholder="Pizarrón&#10;Marcadores&#10;Proyector"
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.label}>Evaluación</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={evaluacion}
              onChangeText={setEvaluacion}
              placeholder="Describe cómo se evaluará el aprendizaje..."
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.label}>Evidencias (una por línea)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={evidencias}
              onChangeText={setEvidencias}
              placeholder="Ejercicios resueltos&#10;Participación&#10;Tarea"
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Observaciones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="note" size={20} /> Observaciones
            </Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Notas adicionales o comentarios..."
              multiline
              numberOfLines={4}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Botón Guardar */}
          <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
            <MaterialIcons name="save" size={24} color="white" />
            <Text style={styles.saveButtonText}>
              {modo === "editar" ? "Actualizar" : "Guardar"} Planeación
            </Text>
          </TouchableOpacity>

          {/* Espacio para el BottomNavBar */}
          <View style={{ height: 100 }} />
        </SafeAreaView>
      </WebScrollView>

      <BottomNavBar currentScreen="Editor" />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.textSecondary + "40",
    marginBottom: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  actividadCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  actividadTitulo: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
  },
  modalidadContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  modalidadButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.textSecondary + "40",
    backgroundColor: COLORS.surface,
    alignItems: "center",
  },
  modalidadButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modalidadText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    fontWeight: "500",
  },
  modalidadTextActive: {
    color: "white",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 10,
    elevation: 3,
    shadowColor: COLORS.text,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  saveButtonText: {
    color: "white",
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
  },
});

export default EditorPlaneacionScreen;
