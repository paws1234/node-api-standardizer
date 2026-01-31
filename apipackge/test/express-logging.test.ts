import 'jest';
import express  from 'express';
import { z } from 'zod';
import request from 'supertest';
import { expressMiddleware } from '../src/expressAdapter';
import { withLogging } from '../src/logging';

describe('Express Logging Adapter', () => {
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
  });

  it('should handle async errors with wrapAsync', async () => {
    const res = await request(server).get('/async-error');
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toBeDefined();
    expect(res.body.meta).toBeDefined();
  });
  const loggerHook = withLogging({ logger: 'pino' });
  const mw = expressMiddleware({ validator: userSchema, hooks: [loggerHook] });
  let app: import('express').Express;
  let server: import('http').Server;

  beforeAll((done: jest.DoneCallback) => {
    const { wrapAsync } = require('../src/index');
    app = express();
    app.use(express.json());
    app.get('/user', mw(), (_req: express.Request, _res: express.Response) => {
      _res.json({ id: '1', name: 'Alice' });
    });
    app.get('/invalid', mw(), (_req: express.Request, _res: express.Response) => {
      _res.json({ id: 1, name: 'Bob' });
    });
    app.get('/async-error', wrapAsync(async (_req: express.Request, _res: express.Response) => {
      await Promise.reject(new Error('Async fail'));
    }));
    // Add error-handling middleware
    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      res.status(200).json({
        success: false,
        data: null,
        error: { message: err.message },
        meta: {},
      });
    });
    server = app.listen(0, done);
  });

  afterAll((done: jest.DoneCallback) => {
    server.close(done);
  });

  it('should return valid envelope for valid data', async () => {
    const res = await request(server).get('/user');
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ id: '1', name: 'Alice' });
    expect(res.body.error).toBeNull();
    expect(res.body.meta).toBeDefined();
  });

  it('should return error envelope for invalid data', async () => {
    const res = await request(server).get('/invalid');
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toBeDefined();
    expect(res.body.meta).toBeDefined();
  });
});
