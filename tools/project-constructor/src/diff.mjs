import { normalizeLf } from './hash.mjs';

const MAX_RENDERED_DIFF_LINES = 200;

function splitLines(value) {
  if (value === '') {
    return [];
  }
  const normalized = normalizeLf(value);
  const lines = normalized.split('\n');
  if (lines.at(-1) === '') {
    lines.pop();
  }
  return lines;
}

function fallbackDiff(before, after) {
  return [
    ...before.map((line) => ({ prefix: '-', line })),
    ...after.map((line) => ({ prefix: '+', line })),
  ];
}

function lcsDiff(before, after) {
  if (before.length * after.length > 1_000_000) {
    return fallbackDiff(before, after);
  }

  const table = Array.from(
    { length: before.length + 1 },
    () => new Uint32Array(after.length + 1),
  );

  for (let left = before.length - 1; left >= 0; left -= 1) {
    for (let right = after.length - 1; right >= 0; right -= 1) {
      table[left][right] = before[left] === after[right]
        ? table[left + 1][right + 1] + 1
        : Math.max(table[left + 1][right], table[left][right + 1]);
    }
  }

  const result = [];
  let left = 0;
  let right = 0;
  while (left < before.length && right < after.length) {
    if (before[left] === after[right]) {
      result.push({ prefix: ' ', line: before[left] });
      left += 1;
      right += 1;
    } else if (table[left + 1][right] >= table[left][right + 1]) {
      result.push({ prefix: '-', line: before[left] });
      left += 1;
    } else {
      result.push({ prefix: '+', line: after[right] });
      right += 1;
    }
  }
  while (left < before.length) {
    result.push({ prefix: '-', line: before[left] });
    left += 1;
  }
  while (right < after.length) {
    result.push({ prefix: '+', line: after[right] });
    right += 1;
  }
  return result;
}

export function deterministicDiff({
  before,
  after,
  owner,
  source,
  target,
}) {
  const beforeText = before === null ? '' : before.toString('utf8');
  const afterText = after === null ? '' : after.toString('utf8');
  const beforeLines = splitLines(beforeText);
  const afterLines = splitLines(afterText);
  const changes = lcsDiff(beforeLines, afterLines);

  const header = [
    `owner ${owner}`,
    `source ${source ?? '<external>'}`,
    `--- a/${target}`,
    `+++ b/${target}`,
    `@@ -1,${beforeLines.length} +1,${afterLines.length} @@`,
  ];
  const renderedChanges = changes.map(({ prefix, line }) => `${prefix}${line}`);
  if (renderedChanges.length > MAX_RENDERED_DIFF_LINES) {
    const omitted = renderedChanges.length - MAX_RENDERED_DIFF_LINES;
    renderedChanges.length = MAX_RENDERED_DIFF_LINES;
    renderedChanges.push(`... ${omitted} line(s) omitted; compare the reported SHA-256 hashes`);
  }
  return [...header, ...renderedChanges].join('\n');
}
