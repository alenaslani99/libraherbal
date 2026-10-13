// Sending email through Resend (domain libraherbal.rs, region eu-west-1).
// The API key is the Worker secret RESEND_API_KEY (`wrangler secret put RESEND_API_KEY`; locally in .dev.vars).
// All senders live here, so marketing mail can move to a subdomain (news.libraherbal.rs) in one place.
export const EMAIL_FROM = {
  reminders: 'Libra Herbal <podsetnik@libraherbal.rs>',
}

export interface EmailMessage {
  from: string
  to: string
  subject: string
  html: string
  text: string
  headers?: Record<string, string>
}

// Resend takes at most 100 emails per batch call
const BATCH_LIMIT = 100

// Sends the messages with one request per 100 (a Worker run may make only a few dozen subrequests).
// Returns Resend's id for each message, in the same order. Throws if Resend refuses a batch;
// in strict mode a batch is all or nothing, so the caller knows exactly what went out.
// Without an API key (local dev) nothing is sent: the messages are logged and null is returned.
export async function sendEmails(messages: EmailMessage[]): Promise<string[] | null> {
  const apiKey = cloudflareEnv()?.RESEND_API_KEY as string | undefined
  if (!apiKey) {
    for (const message of messages) console.info(`[email] RESEND_API_KEY missing, not sent: "${message.subject}" → ${message.to}`)
    return null
  }

  const ids: string[] = []
  for (let i = 0; i < messages.length; i += BATCH_LIMIT) {
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(messages.slice(i, i + BATCH_LIMIT)),
    })
    if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`)
    const { data } = await response.json() as { data: { id: string }[] }
    ids.push(...data.map(item => item.id))
  }
  return ids
}
