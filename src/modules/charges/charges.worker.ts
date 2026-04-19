import type { ConsumeMessage } from 'amqplib';
import { getChannel, QUEUE_CHARGES } from '../../shared/queue/index.js';
import { updateChargeStatus } from './charges.repository.js';
import { dispatchChargeStatusChanged } from '../webhooks/webhooks.dispatcher.js';

const FAILURE_RATE = 0.2;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processMessage(msg: ConsumeMessage): Promise<void> {
  const { chargeId } = JSON.parse(msg.content.toString()) as { chargeId: string };

  console.log(`[worker] processing charge ${chargeId}`);
  const processing = await updateChargeStatus(chargeId, 'processing');
  if (processing) await dispatchChargeStatusChanged(processing);

  await sleep(1500 + Math.random() * 1500);

  const finalStatus = Math.random() < FAILURE_RATE ? 'failed' : 'succeeded';
  const final = await updateChargeStatus(chargeId, finalStatus);
  if (final) await dispatchChargeStatusChanged(final);

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
