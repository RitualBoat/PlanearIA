import React from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../types";
import type { Alumno, Recurso } from "../../../types";
import type { PlaneacionDocumento } from "../../../types/planeacionV2";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import { useAlumnos } from "../../context/AlumnosContext";
import { useGruposContext } from "../../context/GruposContext";
import { usePlaneaciones } from "../../context/PlaneacionesContext";
import { useRecursos } from "../../context/RecursosContext";
import { useClassroomGroupViewModel } from "../../hooks/classroom/useClassroomGroupViewModel";

type Navigation = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ClassroomGroup">;

const TAB_LABELS = ["Novedades", "Trabajo de clase", "Personas", "Calificaciones"];

type MaterialFilter =
  | "todos"
  | "planeaciones"
  | "pdf"
  | "video"
  | "enlaces"
  | "imagenes"
  | "archivos"
  | "otros";

const MATERIAL_FILTERS: { key: MaterialFilter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "planeaciones", label: "Planeaciones" },
  { key: "pdf", label: "PDF" },
  { key: "video", label: "Video" },
  { key: "enlaces", label: "Enlaces" },
  { key: "imagenes", label: "Imagenes" },
  { key: "archivos", label: "Archivo" },
  { key: "otros", label: "Otros" },
];

const isPlaneacionResource = (recurso: Recurso): boolean => {
  const tags = recurso.tags ?? [];
  return (
    recurso.url?.startsWith("planeacion://") === true ||
    tags.some((tag) => tag.toLowerCase() === "planeacion")
  );
};

const resolveMaterialFilter = (recurso: Recurso): MaterialFilter => {
  const formato = recurso.formato?.toLowerCase() ?? "";
  const archivo = recurso.archivo?.toLowerCase() ?? "";

  if (isPlaneacionResource(recurso)) return "planeaciones";
  if (formato === "pdf" || archivo.endsWith(".pdf")) return "pdf";
  if (recurso.tipo === "video") return "video";
  if (recurso.tipo === "enlace" || recurso.url?.startsWith("http") === true) return "enlaces";
  if (recurso.tipo === "imagen") return "imagenes";
  if (recurso.archivo || ["documento", "presentacion", "audio", "examen"].includes(recurso.tipo)) {
    return "archivos";
  }
  return "otros";
};

const getPlaneacionTitle = (doc: PlaneacionDocumento): string => {
  const asignatura = doc.datosGenerales.asignatura || doc.elementosCurriculares.contenido || "Planeacion";
  const grado = doc.datosGenerales.grado ? ` - ${doc.datosGenerales.grado}` : "";
  const grupo = doc.datosGenerales.grupos?.[0] ? ` ${doc.datosGenerales.grupos[0]}` : "";
  return `${asignatura}${grado}${grupo}`.trim();
};

const ClassroomGroupScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { width } = useWindowDimensions();
  const { grupoId, grupoNombre } = route.params;
  const { model, alumnos, materiales, isLoading, error, reload } = useClassroomGroupViewModel(grupoId);
  const { actualizarAlumno } = useAlumnos();
  const { grupos } = useGruposContext();
  const { documentos } = usePlaneaciones();
  const { crearRecurso } = useRecursos();
  const [materialFilter, setMaterialFilter] = React.useState<MaterialFilter>("todos");
  const nombre = model?.grupo.nombre ?? grupoNombre ?? "Grupo";
  const materia = model?.grupo.materia ?? "Materia sin definir";
  const periodo = model?.grupo.periodo ?? "Periodo sin definir";
  const isCompact = width < 760;
  const alumnosPreview = alumnos.slice(0, 4);
  const materialesFiltrados = materiales.filter((recurso) => {
    if (materialFilter === "todos") return true;
    return resolveMaterialFilter(recurso) === materialFilter;
  });
  const materialesPreview = materialesFiltrados.slice(0, 6);
  const gruposDestino = grupos.filter((grupo) => typeof grupo.id === "number" && grupo.id !== grupoId);

  const showMessage = React.useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
      return;
    }

    Alert.alert(title, message);
  }, []);

  const removeAlumnoFromGroup = React.useCallback(
    async (alumno: Alumno) => {
      await actualizarAlumno(alumno.id, { grupoId: undefined });
      await reload();
    },
    [actualizarAlumno, reload]
  );

  const moveAlumnoToGroup = React.useCallback(
    async (alumno: Alumno, targetGrupoId: number) => {
      await actualizarAlumno(alumno.id, { grupoId: targetGrupoId });
      await reload();
    },
    [actualizarAlumno, reload]
  );

  const handleRemoveAlumno = React.useCallback(
    (alumno: Alumno) => {
      const fullName = `${alumno.nombre} ${alumno.apellidos}`.trim();
      const message = `Esto quitara a ${fullName} de ${nombre}, pero no eliminara su perfil.`;

      if (Platform.OS === "web") {
        if (window.confirm(`Quitar alumno\n\n${message}`)) {
          void removeAlumnoFromGroup(alumno);
        }
        return;
      }

      Alert.alert("Quitar alumno", message, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Quitar",
          style: "destructive",
          onPress: () => void removeAlumnoFromGroup(alumno),
        },
      ]);
    },
    [nombre, removeAlumnoFromGroup]
  );

  const handleMoveAlumno = React.useCallback(
    (alumno: Alumno) => {
      if (gruposDestino.length === 0) {
        showMessage("Sin grupos destino", "Crea otro grupo para poder mover este alumno.");
        return;
      }

      if (Platform.OS === "web") {
        const promptText = gruposDestino
          .map((grupo) => `${grupo.id} - ${grupo.nombre ?? "Grupo sin nombre"}`)
          .join("\n");
        const selected = window.prompt(`Escribe el ID del grupo destino:\n\n${promptText}`);
        if (!selected) return;

        const targetId = Number(selected);
        const exists = gruposDestino.some((grupo) => grupo.id === targetId);
        if (!Number.isFinite(targetId) || !exists) {
          showMessage("Grupo invalido", "El ID seleccionado no coincide con un grupo disponible.");
          return;
        }

        void moveAlumnoToGroup(alumno, targetId);
        return;
      }

      Alert.alert(
        "Mover alumno",
        `Selecciona el grupo destino para ${alumno.nombre}.`,
        [
          ...gruposDestino.slice(0, 6).map((grupo) => ({
            text: grupo.nombre ?? `Grupo ${grupo.id}`,
            onPress: () => {
              if (typeof grupo.id === "number") {
                void moveAlumnoToGroup(alumno, grupo.id);
              }
            },
          })),
          { text: "Cancelar", style: "cancel" as const },
        ]
      );
    },
    [gruposDestino, moveAlumnoToGroup, showMessage]
  );

  const attachPlaneacion = React.useCallback(
    async (doc: PlaneacionDocumento) => {
      const now = new Date();
      await crearRecurso({
        titulo: getPlaneacionTitle(doc),
        tipo: "documento",
        descripcion: `Planeacion adjunta a la clase ${nombre}.`,
        url: `planeacion://${doc.id}`,
        grupoId,
        asignadoComoTarea: false,
        tags: ["planeacion", doc.nivelAcademico, doc.datosGenerales.asignatura].filter(Boolean),
        fechaCreacion: now,
        fechaModificacion: now,
        formato: "planeacion",
        formatosExportacion: ["pdf", "docx"],
        acceso: "privado",
        origen: "manual",
        profesorId: 1,
        versionActual: 1,
      });
      await reload();
      showMessage("Planeacion adjunta", "La planeacion ya aparece como material de esta clase.");
    },
    [crearRecurso, grupoId, nombre, reload, showMessage]
  );

  const handleAttachPlaneacion = React.useCallback(() => {
    if (documentos.length === 0) {
      showMessage("Sin planeaciones", "Crea una planeacion para poder adjuntarla como material.");
      return;
    }

    const opciones = documentos.slice(0, 8);

    if (Platform.OS === "web") {
      const promptText = opciones
        .map((doc, index) => `${index + 1}. ${getPlaneacionTitle(doc)}`)
        .join("\n");
      const selected = window.prompt(`Elige una planeacion para adjuntar:\n\n${promptText}`);
      if (!selected) return;

      const index = Number(selected) - 1;
      const doc = opciones[index];
      if (!doc) {
        showMessage("Seleccion invalida", "El numero seleccionado no coincide con una planeacion.");
        return;
      }

      void attachPlaneacion(doc);
      return;
    }

    Alert.alert(
      "Adjuntar planeacion",
      "Selecciona una planeacion para convertirla en material de clase.",
      [
        ...opciones.slice(0, 6).map((doc) => ({
          text: getPlaneacionTitle(doc),
          onPress: () => void attachPlaneacion(doc),
        })),
        { text: "Cancelar", style: "cancel" as const },
      ]
    );
  }, [attachPlaneacion, documentos, showMessage]);

  const handleOpenMaterial = React.useCallback(
    (recurso: Recurso) => {
      if (isPlaneacionResource(recurso) && recurso.url) {
        const planeacionId = recurso.url.replace("planeacion://", "");
        if (planeacionId) {
          navigation.navigate("DocEditor", { modo: "editar", planeacionId });
          return;
        }
      }

      navigation.navigate("CrearRecurso", { recursoId: recurso.id, grupoId });
    },
    [grupoId, navigation]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={[styles.content, isCompact ? styles.contentCompact : null]}
        showsVerticalScrollIndicator={Platform.OS === "web"}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void reload()} />}
      >
        <View style={[styles.banner, isCompact ? styles.bannerCompact : null]}>
          <View style={styles.bannerPatternOne} />
          <View style={styles.bannerPatternTwo} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={[styles.bannerCopy, isCompact ? styles.bannerCopyCompact : null]}>
            <Text style={styles.eyebrow}>Classroom</Text>
            <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>{nombre}</Text>
            <Text style={[styles.subtitle, isCompact ? styles.subtitleCompact : null]}>
              {materia} - {periodo}
            </Text>
          </View>
        </View>

        <View style={[styles.tabsBar, isCompact ? styles.tabsBarCompact : null]}>
          {TAB_LABELS.map((label, index) => (
            <View key={label} style={[styles.tabPill, index === 0 ? styles.tabPillActive : null]}>
              <Text style={[styles.tabText, index === 0 ? styles.tabTextActive : null]}>{label}</Text>
            </View>
          ))}
        </View>

        {error ? (
          <View style={styles.warningCard}>
            <MaterialIcons name="cloud-off" size={22} color="#B45309" />
            <View style={styles.warningCopy}>
              <Text style={styles.warningTitle}>Datos locales</Text>
              <Text style={styles.warningText}>{error}</Text>
            </View>
          </View>
        ) : null}

        {isLoading && !model ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando clase...</Text>
          </View>
        ) : null}

        {!isLoading && !model ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="search-off" size={34} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>No encontramos este grupo</Text>
            <Text style={styles.emptyText}>Puede haberse eliminado o estar pendiente de sincronizacion.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("ListaGrupos")}>
              <Text style={styles.primaryButtonText}>Ir a lista legacy</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {model ? (
          <View style={styles.classroomLayout}>

            <View style={[styles.mainRail, isCompact ? styles.mainRailCompact : null]}>
              <View style={styles.announcementCard}>
                <View style={styles.teacherAvatar}>
                  <MaterialIcons name="person" size={22} color="#FFFFFF" />
                </View>
                <View style={styles.announcementCopy}>
                  <Text style={styles.announcementTitle}>Publica o prepara algo para tu clase</Text>
                  <Text style={styles.announcementText}>
                    Accesos rapidos para crear trabajo, asignar recursos y registrar el avance diario.
                  </Text>
                </View>
              </View>

              <View style={styles.actionsGrid}>
                <ActionCard
                  title="Alumnos"
                  description="Lista del grupo, perfiles e importacion."
                  icon="groups"
                  onPress={() => navigation.navigate("CrearAlumno", { grupoId })}
                />
                <ActionCard
                  title="Actividades"
                  description="Crear tarea o revisar entregas."
                  icon="assignment-add"
                  onPress={() => navigation.navigate("CrearTareaGrupo", { grupoId })}
                />
                <ActionCard
                  title="Materiales"
                  description="Recursos y planeaciones asignadas."
                  icon="folder-special"
                  onPress={() => navigation.navigate("CrearRecurso", { grupoId })}
                />
                <ActionCard
                  title="Asistencia"
                  description="Registro del dia e historial."
                  icon="event-available"
                  onPress={() => navigation.navigate("RegistrarAsistencia", { grupoId })}
                />
                <ActionCard
                  title="Calificaciones"
                  description="Captura y promedios."
                  icon="grading"
                  onPress={() => navigation.navigate("CapturarCalificaciones", { grupoId })}
                />
                <ActionCard
                  title="Reportes"
                  description="Seguimiento accionable."
                  icon="insights"
                  onPress={() => navigation.navigate("ReportesGrupo", { grupoId, grupoNombre: nombre })}
                />
              </View>

              <View style={styles.feedCard}>
                <View style={styles.feedHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Materiales de clase</Text>
                    <Text style={styles.sectionHint}>Recursos asignados al grupo.</Text>
                  </View>
                  <Text style={styles.feedCount}>
                    {materialesFiltrados.length}/{materiales.length}
                  </Text>
                </View>

                <View style={styles.inlineActions}>
                  <TouchableOpacity
                    style={styles.inlineActionButton}
                    onPress={() => navigation.navigate("CrearRecurso", { grupoId })}
                  >
                    <MaterialIcons name="add-to-drive" size={18} color={COLORS.primary} />
                    <Text style={styles.inlineActionText}>Crear material</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.inlineActionButton}
                    onPress={() => navigation.navigate("AsignarRecurso", { grupoId })}
                  >
                    <MaterialIcons name="library-add" size={18} color={COLORS.primary} />
                    <Text style={styles.inlineActionText}>Asignar existente</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.inlineActionButton}
                    onPress={handleAttachPlaneacion}
                  >
                    <MaterialIcons name="article" size={18} color={COLORS.primary} />
                    <Text style={styles.inlineActionText}>Adjuntar planeacion</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.inlineActionButton}
                    onPress={() => navigation.navigate("ListaRecursos", { filtroTipo: undefined })}
                  >
                    <MaterialIcons name="folder-open" size={18} color={COLORS.primary} />
                    <Text style={styles.inlineActionText}>Biblioteca</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.filterPills}>
                  {MATERIAL_FILTERS.map((filter) => (
                    <TouchableOpacity
                      key={filter.key}
                      style={[
                        styles.filterPill,
                        materialFilter === filter.key ? styles.filterPillActive : null,
                      ]}
                      onPress={() => setMaterialFilter(filter.key)}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          materialFilter === filter.key ? styles.filterPillTextActive : null,
                        ]}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {materialesPreview.length === 0 ? (
                  <EmptyFeedLine icon="folder-open" text="No hay materiales para este filtro." />
                ) : (
                  materialesPreview.map((recurso) => (
                    <MaterialRow
                      key={recurso.id}
                      recurso={recurso}
                      onPress={() => handleOpenMaterial(recurso)}
                    />
                  ))
                )}
              </View>

              <View style={styles.feedCard}>
                <View style={styles.feedHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Alumnos del grupo</Text>
                    <Text style={styles.sectionHint}>Participantes vinculados a esta clase.</Text>
                  </View>
                  <Text style={styles.feedCount}>{alumnos.length}</Text>
                </View>

                <View style={styles.inlineActions}>
                  <TouchableOpacity
                    style={styles.inlineActionButton}
                    onPress={() => navigation.navigate("CrearAlumno", { grupoId })}
                  >
                    <MaterialIcons name="person-add" size={18} color={COLORS.primary} />
                    <Text style={styles.inlineActionText}>Agregar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.inlineActionButton}
                    onPress={() => navigation.navigate("ImportarAlumnos", { grupoId, grupoNombre: nombre })}
                  >
                    <MaterialIcons name="upload-file" size={18} color={COLORS.primary} />
                    <Text style={styles.inlineActionText}>Importar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.inlineActionButton}
                    onPress={() => navigation.navigate("ExportarAlumnos", { grupoId, grupoNombre: nombre })}
                  >
                    <MaterialIcons name="download" size={18} color={COLORS.primary} />
                    <Text style={styles.inlineActionText}>Exportar</Text>
                  </TouchableOpacity>
                </View>

                {alumnosPreview.length === 0 ? (
                  <EmptyFeedLine icon="person-add" text="Aun no hay alumnos vinculados a este grupo." />
                ) : (
                  alumnosPreview.map((alumno) => (
                    <StudentRow
                      key={alumno.id}
                      alumno={alumno}
                      onPress={() => navigation.navigate("DetalleAlumno", { alumnoId: alumno.id })}
                      onMove={() => handleMoveAlumno(alumno)}
                      onRemove={() => handleRemoveAlumno(alumno)}
                    />
                  ))
                )}
              </View>

              <View style={styles.feedCard}>
                <View style={styles.feedHeader}>
                  <Text style={styles.sectionTitle}>Pendientes</Text>
                  <Text style={styles.feedCount}>{model.pendientes.length}</Text>
                </View>
                {model.pendientes.length === 0 ? (
                  <EmptyFeedLine icon="check-circle" text="Sin pendientes academicos detectados." />
                ) : (
                  model.pendientes.slice(0, 5).map((pendiente) => (
                    <FeedItem key={pendiente.id} icon="flag" title={pendiente.titulo} meta={pendiente.tipo} />
                  ))
                )}
              </View>

              <View style={styles.feedCard}>
                <View style={styles.feedHeader}>
                  <Text style={styles.sectionTitle}>Actividad reciente</Text>
                  <Text style={styles.feedCount}>{model.actividadReciente.length}</Text>
                </View>
                {model.actividadReciente.length === 0 ? (
                  <EmptyFeedLine icon="history" text="Aun no hay actividad reciente." />
                ) : (
                  model.actividadReciente.slice(0, 5).map((actividad) => (
                    <FeedItem
                      key={actividad.id}
                      icon="history"
                      title={actividad.titulo}
                      meta={`${actividad.entidadOrigen} - ${new Date(actividad.fecha).toLocaleDateString()}`}
                    />
                  ))
                )}
              </View>
            </View>

            <View style={[styles.sideRail, isCompact ? styles.sideRailCompact : null]}>
              <View style={styles.classCodeCard}>
                <Text style={styles.cardLabel}>Resumen de clase</Text>
                <Text style={styles.classCode}>{String(grupoId).padStart(3, "0")}</Text>
                <Text style={styles.classCodeHelp}>Codigo local del grupo</Text>
              </View>

              <View style={[styles.metricsStack, isCompact ? styles.metricsStackCompact : null]}>
                <KpiCard label="Alumnos" value={model.resumen.totalAlumnos} icon="school" />
                <KpiCard label="Actividades" value={model.resumen.totalActividades} icon="assignment" />
                <KpiCard label="Materiales" value={model.resumen.totalMateriales} icon="folder" />
                <KpiCard label="Asistencia" value={`${model.resumen.porcentajeAsistencia}%`} icon="how-to-reg" />
              </View>

              <TouchableOpacity
                style={styles.legacyButton}
                onPress={() => navigation.navigate("DetalleGrupo", { grupoId, grupoNombre: nombre })}
              >
                <MaterialIcons name="open-in-new" size={20} color={COLORS.primary} />
                <Text style={styles.legacyButtonText}>Abrir detalle legacy</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const KpiCard: React.FC<{ label: string; value: number | string; icon: keyof typeof MaterialIcons.glyphMap }> = ({
  icon,
  label,
  value,
}) => (
  <View style={styles.kpiCard}>
    <MaterialIcons name={icon} size={20} color={COLORS.primary} />
    <View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  </View>
);

