import { MiddlewareOptions, Envelope } from './types';
import pino from 'pino';
import winston from 'winston';

export function withLogging(options: MiddlewareOptions & { logger?: 'pino' | 'winston', loggerInstance?: any }) {
  let logger: any = null;
  if (options.logger === 'pino') {
    logger = options.loggerInstance || pino();
  } else if (options.logger === 'winston') {
    logger = options.loggerInstance || winston.createLogger({ transports: [new winston.transports.Console()] });
  }
  return (envelope: Envelope, req: any, res: any) => {
    if (!logger) return;
    if (envelope.success) {
      logger.info({ ...envelope, path: req.path, method: req.method }, 'API response');
    } else {
      logger.error({ ...envelope, path: req.path, method: req.method }, 'API error');
    }
  };
}
