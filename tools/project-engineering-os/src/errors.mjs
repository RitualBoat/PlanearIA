import { EXIT_CODES } from './constants.mjs';

export class ConstructorError extends Error {
  constructor(
    code,
    message,
    {
      details = [],
      remediation = null,
      exitCode = EXIT_CODES.invalid,
      cause,
    } = {},
  ) {
    super(message, { cause });
    this.name = 'ConstructorError';
    this.code = code;
    this.details = Array.isArray(details) ? details : [details];
    this.remediation = remediation;
    this.exitCode = exitCode;
  }
}

export function asConstructorError(error) {
  if (error instanceof ConstructorError) {
    return error;
  }

  return new ConstructorError('UNEXPECTED_ERROR', error?.message ?? String(error), {
    exitCode: EXIT_CODES.transaction,
    remediation:
      'Revise el journal de la transacción y ejecute rollback o reintente después de resolver la causa.',
    cause: error,
  });
}
