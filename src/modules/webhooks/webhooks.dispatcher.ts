import { createHmac } from 'node:crypto';
import { listActiveWebhookEndpoints } from './webhooks.repository.js';
import type { Charge } from '../../shared/database/schema.js';

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 1_000;

type WebhookEvent = {
  event: 'charge.status_changed';
  data: Charge;
  timestamp: string;
};

function sign(secret: string, body: string): string {
  return 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
}

async function deliverWithRetry(url: string, secret: string, body: string): Promise<void> {
  const signature = sign(secret, body);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
        body,
        signal: AbortSignal.timeout(5_000),
      });

      if (res.ok) return;

      console.warn(`[webhook] ${url} responded ${res.status} (attempt ${attempt})`);
    } catch (err) {
      console.warn(`[webhook] ${url} unreachable (attempt ${attempt})`, err);
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, BASE_DELAY_MS * 2 ** (attempt - 1)));
    }
  }

  console.error(`[webhook] giving up on ${url} after ${MAX_ATTEMPTS} attempts`);
}

export async function dispatchChargeStatusChanged(charge: Charge): Promise<void> {
  const endpoints = await listActiveWebhookEndpoints();
  if (endpoints.length === 0) return;

  const event: WebhookEvent = {
    event: 'charge.status_changed',
    data: charge,
    timestamp: new Date().toISOString(),
  };
  const body = JSON.stringify(event);

  await Promise.allSettled(
    endpoints.map((ep) => deliverWithRetry(ep.url, ep.secret, body)),
  );
}
