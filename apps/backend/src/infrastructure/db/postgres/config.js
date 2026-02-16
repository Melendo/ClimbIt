import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
  },
  production: {
    use_env_variable: 'PRODUCTION_DATABASE_URL',
    dialect: 'postgres',
    logging: false,
  },
};
