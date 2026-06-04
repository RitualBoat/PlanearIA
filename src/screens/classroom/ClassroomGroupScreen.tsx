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
import type { Alumno, Recurso, Tarea } from "../../../types";
import type { PlaneacionDocumento } from "../../../types/planeacionV2";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import { useAlumnos } from "../../context/AlumnosContext";
import { usePlaneaciones } from "../../context/PlaneacionesContext";
import { useRecursos } from "../../context/RecursosContext";
import {
  type ClassroomContentItem,
  type ClassroomContentSection,
  useClassroomGroupViewModel,
} from "../../hooks/classroom/useClassroomGroupViewModel";
import {
  resumirProgresoClassroom,
  sugerirActividadClassroom,
  type ClassroomAiResponse,
  type ResumirProgresoResultado,
  type SugerirActividadResultado,
} from "../../services/classroom/classroomAiService";

type Navigation = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ClassroomGroup">;
type ClassroomTab = "tablon" | "trabajo" | "personas";

const CLASSROOM_TABS: { key: ClassroomTab; label: string }[] = [
  { key: "tablon", label: "Tablon" },
  { key: "trabajo", label: "Trabajo de clase" },
  { key: "personas", label: "Personas" },
];

const isPlaneacionResource = (recurso: Recurso): boolean =>
  recurso.url?.startsWith("planeacion://") === true ||
  Boolean(recurso.tags?.some((tag) => tag.toLowerCase() === "planeacion"));

const getPlaneacionTitle = (doc: PlaneacionDocumento): string => {
  const asignatura = doc.datosGenerales.asignatura || doc.elementosCurriculares.contenido || "Planeacion";
  const grado = doc.datosGenerales.grado ? ` - ${doc.datosGenerales.grado}` : "";
  const grupo = doc.datosGenerales.grupos?.[0] ? ` ${doc.datosGenerales.grupos[0]}` : "";
  return `${asignatura}${grado}${grupo}`.trim();
};

const formatDate = (value?: Date | string): string => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString();
};

const formatAiActivity = (response: ClassroomAiResponse<SugerirActividadResultado>): string => {
  const { actividad, mensaje } = response.resultado;
  return [
    mensaje,
    "",
    `Titulo: ${actividad.titulo}`,
    `Tipo: ${actividad.tipo}`,
    `Descripcion: ${actividad.descripcion}`,
    "",
    `Instrucciones: ${actividad.instrucciones}`,
    "",
    `Criterios: ${actividad.criterios.join(" - ")}`,
  ].join("\n");
};

const formatAiProgress = (response: ClassroomAiResponse<ResumirProgresoResultado>): string => {
  const { hallazgos, mensaje, resumen } = response.resultado;
  return [mensaje, "", resumen, "", ...hallazgos.map((item) => `- ${item.prioridad}/${item.tipo}: ${item.descripcion}`)].join("\n");
};

const ClassroomGroupScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { width } = useWindowDimensions();
  const { grupoId, grupoNombre } = route.params;
  const {
    model,
    alumnos,
    actividades,
    entregas,
    materiales,
    contentSections,
    feedItems,
    isLoading,
    error,
    crearUnidad,
    renombrarUnidad,
    toggleUnidad,
    eliminarUnidad,
    reload,
  } = useClassroomGroupViewModel(grupoId);
  const { actualizarAlumno } = useAlumnos();
  const { documentos } = usePlaneaciones();
  const { crearRecurso } = useRecursos();
  const [activeTab, setActiveTab] = React.useState<ClassroomTab>("tablon");
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiWarning, setAiWarning] = React.useState<string | null>(null);

  const isCompact = width < 780;
  const nombre = model?.grupo.nombre ?? grupoNombre ?? "Grupo";
  const materia = model?.grupo.materia ?? "Materia sin definir";
  const periodo = model?.grupo.periodo ?? "Periodo sin definir";
  const proximasEntregas = React.useMemo(
    () =>
      actividades
        .filter((actividad) => actividad.estado !== "finalizada")
        .sort((a, b) => new Date(a.fechaEntrega).getTime() - new Date(b.fechaEntrega).getTime())
        .slice(0, 4),
    [actividades],
  );
  const aiContext = React.useMemo(
    () => ({
      grupo: { id: grupoId, nombre, materia, periodo },
      resumen: model?.resumen,
      alumnos: alumnos.map((alumno) => ({
        id: alumno.id,
        nombre: alumno.nombre,
        apellidos: alumno.apellidos,
        estado: alumno.estado,
      })),
      actividades: actividades.map((actividad) => ({
        id: actividad.id,
        titulo: actividad.titulo,
        descripcion: actividad.descripcion,
        tipo: actividad.tipo,
        estado: actividad.estado,
        fechaEntrega: actividad.fechaEntrega,
        valor: actividad.valor,
      })),
      materiales: materiales.map((material) => ({
        id: material.id,
        titulo: material.titulo,
        tipo: material.tipo,
      })),
      entregas: entregas.map((entrega) => ({
        tareaId: entrega.tareaId,
        alumnoId: entrega.alumnoId,
        estado: entrega.estado,
        calificacion: entrega.calificacion,
        calificada: entrega.calificada,
      })),
    }),
    [actividades, alumnos, entregas, grupoId, materiales, materia, model?.resumen, nombre, periodo],
  );

  const showMessage = React.useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message);
  }, []);

  const askText = React.useCallback(
    (title: string, message: string, fallback: string, onSubmit: (value: string) => void) => {
      if (Platform.OS === "web") {
        const value = window.prompt(`${title}\n\n${message}`, fallback);
        if (value?.trim()) onSubmit(value.trim());
        return;
      }

      const nativePrompt = (Alert as typeof Alert & {
        prompt?: (
          title: string,
          message?: string,
          callbackOrButtons?: (value: string) => void,
          type?: "plain-text",
          defaultValue?: string,
        ) => void;
      }).prompt;

      if (Platform.OS === "ios" && nativePrompt) {
        nativePrompt(title, message, (value) => {
          if (value?.trim()) onSubmit(value.trim());
        }, "plain-text", fallback);
        return;
      }

      showMessage(title, "En Android se usara el nombre sugerido por ahora. Lo podremos reemplazar por un modal propio.");
      onSubmit(fallback);
    },
    [showMessage],
  );

  const handleCreateUnidad = React.useCallback(() => {
    askText("Nueva seccion", "Ejemplo: Unidad 1 - Introduccion", "Unidad 1", (value) => {
      void crearUnidad(value);
    });
  }, [askText, crearUnidad]);

  const handleRenameUnidad = React.useCallback(
    (section: ClassroomContentSection) => {
      if (section.isUnassigned) return;
      askText("Renombrar seccion", "Escribe el nuevo nombre de la seccion.", section.nombre, (value) => {
        void renombrarUnidad(section.id, value);
      });
    },
    [askText, renombrarUnidad],
  );

  const handleDeleteUnidad = React.useCallback(
    (section: ClassroomContentSection) => {
      if (section.isUnassigned) return;
      const message =
        "La seccion se quitara del curso. Sus materiales y actividades no se eliminan; apareceran en Sin seccion.";
      if (Platform.OS === "web") {
        if (window.confirm(`Eliminar seccion\n\n${message}`)) void eliminarUnidad(section.id);
        return;
      }
      Alert.alert("Eliminar seccion", message, [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => void eliminarUnidad(section.id) },
      ]);
    },
    [eliminarUnidad],
  );

  const attachPlaneacion = React.useCallback(
    async (doc: PlaneacionDocumento, unidadId?: string) => {
      const now = new Date();
      await crearRecurso({
        titulo: getPlaneacionTitle(doc),
        tipo: "documento",
        descripcion: `Planeacion adjunta a ${nombre}.`,
        url: `planeacion://${doc.id}`,
        grupoId,
        unidadId,
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
      showMessage("Planeacion adjunta", unidadId ? "Aparece dentro de la seccion elegida." : "Aparece en Sin seccion.");
    },
    [crearRecurso, grupoId, nombre, reload, showMessage],
  );

  const handleAttachPlaneacion = React.useCallback(
    (unidadId?: string) => {
      if (documentos.length === 0) {
        showMessage("Sin planeaciones", "Crea una planeacion para adjuntarla como material.");
        return;
      }
      const opciones = documentos.slice(0, 8);
      if (Platform.OS === "web") {
        const promptText = opciones.map((doc, index) => `${index + 1}. ${getPlaneacionTitle(doc)}`).join("\n");
        const selected = window.prompt(`Elige una planeacion:\n\n${promptText}`);
        const doc = opciones[Number(selected) - 1];
        if (doc) void attachPlaneacion(doc, unidadId);
        return;
      }
      Alert.alert("Adjuntar planeacion", "Selecciona una planeacion.", [
        ...opciones.slice(0, 6).map((doc) => ({
          text: getPlaneacionTitle(doc),
          onPress: () => void attachPlaneacion(doc, unidadId),
        })),
        { text: "Cancelar", style: "cancel" },
      ]);
    },
    [attachPlaneacion, documentos, showMessage],
  );

  const handleCreateForSection = React.useCallback(
    (section: ClassroomContentSection) => {
      const unidadId = section.isUnassigned ? undefined : section.id;
      const options = [
        {
          text: "Actividad",
          onPress: () => navigation.navigate("CrearTareaGrupo", { grupoId, unidadId }),
        },
        {
          text: "Material",
          onPress: () => navigation.navigate("CrearRecurso", { grupoId, unidadId }),
        },
        {
          text: "Adjuntar planeacion",
          onPress: () => handleAttachPlaneacion(unidadId),
        },
      ];

      if (Platform.OS === "web") {
        const selected = window.prompt(
          `Agregar a ${section.nombre}\n\n1. Actividad\n2. Material\n3. Adjuntar planeacion`,
          "1",
        );
        if (selected === "1") options[0].onPress();
        if (selected === "2") options[1].onPress();
        if (selected === "3") options[2].onPress();
        return;
      }

      Alert.alert(`Agregar a ${section.nombre}`, "Elige el tipo de contenido.", [
        ...options,
        { text: "Cancelar", style: "cancel" },
      ]);
    },
    [grupoId, handleAttachPlaneacion, navigation],
  );

  const handleOpenContentItem = React.useCallback(
    (item: ClassroomContentItem) => {
      if (item.kind === "actividad") {
        navigation.navigate("DetalleActividadClassroom", { tareaId: item.rawId, grupoId });
        return;
      }
      const recurso = item.raw as Recurso;
      if (isPlaneacionResource(recurso) && recurso.url) {
        navigation.navigate("DocEditor", { modo: "editar", planeacionId: recurso.url.replace("planeacion://", "") });
        return;
      }
      navigation.navigate("CrearRecurso", { recursoId: recurso.id, grupoId, unidadId: recurso.unidadId });
    },
    [grupoId, navigation],
  );

  const handleRemoveAlumno = React.useCallback(
    (alumno: Alumno) => {
      const fullName = `${alumno.nombre} ${alumno.apellidos}`.trim();
      const message = `Esto quitara a ${fullName} de ${nombre}, pero no eliminara su perfil.`;
      if (Platform.OS === "web") {
        if (window.confirm(`Quitar alumno\n\n${message}`)) {
          void actualizarAlumno(alumno.id, { grupoId: undefined }).then(() => reload());
        }
        return;
      }
      Alert.alert("Quitar alumno", message, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Quitar",
          style: "destructive",
          onPress: () => void actualizarAlumno(alumno.id, { grupoId: undefined }).then(() => reload()),
        },
      ]);
    },
    [actualizarAlumno, nombre, reload],
  );

  const runAiSummary = React.useCallback(async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const response = await resumirProgresoClassroom(aiContext);
      setAiWarning(response.usage?.warning ?? null);
      showMessage("Resumen IA", `${formatAiProgress(response)}\n\nEsto no sustituye la revision docente.`);
    } finally {
      setAiLoading(false);
    }
  }, [aiContext, aiLoading, showMessage]);

  const runAiActivity = React.useCallback(async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const response = await sugerirActividadClassroom(aiContext);
      setAiWarning(response.usage?.warning ?? null);
      showMessage("Sugerencia IA", `${formatAiActivity(response)}\n\nRevisala antes de crear una actividad real.`);
    } finally {
      setAiLoading(false);
    }
  }, [aiContext, aiLoading, showMessage]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={[styles.content, isCompact ? styles.contentCompact : null]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void reload()} />}
        showsVerticalScrollIndicator={Platform.OS === "web"}
      >
        <View style={[styles.banner, isCompact ? styles.bannerCompact : null]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.bannerCopy}>
            <Text style={styles.eyebrow}>Classroom</Text>
            <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>{nombre}</Text>
            <Text style={styles.subtitle}>{materia} - {periodo}</Text>
          </View>
          <View style={[styles.headerActions, isCompact ? styles.headerActionsCompact : null]}>
            <TouchableOpacity style={styles.headerAction} onPress={runAiSummary} disabled={aiLoading}>
              <MaterialIcons name="psychology" size={18} color="#1E7D4F" />
              <Text style={styles.headerActionText}>{aiLoading ? "IA..." : "IA"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabsBar}>
          {CLASSROOM_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabPill, activeTab === tab.key ? styles.tabPillActive : null]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key ? styles.tabTextActive : null]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <View style={styles.warningCard}>
            <MaterialIcons name="cloud-off" size={22} color="#B45309" />
            <Text style={styles.warningText}>{error}</Text>
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
          </View>
        ) : null}

        {model && activeTab === "tablon" ? (
          <ClassStream
            aiWarning={aiWarning}
            feedItems={feedItems}
            isCompact={isCompact}
            onCreateActivity={() => setActiveTab("trabajo")}
            onOpenItem={handleOpenContentItem}
            proximasEntregas={proximasEntregas}
          />
        ) : null}

        {model && activeTab === "trabajo" ? (
          <CourseworkTab
            sections={contentSections}
            onAddContent={handleCreateForSection}
            onCreateUnidad={handleCreateUnidad}
            onDeleteUnidad={handleDeleteUnidad}
            onOpenItem={handleOpenContentItem}
            onRenameUnidad={handleRenameUnidad}
            onSuggestActivity={runAiActivity}
            onToggleUnidad={(id) => void toggleUnidad(id)}
          />
        ) : null}

        {model && activeTab === "personas" ? (
          <PeopleTab
            alumnos={alumnos}
            grupoId={grupoId}
            grupoNombre={nombre}
            navigation={navigation}
            onRemoveAlumno={handleRemoveAlumno}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const ClassStream: React.FC<{
  aiWarning: string | null;
  feedItems: ClassroomContentItem[];
  isCompact: boolean;
  proximasEntregas: Tarea[];
  onCreateActivity: () => void;
  onOpenItem: (item: ClassroomContentItem) => void;
}> = ({ aiWarning, feedItems, isCompact, onCreateActivity, onOpenItem, proximasEntregas }) => (
  <View style={[styles.streamLayout, isCompact ? styles.streamLayoutCompact : null]}>
    <View style={[styles.upcomingCard, isCompact ? styles.upcomingCardCompact : null]}>
      <Text style={styles.cardLabel}>Proximas entregas</Text>
      {proximasEntregas.length === 0 ? (
        <Text style={styles.emptyTextLeft}>No tienes entregas pendientes.</Text>
      ) : (
        proximasEntregas.map((actividad) => (
          <View key={actividad.id} style={styles.upcomingItem}>
            <Text style={styles.upcomingTitle}>{actividad.titulo}</Text>
            <Text style={styles.upcomingDate}>{formatDate(actividad.fechaEntrega)}</Text>
          </View>
        ))
      )}
    </View>

    <View style={styles.streamMain}>
      <TouchableOpacity style={styles.announceCard} onPress={onCreateActivity}>
        <View style={styles.teacherAvatar}>
          <MaterialIcons name="person" size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.announceText}>Publica una actividad o material para tu clase</Text>
      </TouchableOpacity>

      {aiWarning ? (
        <View style={styles.aiWarningBox}>
          <MaterialIcons name="warning" size={18} color="#B45309" />
          <Text style={styles.aiWarningText}>{aiWarning}</Text>
        </View>
      ) : null}

      {feedItems.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialIcons name="dynamic-feed" size={30} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>Aun no hay publicaciones</Text>
          <Text style={styles.emptyText}>Crea contenido desde Trabajo de clase para llenar el tablon.</Text>
        </View>
      ) : (
        feedItems.map((item) => <StreamPost key={item.id} item={item} onPress={() => onOpenItem(item)} />)
      )}
    </View>
  </View>
);

