import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const CHILD_FLAG = "--isolated-child";
const TIMEOUT_MS = 1000;

if (process.argv.includes(CHILD_FLAG)) {
  const XLSX = await import("xlsx");
  const truncatedZipDeflateHeader = Buffer.from([
    0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  XLSX.read(truncatedZipDeflateHeader, { type: "buffer" });
  process.exit(2);
}

const script = fileURLToPath(import.meta.url);
const child = spawn(process.execPath, [script, CHILD_FLAG], {
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});

const outcome = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => {
    child.kill("SIGKILL");
    resolve("timed-out-and-terminated");
  }, TIMEOUT_MS);
  child.once("error", reject);
  child.once("exit", (code, signal) => {
    clearTimeout(timer);
    resolve(`exited code=${code} signal=${signal ?? "none"}`);
  });
});

if (outcome !== "timed-out-and-terminated") {
  throw new Error(`La reproduccion no confirmo el bloqueo esperado: ${outcome}`);
}
console.log(`Bloqueo reproducido solo en proceso hijo; timeout ${TIMEOUT_MS} ms y terminacion controlada.`);
