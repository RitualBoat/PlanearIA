import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../types";

interface TrendMiniChartProps {
  title: string;
  subtitle: string;
  color: string;
  bars: number[];
}

const TrendMiniChart: React.FC<TrendMiniChartProps> = ({ title, subtitle, color, bars }) => {
  const normalized = bars.length > 0 ? bars : [25, 35, 45, 55];

  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.barsWrap}>
        {normalized.slice(-5).map((value, index) => (
          <View
            key={`${title}-${index}`}
            style={[
              styles.bar,
              {
                height: Math.max(8, Math.min(value, 100)) / 2,
                backgroundColor: index >= normalized.length - 2 ? color : "#DDE6F2",
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 2,
    color: "#7B8BA4",
    fontSize: 13,
    fontWeight: "500",
  },
  barsWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 40,
  },
  bar: {
    width: 6,
    borderRadius: 4,
  },
});

export default TrendMiniChart;
