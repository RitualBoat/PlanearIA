import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, FONT_SIZES } from "../../../types";
import { API_CONFIG } from "../../sync/config/apiConfig";
import WebScrollView from "../../components/WebScrollView";
import SyncIndicator from "../../components/SyncIndicator";
import { SemanaEditor } from "../../components/SemanaEditor";
import { EvaluacionEditor } from "../../components/EvaluacionEditor";
import { NivelAcademico } from "../../../types/planeacion";
import { useEditorPlaneacionViewModel } from "../../hooks/useEditorPlaneacionViewModel";

interface SugerenciaMejoraIA {
  id: string;
  campo: string;
  categoria: "ortografia" | "redaccion" | "contenido";
  justificacion: string;
  valorActual: string;
  valorSugerido: string;
}

/**
 * Pantalla de editor de planeación (View)
 * Solo JSX y StyleSheet - la logica vive en useEditorPlaneacionViewModel
 */
const EditorPlaneacionScreen: React.FC = () => {
  const vm = useEditorPlaneacionViewModel();

  // Destructure for readability in JSX
  const {
    nivel,
    modo,
    asignatura,
    grado,
    grupo,
    fecha,
    horaInicio,
    duracionTotal,
    unidadTematica,
    temaSesion,
    aprendizajesEsperados,
    actividadInicio,
    duracionInicio,
    actividadDesarrollo,
    duracionDesarrollo,
    actividadCierre,
    duracionCierre,
    recursos,
    evaluacion,
    evidencias,
    observaciones,
    campoFormativo,
    competenciasDisciplinares,
    competenciasGenericas,
    competenciasProfesionales,
    objetivosAprendizaje,
    bibliografia,
    modalidad,
    modoDetallado,
    configuracionCurso,
    semanas,
    evaluaciones,
    semanasVersion,
    setAsignatura,
    setGrado,
    setGrupo,
    setFecha,
    setHoraInicio,
    setDuracionTotal,
    setUnidadTematica,
    setTemaSesion,
    setAprendizajesEsperados,
    setActividadInicio,
    setDuracionInicio,
    setActividadDesarrollo,
    setDuracionDesarrollo,
    setActividadCierre,
    setDuracionCierre,
    setRecursos,
    setEvaluacion,
    setEvidencias,
    setObservaciones,
    setCampoFormativo,
    setCompetenciasDisciplinares,
    setCompetenciasGenericas,
    setCompetenciasProfesionales,
    setObjetivosAprendizaje,
    setBibliografia,
    setModalidad,
    setConfiguracionCurso,
    setEvaluaciones,
    toggleModoDetallado,
    cambiarDuracionCurso,
    actualizarSemana,
    eliminarSemana,
    clonarSemana,
    handleGuardar,
    obtenerTitulo,
  } = vm;

  const [showMejorasModal, setShowMejorasModal] = useState(false);
  const [isMejorandoIA, setIsMejorandoIA] = useState(false);
  const [errorMejorasIA, setErrorMejorasIA] = useState("");
  const [sugerenciasIA, setSugerenciasIA] = useState<SugerenciaMejoraIA[]>([]);
  const [sugerenciasSeleccionadas, setSugerenciasSeleccionadas] = useState<Record<string, boolean>>(
    {}
  );

  const buildPlaneacionActual = () => {
    const planeacionBase = {
      nivelAcademico: nivel,
      asignatura,
      grado,
      grupo,
      fecha,
      horaInicio,
      duracionTotal: parseInt(duracionTotal) || 50,
      unidadTematica,
      temaSesion,
      aprendizajesEsperados: aprendizajesEsperados.split("\n").filter((a) => a.trim()),
      actividades: [
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
      ],
      recursos: recursos.split("\n").filter((r) => r.trim()),
      evaluacion,
      evidencias: evidencias.split("\n").filter((e) => e.trim()),
      observaciones,
    };

    if (nivel === NivelAcademico.PRIMARIA) {
      return {
        ...planeacionBase,
        campoFormativo,
      };
    }

    if (nivel === NivelAcademico.SECUNDARIA) {
      return {
        ...planeacionBase,
        competenciasDisciplinares: competenciasDisciplinares.split("\n").filter((c) => c.trim()),
      };
    }

    if (nivel === NivelAcademico.PREPARATORIA) {
      return {
        ...planeacionBase,
        competenciasGenericas: competenciasGenericas.split("\n").filter((c) => c.trim()),
        competenciasDisciplinares: competenciasDisciplinares.split("\n").filter((c) => c.trim()),
        bibliografia: bibliografia.split("\n").filter((b) => b.trim()),
      };
    }

    return {
      ...planeacionBase,
      modalidad,
      competenciasProfesionales: competenciasProfesionales.split("\n").filter((c) => c.trim()),
      objetivosAprendizaje: objetivosAprendizaje.split("\n").filter((o) => o.trim()),
      bibliografia: bibliografia.split("\n").filter((b) => b.trim()),
      ...(modoDetallado
        ? {
            configuracionCurso,
            semanas,
            evaluaciones,
          }
        : {}),
    };
  };

  const obtenerValorCampo = (campo: string): string => {
    const normalized = campo.trim();
    if (normalized === "temaSesion") return temaSesion;
    if (normalized === "evaluacion") return evaluacion;
    if (normalized === "unidadTematica") return unidadTematica;
    if (normalized === "observaciones") return observaciones;
    if (normalized === "asignatura") return asignatura;
    if (normalized === "actividades[0].descripcion") return actividadInicio;
    if (normalized === "actividades[1].descripcion") return actividadDesarrollo;
    if (normalized === "actividades[2].descripcion") return actividadCierre;
    return "Sin valor actual";
  };

  const aplicarMejoraCampo = (campo: string, valor: string): boolean => {
    const normalized = campo.trim();

    if (normalized === "temaSesion") {
      setTemaSesion(valor);
      return true;
    }
    if (normalized === "evaluacion") {
      setEvaluacion(valor);
      return true;
    }
    if (normalized === "unidadTematica") {
      setUnidadTematica(valor);
      return true;
    }
    if (normalized === "observaciones") {
      setObservaciones(valor);
      return true;
    }
    if (normalized === "asignatura") {
      setAsignatura(valor);
      return true;
    }
    if (normalized === "actividades[0].descripcion") {
      setActividadInicio(valor);
      return true;
    }
    if (normalized === "actividades[1].descripcion") {
      setActividadDesarrollo(valor);
      return true;
    }
    if (normalized === "actividades[2].descripcion") {
      setActividadCierre(valor);
      return true;
    }

    return false;
  };

  const abrirMejorasIA = async () => {
    if (!API_CONFIG.baseUrl) {
      const msg = "No hay URL de backend configurada para mejorar con IA.";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Mejorar con IA", msg);
      }
      return;
    }

    if (!API_CONFIG.apiSecret) {
      const msg = "Falta configurar EXPO_PUBLIC_API_SECRET para usar mejorar con IA.";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Mejorar con IA", msg);
      }
      return;
    }

    setShowMejorasModal(true);
    setIsMejorandoIA(true);
    setErrorMejorasIA("");
    setSugerenciasIA([]);
    setSugerenciasSeleccionadas({});

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/planeaciones/mejorar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_CONFIG.apiSecret,
        },
        body: JSON.stringify({
          planeacion: buildPlaneacionActual(),
          maxSugerencias: 8,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "No se pudieron obtener sugerencias de mejora.");
      }

      const sugerenciasRaw = Array.isArray(payload?.data?.sugerencias)
        ? payload.data.sugerencias
        : [];

      const sugerenciasNormalizadas: SugerenciaMejoraIA[] = sugerenciasRaw.map(
        (sugerencia: any, index: number) => {
          const campo = String(sugerencia?.campo || "campo");
          return {
            id: `${campo}_${index}`,
            campo,
            categoria:
              sugerencia?.categoria === "ortografia" ||
              sugerencia?.categoria === "contenido" ||
              sugerencia?.categoria === "redaccion"
                ? sugerencia.categoria
                : "redaccion",
            justificacion: String(sugerencia?.justificacion || "Mejora sugerida por IA"),
            valorActual: String(sugerencia?.original || obtenerValorCampo(campo) || ""),
            valorSugerido: String(sugerencia?.mejorado || ""),
          };
        }
      );

      setSugerenciasIA(sugerenciasNormalizadas);

      const estadoInicial: Record<string, boolean> = {};
      sugerenciasNormalizadas.forEach((sugerencia) => {
        estadoInicial[sugerencia.id] = false;
      });
      setSugerenciasSeleccionadas(estadoInicial);

      if (sugerenciasNormalizadas.length === 0) {
        setErrorMejorasIA("La IA no devolvió sugerencias aplicables para esta planeación.");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error inesperado al mejorar con IA.";
      setErrorMejorasIA(msg);
    } finally {
      setIsMejorandoIA(false);
    }
  };

  const alternarSugerencia = (id: string) => {
    setSugerenciasSeleccionadas((estadoPrevio) => ({
      ...estadoPrevio,
      [id]: !estadoPrevio[id],
    }));
  };

  const aplicarSugerenciasSeleccionadas = () => {
    const sugerenciasActivas = sugerenciasIA.filter(
      (sugerencia) => sugerenciasSeleccionadas[sugerencia.id]
    );

    if (sugerenciasActivas.length === 0) {
      if (Platform.OS === "web") {
        window.alert("Selecciona al menos una sugerencia para aplicar.");
      } else {
        Alert.alert("Mejorar con IA", "Selecciona al menos una sugerencia para aplicar.");
      }
      return;
    }

    let aplicadas = 0;
    let omitidas = 0;

    sugerenciasActivas.forEach((sugerencia) => {
      const aplicada = aplicarMejoraCampo(sugerencia.campo, sugerencia.valorSugerido);
      if (aplicada) {
        aplicadas += 1;
      } else {
        omitidas += 1;
      }
    });

    setShowMejorasModal(false);

    const mensaje =
      omitidas > 0
        ? `Se aplicaron ${aplicadas} mejora(s). ${omitidas} sugerencia(s) no se pudieron aplicar automáticamente.`
        : `Se aplicaron ${aplicadas} mejora(s) sugeridas por IA.`;
    if (Platform.OS === "web") {
      window.alert(mensaje);
    } else {
      Alert.alert("Mejorar con IA", mensaje);
    }
  };

  // Obtain window dimensions for layout
  const { height: windowHeight } = useWindowDimensions();
  const navBarHeight = 80;

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
          <Text style={styles.subtitle}>Completa todos los campos de tu planeación</Text>

          <TouchableOpacity
            style={[styles.aiImproveButton, isMejorandoIA && styles.aiImproveButtonDisabled]}
            onPress={abrirMejorasIA}
            disabled={isMejorandoIA}
          >
            <MaterialIcons name="auto-fix-high" size={20} color={COLORS.primary} />
            <Text style={styles.aiImproveButtonText}>
              {isMejorandoIA ? "Procesando mejoras..." : "Mejorar con IA"}
            </Text>
          </TouchableOpacity>

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
              <Text style={styles.label}>Competencias Disciplinares (una por línea)</Text>
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
              <Text style={styles.label}>Competencias Genéricas (una por línea)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={competenciasGenericas}
                onChangeText={setCompetenciasGenericas}
                placeholder="Lista de competencias genéricas..."
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Competencias Disciplinares (una por línea)</Text>
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

              {/* Toggle de modo detallado */}
              <View style={styles.modoDetalladoContainer}>
                <View style={styles.modoDetalladoInfo}>
                  <Text style={styles.modoDetalladoLabel}>
                    {modoDetallado ? "Modo Detallado (Semana por Semana)" : "Modo Simple"}
                  </Text>
                  <Text style={styles.modoDetalladoDesc}>
                    {modoDetallado
                      ? "Planificación completa por semanas con evaluaciones"
                      : "Planificación de una sola sesión (formato tradicional)"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.modoDetalladoToggle,
                    modoDetallado && styles.modoDetalladoToggleActive,
                  ]}
                  onPress={toggleModoDetallado}
                >
                  <Text
                    style={[
                      styles.modoDetalladoToggleText,
                      modoDetallado && styles.modoDetalladoToggleTextActive,
                    ]}
                  >
                    {modoDetallado ? "Cambiar a Simple" : "Cambiar a Detallado"}
                  </Text>
                </TouchableOpacity>
              </View>

              {modoDetallado ? (
                // Modo detallado con semanas
                <>
                  {/* Configuración del curso */}
                  <View style={styles.configuracionCurso}>
                    <Text style={styles.subsectionTitle}>Configuración del Curso</Text>

                    {/* Duración del curso */}
                    <Text style={styles.label}>Duración del curso:</Text>
                    <View style={styles.duracionSelector}>
                      <TouchableOpacity
                        style={styles.duracionButton}
                        onPress={() =>
                          cambiarDuracionCurso(
                            Math.max(12, configuracionCurso.duracionSemanas - 1) as 12 | 16 | 18
                          )
                        }
                      >
                        <Text style={styles.duracionButtonText}>−</Text>
                      </TouchableOpacity>
                      <View style={styles.duracionDisplay}>
                        <Text style={styles.duracionNumber}>
                          {configuracionCurso.duracionSemanas}
                        </Text>
                        <Text style={styles.duracionLabel}>semanas</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.duracionButton}
                        onPress={() =>
                          cambiarDuracionCurso(
                            Math.min(18, configuracionCurso.duracionSemanas + 1) as 12 | 16 | 18
                          )
                        }
                      >
                        <Text style={styles.duracionButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Horas */}
                    <Text style={styles.label}>Distribución de horas:</Text>
                    <View style={styles.horasContainer}>
                      <View style={styles.horaField}>
                        <Text style={styles.horaLabel}>Teóricas</Text>
                        <TextInput
                          style={styles.horaInput}
                          value={String(configuracionCurso.horasTeoricas)}
                          onChangeText={(text) =>
                            setConfiguracionCurso({
                              ...configuracionCurso,
                              horasTeoricas: parseInt(text) || 0,
                            })
                          }
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.horaField}>
                        <Text style={styles.horaLabel}>Prácticas</Text>
                        <TextInput
                          style={styles.horaInput}
                          value={String(configuracionCurso.horasPracticas)}
                          onChangeText={(text) =>
                            setConfiguracionCurso({
                              ...configuracionCurso,
                              horasPracticas: parseInt(text) || 0,
                            })
                          }
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.horaField}>
                        <Text style={styles.horaLabel}>Autónomas</Text>
                        <TextInput
                          style={styles.horaInput}
                          value={String(configuracionCurso.horasAutonomas)}
                          onChangeText={(text) =>
                            setConfiguracionCurso({
                              ...configuracionCurso,
                              horasAutonomas: parseInt(text) || 0,
                            })
                          }
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    {/* Créditos y modalidad */}
                    <View style={styles.row}>
                      <View style={styles.halfWidth}>
                        <Text style={styles.label}>Créditos:</Text>
                        <TextInput
                          style={styles.input}
                          value={String(configuracionCurso.creditos)}
                          onChangeText={(text) =>
                            setConfiguracionCurso({
                              ...configuracionCurso,
                              creditos: parseInt(text) || 0,
                            })
                          }
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.halfWidth}>
                        <Text style={styles.label}>Modalidad:</Text>
                        <View style={styles.modalidadContainerSmall}>
                          {["presencial", "hibrida", "virtual"].map((m) => (
                            <TouchableOpacity
                              key={m}
                              style={[
                                styles.modalidadButtonSmall,
                                configuracionCurso.modalidad === m &&
                                  styles.modalidadButtonActiveSmall,
                              ]}
                              onPress={() =>
                                setConfiguracionCurso({
                                  ...configuracionCurso,
                                  modalidad: m as any,
                                })
                              }
                            >
                              <Text
                                style={[
                                  styles.modalidadTextSmall,
                                  configuracionCurso.modalidad === m &&
                                    styles.modalidadTextActiveSmall,
                                ]}
                              >
                                {m.charAt(0).toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Plan de evaluación */}
                  <View style={styles.evaluacionSection}>
                    <Text style={styles.subsectionTitle}>Plan de Evaluación</Text>
                    <EvaluacionEditor
                      evaluaciones={evaluaciones}
                      onUpdate={setEvaluaciones}
                      duracionSemanas={configuracionCurso.duracionSemanas}
                    />
                  </View>

                  {/* Semanas */}
                  <View style={styles.semanasSection} key={`semanas-${semanasVersion}`}>
                    <Text style={styles.subsectionTitle}>
                      Planificación Semanal ({semanas.length} semanas)
                    </Text>
                    {semanas.map((semana) => (
                      <SemanaEditor
                        key={`semana-${semana.numero}-v${semanasVersion}`}
                        semana={semana}
                        onUpdate={actualizarSemana}
                        onDelete={() => eliminarSemana(semana.numero)}
                        onClone={() => clonarSemana(semana.numero)}
                        evaluaciones={evaluaciones.map((ev) => ({
                          id: ev.id,
                          nombre: ev.nombre,
                        }))}
                      />
                    ))}
                  </View>

                  {/* Bibliografía general */}
                  <Text style={styles.label}>Bibliografía general (una por línea)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={bibliografia}
                    onChangeText={setBibliografia}
                    placeholder="Referencias bibliográficas..."
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </>
              ) : (
                // Modo simple (tradicional)
                <>
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

                  <Text style={styles.label}>Competencias Profesionales (una por línea)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={competenciasProfesionales}
                    onChangeText={setCompetenciasProfesionales}
                    placeholder="Lista de competencias profesionales..."
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={COLORS.textSecondary}
                  />

                  <Text style={styles.label}>Objetivos de Aprendizaje (uno por línea)</Text>
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
                </>
              )}
            </View>
          )}

          {/* Contenido */}
          {!(nivel === NivelAcademico.UNIVERSIDAD && modoDetallado) && (
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

              <Text style={styles.label}>Aprendizajes Esperados (uno por línea)</Text>
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
          )}

          {/* Actividades */}
          {!(nivel === NivelAcademico.UNIVERSIDAD && modoDetallado) && (
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
          )}

          {/* Recursos y Evaluación */}
          {!(nivel === NivelAcademico.UNIVERSIDAD && modoDetallado) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <MaterialIcons name="inventory" size={20} /> Recursos y Evaluación
              </Text>

              <Text style={styles.label}>Recursos / Materiales (uno por línea)</Text>
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
          )}

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

          <View style={{ height: 20 }} />
        </SafeAreaView>
      </WebScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showMejorasModal}
        onRequestClose={() => setShowMejorasModal(false)}
      >
        <View style={styles.mejorasOverlay}>
          <View style={styles.mejorasContainer}>
            <Text style={styles.mejorasTitle}>Sugerencias de mejora con IA</Text>
            <Text style={styles.mejorasSubtitle}>Acepta o rechaza cada cambio sugerido</Text>

            <WebScrollView
              style={styles.mejorasList}
              contentContainerStyle={styles.mejorasListContent}
            >
              {isMejorandoIA ? (
                <View style={styles.mejorasLoadingState}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.mejorasLoadingText}>Analizando planeación con IA...</Text>
                </View>
              ) : null}

              {!isMejorandoIA && errorMejorasIA ? (
                <Text style={styles.mejorasErrorText}>{errorMejorasIA}</Text>
              ) : null}

              {!isMejorandoIA && !errorMejorasIA && sugerenciasIA.length === 0 ? (
                <Text style={styles.mejorasEmptyText}>No hay sugerencias para mostrar.</Text>
              ) : null}

              {sugerenciasIA.map((sugerencia) => {
                const estaSeleccionada = !!sugerenciasSeleccionadas[sugerencia.id];

                return (
                  <TouchableOpacity
                    key={sugerencia.id}
                    style={styles.sugerenciaCard}
                    onPress={() => alternarSugerencia(sugerencia.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.sugerenciaHeader}>
                      <Text style={styles.sugerenciaCampo}>{sugerencia.campo}</Text>
                      <MaterialIcons
                        name={estaSeleccionada ? "check-box" : "check-box-outline-blank"}
                        size={24}
                        color={estaSeleccionada ? COLORS.primary : COLORS.textSecondary}
                      />
                    </View>

                    <Text style={styles.sugerenciaMeta}>
                      {sugerencia.categoria.toUpperCase()} - {sugerencia.justificacion}
                    </Text>

                    <Text style={styles.diffLabel}>Actual</Text>
                    <Text style={styles.diffText}>{sugerencia.valorActual}</Text>

                    <Text style={styles.diffLabel}>Sugerido</Text>
                    <Text style={styles.diffText}>{sugerencia.valorSugerido}</Text>
                  </TouchableOpacity>
                );
              })}
            </WebScrollView>

            <View style={styles.mejorasButtonsRow}>
              <TouchableOpacity
                style={styles.mejorasCloseButton}
                onPress={() => setShowMejorasModal(false)}
              >
                <Text style={styles.mejorasCloseText}>Cerrar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mejorasApplyButton}
                onPress={aplicarSugerenciasSeleccionadas}
                disabled={isMejorandoIA || sugerenciasIA.length === 0}
              >
                <Text style={styles.mejorasApplyText}>Aplicar seleccionadas</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 28,
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
  aiImproveButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    gap: 8,
    marginBottom: 16,
  },
  aiImproveButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
  aiImproveButtonDisabled: {
    opacity: 0.7,
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
    boxShadow: "0px 2px 4px rgba(26, 26, 26, 0.3)",
  },
  saveButtonText: {
    color: "white",
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
  },
  modoDetalladoContainer: {
    backgroundColor: "#e8eaf6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.indigo,
  },
  modoDetalladoInfo: {
    marginBottom: 12,
  },
  modoDetalladoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3f51b5",
    marginBottom: 4,
  },
  modoDetalladoDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  modoDetalladoToggle: {
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.indigo,
    alignItems: "center",
  },
  modoDetalladoToggleActive: {
    backgroundColor: COLORS.indigo,
  },
  modoDetalladoToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.indigo,
  },
  modoDetalladoToggleTextActive: {
    color: COLORS.surface,
  },
  configuracionCurso: {
    backgroundColor: COLORS.surfaceTertiary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  duracionSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  duracionButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  duracionButtonText: {
    color: COLORS.surface,
    fontSize: 24,
    fontWeight: "bold",
  },
  duracionDisplay: {
    alignItems: "center",
  },
  duracionNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  duracionLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  horasContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  horaField: {
    flex: 1,
    alignItems: "center",
  },
  horaLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  horaInput: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    textAlign: "center",
    backgroundColor: COLORS.surface,
    width: "100%",
  },
  modalidadContainerSmall: {
    flexDirection: "row",
    gap: 4,
  },
  modalidadButtonSmall: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.textSecondary + "40",
    backgroundColor: COLORS.surface,
    alignItems: "center",
  },
  modalidadButtonActiveSmall: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modalidadTextSmall: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "500",
  },
  modalidadTextActiveSmall: {
    color: "white",
  },
  evaluacionSection: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  semanasSection: {
    marginBottom: 20,
  },
  mejorasOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  mejorasContainer: {
    width: "92%",
    maxHeight: "85%",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
  },
  mejorasTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 6,
  },
  mejorasSubtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  mejorasList: {
    flexGrow: 0,
  },
  mejorasListContent: {
    paddingBottom: 8,
  },
  sugerenciaCard: {
    borderWidth: 1,
    borderColor: COLORS.textSecondary + "44",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: COLORS.background,
  },
  sugerenciaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  sugerenciaCampo: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    fontWeight: "700",
    color: COLORS.text,
  },
  sugerenciaMeta: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  mejorasLoadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  mejorasLoadingText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
  },
  mejorasErrorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.medium,
    lineHeight: 20,
    paddingVertical: 8,
  },
  mejorasEmptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
    lineHeight: 20,
    paddingVertical: 8,
  },
  diffLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 2,
  },
  diffText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    lineHeight: 20,
  },
  mejorasButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  mejorasCloseButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
  },
  mejorasCloseText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
  mejorasApplyButton: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
  },
  mejorasApplyText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "700",
  },
});

export default EditorPlaneacionScreen;
