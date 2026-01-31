import { Context, Next } from 'koa';
import { createEnvelope } from './envelope';
import { validateResponse } from './validation';
import { MiddlewareOptions } from './types';

export function koaMiddleware(options: MiddlewareOptions = {}) {
  const envelope = createEnvelope(options.config);
  return async function (ctx: Context, next: Next) {
    const startTime = Date.now();
    try {
      await next();
      let error = null;
      let data = ctx.body;
      if (options.validator) {
        const validation = validateResponse(options.validator, ctx.body);
        if (!validation.valid) {
          error = validation.error;
          data = null;
        }
      }
      const wrapped = envelope({
        success: !error,
        data,
        error,
        req: ctx.request,
        startTime,
      });
      if (options.hooks) {
        for (const hook of options.hooks) {
          await hook(wrapped, ctx.request, ctx.response);
        }
      }
      ctx.body = wrapped;
    } catch (err) {
      const wrapped = envelope({
        success: false,
        data: null,
        error: err,
        req: ctx.request,
        startTime,
      });
      if (options.hooks) {
        for (const hook of options.hooks) {
          await hook(wrapped, ctx.request, ctx.response);
        }
      }
      ctx.status = 500;
      ctx.body = wrapped;
    }
  };
}
