import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { PostMood } from "../../types";

const MOODS: { emoji: PostMood; label: string }[] = [
  { emoji: "😊", label: "Feliz" },
  { emoji: "📚", label: "Estudiando" },
  { emoji: "💡", label: "Inspirado" },
  { emoji: "🎯", label: "Enfocado" },
  { emoji: "☕", label: "Relajado" },
  { emoji: "🎨", label: "Creativo" },
  { emoji: "🚀", label: "Productivo" },
];

const MAX_CHARS = 2000;

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPublish: (data: {
    titulo?: string;
    contenido: string;
    mood?: PostMood;
    isChallenge?: boolean;
    challengeData?: {
      titulo: string;
      descripcion: string;
      tiempoLimite?: number;
      preguntas?: number;
    };
  }) => void;
  authorName: string;
  authorAvatar?: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onPublish,
  authorName,
  authorAvatar,
}) => {
  const { colors } = useTheme();
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [selectedMood, setSelectedMood] = useState<PostMood | undefined>();
  const [isChallenge, setIsChallenge] = useState(false);
  const [challengeTitulo, setChallengeTitulo] = useState("");
  const [challengeDescripcion, setChallengeDescripcion] = useState("");
  const [challengeTiempo, setChallengeTiempo] = useState("");
  const [challengePreguntas, setChallengePreguntas] = useState("");

  const canPublish = contenido.trim().length > 0;
  const charCount = contenido.length;

  const handlePublish = () => {
    if (!canPublish) return;
    if (isChallenge && !challengeTitulo.trim()) {
      Alert.alert("Campo requerido", "El reto necesita un título.");
      return;
    }
    onPublish({
      titulo: titulo.trim() || undefined,
      contenido: contenido.trim(),
      mood: selectedMood,
      isChallenge,
      challengeData: isChallenge
        ? {
            titulo: challengeTitulo.trim(),
            descripcion: challengeDescripcion.trim() || contenido.trim(),
            tiempoLimite: challengeTiempo ? parseInt(challengeTiempo, 10) : undefined,
            preguntas: challengePreguntas ? parseInt(challengePreguntas, 10) : undefined,
          }
        : undefined,
    });
    setTitulo("");
    setContenido("");
    setSelectedMood(undefined);
    setIsChallenge(false);
    setChallengeTitulo("");
    setChallengeDescripcion("");
    setChallengeTiempo("");
    setChallengePreguntas("");
  };

  const handleAttach = () => {
    Alert.alert(
      "Próximamente",
      "La funcionalidad de adjuntar archivos se implementará próximamente."
    );
  };

  const initials = authorName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderBottomColor: `${colors.outlineVariant}20`,
            },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.headerAction}>
            <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Crear Publicación</Text>
          <TouchableOpacity
            onPress={handlePublish}
            disabled={!canPublish}
            style={{ opacity: canPublish ? 1 : 0.4 }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.publishBtn}
            >
              <Text style={styles.publishBtnText}>Publicar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Author info */}
          <View style={styles.authorRow}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View>
              <Text style={[styles.authorName, { color: colors.onSurface }]}>{authorName}</Text>
              <View
                style={[styles.visibilityChip, { backgroundColor: colors.surfaceContainerLow }]}
              >
                <MaterialIcons name="public" size={12} color={colors.onSurfaceVariant} />
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 11, fontWeight: "600" }}>
                  Todos
                </Text>
              </View>
            </View>
          </View>

          {/* Title input */}
          <TextInput
            style={[styles.titleInput, { color: colors.onSurface }]}
            placeholder="Título (opcional)"
            placeholderTextColor={colors.onSurfaceVariant}
            value={titulo}
            onChangeText={setTitulo}
            maxLength={100}
          />

          {/* Content input */}
          <TextInput
            style={[styles.contentInput, { color: colors.onSurface }]}
            placeholder="¿Qué quieres compartir hoy?"
            placeholderTextColor={`${colors.onSurfaceVariant}80`}
            value={contenido}
            onChangeText={(t) => t.length <= MAX_CHARS && setContenido(t)}
            multiline
            textAlignVertical="top"
          />

          {/* Mood chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodRow}
          >
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.emoji}
                style={[
                  styles.moodChip,
                  {
                    backgroundColor:
                      selectedMood === m.emoji ? `${colors.primary}15` : colors.surfaceContainerLow,
                    borderColor: selectedMood === m.emoji ? colors.primary : "transparent",
                  },
                ]}
                onPress={() => setSelectedMood((prev) => (prev === m.emoji ? undefined : m.emoji))}
              >
                <Text style={{ fontSize: 18 }}>{m.emoji}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: selectedMood === m.emoji ? colors.primary : colors.onSurfaceVariant,
                  }}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Challenge form */}
          {isChallenge && (
            <View
              style={[
                styles.challengeForm,
                {
                  backgroundColor: `${colors.primary}08`,
                  borderColor: `${colors.primary}20`,
                },
              ]}
            >
              <View style={styles.challengeFormHeader}>
                <MaterialIcons name="military-tech" size={20} color={colors.primary} />
                <Text style={[styles.challengeFormTitle, { color: colors.primary }]}>
                  Publicar como Reto
                </Text>
              </View>
              <TextInput
                style={[
                  styles.challengeInput,
                  { color: colors.onSurface, borderColor: `${colors.outlineVariant}40` },
                ]}
                placeholder="Título del reto *"
                placeholderTextColor={colors.onSurfaceVariant}
                value={challengeTitulo}
                onChangeText={setChallengeTitulo}
                maxLength={100}
              />
              <TextInput
                style={[
                  styles.challengeInput,
                  { color: colors.onSurface, borderColor: `${colors.outlineVariant}40` },
                ]}
                placeholder="Descripción (opcional, usa el contenido del post si está vacío)"
                placeholderTextColor={colors.onSurfaceVariant}
                value={challengeDescripcion}
                onChangeText={setChallengeDescripcion}
                multiline
                maxLength={500}
              />
              <View style={styles.challengeRow}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[
                      styles.challengeInput,
                      { color: colors.onSurface, borderColor: `${colors.outlineVariant}40` },
                    ]}
                    placeholder="Tiempo límite (min)"
                    placeholderTextColor={colors.onSurfaceVariant}
                    value={challengeTiempo}
                    onChangeText={setChallengeTiempo}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[
                      styles.challengeInput,
                      { color: colors.onSurface, borderColor: `${colors.outlineVariant}40` },
                    ]}
                    placeholder="Nº preguntas"
                    placeholderTextColor={colors.onSurfaceVariant}
                    value={challengePreguntas}
                    onChangeText={setChallengePreguntas}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom toolbar */}
        <View
          style={[
            styles.toolbar,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderTopColor: `${colors.outlineVariant}20`,
            },
          ]}
        >
          <View style={styles.toolbarIcons}>
            <TouchableOpacity style={styles.toolbarBtn} onPress={handleAttach}>
              <MaterialIcons name="image" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarBtn} onPress={handleAttach}>
              <MaterialIcons name="description" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarBtn} onPress={handleAttach}>
              <MaterialIcons name="link" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarBtn} onPress={() => setIsChallenge((v) => !v)}>
              <MaterialIcons
                name="military-tech"
                size={22}
                color={isChallenge ? colors.primary : colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.charCount,
              { color: charCount > MAX_CHARS * 0.9 ? colors.error : colors.onSurfaceVariant },
            ]}
          >
            {charCount}/{MAX_CHARS}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === "ios" ? 56 : 12,
  },
  headerAction: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  publishBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  authorName: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },
  visibilityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    marginBottom: 16,
  },
  moodRow: {
    gap: 8,
    paddingBottom: 8,
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 32 : 12,
  },
  toolbarIcons: {
    flexDirection: "row",
    gap: 16,
  },
  toolbarBtn: {
    padding: 6,
  },
  charCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  challengeForm: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  challengeFormHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  challengeFormTitle: {
    fontWeight: "700",
    fontSize: 15,
  },
  challengeInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  challengeRow: {
    flexDirection: "row",
    gap: 10,
  },
});

export default CreatePostModal;
