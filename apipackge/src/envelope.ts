// Envelope structure and helpers
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
import { EnvelopeConfig, Envelope, Meta } from './types';

const defaultConfig: EnvelopeConfig = {
  keys: {
    success: 'success',
    data: 'data',
    error: 'error',
    meta: 'meta',
  },
  apiVersion: '1.0.0',
};

export function createEnvelope(config: Partial<EnvelopeConfig> = {}): (args: {
  success: boolean;
  data?: any;
  error?: any;
  req?: any;
  startTime?: number;
}) => Envelope {
  const mergedConfig = { ...defaultConfig, ...config };
  return ({ success, data, error, req, startTime }) => {
    const now = Date.now();
    const meta: Meta = {
      requestId: req?.id || req?.headers?.['x-request-id'] || uuidv4(),
      timestamp: new Date(now).toISOString(),
      executionTime: startTime ? now - startTime : undefined,
      apiVersion: mergedConfig.apiVersion,
    };
    return {
      [mergedConfig.keys.success]: success,
      [mergedConfig.keys.data]: data ?? null,
      [mergedConfig.keys.error]: error ?? null,
      [mergedConfig.keys.meta]: meta,
    };
  };
}
