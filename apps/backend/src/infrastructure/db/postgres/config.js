require('dotenv').config();

module.exports = {
  development: {
    use_env_variable: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    use_env_variable: process.env.PRODUCTION_DATABASE_URL,
    dialect: 'postgres',
    logging: false,
  },
};
