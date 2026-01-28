import { Sequelize } from 'sequelize';
import { logger } from './logger.js';

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DATABASE,
  NODE_ENV,
} = process.env;

const isTestEnv = NODE_ENV === 'testing' || NODE_ENV === 'preproduction';

export const sequelize = new Sequelize(
  POSTGRES_DATABASE || 'portal_validador',
  POSTGRES_USER || 'postgres',
  POSTGRES_PASSWORD || '',
  {
    host: POSTGRES_HOST || 'localhost',
    port: Number(POSTGRES_PORT) || 5432,
    dialect: 'postgres',
    logging: isTestEnv ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
}
