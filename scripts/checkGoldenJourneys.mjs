#!/usr/bin/env node

/**
 * Verificador de evidencia de QA visual contra el manifiesto de golden journeys.
 *
 * Read-only y determinista: no levanta navegador, no navega y no toca la red. Solo
 * afirma que la evidencia que un change dice haber producido esta completa segun el
 * nivel de esfuerzo que declara.
 *
 * Limitacion honesta: comprueba que la evidencia este COMPLETA, no que sea CIERTA.
 * Cerrar esa brecha exige baselines de imagen comparables en CI, que pertenecen al
 * change golden-journeys-web (Ola 2 del plan de harness).
 *
 *   node scripts/checkGoldenJourneys.mjs --change <nombre> [--nivel N1|N2|N3]
 *                                        [--journeys slug,slug] [--evidence <dir>]
 *                                        [--manifest <archivo>] [--route-manifest <archivo>]
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MANIFEST = "qa/golden-journeys.json";
const DEFAULT_ROUTE_MANIFEST = "src/navigation/routeManifest.ts";
const ESTADOS = new Set(["vigente", "parcial", "declarado"]);
const SEVERIDAD_RE = /Severidad\s+Nielsen\s+maxima:\s*(\d+)/i;

function result(id, ok, summary, remediation = null) {
  return { id, status: ok ? "PASS" : "FAIL", summary, remediation };
}

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

/**
 * Rutas registradas en el manifiesto de navegacion. Se extraen como texto en vez de
 * importar el modulo porque es TypeScript y este script corre en Node sin transpilar;
 * el corte antes de los chequeos de tipo evita contar identificadores de tipos.
 */
export function rutasRegistradas(source) {
  const corte = source.indexOf("Chequeos de compilacion");
  const util = corte > 0 ? source.slice(0, corte) : source;
  return new Set([...util.matchAll(/"([A-Za-z][A-Za-z0-9]*)"/g)].map((match) => match[1]));
}

export function validarManifiesto(manifest, rutasConocidas) {
  const results = [];

  const formaOk =
    manifest?.schemaVersion === 1 &&
    Array.isArray(manifest.journeys) &&
    manifest.journeys.length > 0 &&
    manifest.niveles &&
    Array.isArray(manifest.seccionesObligatoriasEvidencia) &&
    Number.isInteger(manifest.umbralNielsenBloqueo);
  results.push(
    result(
      "manifiesto-forma",
      formaOk,
      formaOk ? "El manifiesto declara schemaVersion 1, journeys, niveles, secciones y umbral." : "El manifiesto no cumple la forma minima (schemaVersion 1, journeys, niveles, seccionesObligatoriasEvidencia, umbralNielsenBloqueo).",
      "Corrige qa/golden-journeys.json.",
    ),
  );
  if (!formaOk) return results;

  const estadosInvalidos = manifest.journeys.filter((journey) => !ESTADOS.has(journey.estado));
  results.push(
    result(
      "manifiesto-estados",
      estadosInvalidos.length === 0,
      estadosInvalidos.length === 0 ? "Todo journey declara un estado valido." : `Journeys con estado invalido: ${estadosInvalidos.map((j) => j.slug).join(", ")}.`,
      "Usa vigente, parcial o declarado.",
    ),
  );

  // Un journey que no esta completo debe decir quien lo completa: es lo que impide
  // que el gate exija verificar pantallas inexistentes sin dejar rastro del dueno.
  const sinDuenio = manifest.journeys.filter(
    (journey) => journey.estado !== "vigente" && !journey.delta?.changeDuenio,
  );
  results.push(
    result(
      "manifiesto-duenios",
      sinDuenio.length === 0,
      sinDuenio.length === 0 ? "Todo journey parcial o declarado nombra al change dueno de su delta." : `Journeys sin change dueno declarado: ${sinDuenio.map((j) => j.slug).join(", ")}.`,
      "Agrega delta.changeDuenio al journey.",
    ),
  );

  const vigentesConDelta = manifest.journeys.filter(
    (journey) => journey.estado === "vigente" && journey.delta,
  );
  results.push(
    result(
      "manifiesto-vigentes",
      vigentesConDelta.length === 0,
      vigentesConDelta.length === 0 ? "Ningun journey vigente arrastra delta pendiente." : `Journeys vigentes con delta pendiente: ${vigentesConDelta.map((j) => j.slug).join(", ")}.`,
      "Un journey con delta pendiente no puede estar en estado vigente.",
    ),
  );

  const rutasFantasma = [];
  for (const journey of manifest.journeys) {
    const citadas = new Set([
      ...(journey.rutas ?? []),
      ...(journey.pasos ?? []).map((paso) => paso.ruta).filter(Boolean),
    ]);
    for (const ruta of citadas) {
      if (!rutasConocidas.has(ruta)) rutasFantasma.push(`${journey.slug} -> ${ruta}`);
    }
  }
  results.push(
    result(
      "manifiesto-rutas",
      rutasFantasma.length === 0,
      rutasFantasma.length === 0 ? "Toda ruta citada por los journeys existe en el manifiesto de navegacion." : `Rutas citadas que no existen en la navegacion: ${rutasFantasma.join("; ")}.`,
      "Corrige la ruta o retirala del journey; el manifiesto no debe citar pantallas inexistentes.",
    ),
  );

  return results;
}

