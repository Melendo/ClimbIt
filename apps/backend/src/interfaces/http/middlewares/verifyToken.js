import tokenService from '../../../infrastructure/security/tokenService.js';

function verifyTokenMiddleware(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: 'Acceso denegado: No se proporcionó token' });
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res
      .status(400)
      .json({ message: 'Formato inválido. Use: Bearer <token>' });
  }
  const token = parts[1];
  if (!token) {
    return res
      .status(400)
      .json({ message: 'Token no encontrado en la cabecera' });
  }
  try {
    const decoded = tokenService.verificar(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'El token ha expirado' });
    }
    return res
      .status(401)
      .json({ message: 'Token inválido', error: error.message });
  }
}

export default verifyTokenMiddleware;
