import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const DEFAULT_TIMEOUT_MS = 45000;
const cwd = process.cwd();
const configPath = path.join(cwd, ".mcp.json");
const config = JSON.parse(await readFile(configPath, "utf8"));

// Parity check: every server declared in .mcp.json (the universal canon) must also be present in the
// per-harness MCP configs (.codex/config.toml, .cursor/mcp.json). Codex may declare extra servers.
function checkConfigParity() {
  const universal = Object.keys(config.mcpServers ?? {});
  const codexPath = path.join(cwd, ".codex/config.toml");
  const cursorPath = path.join(cwd, ".cursor/mcp.json");
  const codexRaw = existsSync(codexPath) ? readFileSync(codexPath, "utf8") : "";
  const codexNames = [...codexRaw.matchAll(/^\[mcp_servers\.([^\]]+)\]/gm)].map((m) => m[1]);
  const cursor = existsSync(cursorPath) ? JSON.parse(readFileSync(cursorPath, "utf8")) : { mcpServers: {} };
  const cursorNames = Object.keys(cursor.mcpServers ?? {});
  const missingCodex = universal.filter((n) => !codexNames.includes(n));
  const missingCursor = universal.filter((n) => !cursorNames.includes(n));
  return { ok: missingCodex.length === 0 && missingCursor.length === 0, universal, codexNames, cursorNames, missingCodex, missingCursor };
}

if (process.argv.includes("--parity-only")) {
  const p = checkConfigParity();
  console.log(JSON.stringify(p, null, 2));
  if (!p.ok) {
    console.error("mcp parity: FAIL - servers missing from a harness config (run `npm run agent:harness:sync`).");
    process.exit(1);
  }
  console.log("mcp parity: OK");
  process.exit(0);
}

const requestedServers = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const timeoutArg = process.argv.find((arg) => arg.startsWith("--timeout="));
const timeoutMs = timeoutArg ? Number(timeoutArg.split("=")[1]) : DEFAULT_TIMEOUT_MS;

const entries = Object.entries(config.mcpServers ?? {}).filter(([name]) => {
  return requestedServers.length === 0 || requestedServers.includes(name);
});

const results = [];

for (const [name, server] of entries) {
  results.push(await testServer(name, server, timeoutMs));
}

console.log(JSON.stringify({ ok: results.every((result) => result.ok), results }, null, 2));

if (results.some((result) => !result.ok)) {
  process.exit(1);
}

async function testServer(name, server, timeout) {
  const startedAt = Date.now();
  const messages = [];
  const stderr = [];
  const framing = server.framing ?? "line";

  if (server.url) {
    return {
      name,
      ok: true,
      durationMs: Date.now() - startedAt,
      transport: server.type ?? "http",
      url: server.url,
      initialized: false,
      toolCount: 0,
      tools: [],
      note: "Remote OAuth/HTTP server config present. Complete auth and tool listing inside an MCP client that supports this remote server.",
    };
  }

  return new Promise((resolve) => {
    const child = spawn(server.command, server.args ?? [], {
      cwd,
      env: { ...process.env, ...(server.env ?? {}) },
      shell: process.platform === "win32" && server.command !== "cmd",
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdoutBuffer = "";
    let done = false;
    let initialized = false;
    let toolNames = [];

    const finish = (ok, details = {}) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      child.kill();
      resolve({
        name,
        ok,
        durationMs: Date.now() - startedAt,
        initialized,
        toolCount: toolNames.length,
        tools: toolNames.slice(0, 20),
        stderr: sanitize(stderr.join("").slice(-1200)),
        ...details,
      });
    };

    const timer = setTimeout(() => {
      finish(false, { error: `Timed out after ${timeout}ms` });
    }, timeout);

    child.on("error", (error) => {
      finish(false, { error: error.message });
    });

    child.stderr.on("data", (chunk) => {
      stderr.push(chunk.toString());
    });

    child.stdout.on("data", (chunk) => {
      stdoutBuffer += chunk.toString();
      const parsed = readJsonMessages(stdoutBuffer);
      stdoutBuffer = parsed.remainder;

      for (const message of parsed.messages) {
        messages.push(message);

        if (message.id === 1 && message.result) {
          initialized = true;
          send(child, framing, { jsonrpc: "2.0", method: "notifications/initialized", params: {} });
          send(child, framing, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
        }

        if (message.id === 2 && message.result) {
          toolNames = (message.result.tools ?? []).map((tool) => tool.name);
          finish(true);
        }

        if (message.error) {
          finish(false, { error: message.error.message ?? JSON.stringify(message.error) });
        }
      }
    });

    child.on("exit", (code) => {
      if (!done && code !== 0) {
        finish(false, { error: `Process exited with code ${code}` });
      }
    });

    send(child, framing, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "planearia-mcp-test", version: "1.0.0" },
      },
    });
  });
}

function send(child, framing, message) {
  const payload = JSON.stringify(message);
  if (framing === "line") {
    child.stdin.write(`${payload}\n`);
    return;
  }

  child.stdin.write(`Content-Length: ${Buffer.byteLength(payload, "utf8")}\r\n\r\n${payload}`);
}

function readJsonMessages(buffer) {
  const messages = [];
  let remainder = buffer;

  while (true) {
    const headerMatch = /^Content-Length:\s*(\d+)\r?\n\r?\n/i.exec(remainder);
    if (!headerMatch) break;

    const length = Number(headerMatch[1]);
    const headerLength = headerMatch[0].length;
    if (remainder.length < headerLength + length) break;

    const payload = remainder.slice(headerLength, headerLength + length);
    messages.push(JSON.parse(payload));
    remainder = remainder.slice(headerLength + length);
  }

  while (true) {
    const newline = remainder.indexOf("\n");
    if (newline < 0) break;

    const line = remainder.slice(0, newline).trim();
    remainder = remainder.slice(newline + 1);

    if (!line || !line.startsWith("{")) continue;
    messages.push(JSON.parse(line));
  }

  return { messages, remainder };
}

function sanitize(value) {
  return value
    .replace(/(Bearer|token|secret|password|passwd|pwd|key)=?[A-Za-z0-9._~+/=-]+/gi, "$1=[redacted]")
    .replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, "mongodb$1://[redacted]@");
}
