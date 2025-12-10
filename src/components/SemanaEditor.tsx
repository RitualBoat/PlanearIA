import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SemanaUniversitaria, ActividadPresencial } from "../../types";

interface SemanaEditorProps {
  semana: SemanaUniversitaria;
  onUpdate: (semana: SemanaUniversitaria) => void;
  onDelete: () => void;
  onClone: () => void;
  evaluaciones?: { id: string; nombre: string }[];
}

export const SemanaEditor: React.FC<SemanaEditorProps> = ({
  semana,
  onUpdate,
  onDelete,
  onClone,
  evaluaciones = [],
}) => {
  const [expandido, setExpandido] = useState(false);

  const actualizarCampo = (campo: keyof SemanaUniversitaria, valor: any) => {
    onUpdate({ ...semana, [campo]: valor });
  };

  const agregarTema = () => {
    actualizarCampo("temas", [...semana.temas, ""]);
  };

  const actualizarTema = (index: number, valor: string) => {
    const nuevosTemas = [...semana.temas];
    nuevosTemas[index] = valor;
    actualizarCampo("temas", nuevosTemas);
  };

  const eliminarTema = (index: number) => {
    const nuevosTemas = semana.temas.filter((_, i) => i !== index);
    actualizarCampo("temas", nuevosTemas);
  };

  const agregarObjetivo = () => {
    actualizarCampo("objetivos", [...semana.objetivos, ""]);
  };

  const actualizarObjetivo = (index: number, valor: string) => {
    const nuevosObjetivos = [...semana.objetivos];
    nuevosObjetivos[index] = valor;
    actualizarCampo("objetivos", nuevosObjetivos);
  };

  const eliminarObjetivo = (index: number) => {
    const nuevosObjetivos = semana.objetivos.filter((_, i) => i !== index);
    actualizarCampo("objetivos", nuevosObjetivos);
  };

  const agregarActividadPresencial = () => {
    actualizarCampo("actividadesPresenciales", [
      ...semana.actividadesPresenciales,
      { descripcion: "", duracion: 60, metodologia: "" },
    ]);
  };

  const actualizarActividadPresencial = (
    index: number,
    campo: keyof ActividadPresencial,
    valor: any
  ) => {
    const nuevasActividades = [...semana.actividadesPresenciales];
    nuevasActividades[index] = { ...nuevasActividades[index], [campo]: valor };
    actualizarCampo("actividadesPresenciales", nuevasActividades);
  };

  const eliminarActividadPresencial = (index: number) => {
    const nuevasActividades = semana.actividadesPresenciales.filter(
      (_, i) => i !== index
    );
    actualizarCampo("actividadesPresenciales", nuevasActividades);
  };

  const agregarActividadAutonoma = () => {
    actualizarCampo("actividadesAutonomas", [
      ...semana.actividadesAutonomas,
      "",
    ]);
  };

  const actualizarActividadAutonoma = (index: number, valor: string) => {
    const nuevasActividades = [...semana.actividadesAutonomas];
    nuevasActividades[index] = valor;
    actualizarCampo("actividadesAutonomas", nuevasActividades);
  };

  const eliminarActividadAutonoma = (index: number) => {
    const nuevasActividades = semana.actividadesAutonomas.filter(
      (_, i) => i !== index
    );
    actualizarCampo("actividadesAutonomas", nuevasActividades);
  };

  const agregarRecurso = () => {
    actualizarCampo("recursos", [...semana.recursos, ""]);
  };

  const actualizarRecurso = (index: number, valor: string) => {
    const nuevosRecursos = [...semana.recursos];
    nuevosRecursos[index] = valor;
    actualizarCampo("recursos", nuevosRecursos);
  };

  const eliminarRecurso = (index: number) => {
    const nuevosRecursos = semana.recursos.filter((_, i) => i !== index);
    actualizarCampo("recursos", nuevosRecursos);
  };

  const aplicarPlantilla = (tipo: string) => {
    switch (tipo) {
      case "teorica":
        onUpdate({
          ...semana,
          temas: ["Nuevo tema teórico"],
          objetivos: ["Comprender conceptos fundamentales"],
          actividadesPresenciales: [
            {
              descripcion: "Clase magistral con presentación",
              duracion: 90,
              metodologia: "Clase magistral",
            },
            {
              descripcion: "Discusión y preguntas",
              duracion: 30,
              metodologia: "Discusión grupal",
            },
          ],
          actividadesAutonomas: [
            "Lectura de material complementario",
            "Resolución de ejercicios",
          ],
          recursos: ["Presentación PowerPoint", "Artículos académicos"],
        });
        break;
      case "practica":
        onUpdate({
          ...semana,
          temas: ["Práctica de laboratorio"],
          objetivos: ["Aplicar conocimientos en casos prácticos"],
          actividadesPresenciales: [
            {
              descripcion: "Práctica guiada en laboratorio",
              duracion: 120,
              metodologia: "Laboratorio",
            },
          ],
          actividadesAutonomas: [
            "Reporte de práctica",
            "Análisis de resultados",
          ],
          recursos: ["Manual de prácticas", "Equipo de laboratorio"],
        });
        break;
      case "evaluacion":
        onUpdate({
          ...semana,
          temas: ["Evaluación de conocimientos"],
          objetivos: ["Evaluar competencias adquiridas"],
          actividadesPresenciales: [
            {
              descripcion: "Aplicación de examen/presentación",
              duracion: 120,
              metodologia: "Evaluación",
            },
          ],
          actividadesAutonomas: ["Preparación para evaluación"],
          recursos: [],
        });
        break;
      case "proyecto":
        onUpdate({
          ...semana,
          temas: ["Desarrollo de proyecto"],
          objetivos: ["Integrar conocimientos en proyecto aplicado"],
          actividadesPresenciales: [
            {
              descripcion: "Asesoría de proyectos",
              duracion: 60,
              metodologia: "Tutoría",
            },
            {
              descripcion: "Trabajo en equipo",
              duracion: 60,
              metodologia: "Trabajo colaborativo",
            },
          ],
          actividadesAutonomas: [
            "Desarrollo del proyecto",
            "Investigación",
            "Documentación",
          ],
          recursos: ["Guía de proyecto", "Rúbrica de evaluación"],
        });
        break;
      case "lecturas":
        onUpdate({
          ...semana,
          temas: ["Análisis de textos"],
          objetivos: ["Analizar críticamente material bibliográfico"],
          actividadesPresenciales: [
            {
              descripcion: "Discusión de lecturas",
              duracion: 90,
              metodologia: "Seminario",
            },
          ],
          actividadesAutonomas: [
            "Lectura de textos asignados",
            "Elaboración de fichas de lectura",
            "Ensayo crítico",
          ],
          recursos: ["Textos académicos", "Guía de lectura"],
        });
        break;
    }
  };

  const getSummary = () => {
    const temasCount = semana.temas.filter((t) => t.trim()).length;
    const objetivosCount = semana.objetivos.filter((o) => o.trim()).length;
    return `${temasCount} temas, ${objetivosCount} objetivos`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpandido(!expandido)}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.semanaNumero}>Semana {semana.numero}</Text>
          <Text style={styles.unidadTematica}>
            {semana.unidadTematica || "Sin unidad temática"}
          </Text>
          {!expandido && <Text style={styles.summary}>{getSummary()}</Text>}
        </View>
        <Text style={styles.expandIcon}>{expandido ? "▼" : "►"}</Text>
      </TouchableOpacity>

      {/* Contenido expandido */}
      {expandido && (
        <View style={styles.content}>
          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cloneButton]}
              onPress={onClone}
            >
              <Text style={styles.actionButtonText}>📋 Clonar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
            >
              <Text style={styles.actionButtonText}>🗑️ Eliminar</Text>
            </TouchableOpacity>
          </View>

          {/* Plantillas rápidas */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Plantillas rápidas:</Text>
            <View style={styles.templateButtons}>
              <TouchableOpacity
                style={styles.templateButton}
                onPress={() => aplicarPlantilla("teorica")}
              >
                <Text style={styles.templateButtonText}>Teórica</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.templateButton}
                onPress={() => aplicarPlantilla("practica")}
              >
                <Text style={styles.templateButtonText}>Práctica</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.templateButton}
                onPress={() => aplicarPlantilla("evaluacion")}
              >
                <Text style={styles.templateButtonText}>Evaluación</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.templateButton}
                onPress={() => aplicarPlantilla("proyecto")}
              >
                <Text style={styles.templateButtonText}>Proyecto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.templateButton}
                onPress={() => aplicarPlantilla("lecturas")}
              >
                <Text style={styles.templateButtonText}>Lecturas</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Unidad temática */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Unidad temática:</Text>
            <TextInput
              style={styles.input}
              value={semana.unidadTematica}
              onChangeText={(text) => actualizarCampo("unidadTematica", text)}
              placeholder="Ej: Introducción a la Programación"
              multiline
            />
          </View>

          {/* Temas */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Temas:</Text>
            {semana.temas.map((tema, index) => (
              <View key={index} style={styles.listItem}>
                <TextInput
                  style={[styles.input, styles.listInput]}
                  value={tema}
                  onChangeText={(text) => actualizarTema(index, text)}
                  placeholder={`Tema ${index + 1}`}
                  multiline
                />
                <TouchableOpacity onPress={() => eliminarTema(index)}>
                  <Text style={styles.deleteItemButton}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={agregarTema}>
              <Text style={styles.addButtonText}>+ Agregar tema</Text>
            </TouchableOpacity>
          </View>

          {/* Objetivos */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Objetivos de aprendizaje:</Text>
            {semana.objetivos.map((objetivo, index) => (
              <View key={index} style={styles.listItem}>
                <TextInput
                  style={[styles.input, styles.listInput]}
                  value={objetivo}
                  onChangeText={(text) => actualizarObjetivo(index, text)}
                  placeholder={`Objetivo ${index + 1}`}
                  multiline
                />
                <TouchableOpacity onPress={() => eliminarObjetivo(index)}>
                  <Text style={styles.deleteItemButton}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={agregarObjetivo}
            >
              <Text style={styles.addButtonText}>+ Agregar objetivo</Text>
            </TouchableOpacity>
          </View>

          {/* Actividades presenciales */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Actividades presenciales:</Text>
            {semana.actividadesPresenciales.map((actividad, index) => (
              <View key={index} style={styles.actividadCard}>
                <TextInput
                  style={styles.input}
                  value={actividad.descripcion}
                  onChangeText={(text) =>
                    actualizarActividadPresencial(index, "descripcion", text)
                  }
                  placeholder="Descripción de la actividad"
                  multiline
                />
                <View style={styles.actividadRow}>
                  <View style={styles.actividadField}>
                    <Text style={styles.fieldLabel}>Duración (min):</Text>
                    <TextInput
                      style={styles.inputSmall}
                      value={String(actividad.duracion)}
                      onChangeText={(text) =>
                        actualizarActividadPresencial(
                          index,
                          "duracion",
                          parseInt(text) || 0
                        )
                      }
                      keyboardType="numeric"
                      placeholder="60"
                    />
                  </View>
                  <View style={[styles.actividadField, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Metodología:</Text>
                    <TextInput
                      style={styles.inputSmall}
                      value={actividad.metodologia}
                      onChangeText={(text) =>
                        actualizarActividadPresencial(
                          index,
                          "metodologia",
                          text
                        )
                      }
                      placeholder="Ej: Clase magistral"
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteCardButton}
                  onPress={() => eliminarActividadPresencial(index)}
                >
                  <Text style={styles.deleteCardButtonText}>
                    Eliminar actividad
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={agregarActividadPresencial}
            >
              <Text style={styles.addButtonText}>
                + Agregar actividad presencial
              </Text>
            </TouchableOpacity>
          </View>

          {/* Actividades autónomas */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Actividades autónomas:</Text>
            {semana.actividadesAutonomas.map((actividad, index) => (
              <View key={index} style={styles.listItem}>
                <TextInput
                  style={[styles.input, styles.listInput]}
                  value={actividad}
                  onChangeText={(text) =>
                    actualizarActividadAutonoma(index, text)
                  }
                  placeholder={`Actividad autónoma ${index + 1}`}
                  multiline
                />
                <TouchableOpacity
                  onPress={() => eliminarActividadAutonoma(index)}
                >
                  <Text style={styles.deleteItemButton}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={agregarActividadAutonoma}
            >
              <Text style={styles.addButtonText}>
                + Agregar actividad autónoma
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recursos */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Recursos didácticos:</Text>
            {semana.recursos.map((recurso, index) => (
              <View key={index} style={styles.listItem}>
                <TextInput
                  style={[styles.input, styles.listInput]}
                  value={recurso}
                  onChangeText={(text) => actualizarRecurso(index, text)}
                  placeholder={`Recurso ${index + 1}`}
                  multiline
                />
                <TouchableOpacity onPress={() => eliminarRecurso(index)}>
                  <Text style={styles.deleteItemButton}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={agregarRecurso}>
              <Text style={styles.addButtonText}>+ Agregar recurso</Text>
            </TouchableOpacity>
          </View>

          {/* Entregables */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Entregables (opcional):</Text>
            <TextInput
              style={styles.input}
              value={semana.entregables || ""}
              onChangeText={(text) => actualizarCampo("entregables", text)}
              placeholder="Ej: Reporte de práctica, Resumen de lecturas"
              multiline
            />
          </View>

          {/* Evaluación */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Evaluación en esta semana:</Text>
            <TextInput
              style={styles.input}
              value={semana.evaluacion || ""}
              onChangeText={(text) => actualizarCampo("evaluacion", text)}
              placeholder="ID de evaluación o descripción"
              multiline
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  headerLeft: {
    flex: 1,
  },
  semanaNumero: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 4,
  },
  unidadTematica: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  summary: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  expandIcon: {
    fontSize: 20,
    color: "#666",
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  cloneButton: {
    backgroundColor: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
    minHeight: 40,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
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
    marginTop: 8,
  },
  addButtonText: {
    color: "#2196F3",
    fontWeight: "600",
  },
  actividadCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  actividadRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actividadField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#666",
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 6,
    fontSize: 14,
    backgroundColor: "#fff",
    minWidth: 60,
  },
  deleteCardButton: {
    marginTop: 8,
    padding: 6,
    alignItems: "center",
  },
  deleteCardButtonText: {
    color: "#f44336",
    fontSize: 12,
  },
  templateButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  templateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#e8eaf6",
    borderRadius: 16,
  },
  templateButtonText: {
    color: "#3f51b5",
    fontSize: 12,
    fontWeight: "500",
  },
});
