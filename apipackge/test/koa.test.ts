import 'jest';
import Koa from 'koa';
import Router from '@koa/router';
import request from 'supertest';
import { z } from 'zod';
import { koaMiddleware } from '../src/koaAdapter';

describe('Koa Adapter', () => {
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
  });

  it('should handle async errors with wrapAsync', async () => {
    const { wrapAsync } = require('../src/index');
    router.get('/async-error', wrapAsync(async (_ctx: any) => {
      await Promise.reject(new Error('Async fail'));
    }));
    const res = await request(app.callback()).get('/async-error');
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toBeDefined();
    expect(res.body.meta).toBeDefined();
  });
  const app = new Koa();
  const router = new Router();
  app.use(koaMiddleware({ validator: userSchema }));

  router.get('/user', (_ctx: any) => {
    _ctx.body = { id: '1', name: 'Alice' };
  });
  router.get('/invalid', (_ctx: any) => {
    _ctx.body = { id: 1, name: 'Bob' }; // id should be string
  });
  app.use(router.routes());
  app.use(router.allowedMethods());

  it('should return valid envelope for valid data', async () => {
    const res = await request(app.callback()).get('/user');
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ id: '1', name: 'Alice' });
    expect(res.body.error).toBeNull();
    expect(res.body.meta).toBeDefined();
  });

  it('should return error envelope for invalid data', async () => {
    const res = await request(app.callback()).get('/invalid');
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toBeDefined();
    expect(res.body.meta).toBeDefined();
  });
});
