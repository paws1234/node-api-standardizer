import { ZodSchema } from 'zod';
import { EnvelopeConfig, Envelope } from './types';

// Utility to convert Zod schema to OpenAPI schema (basic version)
export function zodToOpenAPISchema(zodSchema: ZodSchema<any>): any {
  // For a production library, use zod-to-openapi or similar package
  // Here, we just return the shape for demonstration
  return (zodSchema as any).shape ? (zodSchema as any).shape : {};
}

export function generateOpenAPIResponse({
  zodSchema,
  config,
  description = '',
}: {
  zodSchema: ZodSchema<any>;
  config?: Partial<EnvelopeConfig>;
  description?: string;
}) {
  // Envelope keys
  const keys = { ...((config && config.keys) || {}), success: 'success', data: 'data', error: 'error', meta: 'meta' };
  return {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            [keys.success]: { type: 'boolean' },
            [keys.data]: zodToOpenAPISchema(zodSchema),
            [keys.error]: { type: 'object' },
            [keys.meta]: { type: 'object' },
          },
        },
      },
    },
  };
}