const StreamPost: React.FC<{ item: ClassroomContentItem; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.streamPost} onPress={onPress}>
    <View style={styles.postAvatar}>
      <MaterialIcons name={item.kind === "actividad" ? "assignment" : "description"} size={20} color={COLORS.primary} />
    </View>
    <View style={styles.postCopy}>
      <Text style={styles.postMeta}>Profesor publico {item.kind === "actividad" ? "una actividad" : "un material"}</Text>
      <Text style={styles.postTitle}>{item.titulo}</Text>
      <Text style={styles.postDescription} numberOfLines={2}>{item.descripcion || item.tipo}</Text>
      <Text style={styles.postDate}>{formatDate(item.fecha)}</Text>
    </View>
    <MaterialIcons name="more-vert" size={22} color="#64748B" />
  </TouchableOpacity>
);

const CourseworkTab: React.FC<{
  sections: ClassroomContentSection[];
  onAddContent: (section: ClassroomContentSection) => void;
  onCreateUnidad: () => void;
  onDeleteUnidad: (section: ClassroomContentSection) => void;
  onOpenItem: (item: ClassroomContentItem) => void;
  onRenameUnidad: (section: ClassroomContentSection) => void;
  onSuggestActivity: () => void;
  onToggleUnidad: (id: string) => void;
}> = ({
  sections,
  onAddContent,
  onCreateUnidad,
  onDeleteUnidad,
  onOpenItem,
  onRenameUnidad,
  onSuggestActivity,
  onToggleUnidad,
}) => (
  <View style={styles.coursework}>
    <View style={styles.courseworkToolbar}>
      <TouchableOpacity style={styles.primaryAction} onPress={onCreateUnidad}>
        <MaterialIcons name="topic" size={18} color="#FFFFFF" />
        <Text style={styles.primaryActionText}>Crear seccion</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryAction} onPress={onSuggestActivity}>
        <MaterialIcons name="auto-awesome" size={18} color={COLORS.primary} />
        <Text style={styles.secondaryActionText}>Sugerir actividad</Text>
      </TouchableOpacity>
    </View>

    {sections.map((section) => (
      <CourseSection
        key={section.id}
        section={section}
        onAddContent={() => onAddContent(section)}
        onDelete={() => onDeleteUnidad(section)}
        onOpenItem={onOpenItem}
        onRename={() => onRenameUnidad(section)}
        onToggle={() => onToggleUnidad(section.id)}
      />
    ))}
  </View>
);

