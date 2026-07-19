import { lightTheme, darkTheme } from "../../../themes/colors";

/**
 * El anillo de foco es un indicador no textual: WCAG 2.2 SC 1.4.11 le exige 3:1 contra su
 * fondo adyacente. Se verifica aqui, y no solo en el navegador, porque el valor depende de
 * dos tokens (`primary` y el fondo del tema) que pueden cambiar en cualquier ajuste de
 * paleta; una prueba lo vuelve un contrato en vez de una observacion de un dia.
 */

function luminanciaRelativa(hex: string): number {
  const canales = [1, 3, 5].map((inicio) => parseInt(hex.slice(inicio, inicio + 2), 16) / 255);
  const lineales = canales.map((canal) =>
    canal <= 0.03928 ? canal / 12.92 : Math.pow((canal + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * lineales[0] + 0.7152 * lineales[1] + 0.0722 * lineales[2];
}

function razonDeContraste(colorA: string, colorB: string): number {
  const [mayor, menor] = [luminanciaRelativa(colorA), luminanciaRelativa(colorB)].sort(
    (x, y) => y - x
  );
  return (mayor + 0.05) / (menor + 0.05);
}

const MINIMO_NO_TEXTUAL = 3;

describe("anillo de foco: contraste no textual", () => {
  it("cumple 3:1 contra el fondo de pantalla en tema claro", () => {
    expect(razonDeContraste(lightTheme.primary, lightTheme.background)).toBeGreaterThanOrEqual(
      MINIMO_NO_TEXTUAL
    );
  });

  it("cumple 3:1 contra el fondo de pantalla en tema oscuro", () => {
    expect(razonDeContraste(darkTheme.primary, darkTheme.background)).toBeGreaterThanOrEqual(
      MINIMO_NO_TEXTUAL
    );
  });

  it("cumple 3:1 contra la superficie de tarjetas en ambos temas", () => {
    // Los controles tambien viven dentro de Card y Sheet, no solo sobre el fondo.
    expect(razonDeContraste(lightTheme.primary, lightTheme.surface)).toBeGreaterThanOrEqual(
      MINIMO_NO_TEXTUAL
    );
    expect(razonDeContraste(darkTheme.primary, darkTheme.surface)).toBeGreaterThanOrEqual(
      MINIMO_NO_TEXTUAL
    );
  });
});
