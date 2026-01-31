
# api-standardizer

## Purpose

A framework-agnostic middleware/library for Node.js that enforces a consistent JSON response format, validates responses, automatically adds metadata, integrates with observability, and generates OpenAPI/Swagger specs.

## Core Features

| Feature                        | Description                                                                                       |
|--------------------------------|---------------------------------------------------------------------------------------------------|
| Multi-framework support        | Works with Express, Fastify, Koa, Hono, and native Node HTTP servers.                             |
| Response envelope              | Wraps all responses in a standard structure `{ success, data, error, meta }`.                     |
| Runtime response validation    | Uses Zod or io-ts schemas to validate responses before sending.                                   |
| Automatic metadata             | Adds `requestId`, `timestamp`, `executionTime`, `apiVersion` automatically.                      |
| Error codes & field errors     | Standardizes error codes, messages, optional fields array for validation errors.                  |
| Pluggable hooks                | Allows custom transformations per client type (e.g., mobile/web) or API version.                 |
| Logging & observability        | Optional Pino/Winston hooks for automatic logging of response and errors.                         |
| OpenAPI/Swagger output         | Automatically generates response schemas for documentation.                                       |
| Async error handling           | Wraps async route handlers to catch unhandled promise rejections and format them automatically.   |
| Config-driven envelope         | Developers can change structure shape, keys, or metadata via config.                              |

## Version Compatibility

This package is tested and compatible with:

- **Node.js:** 18.x (Express, Fastify only), 20.x (all frameworks)
- **Express:** 4.18.x, 5.x
- **Fastify:** 4.x, 5.x
- **Koa:** 2.x (Node 20+)
- **Hono:** 3.x, 4.x (Node 20+)

See `.github/workflows/nodejs.yml` for CI matrix and compatibility details.
