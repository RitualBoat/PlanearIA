import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatCardProps {
  label: string;
  value: string;
  accentColor: string;
  trend?: "up" | "down" | "flat";
  footerText?: string;
}

const TrendSymbol: React.FC<{ trend: "up" | "down" | "flat"; color: string }> = ({
  trend,
  color,
}) => {
  const symbol = trend === "up" ? "↑" : trend === "down" ? "↓" : "–";
  return <Text style={[styles.trend, { color }]}>{symbol}</Text>;
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  accentColor,
  trend = "flat",
  footerText,
}) => {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <TrendSymbol trend={trend} color={accentColor} />
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { backgroundColor: accentColor }]} />
      </View>
      {footerText ? <Text style={styles.footer}>{footerText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3EAF4",
    borderLeftWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  label: {
    color: "#74839A",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    color: "#1E2A3A",
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  trend: {
    fontSize: 16,
    fontWeight: "800",
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E9EEF5",
    overflow: "hidden",
  },
  progressFill: {
    width: "72%",
    height: "100%",
    borderRadius: 999,
  },
  footer: {
    color: "#8A97AA",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default StatCard;
