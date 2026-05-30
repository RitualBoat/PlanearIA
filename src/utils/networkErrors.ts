const NETWORK_ERROR_PATTERNS = [
  "network request failed",
  "failed to fetch",
  "load failed",
  "aborterror",
  "the request timed out",
];

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

export const isNetworkRequestError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return NETWORK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
};
