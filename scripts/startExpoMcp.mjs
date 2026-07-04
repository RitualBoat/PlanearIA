import { spawn } from "node:child_process";

const child = spawn("npx", ["expo", "start", ...process.argv.slice(2)], {
  env: {
    ...process.env,
    EXPO_UNSTABLE_MCP_SERVER: "1",
  },
  shell: process.platform === "win32",
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
