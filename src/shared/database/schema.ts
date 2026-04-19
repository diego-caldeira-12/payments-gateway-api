import { pgEnum, pgTable, integer, varchar, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const chargeStatusEnum = pgEnum('charge_status', [
  'pending',
  'processing',
  'succeeded',
  'failed',
]);

export const charges = pgTable('charges', {
  id: uuid('id').defaultRandom().primaryKey(),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('BRL'),
  description: text('description'),
  status: chargeStatusEnum('status').notNull().default('pending'),
  idempotencyKey: varchar('idempotency_key', { length: 255 }).unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Charge = typeof charges.$inferSelect;
export type NewCharge = typeof charges.$inferInsert;

export const webhookEndpoints = pgTable('webhook_endpoints', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull(),
  secret: varchar('secret', { length: 64 }).notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type WebhookEndpoint = typeof webhookEndpoints.$inferSelect;
