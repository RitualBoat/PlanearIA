const crypto = require("crypto");

const RESET_CODE_TTL_MS = parseInt(process.env.AUTH_RESET_CODE_TTL_MS || String(15 * 60 * 1000), 10);
const RESET_CODE_MAX_ATTEMPTS = parseInt(process.env.AUTH_RESET_CODE_MAX_ATTEMPTS || "5", 10);

function getResetCodeSecret() {
  return process.env.AUTH_RESET_CODE_SECRET || process.env.JWT_SECRET || process.env.API_SECRET || "dev-reset-secret";
}

function createResetCode() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashResetCode(email, code) {
  return crypto
    .createHmac("sha256", getResetCodeSecret())
    .update(`${String(email || "").toLowerCase().trim()}:${String(code || "").trim()}`)
    .digest("hex");
}

function isDevResetCodeEnabled() {
  return /^(1|true|yes|on)$/i.test(String(process.env.AUTH_DEV_RESET_CODE || "").trim());
}

function verifyResetCode(user, code) {
  if (!user || !code) return false;

  if (user.resetCodeHash) {
    const expected = hashResetCode(user.email, code);
    const left = Buffer.from(expected, "hex");
    const right = Buffer.from(String(user.resetCodeHash || ""), "hex");
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  }

  return Boolean(user.resetCode && user.resetCode === code);
}

module.exports = {
  RESET_CODE_MAX_ATTEMPTS,
  RESET_CODE_TTL_MS,
  createResetCode,
  hashResetCode,
  isDevResetCodeEnabled,
  verifyResetCode,
};
