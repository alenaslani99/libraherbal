// PBKDF2-SHA256 via WebCrypto — native on Workers (bcrypt/argon2 would need WASM).
// 100k iterations is the Workers maximum. Stored as "pbkdf2$<iterations>$<salt hex>$<hash hex>",
// so the parameters can be raised later without breaking existing hashes.
const ITERATIONS = 100_000

// Verified against when the email doesn't exist, so a login takes as long either way
// and response time doesn't reveal which emails have an account.
export const DUMMY_PASSWORD_HASH = `pbkdf2$${ITERATIONS}$${'0'.repeat(32)}$${'0'.repeat(64)}`

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await pbkdf2(password, salt, ITERATIONS)
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(hash)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, salt, hash] = stored.split('$')
  if (scheme !== 'pbkdf2' || !iterations || !salt || !hash) return false
  const actual = await pbkdf2(password, fromHex(salt), Number(iterations))
  return timingSafeEqual(actual, fromHex(hash))
}

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
  return new Uint8Array(bits)
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!
  return diff === 0
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(hex.match(/../g)?.map(h => Number.parseInt(h, 16)) ?? [])
}
