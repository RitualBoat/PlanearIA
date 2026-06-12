const crypto = require("crypto");

const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const ITERATIONS = parseInt(process.env.AUTH_PBKDF2_ITERATIONS || "100000", 10);
const DIGEST = "sha512";
const PASSWORD_HASH_PREFIX = "pbkdf2:v1";
const MIN_PASSWORD_LENGTH = parseInt(process.env.AUTH_MIN_PASSWORD_LENGTH || "6", 10);

function validatePasswordPolicy(password) {
  if (typeof password !== "string" || !password) {
    return { valid: false, error: "La contraseña es obligatoria." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }
  return { valid: true };
}

function derivePasswordKey(password, salt, iterations = ITERATIONS, digest = DIGEST) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, KEY_LENGTH, digest, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString("hex"));
    });
  });
}

async function hashPassword(password) {
  const policy = validatePasswordPolicy(password);
  if (!policy.valid) {
    throw new Error(policy.error);
  }

  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const key = await derivePasswordKey(password, salt);
  return `${PASSWORD_HASH_PREFIX}:${DIGEST}:${ITERATIONS}:${salt}:${key}`;
}

function parseStoredPassword(stored) {
  if (typeof stored !== "string") return null;

  const modern = stored.split(":");
  if (modern.length === 6 && modern[0] === "pbkdf2" && modern[1] === "v1") {
    return {
      format: "pbkdf2:v1",
      digest: modern[2],
      iterations: parseInt(modern[3], 10),
      salt: modern[4],
      key: modern[5],
      needsRehash: false,
    };
  }

  const legacy = stored.split(":");
  if (legacy.length === 2) {
    return {
      format: "legacy-pbkdf2",
      digest: DIGEST,
      iterations: ITERATIONS,
      salt: legacy[0],
      key: legacy[1],
      needsRehash: true,
    };
  }

  return null;
}

function timingSafeEqualHex(a, b) {
  try {
    const left = Buffer.from(String(a || ""), "hex");
    const right = Buffer.from(String(b || ""), "hex");
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

async function verifyPasswordDetailed(password, stored) {
  const parsed = parseStoredPassword(stored);
  if (!parsed) return { valid: false, needsRehash: false };

  const candidate = await derivePasswordKey(
    password,
    parsed.salt,
    parsed.iterations || ITERATIONS,
    parsed.digest || DIGEST
  );

  return {
    valid: timingSafeEqualHex(candidate, parsed.key),
    needsRehash: parsed.needsRehash,
  };
}

async function verifyPassword(password, stored) {
  const result = await verifyPasswordDetailed(password, stored);
  return result.valid;
}

module.exports = {
  DIGEST,
  ITERATIONS,
  MIN_PASSWORD_LENGTH,
  PASSWORD_HASH_PREFIX,
  hashPassword,
  parseStoredPassword,
  validatePasswordPolicy,
  verifyPassword,
  verifyPasswordDetailed,
};
