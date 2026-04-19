import type { ConsumeMessage } from 'amqplib';
import { getChannel, QUEUE_CHARGES } from '../../shared/queue/index.js';
import { updateChargeStatus } from './charges.repository.js';

const FAILURE_RATE = 0.2;
const PROCESSING_DELAY_MS = 1500 + Math.random() * 1500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processMessage(msg: ConsumeMessage): Promise<void> {
  const { chargeId } = JSON.parse(msg.content.toString()) as { chargeId: string };

  console.log(`[worker] processing charge ${chargeId}`);
  await updateChargeStatus(chargeId, 'processing');

  await sleep(PROCESSING_DELAY_MS);

  const failed = Math.random() < FAILURE_RATE;
  const finalStatus = failed ? 'failed' : 'succeeded';

  await updateChargeStatus(chargeId, finalStatus);
  console.log(`[worker] charge ${chargeId} → ${finalStatus}`);
}

export async function startWorker(): Promise<void> {
  const channel = await getChannel();

  channel.consume(QUEUE_CHARGES, async (msg) => {
    if (!msg) return;
    try {
      await processMessage(msg);
      channel.ack(msg);
    } catch (err) {
      console.error('[worker] failed to process message, requeueing', err);
      channel.nack(msg, false, true);
    }
  });

  console.log(`[worker] listening on queue "${QUEUE_CHARGES}"`);
}
