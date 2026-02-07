import bcrypt from 'bcryptjs';

const passwordService = {
  hash: async (password) => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  },
  compare: async (password, hash) => {
    return bcrypt.compare(password, hash);
  }
};

export default passwordService;
