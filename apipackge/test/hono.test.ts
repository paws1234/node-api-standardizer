import 'jest';
import { Hono } from 'hono';
import { z } from 'zod';
import { honoMiddleware } from '../src/honoAdapter';

describe('Hono Adapter', () => {
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
  });

  it('should return valid envelope for valid data', async () => {
    const app = new Hono();
    const wrapAsync = require('../src/index').wrapAsync;
    app.get('/user', honoMiddleware({ validator: userSchema })((_c: any) => ({ id: '1', name: 'Alice' })));
    const req = new Request('http://localhost/user');
    const res = await app.request(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: '1', name: 'Alice' });
    expect(body.error).toBeNull();
    expect(body.meta).toBeDefined();
  });

  it('should handle async errors', async () => {
    const app = new Hono();

    app.get('/async-error', honoMiddleware()((_c: any) => {
        throw new Error('Async fail');
    }));

    const req = new Request('http://localhost/async-error');
    const res = await app.request(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.data).toBeNull();
    expect(body.error).toBeDefined();
    expect(body.meta).toBeDefined();
    });


  it('should return error envelope for invalid data', async () => {
    const app = new Hono();
    const wrapAsync = require('../src/index').wrapAsync;
    app.get('/invalid', honoMiddleware({ validator: userSchema })((_c: any) => ({ id: 1, name: 'Bob' })));
    const req = new Request('http://localhost/invalid');
    const res = await app.request(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.data).toBeNull();
    expect(body.error).toBeDefined();
    expect(body.meta).toBeDefined();
  });
});
