import pino from 'pino';

const { NODE_ENV } = process.env;

export const logger = pino({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});
