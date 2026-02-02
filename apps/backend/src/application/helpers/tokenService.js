import jwt from 'jsonwebtoken';

export function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'your-default-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '2h';

  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'your-default-secret';
  return jwt.verify(token, secret);
}
