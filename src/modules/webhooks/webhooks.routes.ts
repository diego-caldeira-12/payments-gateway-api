import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import {
  createWebhookEndpoint,
  listActiveWebhookEndpoints,
  deleteWebhookEndpoint,
} from './webhooks.repository.js';

export async function webhooksRoutes(app: FastifyInstance) {
  app.post<{ Body: { url: string } }>(
    '/webhooks',
    {
      schema: {
        body: {
          type: 'object',
          required: ['url'],
          properties: { url: { type: 'string', format: 'uri' } },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const secret = randomBytes(32).toString('hex');
      const endpoint = await createWebhookEndpoint(request.body.url, secret);
      return reply.status(201).send({ ...endpoint, secret });
    },
  );

  app.get('/webhooks', async (_request, reply) => {
    const endpoints = await listActiveWebhookEndpoints();
    return reply.send(endpoints);
  });

  app.delete<{ Params: { id: string } }>('/webhooks/:id', async (request, reply) => {
    const deleted = await deleteWebhookEndpoint(request.params.id);
    if (!deleted) return reply.notFound('Webhook endpoint not found');
    return reply.status(204).send();
  });
}
