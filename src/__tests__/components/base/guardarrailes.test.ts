import { readFileSync, readdirSync } from "fs";
import path from "path";
import { hitSlopToMinTarget, MIN_TOUCH_TARGET } from "../../../components/base/primitives";

const CARPETA_BASE = path.join(__dirname, "..", "..", "..", "components", "base");

function archivosDeLaBiblioteca(): string[] {
  return readdirSync(CARPETA_BASE).filter((archivo) => /\.tsx?$/.test(archivo));
}

describe("guardarrail de color en la biblioteca base", () => {
  // El lint ya prohibe COLORS en src/**; esta prueba lo vuelve a afirmar sobre la carpeta
  // para que la garantia sobreviva a un cambio de configuracion de ESLint.
  it("ningun componente importa la paleta estatica legacy", () => {
    const infractores = archivosDeLaBiblioteca().filter((archivo) => {
      const fuente = readFileSync(path.join(CARPETA_BASE, archivo), "utf8");
      return /\bCOLORS\b/.test(fuente);
    });

    expect(infractores).toEqual([]);
  });

  it("ningun componente codifica color con literales hexadecimales", () => {
    const infractores = archivosDeLaBiblioteca().filter((archivo) => {
      const fuente = readFileSync(path.join(CARPETA_BASE, archivo), "utf8");
      return /#[0-9a-fA-F]{3,8}\b/.test(fuente);
    });

    expect(infractores).toEqual([]);
  });

  it("la carpeta expone los diez componentes acordados", () => {
    const componentes = archivosDeLaBiblioteca()
      .filter((archivo) => /^[A-Z]/.test(archivo))
      .map((archivo) => archivo.replace(/\.tsx?$/, ""))
      .sort();

    expect(componentes).toEqual([
      "Banner",
      "Button",
      "Card",
      "Chip",
      "EmptyState",
      "Input",
      "Screen",
      "Sheet",
      "Skeleton",
      "Toast",
    ]);
  });
});

describe("hitSlopToMinTarget", () => {
  it("no agrega area cuando el control ya cubre el minimo", () => {
    expect(hitSlopToMinTarget(MIN_TOUCH_TARGET, MIN_TOUCH_TARGET)).toBeUndefined();
    expect(hitSlopToMinTarget(60, 60)).toBeUndefined();
  });

  it("completa hasta 44 puntos en el eje que falta", () => {
    const slop = hitSlopToMinTarget(20, 20);

    expect(slop).toBeDefined();
    expect(20 + slop!.top! + slop!.bottom!).toBe(MIN_TOUCH_TARGET);
    expect(20 + slop!.left! + slop!.right!).toBe(MIN_TOUCH_TARGET);
  });

  it("extiende solo el eje corto", () => {
    const slop = hitSlopToMinTarget(80, 32);

    expect(slop!.left).toBe(0);
    expect(slop!.right).toBe(0);
    expect(32 + slop!.top! + slop!.bottom!).toBe(MIN_TOUCH_TARGET);
  });
});
