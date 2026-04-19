import type { FastifyInstance } from 'fastify';
import { handleCreateCharge, handleGetCharge, type CreateChargeInput } from './charges.service.js';

const createChargeSchema = {
  body: {
    type: 'object',
    required: ['amount'],
    properties: {
      amount: { type: 'integer', minimum: 1, description: 'Value in cents' },
      currency: { type: 'string', minLength: 3, maxLength: 3, default: 'BRL' },
      description: { type: 'string' },
    },
    additionalProperties: false,
  },
  headers: {
    type: 'object',
    properties: {
      'idempotency-key': { type: 'string', maxLength: 255 },
    },
  },
} as const;

export async function chargesRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateChargeInput; Headers: { 'idempotency-key'?: string } }>(
    '/charges',
    { schema: createChargeSchema },
    async (request, reply) => {
      const idempotencyKey = request.headers['idempotency-key'];
      const { charge, fromCache } = await handleCreateCharge(request.body, idempotencyKey);

      if (fromCache) {
        return reply.status(201).header('Idempotent-Replayed', 'true').send(charge);
      }

      return reply.status(201).send(charge);
    },
  );

  app.get<{ Params: { id: string } }>(
    '/charges/:id',
    async (request, reply) => {
      const charge = await handleGetCharge(request.params.id);
      if (!charge) return reply.notFound('Charge not found');
      return reply.send(charge);
    },
  );
}
