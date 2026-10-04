// Number of the order just placed. Kept for 30 minutes in a cookie (readable during SSR too), so /hvala
// survives a refresh right after ordering but can't be opened by typing the URL.
export function useLastOrder() {
  return useCookie<string | null>('lh_last_order', {
    maxAge: 60 * 30,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
  })
}