const CourseSection: React.FC<{
  section: ClassroomContentSection;
  onAddContent: () => void;
  onDelete: () => void;
  onOpenItem: (item: ClassroomContentItem) => void;
  onRename: () => void;
  onToggle: () => void;
}> = ({ onAddContent, onDelete, onOpenItem, onRename, onToggle, section }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <TouchableOpacity style={styles.sectionTitleWrap} onPress={onToggle}>
        <MaterialIcons name={section.colapsada ? "keyboard-arrow-down" : "keyboard-arrow-up"} size={24} color="#1F2937" />
        <View>
          <Text style={styles.unitTitle}>{section.nombre}</Text>
          <Text style={styles.unitMeta}>
            {section.actividadesCount} actividades - {section.materialesCount} materiales
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.sectionActions}>
        <TouchableOpacity style={styles.iconButton} onPress={onAddContent}>
          <MaterialIcons name="add" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        {!section.isUnassigned ? (
          <>
            <TouchableOpacity style={styles.iconButton} onPress={onRename}>
              <MaterialIcons name="edit" size={20} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
              <MaterialIcons name="delete-outline" size={20} color="#B91C1C" />
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>

    {!section.colapsada ? (
      <View style={styles.sectionItems}>
        {section.items.length === 0 ? (
          <Text style={styles.emptyTextLeft}>No hay contenido en esta seccion.</Text>
        ) : (
          section.items.map((item) => <CourseContentRow key={item.id} item={item} onPress={() => onOpenItem(item)} />)
        )}
      </View>
    ) : null}
  </View>
);

const CourseContentRow: React.FC<{ item: ClassroomContentItem; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.contentRow} onPress={onPress}>
    <View style={styles.contentIcon}>
      <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={22} color={COLORS.primary} />
    </View>
    <View style={styles.contentCopy}>
      <Text style={styles.contentTitle}>{item.titulo}</Text>
      <Text style={styles.contentMeta}>
        {item.kind === "actividad" ? `Fecha de entrega: ${formatDate(item.fechaEntrega)}` : item.tipo}
      </Text>
    </View>
    <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
  </TouchableOpacity>
);

