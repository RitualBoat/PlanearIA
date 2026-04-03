import React from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export interface StatDetail {
  label: string;
  subtitle?: string;
  date?: string;
  status?: string;
}

export interface ExpandedStatsData {
  icon: string;
  title: string;
  count: number;
  items: StatDetail[];
  completedCount?: number;
  pendingCount?: number;
}

interface ExpandedStatsModalProps {
  visible: boolean;
  data: ExpandedStatsData | null;
  onClose: () => void;
}

const ExpandedStatsModal: React.FC<ExpandedStatsModalProps> = ({ visible, data, onClose }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  if (!data) return null;

  const content = (
    <View style={[styles.card, isDesktop && styles.cardDesktop]}>
      {/* Handle (mobile) */}
      {!isDesktop && <View style={styles.handle} />}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name={data.icon as any} size={20} color="#005da8" />
          <Text style={styles.headerTitle}>
            {data.title} ({data.count})
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        >
          <MaterialIcons name="close" size={22} color="#424750" />
        </TouchableOpacity>
      </View>

      {/* Quick stats summary */}
      {(data.completedCount != null || data.pendingCount != null) && (
        <View style={styles.quickStatsRow}>
          {data.completedCount != null && (
            <View style={[styles.quickStatCard, { backgroundColor: "#e8f5e9" }]}>
              <Text style={[styles.quickStatValue, { color: "#1b6d24" }]}>
                {data.completedCount}
              </Text>
              <Text style={[styles.quickStatLabel, { color: "#1b6d24" }]}>Completas</Text>
            </View>
          )}
          {data.pendingCount != null && (
            <View style={[styles.quickStatCard, { backgroundColor: "#fff3e0" }]}>
              <Text style={[styles.quickStatValue, { color: "#e65100" }]}>{data.pendingCount}</Text>
              <Text style={[styles.quickStatLabel, { color: "#e65100" }]}>Pendientes</Text>
            </View>
          )}
        </View>
      )}

      {/* Items list */}
      <ScrollView
        style={styles.listScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {data.items.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={40} color="#c0c7d4" />
            <Text style={styles.emptyText}>Sin datos aún</Text>
          </View>
        ) : (
          data.items.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <View style={styles.listDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.listLabel}>{item.label}</Text>
                {item.subtitle && <Text style={styles.listSubtitle}>{item.subtitle}</Text>}
              </View>
              {item.status && (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: item.status === "Completa" ? "#d4edda" : "#ebeef4",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color: item.status === "Completa" ? "#1b6d24" : "#424750",
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              )}
              {item.date && <Text style={styles.listDate}>{item.date}</Text>}
            </View>
          ))
        )}
      </ScrollView>

      {/* Footer */}
      {data.items.length > 0 && (
        <TouchableOpacity style={styles.footerBtn} onPress={onClose}>
          <Text style={styles.footerBtnText}>Ver todas</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#005da8" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isDesktop ? "fade" : "slide"}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose} accessibilityRole="button">
        <View style={[styles.overlay, isDesktop && styles.overlayDesktop]}>
          <TouchableWithoutFeedback>{content}</TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    ...Platform.select({
      web: { backdropFilter: "blur(2px)" } as any,
      default: {},
    }),
  },
  overlayDesktop: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 12,
    paddingHorizontal: 20,
    ...Platform.select({
      web: { boxShadow: "0px -8px 24px rgba(0, 72, 132, 0.08)" } as any,
      default: {
        shadowColor: "#004884",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  cardDesktop: {
    borderRadius: 24,
    maxWidth: 560,
    width: "100%",
    maxHeight: "70%",
    ...Platform.select({
      web: { boxShadow: "0px 24px 48px rgba(0, 72, 132, 0.08)" } as any,
      default: {},
    }),
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e3e7",
    alignSelf: "center",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ebeef2",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#181c20",
  },
  listScroll: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f4f8",
  },
  listDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#005da8",
  },
  listLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#181c20",
  },
  listSubtitle: {
    fontSize: 12,
    color: "#424750",
    marginTop: 2,
  },
  listDate: {
    fontSize: 11,
    color: "#727781",
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#727781",
  },
  quickStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 2,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#ebeef2",
    marginTop: 4,
  },
  footerBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#005da8",
  },
});

export default ExpandedStatsModal;
