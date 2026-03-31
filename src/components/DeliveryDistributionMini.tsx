import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ProgressChart } from "react-native-chart-kit";

interface DeliveryDistributionMiniProps {
  onTime: number;
  late: number;
  missing: number;
  chartWidth: number;
}

const chartConfig = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientTo: "#FFFFFF",
  color: (opacity = 1) => `rgba(12, 99, 184, ${opacity})`,
  labelColor: () => "#2E3E57",
};

const DeliveryDistributionMini: React.FC<DeliveryDistributionMiniProps> = ({
  onTime,
  late,
  missing,
  chartWidth,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Distribución de Entregas</Text>
      <View style={styles.chartWrap}>
        <ProgressChart
          data={{
            labels: ["A tiempo", "Tarde", "No entregadas"],
            data: [onTime / 100, late / 100, missing / 100],
          }}
          width={Math.min(chartWidth - 48, 280)}
          height={170}
          strokeWidth={13}
          radius={50}
          hideLegend
          chartConfig={chartConfig}
        />
        <Text style={styles.centerValue}>{Math.round(onTime)}%</Text>
        <Text style={styles.centerLabel}>ÉXITO</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.dotBlue}>● A tiempo</Text>
        <Text style={styles.value}>{Math.round(onTime)}%</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.dotGray}>● Tarde</Text>
        <Text style={styles.value}>{Math.round(late)}%</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.dotRed}>● No entregadas</Text>
        <Text style={styles.value}>{Math.round(missing)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#E3EAF4",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  title: {
    color: "#2A3B56",
    fontSize: 31,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  chartWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
  },
  centerValue: {
    position: "absolute",
    top: 66,
    color: "#1E2A3A",
    fontSize: 30,
    fontWeight: "800",
  },
  centerLabel: {
    position: "absolute",
    top: 102,
    color: "#7A8AA3",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  value: {
    color: "#2E3E57",
    fontSize: 13,
    fontWeight: "700",
  },
  dotBlue: {
    color: "#0C63B8",
    fontSize: 14,
    fontWeight: "700",
  },
  dotGray: {
    color: "#596982",
    fontSize: 14,
    fontWeight: "700",
  },
  dotRed: {
    color: "#C62828",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default DeliveryDistributionMini;
