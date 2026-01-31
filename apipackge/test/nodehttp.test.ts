import 'jest';
import http from 'http';
import { z } from 'zod';
import { nodeHttpMiddleware } from '../src/nodeHttpAdapter';

describe('Node HTTP Adapter', () => {
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
  });
  const middleware = nodeHttpMiddleware({ validator: userSchema });


  it('should return valid envelope for valid data', (done: jest.DoneCallback) => {
    makeRequest({ id: '1', name: 'Alice' }, (body) => {
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ id: '1', name: 'Alice' });
      expect(body.error).toBeNull();
      expect(body.meta).toBeDefined();
      done();
    });
  });

  it('should return error envelope for invalid data', (done: jest.DoneCallback) => {
    makeRequest({ id: 1, name: 'Bob' }, (body) => {
      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(body.error).toBeDefined();
      expect(body.meta).toBeDefined();
      done();
    });
  });
  function makeRequest(data: any, callback: (res: any) => void) {
    const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
      middleware(req, res, data);
    });
    server.listen(0, () => {
      const port = (server.address() as any).port;
      http.get({ port, path: '/' }, (res: http.IncomingMessage) => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          server.close();
          callback(JSON.parse(body));
        });
      });
    });
  }
});
