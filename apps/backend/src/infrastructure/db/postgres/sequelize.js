import { Sequelize } from 'sequelize';
import configs from './config.js';

const env = process.env.NODE_ENV || 'development';
const cfg = configs[env] || configs.development;

let sequelize;
if (cfg.use_env_variable && process.env[cfg.use_env_variable]) {
  sequelize = new Sequelize(process.env[cfg.use_env_variable], {
    dialect: cfg.dialect,
    logging: cfg.logging,
  });
} else {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: cfg.dialect || 'postgres',
    logging: cfg.logging,
  });
}

export default sequelize;
