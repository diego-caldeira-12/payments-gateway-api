import Fastify from 'fastify';
import sensible from '@fastify/sensible';

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
});

app.register(sensible);

app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
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