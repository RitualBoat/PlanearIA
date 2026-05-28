import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import type { EditorMode } from "../../../hooks/useEditorMode";
import type { Sesion } from "../../../../types/planeacionV2";
import { SesionCard } from "./SesionCard";
import type { EditorBridge } from "@10play/tentap-editor";

export interface SeccionSesionesProps {
  sesiones: Sesion[];
  mode?: EditorMode;
  onChange: (next: Sesion[]) => void;
  onActiveEditor?: (editor: EditorBridge) => void;
}

const buildNewSesion = (numero: number): Sesion => {
  return {
    id: `sesion_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    numero,
    tipo: "regular",
    inicio: "",
    desarrollo: "",
    cierre: "",
    tarea: "",
  };
};

export const SeccionSesiones: React.FC<SeccionSesionesProps> = ({
  sesiones,
  mode = "mobile",
  onChange,
  onActiveEditor,
}) => {
  const { colors } = useTheme();
  const ordered = useMemo(() => [...sesiones].sort((a, b) => a.numero - b.numero), [sesiones]);
  const [expandedId, setExpandedId] = useState<string | null>(ordered[0]?.id || null);

  const pushSessions = (next: Sesion[]) => {
    const normalized = next
      .sort((a, b) => a.numero - b.numero)
      .map((sesion, index) => ({
        ...sesion,
        numero: index + 1,
      }));
    onChange(normalized);
  };

  const addSession = () => {
    const nextNumber = ordered.length + 1;
    const newSession = buildNewSesion(nextNumber);
    const next = [...ordered, newSession];
    pushSessions(next);
    setExpandedId(newSession.id);
  };

  const updateSession = (id: string, nextSession: Sesion) => {
    const next = ordered.map((session) => (session.id === id ? nextSession : session));
    pushSessions(next);
  };

  const deleteSession = (id: string) => {
    const next = ordered.filter((session) => session.id !== id);
    pushSessions(next);
    if (expandedId === id) {
      setExpandedId(next[0]?.id || null);
    }
  };

  const moveSession = (id: string, direction: "up" | "down") => {
    const index = ordered.findIndex((session) => session.id === id);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;

    const next = [...ordered];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    pushSessions(next);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: colors.borderLight,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Sesiones</Text>
        <Pressable
          style={[
            styles.addButton,
            {
              backgroundColor: colors.primaryContainer,
              borderColor: colors.primary,
            },
          ]}
          onPress={addSession}
        >
          <MaterialIcons name="add" size={16} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Agregar sesion</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {ordered.map((session, index) => {
          const canMoveUp = index > 0;
          const canMoveDown = index < ordered.length - 1;
          const isExpanded = expandedId === session.id;
          return (
            <View key={session.id} style={styles.cardWrapper}>
              <View style={styles.orderActions}>
                <Pressable
                  disabled={!canMoveUp}
                  onPress={() => moveSession(session.id, "up")}
                  style={({ pressed }) => [
                    styles.orderButton,
                    {
                      opacity: canMoveUp ? (pressed ? 0.8 : 1) : 0.35,
                      borderColor: colors.borderLight,
                      backgroundColor: colors.surfaceContainerLow,
                    },
                  ]}
                >
                  <MaterialIcons name="arrow-upward" size={16} color={colors.onSurfaceVariant} />
                </Pressable>
                <Pressable
                  disabled={!canMoveDown}
                  onPress={() => moveSession(session.id, "down")}
                  style={({ pressed }) => [
                    styles.orderButton,
                    {
                      opacity: canMoveDown ? (pressed ? 0.8 : 1) : 0.35,
                      borderColor: colors.borderLight,
                      backgroundColor: colors.surfaceContainerLow,
                    },
                  ]}
                >
                  <MaterialIcons name="arrow-downward" size={16} color={colors.onSurfaceVariant} />
                </Pressable>
              </View>

              <View style={styles.sessionContent}>
                <SesionCard
                  sesion={session}
                  mode={mode}
                  expanded={isExpanded}
                  onToggle={() => setExpandedId(isExpanded ? null : session.id)}
                  onChange={(nextSesion) => updateSession(session.id, nextSesion)}
                  onDelete={ordered.length > 1 ? () => deleteSession(session.id) : undefined}
                  onActiveEditor={onActiveEditor}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  list: {
    gap: 10,
  },
  cardWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  orderActions: {
    width: 34,
    gap: 6,
    paddingTop: 8,
  },
  orderButton: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  sessionContent: {
    flex: 1,
  },
});

export default SeccionSesiones;
