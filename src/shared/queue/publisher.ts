import { getChannel, QUEUE_CHARGES } from './index.js';

export async function publishChargeToProcess(chargeId: string): Promise<void> {
  const channel = await getChannel();
  channel.sendToQueue(
    QUEUE_CHARGES,
    Buffer.from(JSON.stringify({ chargeId })),
    { persistent: true },
  );
}
