import type { FastifyInstance } from 'fastify';
import { handleCreateCharge, type CreateChargeInput } from './charges.service.js';
import { handleGetCharge } from './charges.service.js';

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
} as const;

export async function chargesRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateChargeInput }>(
    '/charges',
    { schema: createChargeSchema },
    async (request, reply) => {
      const charge = await handleCreateCharge(request.body);
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
