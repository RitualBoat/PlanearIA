import assert from 'node:assert/strict';
import test from 'node:test';

import { runUpgradePullRequest } from '../src/git-upgrade-pr.mjs';

function result(status = 0, stdout = '', stderr = '') {
  return { status, stdout, stderr };
}

function appliedResult() {
  return {
    command: 'upgrade',
    mutationPerformed: true,
    plan: {
      operations: [
        {
          operation: 'update',
          target: 'package.json',
        },
      ],
      summary: {
        stateUpdate: true,
      },
    },
    status: 'APPLIED',
    transaction: {
      transactionId: 'tx-upgrade-fixture',
    },
  };
}

test('--open-pr falla antes de mutar cuando gh no está autenticado', async () => {
  let applied = false;
  const calls = [];
  const runner = (executable, args) => {
    calls.push([executable, ...args]);
    if (executable === 'git' && args[0] === 'status') return result();
    if (executable === 'gh' && args[0] === 'auth') {
      return result(1, '', 'not logged in');
    }
    return result();
  };

  await assert.rejects(
    runUpgradePullRequest({
      applyUpgrade: async () => {
        applied = true;
        return appliedResult();
      },
      runner,
      targetRoot: '/fixture',
    }),
    (error) => error.code === 'UPGRADE_PR_GH_AUTH_REQUIRED',
  );
  assert.equal(applied, false);
  assert.equal(calls.some((call) => call.includes('switch')), false);
});

test('--open-pr crea una rama acotada y reutiliza un PR abierto', async () => {
  const calls = [];
  let statusCount = 0;
  const runner = (executable, args) => {
    calls.push([executable, ...args]);
    if (executable === 'git' && args[0] === 'status') {
      statusCount += 1;
      return statusCount === 1
        ? result()
        : result(0, ' M package.json\n M .project-constructor/state.json\n');
    }
    if (executable === 'gh' && args[0] === 'auth') return result();
    if (executable === 'gh' && args[0] === 'repo') return result(0, 'main\n');
    if (executable === 'git' && args[0] === 'show-ref') return result(1);
    if (executable === 'gh' && args[0] === 'pr' && args[1] === 'list') {
      return result(0, '[{"number":42,"url":"https://example.test/pr/42"}]\n');
    }
    return result();
  };

  const output = await runUpgradePullRequest({
    applyUpgrade: async () => appliedResult(),
    runner,
    targetRoot: '/fixture',
  });

  assert.equal(output.branch, 'chore/project-os-v0.1.0');
  assert.equal(output.baseBranch, 'main');
  assert.deepEqual(output.pullRequest, {
    created: false,
    number: 42,
    url: 'https://example.test/pr/42',
  });
  assert.equal(
    calls.some((call) => (
      call[0] === 'git'
      && call[1] === 'switch'
      && call[2] === '-c'
      && call[3] === 'chore/project-os-v0.1.0'
    )),
    true,
  );
  assert.equal(calls.some((call) => call[0] === 'git' && call[1] === 'push'), true);
  assert.equal(calls.some((call) => call[0] === 'gh' && call[2] === 'create'), false);
  assert.equal(calls.some((call) => call.includes('merge')), false);
});

test('--open-pr bloquea una superficie no declarada antes de stage o push', async () => {
  let statusCount = 0;
  const calls = [];
  const runner = (executable, args) => {
    calls.push([executable, ...args]);
    if (executable === 'git' && args[0] === 'status') {
      statusCount += 1;
      return statusCount === 1
        ? result()
        : result(0, ' M package.json\n M UNRELATED.md\n');
    }
    if (executable === 'gh' && args[0] === 'auth') return result();
    if (executable === 'gh' && args[0] === 'repo') return result(0, 'main\n');
    if (executable === 'git' && args[0] === 'show-ref') return result(1);
    return result();
  };

  await assert.rejects(
    runUpgradePullRequest({
      applyUpgrade: async () => appliedResult(),
      runner,
      targetRoot: '/fixture',
    }),
    (error) => (
      error.code === 'UPGRADE_PR_SCOPE_VIOLATION'
      && error.details.includes('UNRELATED.md')
    ),
  );
  assert.equal(calls.some((call) => call[0] === 'git' && call[1] === 'add'), false);
  assert.equal(calls.some((call) => call[0] === 'git' && call[1] === 'push'), false);
});
