import 'dotenv/config';
import { startWorker } from './modules/charges/charges.worker.js';

startWorker().catch((err) => {
  console.error('[worker] fatal error', err);
  process.exit(1);
});
