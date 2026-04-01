/**
 * Script to replace console.log/warn/error/info/debug with logger utility.
 * Adds import for logger and replaces all console method calls.
 */
const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "src");

const consoleMethods = ["log", "warn", "error", "info", "debug"];
const consoleRegex = /console\.(log|warn|error|info|debug)\s*\(/g;

function getAllFiles(dir, exts = [".ts", ".tsx"]) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function getLoggerImportPath(filePath) {
  const fileDir = path.dirname(filePath);
  let rel = path.relative(fileDir, path.join(SRC_DIR, "utils", "logger"));
  rel = rel.replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

function hasConsoleUsage(content) {
  return consoleRegex.test(content);
}

function hasLoggerImport(content) {
  return /import\s+logger\s+from\s+["']/.test(content);
}

function addLoggerImport(content, importPath) {
  const importLine = `import logger from "${importPath}";\n`;

  // Find last import statement
  const lines = content.split("\n");
  let lastImportIdx = -1;
  let inMultiLineImport = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (inMultiLineImport) {
      if (line.includes("from ")) {
        lastImportIdx = i;
        inMultiLineImport = false;
      }
      continue;
    }
    if (/^\s*import\s+/.test(line)) {
      if (line.includes("from ")) {
        lastImportIdx = i;
      } else {
        inMultiLineImport = true;
      }
    }
  }

  if (lastImportIdx >= 0) {
    lines.splice(lastImportIdx + 1, 0, importLine.trimEnd());
    return lines.join("\n");
  }

  return importLine + content;
}

let totalReplacements = 0;
let filesModified = 0;

const files = getAllFiles(SRC_DIR);
for (const filePath of files) {
  // Skip the logger utility itself
  if (filePath.endsWith("logger.ts")) continue;

  let content = fs.readFileSync(filePath, "utf-8");
  consoleRegex.lastIndex = 0;

  if (!hasConsoleUsage(content)) continue;

  // Count replacements in this file
  consoleRegex.lastIndex = 0;
  const matches = content.match(consoleRegex);
  if (!matches) continue;

  // Skip lines that are in comments or already have __DEV__
  const lines = content.split("\n");
  let fileReplacements = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip comment lines
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;

    // Skip lines already guarded
    if (line.includes("__DEV__")) continue;

    // Replace console.xxx( with logger.xxx(
    const newLine = line.replace(/console\.(log|warn|error|info|debug)\s*\(/g, "logger.$1(");
    if (newLine !== line) {
      lines[i] = newLine;
      fileReplacements++;
    }
  }

  if (fileReplacements === 0) continue;

  content = lines.join("\n");

  // Add logger import if not present
  if (!hasLoggerImport(content)) {
    const importPath = getLoggerImportPath(filePath);
    content = addLoggerImport(content, importPath);
  }

  fs.writeFileSync(filePath, content, "utf-8");

  const relPath = path.relative(path.join(__dirname, ".."), filePath);
  console.log(`  ${relPath}: ${fileReplacements} replacements`);
  totalReplacements += fileReplacements;
  filesModified++;
}

console.log(`\nDone: ${totalReplacements} replacements across ${filesModified} files`);
