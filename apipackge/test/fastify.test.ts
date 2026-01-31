import 'jest';
import Fastify from 'fastify';
import { z } from 'zod';
import request from 'supertest';
import { fastifyMiddleware } from '../src/fastifyAdapter';


describe('Fastify Adapter', () => {
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
  });
  let fastify: import('fastify').FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    const mw = fastifyMiddleware({ validator: userSchema });
    fastify.addHook('preHandler', mw);
    fastify.get('/user', async (req, reply) => {
      return { id: '1', name: 'Alice' };
    });
    fastify.get('/invalid', async (req, reply) => {
      return { id: 1, name: 'Bob' };
    });
    await fastify.listen({ port: 0 });
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('should return valid envelope for valid data', async () => {
    const res = await request(fastify.server).get('/user');
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ id: '1', name: 'Alice' });
    expect(res.body.error).toBeNull();
    expect(res.body.meta).toBeDefined();
  });

  it('should return error envelope for invalid data', async () => {
    const res = await request(fastify.server).get('/invalid');
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toBeDefined();
    expect(res.body.meta).toBeDefined();
  });
});
