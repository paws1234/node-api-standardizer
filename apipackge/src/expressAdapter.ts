import { Request, Response, NextFunction } from 'express';
import { createEnvelope } from './envelope';
import { validateResponse } from './validation';
import { MiddlewareOptions } from './types';

export function expressMiddleware(options: MiddlewareOptions = {}) {
  const envelope = createEnvelope(options.config);
  return function (schema?: any) {
    return async function (req: Request, res: Response, next: NextFunction) {
      const startTime = Date.now();
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        let error = null;
        let data = body;
        if (options.validator) {
          const validation = validateResponse(options.validator, body);
          if (!validation.valid) {
            error = validation.error;
            data = null;
          }
        }
        const wrapped = envelope({
          success: !error,
          data,
          error,
          req,
          startTime,
        });
        if (options.hooks) {
          options.hooks.forEach(hook => hook(wrapped, req, res));
        }
        return originalJson(wrapped);
      };
      try {
        await next();
      } catch (err) {
        const wrapped = envelope({
          success: false,
          data: null,
          error: err,
          req,
          startTime,
        });
        if (options.hooks) {
          options.hooks.forEach(hook => hook(wrapped, req, res));
        }
        return res.status(500).json(wrapped);
      }
    };
  };
}
