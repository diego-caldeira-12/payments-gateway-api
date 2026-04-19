import pino from 'pino';
import type { ConsumeMessage } from 'amqplib';
import { getChannel, QUEUE_CHARGES } from '../../shared/queue/index.js';
import { updateChargeStatus } from './charges.repository.js';
import { dispatchChargeStatusChanged } from '../webhooks/webhooks.dispatcher.js';
import { chargesProcessedTotal } from '../../shared/metrics/index.js';

const logger = pino({ name: 'worker' });

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processMessage(msg: ConsumeMessage): Promise<void> {
  const { chargeId } = JSON.parse(msg.content.toString()) as { chargeId: string };

  logger.info({ chargeId }, 'processing charge');
  const processing = await updateChargeStatus(chargeId, 'processing');
  if (processing) await dispatchChargeStatusChanged(processing);

  await sleep(1500 + Math.random() * 1500);

  const finalStatus = Math.random() < 0.2 ? 'failed' : 'succeeded';
  const final = await updateChargeStatus(chargeId, finalStatus);
  if (final) await dispatchChargeStatusChanged(final);

  chargesProcessedTotal.inc({ status: finalStatus });
  logger.info({ chargeId, status: finalStatus }, 'charge processed');
}

export async function startWorker(): Promise<void> {
  const channel = await getChannel();

  channel.consume(QUEUE_CHARGES, async (msg) => {
    if (!msg) return;
    try {
      await processMessage(msg);
      channel.ack(msg);
    } catch (err) {
      logger.error({ err }, 'failed to process message, requeueing');
      channel.nack(msg, false, true);
    }
  });

  logger.info({ queue: QUEUE_CHARGES }, 'worker listening');
}
