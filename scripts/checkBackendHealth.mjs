const DEFAULT_HEALTH_URL = "http://localhost:3000/api/health";
const timeoutMs = Number(process.env.BACKEND_HEALTH_TIMEOUT_MS ?? 5000);

const normalizeHealthUrl = (value) => {
  const rawUrl = (value ?? "").trim();

  if (!rawUrl) {
    return DEFAULT_HEALTH_URL;
  }

  const url = rawUrl.replace(/\/+$/, "");

  if (url.endsWith("/api/health")) {
    return url;
  }

  if (url.endsWith("/api")) {
    return `${url}/health`;
  }

  return `${url}/api/health`;
};

const healthUrl = normalizeHealthUrl(
  process.argv[2] ?? process.env.BACKEND_HEALTH_URL ?? process.env.EXPO_PUBLIC_API_URL
);

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);

try {
  const response = await fetch(healthUrl, {
    method: "GET",
    signal: controller.signal,
    headers: {
      Accept: "application/json",
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const healthData = body?.data ?? body;

  if (!healthData || healthData.status !== "ok") {
    throw new Error("Health response did not include status=ok");
  }

  console.log(`[backend:health] OK ${healthUrl}`);
  console.log(
    `[backend:health] ${healthData.service ?? "PlanearIA API"} ${healthData.version ?? ""}`.trim()
  );
} catch (error) {
  const message = error?.name === "AbortError" ? `timeout after ${timeoutMs}ms` : error.message;
  console.error(`[backend:health] FAIL ${healthUrl}`);
  console.error(`[backend:health] ${message}`);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
}
