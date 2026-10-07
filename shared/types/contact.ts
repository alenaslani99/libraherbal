// /kontakt messages in the admin (/admin/poruke)

export type ContactMessageStatus = 'new' | 'read' | 'answered'

export interface AdminContactMessage {
  id: number
  name: string
  email: string
  // '' = not given
  phone: string
  message: string
  status: ContactMessageStatus
  // sent while signed in
  registered: boolean
  // ISO
  createdAt: string
}

// GET /api/admin/messages — one page plus how many there are per status (for the filter tabs)
export interface AdminContactMessageList {
  messages: AdminContactMessage[]
  // messages matching status + search
  total: number
  page: number
  pageSize: number
  // per status for the current search; `all` = every status
  counts: Record<ContactMessageStatus | 'all', number>
}
