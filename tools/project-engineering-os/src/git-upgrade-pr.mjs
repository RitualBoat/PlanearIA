import { spawnSync } from 'node:child_process';

import {
  CONSTRUCTOR_VERSION,
  STATE_RELATIVE_PATH,
} from './constants.mjs';
import { ConstructorError } from './errors.mjs';

function defaultRunner(executable, args, { cwd }) {
  return spawnSync(executable, args, {
    cwd,
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
  });
}

function runChecked(
  runner,
  executable,
  args,
  {
    cwd,
    code,
    message,
    remediation,
    trim = true,
  },
) {
  const result = runner(executable, args, { cwd });
  if (result.error?.code === 'ENOENT') {
    throw new ConstructorError(`${code}_NOT_FOUND`, `${executable} no está disponible en PATH.`, {
      cause: result.error,
      remediation,
    });
  }
  if (result.status !== 0) {
    throw new ConstructorError(code, message, {
      details: (result.stderr || result.stdout || '').trim(),
      remediation,
    });
  }
  return trim ? result.stdout.trim() : result.stdout;
}

function statusPaths(raw) {
  if (!raw.trim()) return [];
  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/^"|"$/g, ''));
}

function parseExistingPullRequest(raw) {
  let values;
  try {
    values = JSON.parse(raw || '[]');
  } catch (error) {
    throw new ConstructorError(
      'UPGRADE_PR_QUERY_INVALID',
      'GitHub CLI devolvió una respuesta de PR no válida.',
      {
        cause: error,
        details: error.message,
        remediation: 'Ejecuta `gh pr list` manualmente y conserva la rama local.',
      },
    );
  }
  return Array.isArray(values) ? values[0] ?? null : null;
}

