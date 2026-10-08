import { newsletterSchema } from '#shared/schemas/engagement'
import type { NewsletterResult } from '#shared/types/engagement'

// One newsletter form (footer or the yellow section). Each form has its own state;
// `done` swaps the form for `doneMessage` (thank you, or "already subscribed").
export function useNewsletter(source: 'footer' | 'section') {
  const email = ref('')
  // honeypot, bound to a hidden input
  const website = ref('')
  const error = ref('')
  const pending = ref(false)
  const done = ref(false)
  const alreadySubscribed = ref(false)

  const doneMessage = computed(() => alreadySubscribed.value
    ? 'Ova adresa je već prijavljena na naš newsletter.'
    : 'Hvala! Prijavili ste se na naš newsletter.')

  // typing again clears the message, so it doesn't sit under a corrected address
  watch(email, () => { error.value = '' })

  async function submit() {
    error.value = ''
    const result = newsletterSchema.safeParse({ email: email.value, source, website: website.value })
    if (!result.success) {
      error.value = result.error.issues[0]!.message
      return
    }
    pending.value = true
    try {
      const res = await $fetch<NewsletterResult>('/api/newsletter', { method: 'POST', body: result.data })
      alreadySubscribed.value = res.alreadySubscribed
      done.value = true
    }
    catch (e) {
      const { fields, message } = apiError(e)
      error.value = fields.email || message
    }
    finally {
      pending.value = false
    }
  }

  return { email, website, error, pending, done, doneMessage, submit }
}
