import { eq } from 'drizzle-orm';
import { db } from '../../shared/database/index.js';
import { webhookEndpoints, type WebhookEndpoint } from '../../shared/database/schema.js';

export async function createWebhookEndpoint(url: string, secret: string): Promise<WebhookEndpoint> {
  const [endpoint] = await db.insert(webhookEndpoints).values({ url, secret }).returning();
  return endpoint;
}

export async function listActiveWebhookEndpoints(): Promise<WebhookEndpoint[]> {
  return db.select().from(webhookEndpoints).where(eq(webhookEndpoints.active, true));
}

export async function deleteWebhookEndpoint(id: string): Promise<boolean> {
  const result = await db
    .update(webhookEndpoints)
    .set({ active: false })
    .where(eq(webhookEndpoints.id, id))
    .returning();
  return result.length > 0;
}
