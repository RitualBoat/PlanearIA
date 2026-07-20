import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyOpenSpecInitOutput,
  opsxAdaptInvariantFailures,
} from "../src/fixture-output.mjs";

test("clasifica las señales exactas actuales de OpenSpec", () => {
  const tools = ["Codex", "Claude Code", "Cursor", "GitHub Copilot", "OpenCode"];
  const response = {
    stdout: tools.map((tool) => `- Setting up ${tool}...`).join("\n"),
    stderr: tools.map((tool) => `✔ Setup complete for ${tool}`).join("\n"),
  };
  const result = classifyOpenSpecInitOutput(response);
  assert.equal(result.expectedProgress, true);
  assert.deepEqual(result.unexpectedStderr, []);
  assert.deepEqual(result.missingSignals, []);
});

test("rechaza stderr fuera de la allowlist aunque incluya el progreso esperado", () => {
  const tools = ["Codex", "Claude Code", "Cursor", "GitHub Copilot", "OpenCode"];
  const response = {
    stdout: tools.map((tool) => `- Setting up ${tool}...`).join("\n"),
    stderr: [
      ...tools.map((tool) => `✔ Setup complete for ${tool}`),
      "Warning: unexpected provider output",
    ].join("\n"),
  };
  const result = classifyOpenSpecInitOutput(response);
  assert.equal(result.expectedProgress, false);
  assert.deepEqual(result.unexpectedStderr, ["Warning: unexpected provider output"]);
  assert.deepEqual(result.warnings, ["Warning: unexpected provider output"]);
});

test("acepta conteos OPSX variables si el contrato permanece íntegro", () => {
  const operations = Array.from({ length: 25 }, (_, index) => ({
    owner: "external-openspec",
    target: `surface-${index + 1}.md`,
  }));
  assert.deepEqual(opsxAdaptInvariantFailures({
    plan: {
      generatedFileCount: 30,
      operations,
      summary: { preserves: 5, updates: 25 },
    },
  }), []);
});

test("rechaza falsos verdes OPSX por conteo, owner o target duplicado", () => {
  const failures = opsxAdaptInvariantFailures({
    plan: {
      generatedFileCount: 3,
      operations: [
        { owner: "external-openspec", target: "same.md" },
        { owner: "project", target: "same.md" },
      ],
      summary: { preserves: 0, updates: 2 },
    },
  });
  assert.equal(failures.length, 3);
  assert.match(failures.join("\n"), /generatedFileCount/);
  assert.match(failures.join("\n"), /external-openspec/);
  assert.match(failures.join("\n"), /únicos/);
});
