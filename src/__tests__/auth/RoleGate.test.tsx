import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import { RoleGate } from "../../components/auth/RoleGate";
import type { Permission, RolUsuario } from "../../../types/auth";

interface MockPerm {
  can: (p: Permission) => boolean;
  hasRole: (...roles: RolUsuario[]) => boolean;
}

let mockPerm: MockPerm = { can: () => false, hasRole: () => false };

jest.mock("../../hooks/usePermission", () => ({
  usePermission: () => mockPerm,
}));

describe("RoleGate", () => {
  it("renders children when the permission is granted", () => {
    mockPerm = { can: (p) => p === "cambiar_roles", hasRole: () => false };
    const { queryByText } = render(
      <RoleGate permission="cambiar_roles">
        <Text>secret</Text>
      </RoleGate>
    );
    expect(queryByText("secret")).not.toBeNull();
  });

  it("renders fallback when the permission is denied", () => {
    mockPerm = { can: () => false, hasRole: () => false };
    const { queryByText } = render(
      <RoleGate permission="cambiar_roles" fallback={<Text>denied</Text>}>
        <Text>secret</Text>
      </RoleGate>
    );
    expect(queryByText("secret")).toBeNull();
    expect(queryByText("denied")).not.toBeNull();
  });

  it("ANDs roles with permission", () => {
    mockPerm = { can: () => true, hasRole: (...roles) => roles.includes("admin") };
    const { queryByText, rerender } = render(
      <RoleGate permission="cambiar_roles" roles={["admin"]}>
        <Text>secret</Text>
      </RoleGate>
    );
    expect(queryByText("secret")).not.toBeNull();

    mockPerm = { can: () => true, hasRole: () => false };
    rerender(
      <RoleGate permission="cambiar_roles" roles={["admin"]}>
        <Text>secret</Text>
      </RoleGate>
    );
    expect(queryByText("secret")).toBeNull();
  });

  it("allows access with anyOf when at least one permission matches", () => {
    mockPerm = { can: (p) => p === "gestionar_grupos", hasRole: () => false };
    const { queryByText } = render(
      <RoleGate anyOf={["cambiar_roles", "gestionar_grupos"]}>
        <Text>secret</Text>
      </RoleGate>
    );
    expect(queryByText("secret")).not.toBeNull();
  });

  it("is a passthrough with no conditions", () => {
    mockPerm = { can: () => false, hasRole: () => false };
    const { queryByText } = render(
      <RoleGate>
        <Text>secret</Text>
      </RoleGate>
    );
    expect(queryByText("secret")).not.toBeNull();
  });
});
