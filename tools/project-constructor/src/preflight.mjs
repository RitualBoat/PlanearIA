import { constants as fsConstants } from 'node:fs';
import {
  access,
  lstat,
  realpath,
} from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

import { ConstructorError } from './errors.mjs';

function samePath(left, right) {
  const normalizedLeft = resolve(left);
  const normalizedRight = resolve(right);
  if (process.platform === 'win32') {
    return normalizedLeft.toLowerCase() === normalizedRight.toLowerCase();
  }
  return normalizedLeft === normalizedRight;
}

export async function preflightTarget(targetRoot, { writable = true } = {}) {
  const target = resolve(targetRoot);
  let stats;

  try {
    stats = await lstat(target);
  } catch (error) {
    throw new ConstructorError('TARGET_MISSING', 'El directorio destino no existe.', {
      details: target,
      remediation: 'Cree el directorio, inicialice Git y vuelva a ejecutar el constructor.',
      cause: error,
    });
  }

  if (!stats.isDirectory()) {
    throw new ConstructorError('TARGET_NOT_DIRECTORY', 'El destino no es un directorio.', {
      details: target,
    });
  }

  if (writable) {
    try {
      await access(target, fsConstants.R_OK | fsConstants.W_OK);
    } catch (error) {
      throw new ConstructorError('TARGET_NOT_WRITABLE', 'El repositorio destino no es escribible.', {
        details: target,
        remediation: 'Corrija permisos o seleccione un repositorio escribible.',
        cause: error,
      });
    }
  } else {
    await access(target, fsConstants.R_OK);
  }

  const git = spawnSync(
    'git',
    ['-C', target, 'rev-parse', '--show-toplevel'],
    {
      encoding: 'utf8',
      shell: false,
      windowsHide: true,
    },
  );

  if (git.error?.code === 'ENOENT') {
    throw new ConstructorError('GIT_NOT_FOUND', 'Git no está disponible en PATH.', {
      remediation: 'Instale Git y verifique `git --version` antes de reintentar.',
      cause: git.error,
    });
  }
  if (git.status !== 0) {
    throw new ConstructorError('TARGET_NOT_GIT', 'El destino no es un repositorio Git.', {
      details: git.stderr.trim() || git.stdout.trim(),
      remediation: 'Ejecute `git init` en el destino y vuelva a ejecutar el constructor.',
    });
  }

  const root = git.stdout.trim();
  const [targetReal, gitReal] = await Promise.all([
    realpath(target),
    realpath(root),
  ]);
  if (!samePath(targetReal, gitReal)) {
    throw new ConstructorError(
      'TARGET_NOT_GIT_ROOT',
      'El destino debe ser la raíz del repositorio Git.',
      {
        details: `Git reporta una raíz distinta: ${root}`,
        remediation: 'Pase --target con la raíz exacta del repositorio.',
      },
    );
  }

  const status = spawnSync(
    'git',
    ['-C', target, 'status', '--short', '--untracked-files=normal'],
    {
      encoding: 'utf8',
      shell: false,
      windowsHide: true,
    },
  );

  return {
    gitDirty: status.status === 0 && status.stdout.trim() !== '',
    target,
  };
}