const ActionCard: React.FC<{
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}> = ({ title, description, icon, onPress }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress}>
    <View style={styles.actionIcon}>
      <MaterialIcons name={icon} size={22} color={COLORS.primary} />
    </View>
    <View style={styles.actionCopy}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
  </TouchableOpacity>
);

const StudentRow: React.FC<{
  alumno: Alumno;
  onPress: () => void;
  onMove: () => void;
  onRemove: () => void;
}> = ({ alumno, onMove, onPress, onRemove }) => (
  <TouchableOpacity style={styles.studentRow} onPress={onPress}>
    <View style={styles.studentAvatar}>
      <Text style={styles.studentAvatarText}>
        {(alumno.nombre?.[0] ?? "A").toUpperCase()}
      </Text>
    </View>
    <View style={styles.studentCopy}>
      <Text style={styles.studentName}>{`${alumno.nombre} ${alumno.apellidos}`.trim()}</Text>
      <Text style={styles.studentMeta}>
        {alumno.numeroControl} - {alumno.carrera} - {alumno.estado}
      </Text>
    </View>
    <View style={styles.rowActions}>
      <TouchableOpacity
        style={styles.rowActionButton}
        onPress={(event) => {
          event.stopPropagation();
          onMove();
        }}
      >
        <MaterialIcons name="drive-file-move" size={16} color={COLORS.primary} />
        <Text style={styles.rowActionText}>Mover</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.rowActionButton, styles.rowActionDanger]}
        onPress={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      >
        <MaterialIcons name="person-remove" size={16} color="#B91C1C" />
        <Text style={[styles.rowActionText, styles.rowActionDangerText]}>Quitar</Text>
      </TouchableOpacity>
    </View>
    <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
  </TouchableOpacity>
);

