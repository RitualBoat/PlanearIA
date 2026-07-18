// El test solo ejercita la fabrica pura `getStyles`; se corta la cadena de runtime del
// ViewModel (AuthContext -> AsyncStorage) para no acoplar la prueba a esa infraestructura.
jest.mock("../../hooks/useLoginViewModel", () => ({
  useLoginViewModel: () => ({}),
}));

import { getStyles } from "../../screens/auth/LoginScreen";

// La fabrica `getStyles(breakpoint)` es la que descongela `LoginScreen`: antes los
// tamanos dependientes de ancho se calculaban una vez, dentro de un StyleSheet de
// modulo, y quedaban clavados. Ahora se recalculan por rango. Probar la fabrica prueba
// el reflow: el mismo estilo cambia al cambiar de breakpoint.

describe("LoginScreen getStyles reflow por breakpoint", () => {
  it("el logo escala con el rango (movil -> tablet -> escritorio)", () => {
    expect(getStyles("mobile").loginImage.width).toBe(120);
    expect(getStyles("tablet").loginImage.width).toBe(140);
    expect(getStyles("desktop").loginImage.width).toBe(160);
  });

  it("el titulo y el formulario tambien reaccionan al ancho", () => {
    expect(getStyles("mobile").title.fontSize).toBeLessThan(
      getStyles("desktop").title.fontSize as number
    );
    expect(getStyles("mobile").formContainer.maxWidth).toBe(300);
    expect(getStyles("desktop").formContainer.maxWidth).toBe(380);
  });

  it("un rango produce estilos estables (no depende de una foto congelada)", () => {
    // A igual rango, el resultado es identico: la variacion viene solo del breakpoint,
    // no de una lectura de dimensiones tomada al importar el modulo.
    expect(getStyles("tablet").loginImage.height).toBe(140);
    expect(getStyles("tablet").loginImage.borderRadius).toBe(70);
  });
});
