import { createCharge, findChargeById } from './charges.repository.js';
import { redis } from '../../shared/cache/index.js';
import { publishChargeToProcess } from '../../shared/queue/publisher.js';
import { chargesCreatedTotal } from '../../shared/metrics/index.js';
import type { Charge } from '../../shared/database/schema.js';

export type CreateChargeInput = {
  amount: number;
  currency?: string;
  description?: string;
};

const IDEMPOTENCY_TTL_SECONDS = 86_400; // 24h

export async function handleCreateCharge(
  input: CreateChargeInput,
  idempotencyKey?: string,
): Promise<{ charge: Charge; fromCache: boolean }> {
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw Object.assign(new Error('amount must be a positive integer (in cents)'), { statusCode: 400 });
  }

  if (idempotencyKey) {
    const cached = await redis.get(`idempotency:charges:${idempotencyKey}`);
    if (cached) {
      return { charge: JSON.parse(cached) as Charge, fromCache: true };
    }
  }

  const charge = await createCharge({
    amount: input.amount,
    currency: input.currency ?? 'BRL',
    description: input.description ?? null,
    idempotencyKey: idempotencyKey ?? null,
  });

  if (idempotencyKey) {
    await redis.set(
      `idempotency:charges:${idempotencyKey}`,
      JSON.stringify(charge),
      'EX',
      IDEMPOTENCY_TTL_SECONDS,
    );
  }

  await publishChargeToProcess(charge.id);
  chargesCreatedTotal.inc();

  return { charge, fromCache: false };
}

export async function handleGetCharge(id: string) {
  return findChargeById(id);
}
