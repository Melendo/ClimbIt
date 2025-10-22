const { Sequelize } = require('sequelize');

// Aquí es donde lees las variables de entorno o el config.json
// para obtener las credenciales.
// Por simplicidad, las ponemos aquí, pero deberías usar process.env
const config = {
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER || 'tu_usuario',
  password: process.env.POSTGRES_PASSWORD || 'tu_contraseña',
  host: process.env.POSTGRES_HOST || 'localhost',
  dialect: 'postgres',
};

// 1. CREAS LA INSTANCIA
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false, // (o console.log para ver queries)
  }
);

// 2. EXPORTAS LA INSTANCIA
module.exports = sequelize;
