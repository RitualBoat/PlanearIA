/**
 * Script para reemplazar colores hardcodeados por constantes COLORS.
 *
 * Ejecutar:  node scripts/replace-colors.js
 * Vista previa (sin escribir):  node scripts/replace-colors.js --dry-run
 */
const fs = require("fs");
const path = require("path");

const DRY_RUN = process.argv.includes("--dry-run");

// ─── Mapa: hex (lowercase) → token COLORS.xxx ───
const COLOR_MAP = {
  // Primarios
  "#1676d2": "COLORS.primary",
  "#0c63b8": "COLORS.primaryDark",
  "#2196f3": "COLORS.primaryLight",
  "#1e64cc": "COLORS.primaryMuted",

  // Fondos
  "#eef3fa": "COLORS.background",
  "#f8fbff": "COLORS.backgroundSoft",

  // Superficies
  "#ffffff": "COLORS.surface",
  "#fff": "COLORS.surface",
  "#ecf1f8": "COLORS.surfaceSecondary",
  "#f2f5fa": "COLORS.surfaceTertiary",
  "#f5f8fc": "COLORS.surfaceHover",

  // Bordes
  "#e3eaf4": "COLORS.border",
  "#dde7f5": "COLORS.borderLight",
  "#d8e2f0": "COLORS.borderStrong",
  "#e0e0e0": "COLORS.divider",

  // Texto
  "#1e2a3a": "COLORS.text",
  "#5c6e86": "COLORS.textSecondary",
  "#6b7d96": "COLORS.textTertiary",
  "#8a97aa": "COLORS.textMuted",
  "#2a3b56": "COLORS.textDark",

  // Estado
  "#4caf50": "COLORS.success",
  "#e7f9f3": "COLORS.successTint",
  "#c62828": "COLORS.error",
  "#f44336": "COLORS.errorLight",
  "#fff1f2": "COLORS.errorTint",
  "#ff9800": "COLORS.warning",
  "#d34553": "COLORS.danger",
  "#b12635": "COLORS.dangerDark",

  // Acentos
  "#9c27b0": "COLORS.purple",
  "#0b6f86": "COLORS.teal",
  "#0ea5a5": "COLORS.tealLight",
  "#5c6bc0": "COLORS.indigo",
  "#f58026": "COLORS.amber",

  // Dashboard métricas
  "#147ad6": "COLORS.metricBlue",
  "#0e8b9a": "COLORS.metricTeal",
  "#a6651a": "COLORS.metricAmber",

  // Componentes
  "#09589e": "COLORS.bannerBg",
  "#a8d6ff": "COLORS.bannerAccent",
  "#0c74c6": "COLORS.toggleActive",
  "#e8edf5": "COLORS.progressTrack",
  "#edf1f7": "COLORS.skeleton",
  "#eaf4ff": "COLORS.primaryTint",
  "#f3e5f5": "COLORS.purpleTint",
  "#0d9e70": "COLORS.successLight",

  // ─── Variantes cercanas (Round 2) ───
  // Blues primarios cercanos → primaryDark
  "#0a6fc4": "COLORS.primaryDark",
  "#0a6ab0": "COLORS.primaryDark",
  "#0c5da8": "COLORS.primaryDark",
  "#1976d2": "COLORS.primary",
  "#0f6cc8": "COLORS.primaryDark",
  "#1a6bc1": "COLORS.primaryDark",
  "#1a71ba": "COLORS.primaryDark",
  "#1b68b8": "COLORS.primaryDark",
  "#2e6cd0": "COLORS.primaryMuted",

  // Textos oscuros
  "#4d5d74": "COLORS.textDark",
  "#4e5a70": "COLORS.textDark",
  "#4a5e78": "COLORS.textDark",
  "#4a5568": "COLORS.textDark",
  "#4c5c74": "COLORS.textDark",
  "#1f2a3e": "COLORS.text",
  "#15243b": "COLORS.text",
  "#2e3e57": "COLORS.textDark",
  "#2b3a54": "COLORS.textDark",
  "#2a3d56": "COLORS.textDark",
  "#33445c": "COLORS.textDark",
  "#404b5f": "COLORS.textDark",

  // Textos medios
  "#5e708a": "COLORS.textSecondary",
  "#5a6e88": "COLORS.textSecondary",
  "#5a6679": "COLORS.textSecondary",
  "#5d6f86": "COLORS.textSecondary",
  "#63738c": "COLORS.textSecondary",

  // Textos claros
  "#74839a": "COLORS.textTertiary",
  "#73839b": "COLORS.textTertiary",
  "#7a8ba3": "COLORS.textTertiary",
  "#71829a": "COLORS.textTertiary",
  "#6e809a": "COLORS.textTertiary",
  "#70829c": "COLORS.textTertiary",
  "#76879e": "COLORS.textTertiary",

  // Bordes variantes
  "#dfe8f4": "COLORS.borderLight",
  "#dce6f3": "COLORS.borderLight",
  "#dce4f1": "COLORS.borderLight",
  "#d7e1ef": "COLORS.borderStrong",
  "#dce5f2": "COLORS.borderLight",
  "#dce8f8": "COLORS.borderLight",
  "#d0e2f6": "COLORS.borderLight",
  "#dfe7f3": "COLORS.borderLight",

  // Bordes como border principal
  "#e5ecf6": "COLORS.border",
  "#e2eaf5": "COLORS.border",
  "#e0e8f3": "COLORS.border",
  "#e7edf6": "COLORS.border",
  "#e8eef6": "COLORS.border",
  "#e0e8f4": "COLORS.border",
  "#e7f0ff": "COLORS.border",
  "#e8f3ff": "COLORS.border",
  "#e3f2fd": "COLORS.primaryTint",

  // Fondos suaves
  "#f6faff": "COLORS.backgroundSoft",
  "#f7faff": "COLORS.backgroundSoft",
  "#f4f8ff": "COLORS.backgroundSoft",
  "#f5faff": "COLORS.backgroundSoft",
  "#f7fafe": "COLORS.backgroundSoft",
  "#f6f9fd": "COLORS.surfaceHover",
  "#f4f7fb": "COLORS.surfaceHover",
  "#f5f5f5": "COLORS.surfaceTertiary",
  "#e9eef5": "COLORS.progressTrack",
  "#eef2f7": "COLORS.skeleton",
  "#eaf0fa": "COLORS.primaryTint",
  "#eaf2ff": "COLORS.primaryTint",
  "#f2f6fb": "COLORS.surfaceTertiary",
  "#f2f8ff": "COLORS.backgroundSoft",

  // Short hex codes
  "#666": "COLORS.textMuted",
  "#333": "COLORS.text",
  "#ddd": "COLORS.divider",
  "#dbc": "COLORS.divider",

  // Error/tint
  "#f7cdd2": "COLORS.errorTint",
  "#f5c2c7": "COLORS.errorTint",
  "#ff5e5b": "COLORS.errorLight",
  "#f57c00": "COLORS.warning",

  // Tints
  "#bbe7f0": "COLORS.primaryTint",
  "#eaf8fb": "COLORS.primaryTint",
  "#cfe2f7": "COLORS.primaryTint",
  "#ddefff": "COLORS.primaryTint",
  "#fff3e0": "COLORS.warningTint",
  "#fff8f1": "COLORS.warningTint",
};

