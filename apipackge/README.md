# api-standardizer

A framework-agnostic middleware/library for Node.js that enforces a consistent JSON response format, validates responses, automatically adds metadata, integrates with observability, and generates OpenAPI/Swagger specs.

## Features

- **Multi-framework support:** Express, Fastify, Koa, Hono, and native Node HTTP
- **Response envelope:** Standard structure `{ success, data, error, meta }`
- **Runtime response validation:** Zod or io-ts schemas
- **Automatic metadata:** Adds `requestId`, `timestamp`, `executionTime`, `apiVersion`
- **Error codes & field errors:** Standardized error codes/messages, field-level errors
- **Pluggable hooks:** Custom transformations/logging
- **Logging & observability:** Pino/Winston integration
- **OpenAPI/Swagger output:** Auto-generates response schemas
- **Async error handling:** Catches and formats unhandled promise rejections
- **Config-driven envelope:** Customizable structure and metadata

## Version Compatibility

- **Node.js:** 18.x (Express, Fastify only), 20.x (all frameworks)
- **Express:** 4.18.x, 5.x
- **Fastify:** 4.x, 5.x
- **Koa:** 2.x (Node 20+)
- **Hono:** 3.x, 4.x (Node 20+)

See `.github/workflows/nodejs.yml` for CI matrix and compatibility details.

## Installation

```sh
npm install api-standardizer
```

## Usage Example (Express)

```ts
import express from 'express';
import { z } from 'zod';
import { expressMiddleware } from 'api-standardizer';

const userSchema = z.object({ id: z.string(), name: z.string() });
const app = express();
app.use(express.json());
app.get('/user', expressMiddleware({ validator: userSchema })(), (req, res) => {
  res.json({ id: '1', name: 'Alice' });
});

app.listen(3000);
```

## License

MIT