const MaterialRow: React.FC<{ recurso: Recurso; onPress: () => void }> = ({ recurso, onPress }) => (
  <TouchableOpacity style={styles.studentRow} onPress={onPress}>
    <View style={styles.materialAvatar}>
      <MaterialIcons
        name={isPlaneacionResource(recurso) ? "article" : "folder"}
        size={20}
        color={COLORS.primary}
      />
    </View>
    <View style={styles.studentCopy}>
      <Text style={styles.studentName}>{recurso.titulo}</Text>
      <Text style={styles.studentMeta}>
        {isPlaneacionResource(recurso) ? "planeacion" : recurso.tipo} - {recurso.origen} - v
        {recurso.versionActual}
      </Text>
    </View>
    <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
  </TouchableOpacity>
);

const FeedItem: React.FC<{ icon: keyof typeof MaterialIcons.glyphMap; title: string; meta: string }> = ({
  icon,
  meta,
  title,
}) => (
  <View style={styles.feedItem}>
    <View style={styles.feedIcon}>
      <MaterialIcons name={icon} size={19} color={COLORS.primary} />
    </View>
    <View style={styles.feedCopy}>
      <Text style={styles.feedTitle}>{title}</Text>
      <Text style={styles.feedMeta}>{meta}</Text>
    </View>
  </View>
);

