import jwt from 'jsonwebtoken';

const tokenService = {
  crear: (payload) => {
    const secret = process.env.JWT_SECRET || 'secreto_super_seguro_dev';
    const expiresIn = process.env.JWT_EXPIRES_IN || '2h';
    return jwt.sign(payload, secret, { expiresIn });
  },
  verificar: (token) => {
    const secret = process.env.JWT_SECRET || 'secreto_super_seguro_dev';
    return jwt.verify(token, secret);
  }
};

export default tokenService;
