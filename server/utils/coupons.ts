import type { D1Database } from '@cloudflare/workers-types'

// Discount codes (migrations/0009_coupons.sql): unique, single use, valid until expires_at.
// Amounts are in para (1 RSD = 100), like the DB.

export interface Coupon {
  id: number
  code: string
  percent: number
}

// A code that exists, isn't used and hasn't expired — or the message to show under the field
export async function findCoupon(db: D1Database, code: string): Promise<{ coupon: Coupon } | { error: string }> {
  const row = await db.prepare(`
    SELECT id, code, percent, used_at, expires_at <= datetime('now') AS expired
    FROM coupons WHERE code = ?1
  `).bind(code.trim()).first<Coupon & { used_at: string | null, expired: number }>()

  if (!row) return { error: 'Kod za popust ne postoji.' }
  if (row.used_at) return { error: 'Ovaj kod je već iskorišćen.' }
  if (row.expired) return { error: 'Ovaj kod je istekao.' }
  return { coupon: { id: row.id, code: row.code, percent: row.percent } }
}

// The discount is whole RSD (rounded down), so prices keep printing as "1234,00".
// Free shipping is decided on the amount after the discount.
export function priceCart(subtotal: number, percent = 0) {
  const discount = Math.floor((subtotal * percent) / 100_00) * 100
  const shipping = shippingFor(subtotal - discount)
  return { discount, shipping, total: subtotal - discount + shipping }
}

// Marks the coupon used before the order is saved; false = another order took it first (or it just expired)
export async function claimCoupon(db: D1Database, id: number) {
  const { meta } = await db.prepare(`
    UPDATE coupons SET used_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?1 AND used_at IS NULL AND expires_at > datetime('now')
  `).bind(id).run()
  return meta.changes === 1
}

// Gives the code back when the order it was claimed for couldn't be saved
export async function releaseCoupon(db: D1Database, id: number) {
  await db.prepare(`UPDATE coupons SET used_at = NULL, order_id = NULL, updated_at = datetime('now') WHERE id = ?1`).bind(id).run()
}

// No 0/O/1/I, so a code read off a phone screen can't be mistyped; 32^8 ≈ 1 trillion codes
// (32 divides 256, so byte % 32 picks every character equally often)
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const CODE_LENGTH = 8

function newCouponCode(prefix: string) {
  const random = crypto.getRandomValues(new Uint8Array(CODE_LENGTH))
  return prefix + Array.from(random, byte => ALPHABET[byte % ALPHABET.length]).join('')
}

// New code for one user, e.g. 7K3FQ9MA (welcome) or BTHD7K3FQ9MA (birthday, prefix "BTHD");
// retries on the rare UNIQUE collision
export async function createCoupon(db: D1Database, input: { kind: 'welcome' | 'birthday', prefix?: string, percent: number, userId: number, days: number }) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = newCouponCode(input.prefix ?? '')
    try {
      await db.prepare(`
        INSERT INTO coupons (code, kind, percent, user_id, expires_at)
        VALUES (?1, ?2, ?3, ?4, datetime('now', ?5))
      `).bind(code, input.kind, input.percent, input.userId, `+${input.days} days`).run()
      return code
    }
    catch (error) {
      if (!String(error).includes('UNIQUE constraint failed: coupons.code')) throw error
    }
  }
  throw createError({ statusCode: 500, message: 'Kod za popust nije napravljen.' })
}
