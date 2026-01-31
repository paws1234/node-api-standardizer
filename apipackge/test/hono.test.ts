import 'jest';
import { Hono } from 'hono';
import { z } from 'zod';
import { honoMiddleware } from '../src/honoAdapter';

describe('Hono Adapter', () => {
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
  });
  const app = new Hono();

  // Use honoMiddleware as a handler wrapper
  app.get('/user', honoMiddleware({ validator: userSchema })(c => ({ id: '1', name: 'Alice' })));
  app.get('/invalid', honoMiddleware({ validator: userSchema })(c => ({ id: 1, name: 'Bob' })));

  async function honoFetch(path: string) {
    const req = new Request(`http://localhost${path}`);
    return await app.request(req);
  }

  it('should return valid envelope for valid data', async () => {
    const res = await honoFetch('/user');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: '1', name: 'Alice' });
    expect(body.error).toBeNull();
    expect(body.meta).toBeDefined();
  });

  it('should return error envelope for invalid data', async () => {
    const res = await honoFetch('/invalid');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.data).toBeNull();
    expect(body.error).toBeDefined();
    expect(body.meta).toBeDefined();
  });
});
