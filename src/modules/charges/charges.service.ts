import { createCharge, findChargeById } from './charges.repository.js';

export type CreateChargeInput = {
  amount: number;
  currency?: string;
  description?: string;
};

export async function handleCreateCharge(input: CreateChargeInput) {
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw Object.assign(new Error('amount must be a positive integer (in cents)'), { statusCode: 400 });
  }

  return createCharge({
    amount: input.amount,
    currency: input.currency ?? 'BRL',
    description: input.description ?? null,
  });
}

export async function handleGetCharge(id: string) {
  return findChargeById(id);
}
