import 'dotenv/config';
import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { chargesRoutes } from './modules/charges/charges.routes.js';
import { webhooksRoutes } from './modules/webhooks/webhooks.routes.js';
import { registry } from './shared/metrics/index.js';

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
});

app.register(sensible);
app.register(chargesRoutes);
app.register(webhooksRoutes);

app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

app.get('/metrics', async (_request, reply) => {
  reply.header('Content-Type', registry.contentType);
  return reply.send(await registry.metrics());
});

const PORT = Number(process.env.PORT) || 3000;

app.listen({ port: PORT, host: '0.0.0.0' })
  .then(() => {
    app.log.info(`Server running on http://localhost:${PORT}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
