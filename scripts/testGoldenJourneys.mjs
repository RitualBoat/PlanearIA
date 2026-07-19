#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { ejecutar, rutasRegistradas, validarManifiesto } from "./checkGoldenJourneys.mjs";

const fixture = mkdtempSync(path.join(tmpdir(), "planearia-golden-journeys-"));

const ROUTE_MANIFEST_TS = `
export const ROOT_ROUTES = ["Onboarding", "MainTabs"] as const;
export const HUB_ROUTES = {
  InicioTab: ["Escritorio"] as const,
  OfficeTab: ["OfficeHome", "Contenido"] as const,
} as const;
// Chequeos de compilacion: nada de aqui abajo debe contarse como ruta.
type _Fantasma = Exclude<keyof RootStackParamList, "RutaDeTipoNoDeValor">;
`;

const MANIFIESTO_BASE = {
  schemaVersion: 1,
  umbralNielsenBloqueo: 3,
  patronCaptura: "{slug}-{ancho}.png",
  niveles: {
    N1: { disparador: "UI visible.", anchos: [375, 768], journeysObligatorios: ["shell"], medicionDomObligatoria: false },
    N2: { disparador: "Altera layout.", anchos: [375, 768], journeysObligatorios: ["shell"], medicionDomObligatoria: true },
  },
  seccionesObligatoriasEvidencia: ["Entorno", "Consola"],
  journeys: [
    {
      id: "GJ0",
      slug: "shell",
      estado: "vigente",
      pasos: [{ n: 1, ruta: "Escritorio" }],
      rutas: ["Escritorio", "OfficeHome"],
      delta: null,
    },
    {
      id: "GJ9",
      slug: "reservado",
      estado: "declarado",
      pasos: [],
      rutas: [],
      delta: { changeDuenio: "golden-journeys-web" },
    },
  ],
};

const REPORTE_COMPLETO = [
  "# Evidencia",
  "## Entorno",
  "HTTP 200 confirmado. Anchos 375 y 768.",
  "## Journeys cubiertos",
  "Recorrido shell completo.",
  "## Consola",
  "Sin errores atribuibles.",
  "Severidad Nielsen maxima: 0",
].join("\n");

function escenario(nombre, { manifiesto = MANIFIESTO_BASE, reporte = REPORTE_COMPLETO, capturas = ["shell-375.png", "shell-768.png"], nivel = "N1" } = {}) {
  const dir = path.join(fixture, nombre);
  const evidencia = path.join(dir, "evidencia");
  mkdirSync(path.join(evidencia, "capturas"), { recursive: true });
  writeFileSync(path.join(dir, "golden-journeys.json"), JSON.stringify(manifiesto));
  writeFileSync(path.join(dir, "routeManifest.ts"), ROUTE_MANIFEST_TS);
  if (reporte !== null) writeFileSync(path.join(evidencia, "README.md"), reporte);
  for (const captura of capturas) writeFileSync(path.join(evidencia, "capturas", captura), "png");
  return ejecutar({
    manifest: path.join(dir, "golden-journeys.json"),
    "route-manifest": path.join(dir, "routeManifest.ts"),
    evidence: evidencia,
    nivel,
  }, { root: fixture });
}

const fallo = (results, id) => results.find((entry) => entry.id === id && entry.status === "FAIL");
const fallidos = (results) => results.filter((entry) => entry.status === "FAIL");

