import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const token = await readGhToken();
const serverPath = resolveServerPath();

if (!existsSync(serverPath)) {
  console.error(`GitHub MCP server binary not found: ${serverPath}`);
  console.error("Install it from https://github.com/github/github-mcp-server/releases or set GITHUB_MCP_SERVER_PATH.");
  process.exit(1);
}

const child = spawn(serverPath, ["stdio", ...process.argv.slice(2)], {
  env: {
    ...process.env,
    GITHUB_PERSONAL_ACCESS_TOKEN: token,
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});

async function readGhToken() {
  if (process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
    return process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  }

  return new Promise((resolve, reject) => {
    const gh = spawn("gh", ["auth", "token"], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    gh.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    gh.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    gh.on("error", reject);
    gh.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || "gh auth token failed"));
        return;
      }

      const value = stdout.trim();
      if (!value) {
        reject(new Error("gh auth token returned an empty token"));
        return;
      }

      resolve(value);
    });
  });
}

function resolveServerPath() {
  if (process.env.GITHUB_MCP_SERVER_PATH) {
    return process.env.GITHUB_MCP_SERVER_PATH;
  }

  const executable = process.platform === "win32" ? "github-mcp-server.exe" : "github-mcp-server";
  return path.join(os.homedir(), ".local", "bin", executable);
}