// Archivos donde NO reemplazar (son la definición misma o tests con mocks)
const SKIP_FILES = [
  "types/index.ts", // La definición de COLORS
  "scripts/replace-colors.js",
];

// ─── Calcular el import relativo de types para un archivo dado ───
function getTypesImportPath(filePath) {
  const rel = path.relative(path.dirname(filePath), path.join(__dirname, "..", "types"));
  return rel.replace(/\\/g, "/");
}

// ─── Buscar archivos .ts/.tsx recursivamente en un directorio ───
function walkSync(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f === "node_modules" || f === ".git" || f === "scripts") continue;
      walkSync(full, list);
    } else if (/\.(tsx?|jsx?)$/.test(f)) {
      list.push(full);
    }
  }
  return list;
}

// ─── Procesar un archivo ───
function processFile(filePath) {
  const relPath = path.relative(path.join(__dirname, ".."), filePath).replace(/\\/g, "/");

  // Saltar archivos excluidos
  if (SKIP_FILES.some((skip) => relPath.endsWith(skip))) return null;

  // Saltar archivos en backend/ (JavaScript puro, no usa TypeScript constants)
  if (relPath.startsWith("backend/")) return null;

  let content = fs.readFileSync(filePath, "utf8");
  const original = content;
  let replacements = 0;

  // Para cada color en el mapa, reemplazar ocurrencias como strings literales
  for (const [hex, token] of Object.entries(COLOR_MAP)) {
    // Patrón: string literal con el hex color (case insensitive)
    // Matches: "#1676D2", "#1676d2", '#1676D2'
    const escaped = hex.replace("#", "\\#");
    const pattern = new RegExp(`(["'])${escaped}\\1`, "gi");

    let match;
    while ((match = pattern.exec(content)) !== null) {
      // Verificar contexto — no reemplazar si:
      // 1. Ya está dentro de COLORS.xxx
      // 2. Está en un comentario
      // 3. Forma parte de un color con alpha como "#2196F320"
      const before = content.substring(Math.max(0, match.index - 30), match.index);
      const after = content.substring(
        match.index + match[0].length,
        match.index + match[0].length + 5
      );

      // Saltar si es un color con alpha appended (like "#4CAF5020")
      if (/^[0-9a-fA-F]/.test(after.charAt(0)) && match[0].length <= 9) continue;

      // Saltar si está en un comentario de una sola línea
      const lineStart = content.lastIndexOf("\n", match.index) + 1;
      const lineContent = content.substring(lineStart, match.index);
      if (/\/\//.test(lineContent)) continue;

      // Saltar si está dentro de un comentario multi-línea
      const lastBlockOpen = content.lastIndexOf("/*", match.index);
      if (lastBlockOpen >= 0) {
        const lastBlockClose = content.lastIndexOf("*/", match.index);
        if (lastBlockClose < lastBlockOpen) continue; // dentro de /* */
      }

      // Saltar si after tiene más hex chars (partial match)
      // This handles cases like "#ffffff" inside "#ffffff80"
      const afterChar = content[match.index + match[0].length];
      if (afterChar && /[0-9a-fA-F]/.test(afterChar)) continue;

      content =
        content.substring(0, match.index) +
        token +
        content.substring(match.index + match[0].length);
      replacements++;
      // Reset regex position since content length changed
      pattern.lastIndex = match.index + token.length;
    }
  }

  if (replacements === 0) return null;

  // Asegurar que COLORS está importado
  if (!content.includes("COLORS") || !hasColorsImport(content)) {
    content = addColorsImport(content, filePath);
  }

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, content, "utf8");
  }

  return { relPath, replacements };
}

