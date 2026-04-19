import { eq } from 'drizzle-orm';
import { db } from '../../shared/database/index.js';
import { charges, type NewCharge } from '../../shared/database/schema.js';

export async function createCharge(data: NewCharge) {
  const [charge] = await db.insert(charges).values(data).returning();
  return charge;
}

export async function findChargeById(id: string) {
  const [charge] = await db.select().from(charges).where(eq(charges.id, id));
  return charge ?? null;
}
