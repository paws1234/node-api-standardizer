import 'jest';
import Fastify from 'fastify';
import { z } from 'zod';
import { fastifyMiddleware } from '../src/fastifyAdapter';

describe('Fastify Adapter', () => {
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
  });

  let fastify: ReturnType<typeof Fastify>;

  afterEach(async () => {
    if (fastify) await fastify.close();
  });

  it('should handle async errors with wrapAsync', async () => {
    const { wrapAsync } = require('../src/index');

    fastify = Fastify();
    const mw = fastifyMiddleware({ validator: userSchema });
    fastify.addHook('preHandler', mw);

    fastify.get(
      '/async-error',
      wrapAsync(async (_req: any, _reply: any) => {
        throw new Error('Async fail');
      })
    );

    fastify.setErrorHandler((err: any, _req: any, reply: any) => {
      reply.status(200).send({
        success: false,
        data: null,
        error: { message: err.message },
        meta: {},
      });
    });

    await fastify.listen({ port: 0 });
    await fastify.ready();

    const res = await fastify.inject({
      method: 'GET',
      url: '/async-error',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.data).toBeNull();
    expect(body.error).toBeDefined();
    expect(body.meta).toBeDefined();
  });

  it('should return valid envelope for valid data', async () => {
    fastify = Fastify();
    const mw = fastifyMiddleware({ validator: userSchema });
    fastify.addHook('preHandler', mw);

    fastify.get('/user', async (_req: any, _reply: any) => {
      return { id: '1', name: 'Alice' };
    });

    const res = await fastify.inject({
      method: 'GET',
      url: '/user',
    });

    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: '1', name: 'Alice' });
    expect(body.error).toBeNull();
    expect(body.meta).toBeDefined();
  });

  it('should return error envelope for invalid data', async () => {
    fastify = Fastify();
    const mw = fastifyMiddleware({ validator: userSchema });
    fastify.addHook('preHandler', mw);

    fastify.get('/invalid', async (_req: any, _reply: any) => {
      return { id: 1, name: 'Bob' };
    });

    const res = await fastify.inject({
      method: 'GET',
      url: '/invalid',
    });

    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.data).toBeNull();
    expect(body.error).toBeDefined();
    expect(body.meta).toBeDefined();
  });
});