try {
  // Extraccion de rutas: arrays de una linea cuentan; los tipos posteriores no.
  const rutas = rutasRegistradas(ROUTE_MANIFEST_TS);
  assert.ok(rutas.has("Escritorio"), "un array de una sola entrada debe contar como ruta");
  assert.ok(rutas.has("Contenido"));
  assert.ok(!rutas.has("RutaDeTipoNoDeValor"), "lo que sigue a los chequeos de tipo no es una ruta");

  // Caso feliz.
  assert.deepEqual(fallidos(escenario("ok")), [], "la evidencia completa debe pasar");

  // Captura faltante.
  const sinCaptura = escenario("sin-captura", { capturas: ["shell-375.png"] });
  assert.ok(fallo(sinCaptura, "evidencia-capturas"), "una captura faltante debe fallar");
  assert.match(fallo(sinCaptura, "evidencia-capturas").summary, /shell-768\.png/);

  // Seccion obligatoria ausente.
  const sinSeccion = escenario("sin-seccion", { reporte: REPORTE_COMPLETO.replace("## Consola", "## Otra cosa") });
  assert.ok(fallo(sinSeccion, "evidencia-secciones"), "una seccion ausente debe fallar");
  assert.match(fallo(sinSeccion, "evidencia-secciones").summary, /Consola/);

  // Severidad Nielsen en el umbral de bloqueo.
  const severidadAlta = escenario("severidad", { reporte: REPORTE_COMPLETO.replace("maxima: 0", "maxima: 3") });
  assert.ok(fallo(severidadAlta, "evidencia-nielsen"), "severidad 3 debe bloquear");

  // Severidad no declarada.
  const sinSeveridad = escenario("sin-severidad", { reporte: REPORTE_COMPLETO.replace("Severidad Nielsen maxima: 0", "") });
  assert.ok(fallo(sinSeveridad, "evidencia-nielsen"), "no declarar severidad debe fallar");

  // Journey obligatorio sin documentar en el reporte.
  const sinJourney = escenario("sin-journey", { reporte: REPORTE_COMPLETO.replace("Recorrido shell completo.", "Sin detalle.") });
  assert.ok(fallo(sinJourney, "evidencia-journeys-cubiertos"), "un journey sin documentar debe fallar");

  // Reporte inexistente.
  const sinReporte = escenario("sin-reporte", { reporte: null });
  assert.ok(fallo(sinReporte, "evidencia-reporte"), "sin reporte debe fallar");

  // Nivel N2 exige medicion numerica por ancho.
  const sinMedicion = escenario("sin-medicion", {
    nivel: "N2",
    reporte: REPORTE_COMPLETO.replace("Anchos 375 y 768.", "Se reviso en todos los anchos."),
  });
  assert.ok(fallo(sinMedicion, "evidencia-medicion-dom"), "N2 sin medicion por ancho debe fallar");
  assert.deepEqual(fallidos(escenario("con-medicion", { nivel: "N2" })), [], "N2 con medicion debe pasar");

  // Nivel inexistente.
  const nivelMalo = escenario("nivel-malo", { nivel: "N9" });
  assert.ok(fallo(nivelMalo, "evidencia-nivel"), "un nivel inexistente debe fallar");

  // Ruta fantasma en el manifiesto.
  const conFantasma = structuredClone(MANIFIESTO_BASE);
  conFantasma.journeys[0].rutas.push("PantallaQueNoExiste");
  const fantasma = escenario("ruta-fantasma", { manifiesto: conFantasma });
  assert.ok(fallo(fantasma, "manifiesto-rutas"), "citar una ruta inexistente debe fallar");
  assert.match(fallo(fantasma, "manifiesto-rutas").summary, /PantallaQueNoExiste/);

  // Journey parcial sin dueno del delta.
  const sinDuenio = structuredClone(MANIFIESTO_BASE);
  sinDuenio.journeys.push({ id: "GJ1", slug: "huerfano", estado: "parcial", pasos: [], rutas: [], delta: { descripcion: "falta algo" } });
  assert.ok(fallo(validarManifiesto(sinDuenio, rutas), "manifiesto-duenios"), "un journey parcial sin dueno debe fallar");

  // Journey vigente que arrastra delta pendiente.
  const vigenteConDelta = structuredClone(MANIFIESTO_BASE);
  vigenteConDelta.journeys[0].delta = { changeDuenio: "otro", descripcion: "pendiente" };
  assert.ok(fallo(validarManifiesto(vigenteConDelta, rutas), "manifiesto-vigentes"), "vigente con delta debe fallar");

  // Un journey reservado no puede exigirse como evidencia.
  const exigeReservado = structuredClone(MANIFIESTO_BASE);
  exigeReservado.niveles.N1.journeysObligatorios = ["shell", "reservado"];
  const reservado = escenario("reservado", { manifiesto: exigeReservado });
  assert.ok(fallo(reservado, "journeys-no-reservados"), "exigir un journey reservado debe fallar");

  console.log("golden-journeys-tests: PASS (13 escenarios: manifiesto, capturas, secciones, severidad, journeys, niveles, medicion)");
} finally {
  const resolvedFixture = path.resolve(fixture);
  const resolvedTemp = path.resolve(tmpdir());
  if (!resolvedFixture.startsWith(`${resolvedTemp}${path.sep}`)) {
    throw new Error(`Refusing to remove unexpected fixture path: ${resolvedFixture}`);
  }
  rmSync(resolvedFixture, { recursive: true, force: true });
}
