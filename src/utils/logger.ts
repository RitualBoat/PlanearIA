/**
 * Logger utility that only outputs in development mode.
 * Wraps console methods with __DEV__ guard to prevent
 * logging in production builds.
 */
const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (__DEV__) console.error(...args);
  },
  info: (...args: unknown[]) => {
    if (__DEV__) console.info(...args);
  },
  debug: (...args: unknown[]) => {
    if (__DEV__) console.debug(...args);
  },
};

export default logger;
