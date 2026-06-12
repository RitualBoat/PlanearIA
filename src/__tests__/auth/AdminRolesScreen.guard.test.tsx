import React from "react";
import { render } from "@testing-library/react-native";
import AdminRolesScreen from "../../screens/cuenta/AdminRolesScreen";
import type { Permission } from "../../../types/auth";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

let mockCan: (p: Permission) => boolean = () => false;
jest.mock("../../hooks/usePermission", () => ({
  usePermission: () => ({ can: mockCan }),
}));

const mockVm = {
  usuarios: [
    {
      id: 1,
      nombre: "Ana",
      apellidos: "Lopez",
      email: "ana@test.com",
      rol: "docente" as const,
      fechaCreacion: "2026-01-01",
    },
  ],
  isLoading: false,
  updatingId: null,
  cambiarRol: jest.fn(),
  refetch: jest.fn(),
  goBack: jest.fn(),
};

jest.mock("../../hooks/useAdminRolesViewModel", () => ({
  useAdminRolesViewModel: () => mockVm,
}));

describe("AdminRolesScreen guard", () => {
  it("shows a denied state when the user lacks cambiar_roles", () => {
    mockCan = () => false;
    const { queryByText } = render(<AdminRolesScreen />);
    expect(queryByText("No tienes permiso para administrar roles.")).not.toBeNull();
    expect(queryByText("ana@test.com")).toBeNull();
  });

  it("renders the roster when the user has cambiar_roles", () => {
    mockCan = (p) => p === "cambiar_roles";
    const { queryByText } = render(<AdminRolesScreen />);
    expect(queryByText("No tienes permiso para administrar roles.")).toBeNull();
    expect(queryByText("ana@test.com")).not.toBeNull();
  });
});
