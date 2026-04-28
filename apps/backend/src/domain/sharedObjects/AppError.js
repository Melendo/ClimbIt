class AppError extends Error {
  constructor(
    message,
    {
      statusCode = 500,
      code = 'INTERNAL_ERROR',
      isOperational = true,
      cause = null,
    } = {}
  ) {
    super(message, cause ? { cause } : undefined);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
  }
}

class ValidationError extends AppError {
  constructor(message, code = 'VALIDATION_ERROR', cause = null) {
    super(message, { statusCode: 422, code, cause });
  }
}

class BadRequestError extends AppError {
  constructor(message, code = 'BAD_REQUEST', cause = null) {
    super(message, { statusCode: 400, code, cause });
  }
}

class AuthenticationError extends AppError {
  constructor(message, code = 'AUTHENTICATION_ERROR', cause = null) {
    super(message, { statusCode: 401, code, cause });
  }
}

class AuthorizationError extends AppError {
  constructor(message, code = 'AUTHORIZATION_ERROR', cause = null) {
    super(message, { statusCode: 403, code, cause });
  }
}

class NotFoundError extends AppError {
  constructor(message, code = 'NOT_FOUND', cause = null) {
    super(message, { statusCode: 404, code, cause });
  }
}

class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT', cause = null) {
    super(message, { statusCode: 409, code, cause });
  }
}

class InternalServerError extends AppError {
  constructor(
    message = 'Error interno del servidor',
    code = 'INTERNAL_ERROR',
    cause = null
  ) {
    super(message, { statusCode: 500, code, isOperational: false, cause });
  }
}

function toAppError(error, fallbackMessage = 'Error interno del servidor') {
  if (error instanceof AppError) {
    return error;
  }

  return new InternalServerError(fallbackMessage, 'INTERNAL_ERROR', error);
}

export {
  AppError,
  BadRequestError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  toAppError,
};
