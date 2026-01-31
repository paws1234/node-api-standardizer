import { IncomingMessage, ServerResponse } from 'http';
import { createEnvelope } from './envelope';
import { validateResponse } from './validation';
import { MiddlewareOptions } from './types';

export function nodeHttpMiddleware(options: MiddlewareOptions = {}) {
  const envelope = createEnvelope(options.config);
  return (req: IncomingMessage, res: ServerResponse, data: any) => {
    const startTime = Date.now();
    let error = null;
    let responseData = data;
    if (options.validator) {
      const validation = validateResponse(options.validator, data);
      if (!validation.valid) {
        error = validation.error;
        responseData = null;
      }
    }
    const wrapped = envelope({
      success: !error,
      data: responseData,
      error,
      req,
      startTime,
    });
    if (options.hooks) {
      options.hooks.forEach(hook => hook(wrapped, req, res));
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(wrapped));
  };
}
