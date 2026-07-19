import { DEV_ONLY_ROUTES, HUB_ROUTES, ROOT_ROUTES } from "../../../navigation/routeManifest";

/**
 * El catalogo de la biblioteca base es herramienta de revision, no pantalla de producto.
 * Estas guardias afirman que no se cuela al inventario de produccion ni hace crecer la
 * raiz de navegacion, que #81 dejo acotada.
 */
describe("catalogo de componentes: guarda de desarrollo", () => {
  it("no aparece en el manifiesto de rutas de produccion de ningun hub", () => {
    const rutasDeProduccion = Object.values(HUB_ROUTES).flat() as string[];

    expect(rutasDeProduccion).not.toContain("CatalogoComponentes");
  });

  it("esta declarado como ruta solo de desarrollo", () => {
    // Declararlo, en vez de omitirlo en silencio, mantiene total la exhaustividad del
    // manifiesto: cada ruta del contrato esta en el manifiesto o en esta lista.
    expect(DEV_ONLY_ROUTES).toContain("CatalogoComponentes");
  });

  it("no agrega rutas a la raiz de navegacion", () => {
    // #81 acota la raiz a un maximo de 10 rutas hermanas.
    expect(ROOT_ROUTES).not.toContain("CatalogoComponentes");
    expect(ROOT_ROUTES.length).toBeLessThanOrEqual(10);
  });

  it("MasStack solo lo registra cuando __DEV__ esta activo", () => {
    const fuente = require("fs").readFileSync(
      require("path").join(__dirname, "..", "..", "..", "navigation", "stacks", "MasStack.tsx"),
      "utf8"
    );

    // El registro vive dentro de una guarda __DEV__; el bundler la elimina en produccion.
    expect(fuente).toMatch(/__DEV__\s*\?[\s\S]*CatalogoComponentes/);
    // Y no esta en el mapa de pantallas de produccion.
    expect(fuente).not.toMatch(/CatalogoComponentes:\s*CatalogoComponentesScreen/);
  });
});
