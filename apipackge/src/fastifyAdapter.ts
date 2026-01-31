import { FastifyReply, FastifyRequest } from 'fastify';
import { createEnvelope } from './envelope';
import { validateResponse } from './validation';
import { MiddlewareOptions } from './types';

export function fastifyMiddleware(options: MiddlewareOptions = {}) {
  const envelope = createEnvelope(options.config);
  return async function (req: FastifyRequest, reply: FastifyReply) {
    const startTime = Date.now();
    const originalSend = reply.send.bind(reply);
    reply.send = (payload: any) => {
      let error = null;
      let data = payload;
      if (options.validator) {
        const validation = validateResponse(options.validator, payload);
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
        options.hooks.forEach(hook => hook(wrapped, req, reply));
      }
      return originalSend(wrapped);
    };
    try {
      await Promise.resolve(); // allow handler to run
    } catch (err) {
      const wrapped = envelope({
        success: false,
        data: null,
        error: err,
        req,
        startTime,
      });
      if (options.hooks) {
        options.hooks.forEach(hook => hook(wrapped, req, reply));
      }
      return reply.status(500).send(wrapped);
    }
  };
}
