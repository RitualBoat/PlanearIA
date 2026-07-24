import React from "react";
import { Animated } from "react-native";
import { render } from "@testing-library/react-native";
import { NavigationContext } from "@react-navigation/native";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

import AnimatedTopPill from "../../components/AnimatedTopPill";

/**
 * Verifica que el efecto del glow libera cada recurso al desmontar: la animacion se detiene y el
 * listener de focus se da de baja (regla effect-needs-cleanup), sin cambiar el comportamiento.
 */
describe("AnimatedTopPill (cleanup de efecto)", () => {
  let stop: jest.Mock;
  let parallelSpy: jest.SpyInstance;

  beforeEach(() => {
    stop = jest.fn();
    // Simula una animacion en curso (start no invoca su callback), para que el ref siga vivo
    // hasta el desmontaje y podamos verificar que la cleanup la detiene.
    parallelSpy = jest.spyOn(Animated, "parallel").mockReturnValue({
      start: jest.fn(),
      stop,
    } as unknown as Animated.CompositeAnimation);
  });

  afterEach(() => {
    parallelSpy.mockRestore();
  });

  it("detiene la animacion y da de baja el listener de focus al desmontar", () => {
    const unsubscribeFocus = jest.fn();
    const navigation = { addListener: jest.fn(() => unsubscribeFocus) };

    const view = render(
      <NavigationContext.Provider value={navigation as never}>
        <AnimatedTopPill title="Escritorio" subtitle="Hola" />
      </NavigationContext.Provider>
    );

    expect(navigation.addListener).toHaveBeenCalledWith("focus", expect.any(Function));

    view.unmount();

    expect(unsubscribeFocus).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalled();
  });

  it("sin navegador presente, no falla y aun detiene la animacion al desmontar", () => {
    const view = render(<AnimatedTopPill title="Escritorio" />);
    expect(() => view.unmount()).not.toThrow();
    expect(stop).toHaveBeenCalled();
  });
});
