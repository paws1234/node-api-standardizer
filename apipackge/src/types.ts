import { ZodSchema } from 'zod';

export interface EnvelopeConfig {
  keys: {
    success: string;
    data: string;
    error: string;
    meta: string;
  };
  apiVersion: string;
}

export interface Meta {
  requestId: string;
  timestamp: string;
  executionTime?: number;
  apiVersion: string;
}

export interface Envelope {
  [key: string]: any;
}

export interface ErrorField {
  field: string;
  message: string;
}

export interface StandardError {
  code: string;
  message: string;
  fields?: ErrorField[];
}

export type ResponseValidator = ZodSchema<any>;

export type Hook = (envelope: Envelope, req: any, res: any) => void | Promise<void>;

export interface MiddlewareOptions {
  config?: Partial<EnvelopeConfig>;
  validator?: ResponseValidator;
  hooks?: Hook[];
}