export function validarEvidencia(manifest, { nivel, journeys, reporte, capturas }) {
  const results = [];
  const config = manifest.niveles[nivel];

  const obligatorios = new Set([...(config.journeysObligatorios ?? []), ...journeys]);
  const conocidos = new Map(manifest.journeys.map((journey) => [journey.slug, journey]));

  const desconocidos = [...obligatorios].filter((slug) => !conocidos.has(slug));
  results.push(
    result(
      "journeys-declarados",
      desconocidos.length === 0,
      desconocidos.length === 0 ? `Journeys a cubrir en ${nivel}: ${[...obligatorios].join(", ")}.` : `Journeys declarados que no existen en el manifiesto: ${desconocidos.join(", ")}.`,
      "Usa slugs presentes en qa/golden-journeys.json.",
    ),
  );

  // Un journey reservado no tiene pasos ni criterios: exigir su evidencia seria pedir
  // que se verifique algo que este manifiesto deliberadamente no define.
  const reservados = [...obligatorios].filter((slug) => conocidos.get(slug)?.estado === "declarado");
  results.push(
    result(
      "journeys-no-reservados",
      reservados.length === 0,
      reservados.length === 0 ? "Ningun journey reservado se exige como evidencia." : `Journeys en estado declarado no pueden exigirse: ${reservados.join(", ")}.`,
      "Retira el journey reservado o implementalo en su change dueno.",
    ),
  );

  const faltantesSeccion = manifest.seccionesObligatoriasEvidencia.filter(
    (seccion) => !reporte.toLowerCase().includes(seccion.toLowerCase()),
  );
  results.push(
    result(
      "evidencia-secciones",
      faltantesSeccion.length === 0,
      faltantesSeccion.length === 0 ? "El reporte incluye las siete secciones obligatorias." : `Al reporte le faltan secciones obligatorias: ${faltantesSeccion.join(", ")}.`,
      "Completa el reporte segun el contrato de evidencia del runbook.",
    ),
  );

  const cubiertos = [...obligatorios].filter((slug) => conocidos.has(slug) && conocidos.get(slug).estado !== "declarado");
  const sinMencion = cubiertos.filter((slug) => !reporte.includes(slug));
  results.push(
    result(
      "evidencia-journeys-cubiertos",
      sinMencion.length === 0,
      sinMencion.length === 0 ? "El reporte nombra todos los journeys que debe cubrir." : `El reporte no documenta estos journeys: ${sinMencion.join(", ")}.`,
      "Documenta el recorrido de cada journey en la seccion Journeys cubiertos.",
    ),
  );

  const disponibles = new Set(capturas);
  const faltantesCaptura = [];
  for (const slug of cubiertos) {
    for (const ancho of config.anchos) {
      const esperada = manifest.patronCaptura.replace("{slug}", slug).replace("{ancho}", String(ancho));
      if (!disponibles.has(esperada)) faltantesCaptura.push(esperada);
    }
  }
  results.push(
    result(
      "evidencia-capturas",
      faltantesCaptura.length === 0,
      faltantesCaptura.length === 0 ? `Estan las capturas de los ${config.anchos.length} anchos que exige ${nivel}.` : `Faltan capturas: ${faltantesCaptura.join(", ")}.`,
      "Ejecuta el recorrido en el ancho faltante y archiva la captura real; no reutilices ni fabriques capturas.",
    ),
  );

  const severidad = reporte.match(SEVERIDAD_RE);
  if (!severidad) {
    results.push(
      result(
        "evidencia-nielsen",
        false,
        "El reporte no declara la severidad Nielsen maxima.",
        `Agrega una linea "Severidad Nielsen maxima: <n>" al reporte.`,
      ),
    );
  } else {
    const valor = Number(severidad[1]);
    const ok = valor < manifest.umbralNielsenBloqueo;
    results.push(
      result(
        "evidencia-nielsen",
        ok,
        ok ? `Severidad Nielsen maxima declarada: ${valor} (umbral de bloqueo: ${manifest.umbralNielsenBloqueo}).` : `Severidad Nielsen maxima ${valor} alcanza el umbral de bloqueo ${manifest.umbralNielsenBloqueo}.`,
        "Corrige el hallazgo antes de archivar o justifica por escrito en la revision adversarial.",
      ),
    );
  }

  if (config.medicionDomObligatoria) {
    const sinMedicion = config.anchos.filter((ancho) => !reporte.includes(String(ancho)));
    results.push(
      result(
        "evidencia-medicion-dom",
        sinMedicion.length === 0,
        sinMedicion.length === 0 ? `El reporte documenta medicion en los ${config.anchos.length} anchos de ${nivel}.` : `El reporte no documenta medicion en los anchos: ${sinMedicion.join(", ")}.`,
        "Agrega la medicion numerica por ancho; en este nivel la captura no basta.",
      ),
    );
  }

  return results;
}