export async function runUpgradePullRequest({
  applyUpgrade,
  runner = defaultRunner,
  targetRoot,
}) {
  const initialStatus = runChecked(
    runner,
    'git',
    ['status', '--short', '--untracked-files=normal'],
    {
      cwd: targetRoot,
      code: 'UPGRADE_PR_GIT_STATUS_FAILED',
      message: 'No se pudo comprobar el working tree.',
      remediation: 'Comprueba Git y vuelve a ejecutar desde la raíz del repositorio.',
      trim: false,
    },
  );
  if (initialStatus.trim() !== '') {
    throw new ConstructorError(
      'UPGRADE_PR_WORKTREE_DIRTY',
      '--open-pr exige un working tree limpio.',
      {
        details: initialStatus.trim().split(/\r?\n/),
        remediation: 'Conserva, commitea o aparta tus cambios antes de reintentar.',
      },
    );
  }

  runChecked(runner, 'gh', ['auth', 'status'], {
    cwd: targetRoot,
    code: 'UPGRADE_PR_GH_AUTH_REQUIRED',
    message: 'GitHub CLI no tiene una sesión autenticada utilizable.',
    remediation: 'Ejecuta `gh auth login`, verifica `gh auth status` y reintenta.',
  });
  const baseBranch = runChecked(
    runner,
    'gh',
    ['repo', 'view', '--json', 'defaultBranchRef', '--jq', '.defaultBranchRef.name'],
    {
      cwd: targetRoot,
      code: 'UPGRADE_PR_REPOSITORY_UNAVAILABLE',
      message: 'No se pudo resolver la rama por defecto del remoto.',
      remediation: 'Verifica el remoto y `gh repo view` antes de reintentar.',
    },
  );
  if (!baseBranch) {
    throw new ConstructorError(
      'UPGRADE_PR_BASE_MISSING',
      'GitHub no informó una rama por defecto.',
      {
        remediation: 'Configura la rama por defecto del repositorio y reintenta.',
      },
    );
  }

  const branch = `chore/project-os-v${CONSTRUCTOR_VERSION}`;
  const branchLookup = runner(
    'git',
    ['show-ref', '--verify', '--quiet', `refs/heads/${branch}`],
    { cwd: targetRoot },
  );
  if (branchLookup.error) {
    throw new ConstructorError(
      'UPGRADE_PR_BRANCH_LOOKUP_FAILED',
      'No se pudo comprobar la rama local de upgrade.',
      {
        cause: branchLookup.error,
        remediation: 'Comprueba Git y conserva el working tree limpio.',
      },
    );
  }
  const switchArgs = branchLookup.status === 0
    ? ['switch', branch]
    : ['switch', '-c', branch];
  runChecked(runner, 'git', switchArgs, {
    cwd: targetRoot,
    code: 'UPGRADE_PR_BRANCH_FAILED',
    message: `No se pudo crear o reutilizar ${branch}.`,
    remediation: `Revisa la rama local y vuelve a ${baseBranch} si deseas cancelar.`,
  });

  let applied;
  try {
    applied = await applyUpgrade();
    const allowedPaths = new Set(
      applied.plan.operations
        .filter((operation) => ['create', 'delete', 'update'].includes(operation.operation))
        .map((operation) => operation.target),
    );
    if (applied.plan.summary.stateUpdate) {
      allowedPaths.add(STATE_RELATIVE_PATH);
    }
    const changed = statusPaths(runChecked(
      runner,
      'git',
      ['status', '--short', '--untracked-files=normal'],
      {
        cwd: targetRoot,
        code: 'UPGRADE_PR_GIT_STATUS_FAILED',
        message: 'No se pudo verificar la superficie modificada.',
        remediation: `Inspecciona la rama ${branch}; no se creó ni fusionó un PR.`,
        trim: false,
      },
    ));
    const unexpected = changed.filter((relative) => !allowedPaths.has(relative));
    if (unexpected.length > 0) {
      throw new ConstructorError(
        'UPGRADE_PR_SCOPE_VIOLATION',
        'El upgrade produjo cambios fuera del plan declarado.',
        {
          details: unexpected,
          remediation: `Inspecciona la rama ${branch} y usa el rollback transaccional antes de continuar.`,
        },
      );
    }

    if (changed.length > 0) {
      runChecked(runner, 'git', ['add', '--', ...changed], {
        cwd: targetRoot,
        code: 'UPGRADE_PR_STAGE_FAILED',
        message: 'No se pudieron preparar los archivos exactos del upgrade.',
        remediation: `Inspecciona la rama ${branch}; los cambios siguen locales.`,
      });
      runChecked(
        runner,
        'git',
        ['commit', '-m', `chore(project-os): upgrade to v${CONSTRUCTOR_VERSION}`],
        {
          cwd: targetRoot,
          code: 'UPGRADE_PR_COMMIT_FAILED',
          message: 'No se pudo crear el commit acotado de upgrade.',
          remediation: `Inspecciona el staging de ${branch}; no se creó ni fusionó un PR.`,
        },
      );
      runChecked(runner, 'git', ['push', '--set-upstream', 'origin', branch], {
        cwd: targetRoot,
        code: 'UPGRADE_PR_PUSH_FAILED',
        message: 'No se pudo publicar la rama de upgrade.',
        remediation: `Conserva ${branch} y reintenta \`git push --set-upstream origin ${branch}\`.`,
      });
    }

    const existing = parseExistingPullRequest(runChecked(
      runner,
      'gh',
      [
        'pr',
        'list',
        '--head',
        branch,
        '--state',
        'open',
        '--json',
        'number,url',
        '--limit',
        '1',
      ],
      {
        cwd: targetRoot,
        code: 'UPGRADE_PR_QUERY_FAILED',
        message: 'No se pudo comprobar si el PR ya existe.',
        remediation: `Ejecuta \`gh pr list --head ${branch}\`; la rama queda preservada.`,
      },
    ));
    if (existing) {
      return {
        ...applied,
        pullRequest: {
          created: false,
          ...existing,
        },
        branch,
        baseBranch,
      };
    }
    if (changed.length === 0) {
      throw new ConstructorError(
        'UPGRADE_PR_NOTHING_TO_PUBLISH',
        'La release ya está aplicada y no existe un PR abierto para esta rama.',
        {
          remediation: `Vuelve a ${baseBranch}; no hay cambios que publicar.`,
        },
      );
    }

    const url = runChecked(
      runner,
      'gh',
      [
        'pr',
        'create',
        '--base',
        baseBranch,
        '--head',
        branch,
        '--title',
        `chore(project-os): upgrade to v${CONSTRUCTOR_VERSION}`,
        '--body',
        [
          `Actualiza create-project-engineering-os a ${CONSTRUCTOR_VERSION}.`,
          '',
          'El cambio fue generado por project-os upgrade con transacción y rollback explícitos.',
        ].join('\n'),
      ],
      {
        cwd: targetRoot,
        code: 'UPGRADE_PR_CREATE_FAILED',
        message: 'La rama se publicó, pero GitHub no pudo crear el PR.',
        remediation: `Ejecuta \`gh pr create --base ${baseBranch} --head ${branch}\`; no se hizo merge.`,
      },
    );
    return {
      ...applied,
      pullRequest: {
        created: true,
        url,
      },
      branch,
      baseBranch,
    };
  } catch (error) {
    if (error instanceof ConstructorError) {
      error.details = [...error.details, `branch=${branch}`, `base=${baseBranch}`];
    }
    throw error;
  }
}
