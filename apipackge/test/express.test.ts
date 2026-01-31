import 'jest';
import express from 'express';
import { z } from 'zod';
import request from 'supertest';
import { expressMiddleware } from '../src/expressAdapter';

describe('Express Adapter', () => {
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
  });
  const mw = expressMiddleware({ validator: userSchema });
  let app: import('express').Express;
  let server: import('http').Server;

  beforeAll((done: jest.DoneCallback) => {
    app = express();
    app.use(express.json());
    app.get('/user', mw(), (req, res) => {
      res.json({ id: '1', name: 'Alice' });
    });
    app.get('/invalid', mw(), (req, res) => {
      res.json({ id: 1, name: 'Bob' });
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
