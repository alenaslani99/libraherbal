import type { H3Event } from 'h3'
import type { AuthUser } from '#shared/types/auth'

// Sessions are rows in D1, not JWTs, so they can be revoked at any time.
// The cookie holds a random token; the DB only stores its SHA-256, so a leaked
// sessions table can't be used to sign in.
const COOKIE = 'lh_session'
const DAY = 24 * 60 * 60 * 1000

// "Zapamti me": 30 days and a persistent cookie; otherwise 1 day and a cookie that dies with the browser.
// Both slide: once less than half is left, the next request pushes the expiry out again.
function lifetime(remember: boolean) {
  return remember ? 30 * DAY : DAY
}

export interface UserRow {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: AuthUser['role']
}

export const USER_COLUMNS = 'u.id, u.email, u.first_name, u.last_name, u.phone, u.role'

export function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    phone: row.phone ?? '',
    role: row.role,
  }
}

// Signs the user in on this response. Always a fresh token (no session fixation);
// the session the browser had before, if any, is dropped.
export async function createSession(event: H3Event, userId: number, remember: boolean) {
  const db = useDb(event)
  const previous = getCookie(event, COOKIE)
  if (previous) await db.prepare('DELETE FROM sessions WHERE id = ?1').bind(await sha256(previous)).run()

  const token = toHex(crypto.getRandomValues(new Uint8Array(32)))
  const expiresAt = Date.now() + lifetime(remember)
  await db.batch([
    // housekeeping: this user's expired sessions
    db.prepare(`DELETE FROM sessions WHERE user_id = ?1 AND expires_at <= datetime('now')`).bind(userId),
    db.prepare('INSERT INTO sessions (id, user_id, remember, expires_at) VALUES (?1, ?2, ?3, ?4)')
      .bind(await sha256(token), userId, remember ? 1 : 0, toSqlDate(expiresAt)),
  ])
  setSessionCookie(event, token, remember ? expiresAt : null)
  event.context.user = undefined
}

// The signed-in user, or null. Looked up once per request; refreshes a session that is past half its life.
export async function getSessionUser(event: H3Event): Promise<AuthUser | null> {
  if (event.context.user !== undefined) return event.context.user
  event.context.user = null

  const token = getCookie(event, COOKIE)
  if (!token) return null
  if (!/^[0-9a-f]{64}$/.test(token)) {
    clearSessionCookie(event)
    return null
  }

  const id = await sha256(token)
  const db = useDb(event)
  const row = await db.prepare(`
    SELECT s.expires_at, s.remember, ${USER_COLUMNS}
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.id = ?1
  `).bind(id).first<UserRow & { expires_at: string, remember: number }>()

  if (!row) {
    clearSessionCookie(event)
    return null
  }

  const expiresAt = fromSqlDate(row.expires_at)
  if (expiresAt <= Date.now()) {
    await db.prepare('DELETE FROM sessions WHERE id = ?1').bind(id).run()
    clearSessionCookie(event)
    return null
  }

  const remember = row.remember === 1
  if (expiresAt - Date.now() < lifetime(remember) / 2) {
    const next = Date.now() + lifetime(remember)
    await db.prepare(`UPDATE sessions SET expires_at = ?2, updated_at = datetime('now') WHERE id = ?1`)
      .bind(id, toSqlDate(next)).run()
    setSessionCookie(event, token, remember ? next : null)
  }

  event.context.user = toAuthUser(row)
  return event.context.user
}

// Logout: removes the current session.
export async function deleteSession(event: H3Event) {
  const token = getCookie(event, COOKIE)
  if (token) await useDb(event).prepare('DELETE FROM sessions WHERE id = ?1').bind(await sha256(token)).run()
  clearSessionCookie(event)
  event.context.user = null
}

// Signs the user out everywhere: "odjavi se sa svih uređaja", role change by an admin.
export async function deleteUserSessions(event: H3Event, userId: number) {
  await useDb(event).prepare('DELETE FROM sessions WHERE user_id = ?1').bind(userId).run()
}

// Password change: every other device is signed out, this one gets a fresh session
// with the same "Zapamti me" choice.
export async function renewUserSessions(event: H3Event, userId: number) {
  const token = getCookie(event, COOKIE)
  const current = token
    ? await useDb(event).prepare('SELECT remember FROM sessions WHERE id = ?1').bind(await sha256(token)).first<{ remember: number }>()
    : null
  await deleteUserSessions(event, userId)
  await createSession(event, userId, current?.remember === 1)
}

export async function requireUser(event: H3Event): Promise<AuthUser> {
  const user = await getSessionUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Prijavite se da biste nastavili.' })
  return user
}

export async function requireAdmin(event: H3Event): Promise<AuthUser> {
  const user = await requireUser(event)
  if (user.role !== 'admin') throw createError({ statusCode: 403, message: 'Nemate pristup.' })
  return user
}

function setSessionCookie(event: H3Event, token: string, expiresAt: number | null) {
  setCookie(event, COOKIE, token, {
    httpOnly: true,
    // localhost is plain http in dev
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    // no expiry = session cookie, gone when the browser closes
    ...(expiresAt ? { expires: new Date(expiresAt) } : {}),
  })
}

function clearSessionCookie(event: H3Event) {
  if (getCookie(event, COOKIE) === undefined) return
  deleteCookie(event, COOKIE, { httpOnly: true, secure: !import.meta.dev, sameSite: 'lax', path: '/' })
}

async function sha256(text: string): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))))
}

// Same "YYYY-MM-DD HH:MM:SS" (UTC) as datetime('now'), so SQL comparisons work
function toSqlDate(ms: number) {
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ')
}

function fromSqlDate(value: string) {
  return Date.parse(`${value.replace(' ', 'T')}Z`)
}
