import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { runDoctor } from './harnessDoctor.mjs';

const config = {
  project: { owner: 'RitualBoat', title: 'PlanearIA Product OS' },
  checkOrder: ['node-npm', 'git-worktree', 'openspec', 'github-projects', 'gitnexus', 'codegraph', 'harness-parity', 'mcp-parity', 'mcp-smoke', 'expo-compatibility', 'graphify'],
  gitNexusFailurePatterns: ['Not a git repository', 'FTS indexes missing'],
  retiredTools: [{ id: 'graphify', status: 'SKIP', summary: 'Graphify retirado/manual; no forma parte del harness activo.', remediation: null }],
};

const mcpReport = JSON.stringify({ ok: true, results: [{ name: 'codegraph', ok: true }, { name: 'figma', ok: true, note: 'Remote OAuth/HTTP server config present. Complete auth and tool listing inside an MCP client that supports this remote server.' }] });

function healthyRun(calls) {
  return (command, args) => {
    calls.push([command, ...args]);
    if (command === 'gh') return { status: 0, stdout: JSON.stringify({ projects: [{ title: 'PlanearIA Product OS' }] }) };
    if (command === 'git' && args[0] === 'status') return { status: 0, stdout: '' };
    if (command === 'git') return { status: 0, stdout: 'C:/repo' };
    if (args.includes('mcp:test')) return { status: 0, stdout: mcpReport };
    return { status: 0, stdout: 'ok' };
  };
}

const calls = [];
const healthy = runDoctor({ config, run: healthyRun(calls), npm: 'npm' });
assert.equal(healthy.ok, true);
assert.deepEqual(healthy.checks.map((check) => check.id), config.checkOrder);
assert.equal(healthy.checks.find((check) => check.id === 'mcp-smoke').status, 'WARN');
assert.equal(healthy.checks.find((check) => check.id === 'graphify').status, 'SKIP');
assert.equal(calls.some((call) => call.join(' ').toLowerCase().includes('graphify')), false);

const falseGreen = runDoctor({
  config,
  npm: 'npm',
  run: (command, args) => command === 'npm' && args.includes('gitnexus:diagnose') ? { status: 0, stdout: 'Not a git repository' } : healthyRun([])(command, args),
});
assert.equal(falseGreen.ok, false);
assert.equal(falseGreen.checks.find((check) => check.id === 'gitnexus').status, 'FAIL');

const inaccessibleProject = runDoctor({
  config,
  npm: 'npm',
  run: (command, args) => command === 'gh' ? { status: 1, stderr: 'token=private-value' } : healthyRun([])(command, args),
});
const projectCheck = inaccessibleProject.checks.find((check) => check.id === 'github-projects');
assert.equal(projectCheck.status, 'FAIL');
assert.equal(projectCheck.summary.includes('private-value'), false);

const missingCommand = runDoctor({
  config,
  npm: 'npm',
  run: (command, args) => command === 'npm' && args[0] === '--version' ? { status: 1, error: 'spawn npm ENOENT' } : healthyRun([])(command, args),
});
assert.equal(missingCommand.checks.find((check) => check.id === 'node-npm').status, 'FAIL');

const integration = spawnSync(process.execPath, ['scripts/harnessDoctor.mjs', '--json'], { cwd: process.cwd(), encoding: 'utf8' });
const live = JSON.parse(integration.stdout);
assert.equal(integration.status, live.ok ? 0 : 1, integration.stderr || integration.stdout);
assert.equal(live.checks.find((check) => check.id === 'graphify').status, 'SKIP');
assert.deepEqual(live.checks.map((check) => check.id), config.checkOrder);

process.stdout.write('Harness doctor tests passed.\n');
