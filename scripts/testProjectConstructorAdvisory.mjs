import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = readFileSync(path.join(root, '.github/workflows/project-constructor.yml'), 'utf8');
const required = [
  'id: debt-state',
  'continue-on-error: true',
  "if: steps.debt-state.outcome == 'failure'",
  'Debt Control Loop advisory',
  'run: npm run test:project-os-contract',
  'run: npm run test:constructor-docs',
];
const missing = required.filter((needle) => !workflow.includes(needle));
if (missing.length) throw new Error(`Workflow advisory incompleto: ${missing.join(', ')}`);
const debtIndex = workflow.indexOf('id: debt-state');
const consumerIndex = workflow.indexOf('run: npm run test:project-os-contract');
if (consumerIndex > debtIndex || /test:project-os-contract\n\s*continue-on-error/.test(workflow)) {
  throw new Error('El contrato consumidor no puede degradarse a advisory.');
}
process.stdout.write('project-constructor-advisory: PASS\n');
