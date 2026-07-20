import { createHash } from 'node:crypto';

// Normalizacion deliberadamente agresiva: el ID debe sobrevivir a diferencias de mayusculas,
// espacios y puntuacion menor entre agentes distintos que reportan el mismo hallazgo.
function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9/@#.:_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fingerprint({ category, artifact, title }) {
  const material = [normalize(category), normalize(artifact), normalize(title)].join('|');
  return `debt-${createHash('sha256').update(material, 'utf8').digest('hex').slice(0, 12)}`;
}

export function contentHash(value) {
  return createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
}

// Serializacion canonica con claves ordenadas: dos estructuras equivalentes producen el mismo hash
// aunque el orden de insercion difiera entre ejecuciones o plataformas.
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`;
  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