const EmptyFeedLine: React.FC<{ icon: keyof typeof MaterialIcons.glyphMap; text: string }> = ({ icon, text }) => (
  <View style={styles.emptyLine}>
    <MaterialIcons name={icon} size={20} color="#64748B" />
    <Text style={styles.emptyLineText}>{text}</Text>
  </View>
);

const webScrollStyle =
  Platform.OS === "web"
    ? ({ height: "100vh", maxHeight: "100vh", overflowY: "auto" } as object)
    : null;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEF3F8",
  },
  scroller: {
    flex: 1,
    ...webScrollStyle,
  },
  content: {
    alignSelf: "center",
    maxWidth: 1180,
    padding: 18,
    paddingBottom: Platform.OS === "web" ? 190 : 120,
    width: "100%",
  },
  contentCompact: {
    padding: 14,
    paddingBottom: 140,
  },
  banner: {
    backgroundColor: "#1E7D4F",
    borderRadius: 28,
    minHeight: 190,
    overflow: "hidden",
    padding: 24,
  },
  bannerCompact: {
    borderRadius: 24,
    minHeight: 150,
    padding: 20,
  },
  bannerPatternOne: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    height: 210,
    position: "absolute",
    right: -42,
    top: -56,
    width: 210,
  },
  bannerPatternTwo: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    bottom: -82,
    height: 240,
    position: "absolute",
    right: 116,
    width: 240,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  bannerCopy: {
    marginTop: 24,
    maxWidth: 720,
  },
  bannerCopyCompact: {
    marginTop: 18,
  },
  eyebrow: {
    color: "#D7FBE8",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.6,
    lineHeight: 39,
    marginTop: 8,
  },
  titleCompact: {
    fontSize: 30,
    lineHeight: 35,
  },
  subtitle: {
    color: "#E4F8EC",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  tabsBar: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
    padding: 8,
  },
  tabsBarCompact: {
    alignItems: "stretch",
    borderRadius: 24,
  },
  tabPill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabPillActive: {
    backgroundColor: "#E8F3EC",
  },
  tabText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "900",
  },
  tabTextActive: {
    color: "#1E7D4F",
  },
  warningCard: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    padding: 16,
  },
  warningCopy: {
    flex: 1,
  },
  warningTitle: {
    color: "#9A3412",
    fontSize: 16,
    fontWeight: "900",
  },
  warningText: {
    color: "#9A3412",
    fontSize: 14,
  },
  loadingBox: {
    alignItems: "center",
    gap: 10,
    marginTop: 28,
  },
  loadingText: {
    color: "#64748B",
    fontWeight: "700",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    marginTop: 18,
    padding: 22,
  },
  emptyTitle: {
    color: "#122033",
    fontSize: 20,
    fontWeight: "900",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  classroomLayout: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    marginTop: 18,
  },
  sideRail: {
    flexGrow: 1,
    gap: 12,
    maxWidth: 320,
    minWidth: 260,
  },
  sideRailCompact: {
    maxWidth: undefined,
    minWidth: 0,
    width: "100%",
  },
  mainRail: {
    flex: 1,
    gap: 14,
    minWidth: 320,
  },
  mainRailCompact: {
    minWidth: 0,
    width: "100%",
  },
  classCodeCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  cardLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  classCode: {
    color: "#0F172A",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 6,
  },
  classCodeHelp: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 2,
  },
  metricsStack: {
    gap: 10,
  },
  metricsStackCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  kpiCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 15,
  },
  kpiValue: {
    color: "#122033",
    fontSize: 22,
    fontWeight: "900",
  },
  kpiLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
  },
  legacyButton: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderColor: "#CFE0F7",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    padding: 15,
  },
  legacyButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  announcementCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 16,
  },
  teacherAvatar: {
    alignItems: "center",
    backgroundColor: "#1E7D4F",
    borderRadius: 999,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  announcementCopy: {
    flex: 1,
  },
  announcementTitle: {
    color: "#122033",
    fontSize: 16,
    fontWeight: "900",
  },
  announcementText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 20,
    borderWidth: 1,
    flexBasis: 250,
    flexDirection: "row",
    flexGrow: 1,
    gap: 12,
    minHeight: 92,
    padding: 14,
  },
  actionIcon: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    color: "#122033",
    fontSize: 15,
    fontWeight: "900",
  },
  actionDescription: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  feedCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  sectionHint: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  inlineActionButton: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderColor: "#CFE0F7",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inlineActionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  filterPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterPill: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterPillActive: {
    backgroundColor: "#1E7D4F",
    borderColor: "#1E7D4F",
  },
  filterPillText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "900",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  studentRow: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  studentAvatar: {
    alignItems: "center",
    backgroundColor: "#DFF3E8",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  studentAvatarText: {
    color: "#1E7D4F",
    fontSize: 15,
    fontWeight: "900",
  },
  materialAvatar: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  studentCopy: {
    flex: 1,
  },
  studentName: {
    color: "#122033",
    fontSize: 14,
    fontWeight: "900",
  },
  studentMeta: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
    textTransform: "capitalize",
  },
  rowActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "flex-end",
  },
  rowActionButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#CFE0F7",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  rowActionDanger: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECACA",
  },
  rowActionText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  rowActionDangerText: {
    color: "#B91C1C",
  },
  feedHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#122033",
    fontSize: 18,
    fontWeight: "900",
  },
  feedCount: {
    backgroundColor: "#E8F3EC",
    borderRadius: 999,
    color: "#1E7D4F",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  feedItem: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  feedIcon: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  feedCopy: {
    flex: 1,
  },
  feedTitle: {
    color: "#122033",
    fontSize: 14,
    fontWeight: "900",
  },
  feedMeta: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  emptyLine: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  emptyLineText: {
    color: "#64748B",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
});

export default ClassroomGroupScreen;

