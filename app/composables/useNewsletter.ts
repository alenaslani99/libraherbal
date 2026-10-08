import { newsletterSchema } from '#shared/schemas/engagement'
import type { NewsletterResult } from '#shared/types/engagement'

// One newsletter form (footer or the yellow section). Each form has its own state.
// Guests type an address; signed-in users get a one-click button for their account email,
// or just "already subscribed" when they're on the list (known at render, from useAuth).
// `message` replaces the form after sign-up — the form stays hidden behind it, so nothing shifts.
export function useNewsletter(source: 'footer' | 'section') {
  const { user } = useAuth()
  const email = ref('')
  // honeypot, bound to a hidden input
  const website = ref('')
  const error = ref('')
  const pending = ref(false)
  // this form was just submitted
  const done = ref(false)
  const alreadySubscribed = ref(false)

  // signed in and on the list: no form at all (a sign-up in the other form counts too)
  const subscribed = computed(() => !done.value && !!user.value?.subscribed)

  const message = computed(() => {
    if (done.value) {
      return alreadySubscribed.value
        ? 'Ova adresa je već prijavljena na naš newsletter.'
        : 'Hvala! Prijavili ste se na naš newsletter.'
    }
    return subscribed.value ? 'Već ste prijavljeni na naš newsletter.' : ''
  })

  // typing again clears the message, so it doesn't sit under a corrected address
  watch(email, () => { error.value = '' })

  async function submit() {
    error.value = ''
    const result = newsletterSchema.safeParse({ email: user.value?.email ?? email.value, source, website: website.value })
    if (!result.success) {
      error.value = result.error.issues[0]!.message
      return
    }
    pending.value = true
    try {
      const res = await $fetch<NewsletterResult>('/api/newsletter', { method: 'POST', body: result.data })
      alreadySubscribed.value = res.alreadySubscribed
      done.value = true
      if (user.value) user.value.subscribed = true
    }
    catch (e) {
      const { fields, message } = apiError(e)
      error.value = fields.email || message
    }
    finally {
      pending.value = false
    }
  }

  return { user, email, website, error, pending, done, subscribed, message, submit }
}
