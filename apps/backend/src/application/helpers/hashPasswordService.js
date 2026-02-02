import bcrypt from 'bcrypt';

export async function hashPassword(contrasena) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(contrasena, saltRounds);
  return hashedPassword;
}

export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
