import assert from "node:assert/strict";
import test from "node:test";
import { classifyOpenSpecInitOutput } from "../src/fixture-output.mjs";

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