const PeopleTab: React.FC<{
  alumnos: Alumno[];
  grupoId: number;
  grupoNombre: string;
  navigation: Navigation;
  onRemoveAlumno: (alumno: Alumno) => void;
}> = ({ alumnos, grupoId, grupoNombre, navigation, onRemoveAlumno }) => (
  <View style={styles.peopleWrap}>
    <View style={styles.peopleSection}>
      <Text style={styles.peopleHeading}>Profesores</Text>
      <View style={styles.personRow}>
        <View style={styles.personAvatar}>
          <Text style={styles.personAvatarText}>P</Text>
        </View>
        <View style={styles.personCopy}>
          <Text style={styles.personName}>Profesor principal</Text>
          <Text style={styles.personMeta}>Docente de la clase</Text>
        </View>
      </View>
    </View>

    <View style={styles.peopleSection}>
      <View style={styles.peopleHeader}>
        <Text style={styles.peopleHeading}>Companeros de clase</Text>
        <Text style={styles.feedCount}>{alumnos.length} alumnos</Text>
      </View>
      <View style={styles.inlineActions}>
        <TouchableOpacity style={styles.secondaryAction} onPress={() => navigation.navigate("CrearAlumno", { grupoId })}>
          <MaterialIcons name="person-add" size={18} color={COLORS.primary} />
          <Text style={styles.secondaryActionText}>Agregar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={() => navigation.navigate("ImportarAlumnos", { grupoId, grupoNombre })}
        >
          <MaterialIcons name="upload-file" size={18} color={COLORS.primary} />
          <Text style={styles.secondaryActionText}>Importar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={() => navigation.navigate("ExportarAlumnos", { grupoId, grupoNombre })}
        >
          <MaterialIcons name="download" size={18} color={COLORS.primary} />
          <Text style={styles.secondaryActionText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      {alumnos.length === 0 ? (
        <Text style={styles.emptyTextLeft}>Aun no hay alumnos inscritos.</Text>
      ) : (
        alumnos.map((alumno) => (
          <View key={alumno.id} style={styles.personRow}>
            <View style={styles.personAvatar}>
              <Text style={styles.personAvatarText}>{(alumno.nombre?.[0] ?? "A").toUpperCase()}</Text>
            </View>
            <TouchableOpacity
              style={styles.personCopy}
              onPress={() => navigation.navigate("DetalleAlumno", { alumnoId: alumno.id })}
            >
              <Text style={styles.personName}>{`${alumno.nombre} ${alumno.apellidos}`.trim()}</Text>
              <Text style={styles.personMeta}>{alumno.numeroControl} - {alumno.estado}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => onRemoveAlumno(alumno)}>
              <MaterialIcons name="person-remove" size={20} color="#B91C1C" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  </View>
);

const webScrollStyle =
  Platform.OS === "web"
    ? ({ height: "100vh", maxHeight: "100vh", overflowY: "auto" } as object)
    : null;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scroller: {
    flex: 1,
    ...webScrollStyle,
  },
  content: {
    alignSelf: "center",
    maxWidth: 1220,
    padding: 18,
    paddingBottom: Platform.OS === "web" ? 170 : 120,
    width: "100%",
  },
  contentCompact: {
    padding: 12,
  },
  banner: {
    backgroundColor: "#1E7D4F",
    borderRadius: 24,
    minHeight: 168,
    overflow: "hidden",
    padding: 22,
  },
  bannerCompact: {
    minHeight: 150,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  bannerCopy: {
    marginTop: 20,
    maxWidth: 760,
  },
  eyebrow: {
    color: "#D7FBE8",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: 8,
  },
  titleCompact: {
    fontSize: 28,
  },
  subtitle: {
    color: "#E4F8EC",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  headerActions: {
    bottom: 18,
    flexDirection: "row",
    gap: 8,
    position: "absolute",
    right: 18,
  },
  headerActionsCompact: {
    bottom: undefined,
    marginTop: 16,
    position: "relative",
    right: undefined,
  },
  headerAction: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  headerActionText: {
    color: "#1E7D4F",
    fontSize: 12,
    fontWeight: "900",
  },
  tabsBar: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#CBD5E1",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  tabPill: {
    borderBottomColor: "transparent",
    borderBottomWidth: 3,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  tabPillActive: {
    borderBottomColor: "#2563EB",
  },
  tabText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "800",
  },
  tabTextActive: {
    color: "#2563EB",
  },
  warningCard: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    padding: 14,
  },
  warningText: {
    color: "#9A3412",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
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
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    marginTop: 16,
    padding: 20,
  },
  emptyTitle: {
    color: "#122033",
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },
  emptyTextLeft: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 10,
  },
  streamLayout: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 16,
    marginTop: 18,
  },
  streamLayoutCompact: {
    flexDirection: "column",
  },
  upcomingCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 16,
    width: 260,
  },
  upcomingCardCompact: {
    width: "100%",
  },
  cardLabel: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "900",
  },
  upcomingItem: {
    borderTopColor: "#E2E8F0",
    borderTopWidth: 1,
    paddingTop: 10,
  },
  upcomingTitle: {
    color: "#122033",
    fontSize: 13,
    fontWeight: "800",
  },
  upcomingDate: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  streamMain: {
    flex: 1,
    gap: 12,
    minWidth: 0,
  },
  announceCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  teacherAvatar: {
    alignItems: "center",
    backgroundColor: "#1E7D4F",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  announceText: {
    color: "#64748B",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  aiWarningBox: {
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 11,
  },
  aiWarningText: {
    color: "#92400E",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
  streamPost: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  postAvatar: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  postCopy: {
    flex: 1,
  },
  postMeta: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },
  postTitle: {
    color: "#122033",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
  },
  postDescription: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 3,
  },
  postDate: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 5,
  },
  coursework: {
    gap: 14,
    marginTop: 18,
  },
  courseworkToolbar: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderColor: "#CFE0F7",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  ghostAction: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ghostActionText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
  },
  sectionTitleWrap: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  unitTitle: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "900",
  },
  unitMeta: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  sectionActions: {
    flexDirection: "row",
    gap: 6,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  sectionItems: {
    paddingHorizontal: 16,
  },
  contentRow: {
    alignItems: "center",
    borderTopColor: "#E2E8F0",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 14,
    paddingVertical: 13,
  },
  contentIcon: {
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  contentCopy: {
    flex: 1,
  },
  contentTitle: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "900",
  },
  contentMeta: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  peopleWrap: {
    gap: 18,
    marginTop: 18,
  },
  peopleSection: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  peopleHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  peopleHeading: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "900",
  },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  personRow: {
    alignItems: "center",
    borderTopColor: "#E2E8F0",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
  },
  personAvatar: {
    alignItems: "center",
    backgroundColor: "#DFF3E8",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  personAvatarText: {
    color: "#1E7D4F",
    fontSize: 15,
    fontWeight: "900",
  },
  personCopy: {
    flex: 1,
  },
  personName: {
    color: "#122033",
    fontSize: 15,
    fontWeight: "900",
  },
  personMeta: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
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
});

export default ClassroomGroupScreen;