function hasColorsImport(content) {
  return /import\s+\{[^}]*COLORS[^}]*\}\s+from\s+["'][^"']*types["']/.test(content);
}

function addColorsImport(content, filePath) {
  const importPath = getTypesImportPath(filePath);

  // Si ya tiene un import de types, agregar COLORS al existente
  const existingImport = content.match(
    /import\s+\{([^}]*)\}\s+from\s+["']([^"']*types(?:\/index)?)["']/
  );

  if (existingImport) {
    const imports = existingImport[1];
    if (!imports.includes("COLORS")) {
      const newImports = `COLORS, ${imports.trim()}`;
      content = content.replace(
        existingImport[0],
        `import { ${newImports} } from "${existingImport[2]}"`
      );
    }
  } else {
    // Encontrar el final del último import statement completo
    // (puede ser multi-línea, así que buscamos el último "from" seguido de string)
    const importEndPattern = /from\s+["'][^"']+["'];?\s*\n/g;
    let lastMatch = null;
    let m;
    while ((m = importEndPattern.exec(content)) !== null) {
      lastMatch = m;
    }
    if (lastMatch) {
      const insertPos = lastMatch.index + lastMatch[0].length;
      const importLine = `import { COLORS } from "${importPath}";\n`;
      content = content.substring(0, insertPos) + importLine + content.substring(insertPos);
    }
  }

  return content;
}

// ─── Main ───
const root = path.join(__dirname, "..");
const srcDir = path.join(root, "src");

const files = walkSync(srcDir);
const results = files.map(processFile).filter(Boolean);

console.log(`\n${"=".repeat(60)}`);
console.log(DRY_RUN ? "  DRY RUN — no files written" : "  FILES UPDATED");
console.log(`${"=".repeat(60)}\n`);

let totalReplacements = 0;
for (const r of results) {
  console.log(`  ${r.replacements.toString().padStart(4)} replacements  ${r.relPath}`);
  totalReplacements += r.replacements;
}

console.log(`\n  Total: ${totalReplacements} replacements in ${results.length} files\n`);
