import {
  AppError,
  ConflictError,
  InternalServerError,
  ValidationError,
} from '../../domain/sharedObjects/AppError.js';

const UNIQUE_CONSTRAINT_ERROR = 'SequelizeUniqueConstraintError';
const VALIDATION_ERROR = 'SequelizeValidationError';

function mapRepositoryError(
  error,
  {
    fallbackMessage = 'Error de persistencia',
    conflictMessage = 'Conflicto de datos en persistencia',
    conflictCode = 'DB_CONFLICT',
    validationCode = 'DB_VALIDATION_ERROR',
    internalCode = 'DB_OPERATION_FAILED',
  } = {}
) {
  if (error instanceof AppError) {
    return error;
  }

  const rawMessage = error?.message || '';
  const normalizedMessage = rawMessage.toLowerCase();

  if (
    error?.name === UNIQUE_CONSTRAINT_ERROR ||
    normalizedMessage.includes('duplicate') ||
    normalizedMessage.includes('unique')
  ) {
    return new ConflictError(conflictMessage, conflictCode, error);
  }

  if (error?.name === VALIDATION_ERROR) {
    return new ValidationError(rawMessage || 'Datos inválidos', validationCode, error);
  }

  const message = rawMessage
    ? `${fallbackMessage}: ${rawMessage}`
    : fallbackMessage;

  return new InternalServerError(message, internalCode, error);
}

export default mapRepositoryError;
