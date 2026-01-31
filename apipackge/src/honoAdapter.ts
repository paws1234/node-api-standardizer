import { createEnvelope } from './envelope';
import { validateResponse } from './validation';
import { MiddlewareOptions } from './types';

// Wraps a user handler so the envelope is always applied
export function honoMiddleware(options: MiddlewareOptions = {}) {
  const envelope = createEnvelope(options.config);
  return function wrapHandler(userHandler: (c: any) => any | Promise<any>) {
    return async function (c: any) {
      const startTime = Date.now();
      try {
        let handlerResult = await userHandler(c);
        let data = handlerResult;
        // If the handler returned a Response, extract JSON
        if (handlerResult instanceof Response) {
          try {
            data = await handlerResult.clone().json();
          } catch {
            data = undefined;
          }
        }
        let error = null;
        if (options.validator) {
          const validation = validateResponse(options.validator, data);
          if (!validation.valid) {
            error = validation.error;
            data = null;
          }
        }
        const wrapped = envelope({
          success: !error,
          data,
          error,
          req: c.req,
          startTime,
        });
        if (options.hooks) {
          for (const hook of options.hooks) {
            await hook(wrapped, c.req, c.res);
          }
        }
        return c.json(wrapped, 200);
      } catch (err) {
        const wrapped = envelope({
          success: false,
          data: null,
          error: err,
          req: c.req,
          startTime,
        });
        if (options.hooks) {
          for (const hook of options.hooks) {
            await hook(wrapped, c.req, c.res);
          }
        }
        return c.json(wrapped, 500);
      }
    };
  };
}
