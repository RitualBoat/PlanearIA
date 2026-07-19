import React from "react";
import { fireEvent, screen } from "@testing-library/react-native";

// Los proveedores de tema y preferencias persisten en AsyncStorage al montar.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import Button from "../../../components/base/Button";
import Input from "../../../components/base/Input";
import Chip from "../../../components/base/Chip";
import { MIN_TOUCH_TARGET } from "../../../components/base/primitives";
import { renderConProveedores, estiloPlano } from "./renderConProveedores";

describe("Button", () => {
  it("ejecuta su accion una sola vez cuando esta habilitado", () => {
    const onPress = jest.fn();
    renderConProveedores(<Button label="Guardar" onPress={onPress} testID="btn" />);

    fireEvent.press(screen.getByTestId("btn"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("no ejecuta su accion cuando esta deshabilitado y lo anuncia", () => {
    const onPress = jest.fn();
    renderConProveedores(<Button label="Guardar" onPress={onPress} disabled testID="btn" />);

    fireEvent.press(screen.getByTestId("btn"));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByTestId("btn").props.accessibilityState).toMatchObject({ disabled: true });
  });

  it("bloquea la accion mientras carga y se anuncia como ocupado", () => {
    const onPress = jest.fn();
    renderConProveedores(<Button label="Guardar" onPress={onPress} loading testID="btn" />);

    fireEvent.press(screen.getByTestId("btn"));

    // El bloqueo es de comportamiento, no solo visual: evita peticiones duplicadas.
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByTestId("btn").props.accessibilityState).toMatchObject({
      busy: true,
      disabled: true,
    });
    expect(screen.getByTestId("button-loading")).toBeTruthy();
  });


  it("declara rol y etiqueta accesibles", () => {
    renderConProveedores(<Button label="Guardar planeacion" onPress={jest.fn()} testID="btn" />);

    const boton = screen.getByTestId("btn");
    expect(boton.props.accessibilityRole).toBe("button");
    expect(boton.props.accessibilityLabel).toBe("Guardar planeacion");
  });

  it("cubre el area tactil minima de 44 puntos", () => {
    renderConProveedores(<Button label="Guardar" onPress={jest.fn()} testID="btn" />);

    const estilo = estiloPlano(screen.getByTestId("btn").props.style);
    expect(estilo.minHeight).toBe(MIN_TOUCH_TARGET);
  });
});

describe("Input", () => {
  it("asocia el error al control para la tecnologia de asistencia", () => {
    renderConProveedores(
      <Input label="Nombre del grupo" error="Este campo es obligatorio" testID="campo" />
    );

    // El error viaja en la etiqueta accesible: como texto suelto no lo anunciaria junto al campo.
    expect(screen.getByTestId("campo-textinput").props.accessibilityLabel).toContain(
      "Este campo es obligatorio"
    );
  });

  it("muestra la ayuda cuando no hay error y la oculta cuando lo hay", () => {
    const { rerender } = renderConProveedores(
      <Input label="Nombre" ayuda="Como lo veran tus alumnos" testID="campo" />
    );
    expect(screen.getByText("Como lo veran tus alumnos")).toBeTruthy();

    rerender(
      <Input label="Nombre" ayuda="Como lo veran tus alumnos" error="Muy corto" testID="campo" />
    );
    expect(screen.queryByText("Como lo veran tus alumnos")).toBeNull();
    expect(screen.getByText("Muy corto")).toBeTruthy();
  });

  it("no es editable cuando esta deshabilitado", () => {
    renderConProveedores(<Input label="Nombre" disabled testID="campo" />);

    const control = screen.getByTestId("campo-textinput");
    expect(control.props.editable).toBe(false);
    expect(control.props.accessibilityState).toMatchObject({ disabled: true });
  });

  it("cubre el area tactil minima de 44 puntos", () => {
    renderConProveedores(<Input label="Nombre" testID="campo" />);

    // El minimo vive en el contenedor del campo, hermano del label.
    const contenedor = screen.getByTestId("campo");
    const campo = contenedor.props.children[1];
    expect(estiloPlano(campo.props.style).minHeight).toBe(MIN_TOUCH_TARGET);
  });
});

describe("Chip", () => {
  it("reporta su estado de seleccion", () => {
    renderConProveedores(<Chip label="Matematicas" selected onPress={jest.fn()} testID="chip" />);

    expect(screen.getByTestId("chip").props.accessibilityState).toMatchObject({
      selected: true,
      checked: true,
    });
  });


  it("extiende el area tactil sin cambiar el tamano visual", () => {
    renderConProveedores(<Chip label="Matematicas" onPress={jest.fn()} testID="chip" />);

    const chip = screen.getByTestId("chip");
    const estilo = estiloPlano(chip.props.style);
    const hitSlop = chip.props.hitSlop;

    // La forma visual sigue siendo compacta...
    expect(estilo.height).toBeLessThan(MIN_TOUCH_TARGET);
    // ...pero el area efectiva llega a 44 por extension vertical.
    expect(Number(estilo.height) + hitSlop.top + hitSlop.bottom).toBeGreaterThanOrEqual(
      MIN_TOUCH_TARGET
    );
  });

  it("no ejecuta su accion cuando esta deshabilitado", () => {
    const onPress = jest.fn();
    renderConProveedores(
      <Chip label="Matematicas" onPress={onPress} disabled testID="chip" />
    );

    fireEvent.press(screen.getByTestId("chip"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("expone el descarte con etiqueta propia", () => {
    renderConProveedores(
      <Chip label="Matematicas" onDismiss={jest.fn()} testID="chip" />
    );

    expect(screen.getByTestId("chip-dismiss").props.accessibilityLabel).toBe("Quitar Matematicas");
  });
});
