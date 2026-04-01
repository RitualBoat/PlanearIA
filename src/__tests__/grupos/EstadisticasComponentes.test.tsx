import React from "react";
import { render } from "@testing-library/react-native";
import StatCard from "../../components/StatCard";
import TrendMiniChart from "../../components/TrendMiniChart";
import DeliveryDistributionMini from "../../components/DeliveryDistributionMini";
import { COLORS } from "../../../types";

jest.mock("react-native-chart-kit", () => ({
  ProgressChart: () => null,
}));

describe("Componentes de estadisticas", () => {
  it("renderiza StatCard con valor principal", () => {
    const { getByText } = render(
      <StatCard
        label="PROMEDIO"
        value="8.5"
        accentColor={COLORS.primary}
        trend="up"
        footerText="Meta: 8.0"
      />
    );

    expect(getByText("PROMEDIO")).toBeTruthy();
    expect(getByText("8.5")).toBeTruthy();
    expect(getByText("Meta: 8.0")).toBeTruthy();
  });

  it("renderiza mini tendencia con titulo y subtitulo", () => {
    const { getByText } = render(
      <TrendMiniChart
        title="Evolucion del promedio"
        subtitle="8.5 / 10 actual"
        color={COLORS.primary}
        bars={[55, 62, 70, 76, 85]}
      />
    );

    expect(getByText("Evolucion del promedio")).toBeTruthy();
    expect(getByText("8.5 / 10 actual")).toBeTruthy();
  });

  it("renderiza distribucion de entregas", () => {
    const { getByText, getAllByText } = render(
      <DeliveryDistributionMini onTime={70} late={20} missing={10} chartWidth={320} />
    );

    expect(getByText("Distribución de Entregas")).toBeTruthy();
    expect(getAllByText("70%").length).toBeGreaterThan(0);
    expect(getByText("10%")).toBeTruthy();
  });
});
