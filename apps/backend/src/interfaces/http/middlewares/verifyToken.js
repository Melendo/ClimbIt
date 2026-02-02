import { verifyToken } from '../../../application/helpers/tokenService.js';

function verifyTokenMiddleware(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No se proporcionó token' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res
      .status(400)
      .json({ message: 'Formato de token inválido. Use: Bearer <token>' });
  }
  const parts = authHeader.split(' ');
  const tokenString = parts[1];

  console.log('Token extraído:', tokenString);

  if (!tokenString) {
    return res.status(400).json({ message: 'Formato incorrecto' });
  }
  try {
    const decoded = verifyToken(tokenString);
    req.user = decoded;
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Token inválido', error: error.message });
  }
  next();
}

export default verifyTokenMiddleware;
