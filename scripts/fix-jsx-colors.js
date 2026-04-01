/**
 * Fix JSX attribute values that need curly braces after color replacement.
 * Replaces: prop=COLORS.xxx  → prop={COLORS.xxx}
 */
const fs = require("fs");
const path = require("path");

const DRY_RUN = process.argv.includes("--dry-run");

function walkSync(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f === "node_modules" || f === ".git" || f === "scripts") continue;
      walkSync(full, list);
    } else if (/\.tsx$/.test(f)) {
      list.push(full);
    }
  }
  return list;
}

const root = path.join(__dirname, "..");
const files = walkSync(path.join(root, "src"));
let totalFixes = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // Pattern: JSX attribute = COLORS.xxx (without braces)
  // Matches: color=COLORS.primary, backgroundColor=COLORS.background, etc.
  // But NOT: already wrapped like color={COLORS.primary}
  content = content.replace(
    /(\w+)=COLORS\.(\w+)/g,
    (match, prop, colorName) => `${prop}={COLORS.${colorName}}`
  );

  if (content !== original) {
    const fixes =
      (content.match(/\{COLORS\.\w+\}/g) || []).length -
      (original.match(/\{COLORS\.\w+\}/g) || []).length;
    const relPath = path.relative(root, filePath).replace(/\\/g, "/");
    console.log(`  ${fixes.toString().padStart(4)} fixes  ${relPath}`);
    totalFixes += fixes;
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, "utf8");
    }
  }
}

console.log(`\n  Total: ${totalFixes} JSX attribute fixes\n`);
