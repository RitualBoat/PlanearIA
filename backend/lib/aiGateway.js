/**
 * AI Gateway centralizado para endpoints de Planeaciones.
 *
 * Usa proveedores OpenAI-compatible en cascada. Esto permite empezar barato:
 * OpenRouter free router, Groq free plan, OpenAI u otros providers compatibles.
 * Las API keys viven solo en backend.
 */

const DEFAULT_TIMEOUT_MS = parseInt(process.env.OPENAI_TIMEOUT_MS || "25000", 10);

function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/+$/g, "");
}

function cleanConfigValue(value) {
  return String(value || "")
    .replace(/\s+#.*$/g, "")
    .replace(/\s+\/\/.*$/g, "")
    .trim();
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function providerFromEnv(id, env) {
  const apiKey = process.env[env.apiKey];
  const model = cleanConfigValue(process.env[env.model] || env.defaultModel);
  if (!apiKey || !model) return null;

  return {
    id,
    label: env.label || id,
    baseUrl: normalizeBaseUrl(process.env[env.baseUrl] || env.defaultBaseUrl),
    apiKey,
    model,
    headers: env.headers || {},
  };
}

function getConfiguredProviders() {
  const customProviders = safeJsonParse(process.env.AI_GATEWAY_PROVIDERS || "[]", []);
  const parsedCustomProviders = Array.isArray(customProviders)
    ? customProviders
        .map((item, index) => {
          const apiKey = item?.apiKey || (item?.apiKeyEnv ? process.env[item.apiKeyEnv] : "");
          const model = cleanConfigValue(item?.model || (item?.modelEnv ? process.env[item.modelEnv] : ""));
          if (!item?.baseUrl || !apiKey || !model) return null;
          return {
            id: item.id || `custom_${index + 1}`,
            label: item.label || item.id || `custom_${index + 1}`,
            baseUrl: normalizeBaseUrl(item.baseUrl),
            apiKey,
            model,
            headers: item.headers || {},
          };
        })
        .filter(Boolean)
    : [];

  const builtInProviders = [
    providerFromEnv("openrouter", {
      apiKey: "OPENROUTER_API_KEY",
      model: "OPENROUTER_MODEL",
      defaultModel: "openrouter/free",
      baseUrl: "OPENROUTER_BASE_URL",
      defaultBaseUrl: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://planearia.app",
        "X-Title": process.env.OPENROUTER_APP_TITLE || "PlanearIA",
      },
    }),
    providerFromEnv("groq", {
      apiKey: "GROQ_API_KEY",
      model: "GROQ_MODEL",
      defaultModel: process.env.GROQ_MODEL,
      baseUrl: "GROQ_BASE_URL",
      defaultBaseUrl: "https://api.groq.com/openai/v1",
    }),
    providerFromEnv("openai", {
      apiKey: "OPENAI_API_KEY",
      model: "OPENAI_MODEL",
      defaultModel: "gpt-4o-mini",
      baseUrl: "OPENAI_BASE_URL",
      defaultBaseUrl: "https://api.openai.com/v1",
    }),
    providerFromEnv("together", {
      apiKey: "TOGETHER_API_KEY",
      model: "TOGETHER_MODEL",
      defaultModel: process.env.TOGETHER_MODEL,
      baseUrl: "TOGETHER_BASE_URL",
      defaultBaseUrl: "https://api.together.xyz/v1",
    }),
  ].filter(Boolean);

  return [...parsedCustomProviders, ...builtInProviders];
}

function hasConfiguredProviders() {
  return getConfiguredProviders().length > 0;
}

function extractErrorMessage(payload, status, providerId) {
  const raw =
    payload?.error?.message ||
    payload?.message ||
    payload?.error ||
    `Error IA ${providerId} (${status})`;
  return typeof raw === "string" ? raw : JSON.stringify(raw);
}

async function callProvider(provider, options, useJsonFormat) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT_MS);

  try {
    const body = {
      model: provider.model,
      temperature: options.temperature ?? 0.3,
      messages: options.messages || [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
    };

    if (Number.isFinite(Number(options.maxTokens))) {
      body.max_tokens = Number(options.maxTokens);
    }

    if (useJsonFormat) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
        ...provider.headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const raw = await response.text();
    const data = safeJsonParse(raw, null);

    if (!response.ok) {
      const error = new Error(extractErrorMessage(data || raw, response.status, provider.id));
      error.statusCode = response.status;
      error.provider = provider.id;
      throw error;
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error(`La IA ${provider.id} no devolvio contenido utilizable`);
    }

    return {
      content,
      provider: provider.id,
      model: provider.model,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runChatCompletion(options) {
  const providers = getConfiguredProviders();
  if (providers.length === 0) {
    const error = new Error("No hay proveedores IA configurados en el gateway");
    error.code = "AI_GATEWAY_NO_PROVIDER";
    throw error;
  }

  const errors = [];
  for (const provider of providers) {
    try {
      return await callProvider(provider, options, Boolean(options.responseFormatJson));
    } catch (error) {
      const status = Number(error?.statusCode);
      const canRetryWithoutJson =
        options.responseFormatJson && (status === 400 || status === 422 || status === 404);

      if (canRetryWithoutJson) {
        try {
          return await callProvider(provider, options, false);
        } catch (retryError) {
          errors.push(`${provider.id}: ${retryError.message}`);
          continue;
        }
      }

      errors.push(`${provider.id}: ${error.message}`);
    }
  }

  const finalError = new Error(`Todos los proveedores IA fallaron: ${errors.join(" | ")}`);
  finalError.code = "AI_GATEWAY_ALL_FAILED";
  throw finalError;
}

module.exports = {
  getConfiguredProviders,
  hasConfiguredProviders,
  runChatCompletion,
};
