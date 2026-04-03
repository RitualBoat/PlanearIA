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
}

export interface ExpandedStatsData {
  icon: string;
  title: string;
  count: number;
  items: StatDetail[];
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
              {item.date && <Text style={styles.listDate}>{item.date}</Text>}
            </View>
          ))
        )}
      </ScrollView>
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
});

export default ExpandedStatsModal;
