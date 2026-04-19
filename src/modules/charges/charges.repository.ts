import { eq } from 'drizzle-orm';
import { db } from '../../shared/database/index.js';
import { charges, type NewCharge, type Charge } from '../../shared/database/schema.js';

type ChargeStatus = Charge['status'];

export async function createCharge(data: NewCharge) {
  const [charge] = await db.insert(charges).values(data).returning();
  return charge;
}

export async function findChargeById(id: string) {
  const [charge] = await db.select().from(charges).where(eq(charges.id, id));
  return charge ?? null;
}

export async function updateChargeStatus(id: string, status: ChargeStatus) {
  const [charge] = await db
    .update(charges)
    .set({ status, updatedAt: new Date() })
    .where(eq(charges.id, id))
    .returning();
  return charge ?? null;
}
