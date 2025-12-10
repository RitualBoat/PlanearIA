import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Evaluacion, TipoEvaluacion } from "../../types";

interface EvaluacionEditorProps {
  evaluaciones: Evaluacion[];
  onUpdate: (evaluaciones: Evaluacion[]) => void;
  duracionSemanas: number;
}

export const EvaluacionEditor: React.FC<EvaluacionEditorProps> = ({
  evaluaciones,
  onUpdate,
  duracionSemanas,
}) => {
  const [expandido, setExpandido] = useState<string | null>(null);

  const calcularPorcentajeTotal = () => {
    return evaluaciones.reduce((sum, ev) => sum + ev.porcentaje, 0);
  };

  const agregarEvaluacion = () => {
    const nuevaEvaluacion: Evaluacion = {
      id: Date.now().toString(),
      nombre: "",
      tipo: TipoEvaluacion.EXAMEN,
      semana: 1,
      porcentaje: 0,
      descripcion: "",
      criterios: [],
    };
    onUpdate([...evaluaciones, nuevaEvaluacion]);
    setExpandido(nuevaEvaluacion.id);
  };

  const actualizarEvaluacion = (
    id: string,
    campo: keyof Evaluacion,
    valor: any
  ) => {
    const nuevasEvaluaciones = evaluaciones.map((ev) =>
      ev.id === id ? { ...ev, [campo]: valor } : ev
    );
    onUpdate(nuevasEvaluaciones);
  };

  const eliminarEvaluacion = (id: string) => {
    Alert.alert(
      "Eliminar evaluación",
      "¿Estás seguro de eliminar esta evaluación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            const nuevasEvaluaciones = evaluaciones.filter(
              (ev) => ev.id !== id
            );
            onUpdate(nuevasEvaluaciones);
            if (expandido === id) setExpandido(null);
          },
        },
      ]
    );
  };

  const agregarCriterio = (evaluacionId: string) => {
    const evaluacion = evaluaciones.find((ev) => ev.id === evaluacionId);
    if (evaluacion) {
      actualizarEvaluacion(evaluacionId, "criterios", [
        ...evaluacion.criterios,
        "",
      ]);
    }
  };

  const actualizarCriterio = (
    evaluacionId: string,
    index: number,
    valor: string
  ) => {
    const evaluacion = evaluaciones.find((ev) => ev.id === evaluacionId);
    if (evaluacion) {
      const nuevosCriterios = [...evaluacion.criterios];
      nuevosCriterios[index] = valor;
      actualizarEvaluacion(evaluacionId, "criterios", nuevosCriterios);
    }
  };

  const eliminarCriterio = (evaluacionId: string, index: number) => {
    const evaluacion = evaluaciones.find((ev) => ev.id === evaluacionId);
    if (evaluacion) {
      const nuevosCriterios = evaluacion.criterios.filter(
        (_, i) => i !== index
      );
      actualizarEvaluacion(evaluacionId, "criterios", nuevosCriterios);
    }
  };

  const getTipoBadgeColor = (tipo: TipoEvaluacion) => {
    const colores: Record<TipoEvaluacion, string> = {
      [TipoEvaluacion.EXAMEN]: "#f44336",
      [TipoEvaluacion.PROYECTO]: "#9c27b0",
      [TipoEvaluacion.TAREA]: "#2196F3",
      [TipoEvaluacion.PRESENTACION]: "#ff9800",
      [TipoEvaluacion.PRACTICA]: "#4caf50",
      [TipoEvaluacion.PARTICIPACION]: "#00bcd4",
      [TipoEvaluacion.ENSAYO]: "#795548",
      [TipoEvaluacion.INVESTIGACION]: "#607d8b",
    };
    return colores[tipo] || "#999";
  };

  const getTipoLabel = (tipo: TipoEvaluacion) => {
    const labels: Record<TipoEvaluacion, string> = {
      [TipoEvaluacion.EXAMEN]: "Examen",
      [TipoEvaluacion.PROYECTO]: "Proyecto",
      [TipoEvaluacion.TAREA]: "Tarea",
      [TipoEvaluacion.PRESENTACION]: "Presentación",
      [TipoEvaluacion.PRACTICA]: "Práctica",
      [TipoEvaluacion.PARTICIPACION]: "Participación",
      [TipoEvaluacion.ENSAYO]: "Ensayo",
      [TipoEvaluacion.INVESTIGACION]: "Investigación",
    };
    return labels[tipo];
  };

  const porcentajeTotal = calcularPorcentajeTotal();
  const porcentajeValido = porcentajeTotal === 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plan de Evaluación</Text>
        <View
          style={[
            styles.porcentajeBadge,
            porcentajeValido
              ? styles.porcentajeValido
              : styles.porcentajeInvalido,
          ]}
        >
          <Text
            style={[
              styles.porcentajeText,
              porcentajeValido
                ? styles.porcentajeTextValido
                : styles.porcentajeTextInvalido,
            ]}
          >
            {porcentajeTotal}%
          </Text>
        </View>
      </View>

      {!porcentajeValido && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ El porcentaje total debe sumar 100% (actual: {porcentajeTotal}%)
          </Text>
        </View>
      )}

      <ScrollView style={styles.evaluacionesList}>
        {evaluaciones.map((evaluacion) => (
          <View key={evaluacion.id} style={styles.evaluacionCard}>
            {/* Header de la evaluación */}
            <TouchableOpacity
              style={styles.evaluacionHeader}
              onPress={() =>
                setExpandido(expandido === evaluacion.id ? null : evaluacion.id)
              }
            >
              <View style={styles.evaluacionHeaderLeft}>
                <View
                  style={[
                    styles.tipoBadge,
                    { backgroundColor: getTipoBadgeColor(evaluacion.tipo) },
                  ]}
                >
                  <Text style={styles.tipoBadgeText}>
                    {getTipoLabel(evaluacion.tipo)}
                  </Text>
                </View>
                <View style={styles.evaluacionInfo}>
                  <Text style={styles.evaluacionNombre}>
                    {evaluacion.nombre || "Nueva evaluación"}
                  </Text>
                  <Text style={styles.evaluacionDetalle}>
                    Semana {evaluacion.semana} • {evaluacion.porcentaje}%
                  </Text>
                </View>
              </View>
              <Text style={styles.expandIcon}>
                {expandido === evaluacion.id ? "▼" : "►"}
              </Text>
            </TouchableOpacity>

            {/* Contenido expandido */}
            {expandido === evaluacion.id && (
              <View style={styles.evaluacionContent}>
                {/* Nombre */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    Nombre de la evaluación:
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={evaluacion.nombre}
                    onChangeText={(text) =>
                      actualizarEvaluacion(evaluacion.id, "nombre", text)
                    }
                    placeholder="Ej: Examen parcial 1"
                  />
                </View>

                {/* Tipo */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Tipo de evaluación:</Text>
                  <View style={styles.tipoSelector}>
                    {(Object.values(TipoEvaluacion) as TipoEvaluacion[]).map(
                      (tipo) => (
                        <TouchableOpacity
                          key={tipo as string}
                          style={[
                            styles.tipoOption,
                            evaluacion.tipo === tipo &&
                              styles.tipoOptionSelected,
                            {
                              borderColor:
                                evaluacion.tipo === tipo
                                  ? getTipoBadgeColor(tipo)
                                  : "#ddd",
                            },
                          ]}
                          onPress={() =>
                            actualizarEvaluacion(evaluacion.id, "tipo", tipo)
                          }
                        >
                          <Text
                            style={[
                              styles.tipoOptionText,
                              evaluacion.tipo === tipo &&
                                styles.tipoOptionTextSelected,
                            ]}
                          >
                            {getTipoLabel(tipo)}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>

                {/* Semana y Porcentaje */}
                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Semana:</Text>
                    <View style={styles.numberInputContainer}>
                      <TouchableOpacity
                        style={styles.numberButton}
                        onPress={() =>
                          actualizarEvaluacion(
                            evaluacion.id,
                            "semana",
                            Math.max(1, evaluacion.semana - 1)
                          )
                        }
                      >
                        <Text style={styles.numberButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.numberDisplay}>
                        {evaluacion.semana}
                      </Text>
                      <TouchableOpacity
                        style={styles.numberButton}
                        onPress={() =>
                          actualizarEvaluacion(
                            evaluacion.id,
                            "semana",
                            Math.min(duracionSemanas, evaluacion.semana + 1)
                          )
                        }
                      >
                        <Text style={styles.numberButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Porcentaje:</Text>
                    <View style={styles.numberInputContainer}>
                      <TouchableOpacity
                        style={styles.numberButton}
                        onPress={() =>
                          actualizarEvaluacion(
                            evaluacion.id,
                            "porcentaje",
                            Math.max(0, evaluacion.porcentaje - 5)
                          )
                        }
                      >
                        <Text style={styles.numberButtonText}>−</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.numberInput}
                        value={String(evaluacion.porcentaje)}
                        onChangeText={(text) =>
                          actualizarEvaluacion(
                            evaluacion.id,
                            "porcentaje",
                            Math.min(100, Math.max(0, parseInt(text) || 0))
                          )
                        }
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={styles.numberButton}
                        onPress={() =>
                          actualizarEvaluacion(
                            evaluacion.id,
                            "porcentaje",
                            Math.min(100, evaluacion.porcentaje + 5)
                          )
                        }
                      >
                        <Text style={styles.numberButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Descripción */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Descripción:</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={evaluacion.descripcion}
                    onChangeText={(text) =>
                      actualizarEvaluacion(evaluacion.id, "descripcion", text)
                    }
                    placeholder="Describe qué se evaluará"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Criterios de evaluación */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    Criterios de evaluación:
                  </Text>
                  {evaluacion.criterios.map((criterio, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <TextInput
                        style={[styles.input, styles.listInput]}
                        value={criterio}
                        onChangeText={(text) =>
                          actualizarCriterio(evaluacion.id, index, text)
                        }
                        placeholder={`Criterio ${index + 1}`}
                        multiline
                      />
                      <TouchableOpacity
                        onPress={() => eliminarCriterio(evaluacion.id, index)}
                      >
                        <Text style={styles.deleteItemButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => agregarCriterio(evaluacion.id)}
                  >
                    <Text style={styles.addButtonText}>+ Agregar criterio</Text>
                  </TouchableOpacity>
                </View>

                {/* Botón eliminar */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => eliminarEvaluacion(evaluacion.id)}
                >
                  <Text style={styles.deleteButtonText}>
                    🗑️ Eliminar evaluación
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.agregarButton}
        onPress={agregarEvaluacion}
      >
        <Text style={styles.agregarButtonText}>+ Agregar evaluación</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  porcentajeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  porcentajeValido: {
    backgroundColor: "#e8f5e9",
  },
  porcentajeInvalido: {
    backgroundColor: "#ffebee",
  },
  porcentajeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  porcentajeTextValido: {
    color: "#4caf50",
  },
  porcentajeTextInvalido: {
    color: "#f44336",
  },
  warningBox: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  warningText: {
    color: "#856404",
    fontSize: 14,
  },
  evaluacionesList: {
    flex: 1,
    marginBottom: 12,
  },
  evaluacionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 12,
    overflow: "hidden",
  },
  evaluacionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  evaluacionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  tipoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipoBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  evaluacionInfo: {
    flex: 1,
  },
  evaluacionNombre: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  evaluacionDetalle: {
    fontSize: 12,
    color: "#666",
  },
  expandIcon: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  evaluacionContent: {
    padding: 12,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  tipoSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tipoOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  tipoOptionSelected: {
    borderWidth: 2,
  },
  tipoOptionText: {
    fontSize: 12,
    color: "#666",
  },
  tipoOptionTextSelected: {
    fontWeight: "600",
    color: "#333",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  numberButton: {
    width: 32,
    height: 32,
    backgroundColor: "#e3f2fd",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonText: {
    fontSize: 18,
    color: "#2196F3",
    fontWeight: "600",
  },
  numberDisplay: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 40,
    textAlign: "center",
  },
  numberInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 6,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    minWidth: 50,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  bulletPoint: {
    fontSize: 20,
    color: "#666",
    marginTop: 8,
  },
  listInput: {
    flex: 1,
  },
  deleteItemButton: {
    fontSize: 20,
    color: "#f44336",
    padding: 8,
  },
  addButton: {
    padding: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 6,
    alignItems: "center",
    marginTop: 4,
  },
  addButtonText: {
    color: "#2196F3",
    fontWeight: "600",
    fontSize: 13,
  },
  deleteButton: {
    padding: 12,
    backgroundColor: "#ffebee",
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  deleteButtonText: {
    color: "#f44336",
    fontWeight: "600",
  },
  agregarButton: {
    padding: 16,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    alignItems: "center",
  },
  agregarButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
