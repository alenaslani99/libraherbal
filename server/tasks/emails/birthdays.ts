// Birthday emails with a 10% code (BTHD…), from 12:00 Serbian time on the user's birthday.
// Runs with the hourly cron (Cloudflare crons are UTC, and noon in Belgrade is 10 or 11 UTC depending on
// daylight saving), and does nothing before 12:00 Belgrade time. From 12:00 to midnight each run sends to
// at most MAX_PER_RUN people who haven't had one this year, so a busy day is spread over a few hours.
// 29 February birthdays get theirs on 28 February in non-leap years.
// Only registered users who didn't unsubscribe from marketing (reminder_emails = 1).
// A birthday coupon made in the last 300 days = already sent this year; if Resend refuses the batch,
// the new coupons are deleted again so the next hour retries.

const PERCENT = 10
const DAYS = 30
const SEND_FROM_HOUR = 12
const MAX_PER_RUN = 50

interface Recipient {
  id: number
  email: string
  first_name: string | null
  unsubscribe_token: string | null
}

// today in Belgrade: hour, year and "MM-DD"
function belgradeNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Belgrade', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).map(p => [p.type, p.value]))
  return { hour: Number(parts.hour), year: Number(parts.year), monthDay: `${parts.month}-${parts.day}` }
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export default defineTask({
  meta: {
    name: 'emails:birthdays',
    description: 'Birthday emails with a discount code',
  },
  async run() {
    const now = belgradeNow()
    if (now.hour < SEND_FROM_HOUR) return { result: 0 }

    const days = now.monthDay === '02-28' && !isLeapYear(now.year) ? ['02-28', '02-29'] : [now.monthDay]
    const db = useDb()
    const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

    // substr(...) matches the expression index idx_users_birthday
    const { results: recipients } = await db.prepare(`
      SELECT u.id, u.email, u.first_name, u.unsubscribe_token
      FROM users u
      WHERE substr(u.birth_date, 6, 5) IN (${days.map((_, i) => `?${i + 1}`).join(', ')})
        AND u.reminder_emails = 1
        AND NOT EXISTS (
          SELECT 1 FROM coupons c WHERE c.user_id = u.id AND c.kind = 'birthday' AND c.created_at > datetime('now', '-300 days')
        )
      LIMIT ${MAX_PER_RUN}
    `).bind(...days).all<Recipient>()
    if (!recipients.length) return { result: 0 }

    await ensureUnsubscribeTokens(db, recipients)
    const product = await loadFeaturedProduct(db)
    const validUntil = couponValidUntil(DAYS)
    const codes: string[] = []
    for (const r of recipients) codes.push(await createCoupon(db, { kind: 'birthday', prefix: 'BTHD', percent: PERCENT, userId: r.id, days: DAYS }))

    let ids: string[] | null = null
    try {
      ids = await sendEmails(recipients.map((r, i) => ({
        from: EMAIL_FROM.birthday,
        to: r.email,
        ...birthdayEmail({
          firstName: r.first_name ?? '',
          code: codes[i]!,
          percent: PERCENT,
          validUntil,
          product,
          unsubscribeUrl: `${siteUrl}/odjava-podsetnika?t=${r.unsubscribe_token}`,
        }, siteUrl),
        headers: unsubscribeHeaders(siteUrl, r.unsubscribe_token!),
      })))
    }
    finally {
      // not sent (Resend refused, or no API key in local dev): the codes go, the next run tries again
      if (!ids) await db.prepare(`DELETE FROM coupons WHERE code IN (${codes.map((_, i) => `?${i + 1}`).join(', ')})`).bind(...codes).run()
    }
    if (!ids) return { result: 0 }

    await db.batch(recipients.map((r, i) => db.prepare(`INSERT INTO email_sends (user_id, kind, resend_id) VALUES (?1, 'birthday', ?2)`).bind(r.id, ids[i] ?? null)))
    return { result: recipients.length }
  },
})
