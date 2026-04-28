import tokenService from '../../../infrastructure/security/tokenService.js';
import {
  AuthenticationError,
  BadRequestError,
  InternalServerError,
} from '../../../domain/sharedObjects/AppError.js';

function verifyTokenMiddleware(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return next(
      new AuthenticationError(
        'Acceso denegado: No se proporcionó token',
        'AUTH_TOKEN_MISSING'
      )
    );
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(
      new BadRequestError(
        'Formato inválido. Use: Bearer <token>',
        'AUTH_HEADER_INVALID_FORMAT'
      )
    );
  }

  const token = parts[1];
  if (!token) {
    return next(
      new BadRequestError(
        'Token no encontrado en la cabecera',
        'AUTH_TOKEN_EMPTY'
      )
    );
  }

  try {
    const decoded = tokenService.verificar(token);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(
        new AuthenticationError('El token ha expirado', 'AUTH_TOKEN_EXPIRED')
      );
    }

    if (error.name === 'JsonWebTokenError') {
      return next(
        new AuthenticationError('Token inválido', 'AUTH_TOKEN_INVALID')
      );
    }

    return next(
      new InternalServerError(
        'Error al validar el token de autenticación',
        'AUTH_TOKEN_VALIDATION_FAILED',
        error
      )
    );
  }
}

export default verifyTokenMiddleware;