function leerCapturas(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => name.toLowerCase().endsWith(".png"));
}

export function ejecutar(args, { root = ROOT } = {}) {
  const manifestPath = path.resolve(root, args.manifest ?? DEFAULT_MANIFEST);
  const routeManifestPath = path.resolve(root, args["route-manifest"] ?? DEFAULT_ROUTE_MANIFEST);

  if (!existsSync(manifestPath)) {
    return [result("manifiesto-presente", false, `No existe el manifiesto en ${args.manifest ?? DEFAULT_MANIFEST}.`, "Crea qa/golden-journeys.json.")];
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    return [result("manifiesto-presente", false, `El manifiesto no contiene JSON valido: ${error.message}`, "Corrige qa/golden-journeys.json.")];
  }

  const rutasConocidas = existsSync(routeManifestPath)
    ? rutasRegistradas(readFileSync(routeManifestPath, "utf8"))
    : new Set();

  const results = validarManifiesto(manifest, rutasConocidas);
  if (results.some((entry) => entry.status === "FAIL")) return results;

  if (!args.change && !args.evidence) {
    results.push(result("evidencia-objetivo", true, "Sin --change ni --evidence: solo se valido el manifiesto."));
    return results;
  }

  const evidenceDir = args.evidence
    ? path.resolve(root, args.evidence)
    : path.resolve(root, "openspec/changes", String(args.change), "evidencia");
  const reportePath = path.join(evidenceDir, "README.md");

  if (!existsSync(reportePath)) {
    results.push(
      result(
        "evidencia-reporte",
        false,
        `No existe el reporte de evidencia en ${path.relative(root, reportePath)}.`,
        "Crea evidencia/README.md segun el contrato del runbook.",
      ),
    );
    return results;
  }

  let nivel = args.nivel;
  let journeys = args.journeys ? String(args.journeys).split(",").map((slug) => slug.trim()).filter(Boolean) : null;

  if (!nivel || !journeys) {
    const readinessPath = args.change
      ? path.resolve(root, "openspec/changes", String(args.change), "readiness.json")
      : null;
    if (readinessPath && existsSync(readinessPath)) {
      try {
        const readiness = JSON.parse(readFileSync(readinessPath, "utf8"));
        nivel = nivel ?? readiness.qaVisualNivel;
        journeys = journeys ?? readiness.qaVisualJourneys ?? [];
      } catch {
        /* readiness ilegible: se reporta abajo como nivel ausente */
      }
    }
  }
  journeys = journeys ?? [];

  if (!nivel || !manifest.niveles[nivel]) {
    results.push(
      result(
        "evidencia-nivel",
        false,
        nivel ? `El nivel declarado "${nivel}" no existe en el manifiesto.` : "No se declaro nivel de QA visual (--nivel o qaVisualNivel en readiness.json).",
        `Declara qaVisualNivel con uno de: ${Object.keys(manifest.niveles).join(", ")}.`,
      ),
    );
    return results;
  }

  results.push(result("evidencia-nivel", true, `Nivel de QA visual declarado: ${nivel} (${manifest.niveles[nivel].disparador})`));
  results.push(
    ...validarEvidencia(manifest, {
      nivel,
      journeys,
      reporte: readFileSync(reportePath, "utf8"),
      capturas: leerCapturas(path.join(evidenceDir, "capturas")),
    }),
  );

  return results;
}

export function reportar(results) {
  const fallidos = results.filter((entry) => entry.status === "FAIL");
  console.log(`golden-journeys: ${fallidos.length ? "FAIL" : "PASS"}`);
  for (const entry of results) {
    console.log(`${entry.status.padEnd(4)} ${entry.id}: ${entry.summary}`);
    if (entry.status === "FAIL" && entry.remediation) console.log(`      Remediacion: ${entry.remediation}`);
  }
  return fallidos.length === 0;
}

const invocadoDirectamente = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invocadoDirectamente) {
  const ok = reportar(ejecutar(parseArgs(process.argv.slice(2))));
  process.exit(ok ? 0 : 1);
}
