import { expressMiddleware } from './expressAdapter';
import { fastifyMiddleware } from './fastifyAdapter';
import { koaMiddleware } from './koaAdapter';
import { honoMiddleware } from './honoAdapter';
import { nodeHttpMiddleware } from './nodeHttpAdapter';
import { createEnvelope } from './envelope';
import { validateResponse } from './validation';
import { defaultConfig } from './config';
import { generateOpenAPIResponse, zodToOpenAPISchema } from './openapi';
import { withLogging } from './logging';

// Generic async wrapper for any framework
const wrapAsync = <T extends (...args: any[]) => any>(handler: T): T => {
  return function (...args: any[]) {
    const maybeNext = args[args.length - 1];
    const isExpress = typeof maybeNext === 'function';

    if (isExpress) {
      // Express-style
      return Promise.resolve(handler(...args)).catch(maybeNext);
    } else {
      // Koa / Node
      return (async (...handlerArgs: any[]) => {
        return await handler(...handlerArgs);
      })(...args);
    }
  } as T;
};

export {
  expressMiddleware,
  fastifyMiddleware,
  koaMiddleware,
  honoMiddleware,
  nodeHttpMiddleware,
  createEnvelope,
  validateResponse,
  defaultConfig,
  generateOpenAPIResponse,
  zodToOpenAPISchema,
  withLogging,
  wrapAsync,
};
