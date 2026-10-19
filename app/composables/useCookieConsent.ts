// Cookie choices, saved in localStorage. The inline script in nuxt.config (app.head) reads the same key before
// GTM loads, so a returning visitor's choice applies from the first hit. Change both together.
export const COOKIE_CONSENT_KEY = 'libraherbal:cookie-consent:v2'

export interface CookieConsent {
  analytics: boolean // GA4, Clarity → analytics_storage
  marketing: boolean // Meta Pixel → ad_storage, ad_user_data, ad_personalization
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function readCookieConsent(): CookieConsent | null {
  try {
    const saved = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) ?? 'null')
    return saved ? { analytics: !!saved.analytics, marketing: !!saved.marketing } : null
  }
  catch {
    return null
  }
}

// Saves the choice and tells Google Consent Mode v2. The consent_update event is what GTM triggers
// for Meta Pixel and Clarity listen to (the head script sends the same event for a saved choice).
export function saveCookieConsent(consent: CookieConsent) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ ...consent, date: new Date().toISOString() }))
  }
  catch {
    // blocked storage — the choice holds for this visit only
  }
  const analytics = consent.analytics ? 'granted' : 'denied'
  const marketing = consent.marketing ? 'granted' : 'denied'
  window.gtag?.('consent', 'update', {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  })
  window.dataLayer?.push({ event: 'consent_update', consent_analytics: analytics, consent_marketing: marketing })
}

// "Podešavanja kolačića" in the footer reopens the bar with the settings expanded
export function useCookieSettingsRequest() {
  return useState('cookie-settings-request', () => 0)
}
