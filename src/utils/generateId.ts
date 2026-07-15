/**
 * Cross-device-safe id generation.
 *
 * Sequential ids (Math.max + 1) collide when two devices create items
 * offline from the same baseline, which silently overwrites documents in
 * MongoDB. Timestamp-based ids keep the numeric contract of legacy
 * entities while making cross-device collisions statistically negligible.
 */

let lastNumericId = 0;

export const generateNumericId = (): number => {
  const candidate = Date.now() * 1000 + Math.floor(Math.random() * 1000);
  // Monotonic guard: bulk loops can run within the same millisecond
  lastNumericId = candidate > lastNumericId ? candidate : lastNumericId + 1;
  return lastNumericId;
};

export const generateStringId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
