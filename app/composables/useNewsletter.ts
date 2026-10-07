import { newsletterSchema } from '#shared/schemas/engagement'

// One newsletter form (footer or the yellow section). Each form has its own state;
// `done` swaps the form for a thank-you line.
export function useNewsletter(source: 'footer' | 'section') {
  const email = ref('')
  // honeypot, bound to a hidden input
  const website = ref('')
  const error = ref('')
  const pending = ref(false)
  const done = ref(false)

  async function submit() {
    error.value = ''
    const result = newsletterSchema.safeParse({ email: email.value, source, website: website.value })
    if (!result.success) {
      error.value = result.error.issues[0]!.message
      return
    }
    pending.value = true
    try {
      await $fetch('/api/newsletter', { method: 'POST', body: result.data })
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

  return { email, website, error, pending, done, submit }
}
