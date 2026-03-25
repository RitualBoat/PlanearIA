import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";

describe("Jest setup", () => {
  it("renders a basic component", () => {
    const { getByText } = render(<Text>PlanearIA test ok</Text>);
    expect(getByText("PlanearIA test ok")).toBeTruthy();
  });
});
