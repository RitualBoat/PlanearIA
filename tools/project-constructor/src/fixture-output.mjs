export function classifyCommandOutput(response) {
  const stdoutLines = response.stdout.split(/\r?\n/).filter(Boolean);
  const stderrLines = response.stderr.split(/\r?\n/).filter(Boolean);
  const warnings = [...stdoutLines, ...stderrLines].filter((line) => (
    /\b(?:deprecated|warn|warning)\b/i.test(line)
  ));
  return {
    stderrLines: stderrLines.length,
    stdoutLines: stdoutLines.length,
    warnings,
  };
}

export function classifyOpenSpecInitOutput(response) {
  const expectedTools = [
    "Codex",
    "Claude Code",
    "Cursor",
    "GitHub Copilot",
    "OpenCode",
  ];
  const normalize = (line) => line
    .replace(/\u001B\[[0-9;]*m/g, "")
    .trim();
  const stdoutLines = response.stdout.split(/\r?\n/).map(normalize).filter(Boolean);
  const stderrLines = response.stderr.split(/\r?\n/).map(normalize).filter(Boolean);
  const allLines = [...stdoutLines, ...stderrLines];
  const completeSignals = (tool) => [
    `√ Setup complete for ${tool}`,
    `✓ Setup complete for ${tool}`,
    `✔ Setup complete for ${tool}`,
  ];
  const allowedProgress = new Set(expectedTools.flatMap((tool) => [
    `- Setting up ${tool}...`,
    ...completeSignals(tool),
  ]));
  const unexpectedStderr = stderrLines.filter((line) => !allowedProgress.has(line));
  const missingSignals = expectedTools.flatMap((tool) => {
    const setup = allLines.includes(`- Setting up ${tool}...`);
    const complete = completeSignals(tool).some((signal) => allLines.includes(signal));
    return [
      ...(setup ? [] : [`setup:${tool}`]),
      ...(complete ? [] : [`complete:${tool}`]),
    ];
  });
  return {
    ...classifyCommandOutput(response),
    expectedProgress: unexpectedStderr.length === 0 && missingSignals.length === 0,
    missingSignals,
    unexpectedStderr,
  };
}
