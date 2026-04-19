import { Registry, Counter, Histogram, collectDefaultMetrics } from 'prom-client';

export const registry = new Registry();

collectDefaultMetrics({ register: registry });

export const chargesCreatedTotal = new Counter({
  name: 'charges_created_total',
  help: 'Total number of charges created',
  registers: [registry],
});

export const chargesProcessedTotal = new Counter({
  name: 'charges_processed_total',
  help: 'Total number of charges processed by the worker',
  labelNames: ['status'] as const,
  registers: [registry],
});

export const webhookDispatchTotal = new Counter({
  name: 'webhook_dispatch_total',
  help: 'Total webhook dispatch attempts',
  labelNames: ['outcome'] as const,
  registers: [registry],
});

export const webhookDispatchDuration = new Histogram({
  name: 'webhook_dispatch_duration_seconds',
  help: 'Duration of webhook HTTP deliveries',
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [registry],
});
