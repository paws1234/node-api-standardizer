import { ZodSchema } from 'zod';
import { StandardError } from './types';

export function validateResponse(schema: ZodSchema<any>, data: any): { valid: boolean; error?: StandardError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { valid: true };
  } else {
    // ZodError has an 'issues' array for error details
    const issues = (result.error as any).issues || [];
    return {
      valid: false,
      error: {
        code: 'RESPONSE_VALIDATION_ERROR',
        message: 'Response validation failed',
        fields: issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
          message: e.message,
        })),
      },
    };
  }
}
