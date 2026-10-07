import type { AdminContactMessageList, ContactMessageStatus } from '#shared/types/contact'

const PAGE_SIZE = 25
const STATUSES: ContactMessageStatus[] = ['new', 'read', 'answered']

// GET /api/admin/messages?status=new&q=jelena&page=2 — /kontakt messages, newest first, 25 per page.
// q matches the name, email, phone or the message itself; the per-status counts follow q, not status.
export default defineEventHandler(async (event): Promise<AdminContactMessageList> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const query = getQuery(event)
  const status = STATUSES.includes(query.status as ContactMessageStatus) ? query.status as ContactMessageStatus : ''
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : ''
  const page = pageParam(query.page)
  const like = likePattern(q)

  const search = `(?1 = '' OR name LIKE ?1 ESCAPE '\\' OR email LIKE ?1 ESCAPE '\\'
                   OR phone LIKE ?1 ESCAPE '\\' OR message LIKE ?1 ESCAPE '\\')`

  const db = useDb(event)
  const [rows, counts] = await db.batch([
    db.prepare(`
      SELECT id, user_id, name, email, phone, message, status, created_at
      FROM contact_messages
      WHERE ${search} AND (?2 = '' OR status = ?2)
      ORDER BY created_at DESC, id DESC
      LIMIT ?3 OFFSET ?4
    `).bind(like, status, PAGE_SIZE, (page - 1) * PAGE_SIZE),
    db.prepare(`SELECT status, COUNT(*) AS n FROM contact_messages WHERE ${search} GROUP BY status`).bind(like),
  ])

  const perStatus = Object.fromEntries(STATUSES.map(s => [s, 0])) as Record<ContactMessageStatus, number>
  for (const row of counts!.results as { status: ContactMessageStatus, n: number }[]) perStatus[row.status] = row.n
  const all = STATUSES.reduce((sum, s) => sum + perStatus[s], 0)

  return {
    messages: (rows!.results as {
      id: number
      user_id: number | null
      name: string
      email: string
      phone: string | null
      message: string
      status: ContactMessageStatus
      created_at: string
    }[]).map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone ?? '',
      message: row.message,
      status: row.status,
      registered: row.user_id !== null,
      // D1 stores 'YYYY-MM-DD HH:MM:SS' in UTC
      createdAt: `${row.created_at.replace(' ', 'T')}Z`,
    })),
    total: status ? perStatus[status] : all,
    page,
    pageSize: PAGE_SIZE,
    counts: { all, ...perStatus },
  }
})
