// POST /api/products/:slug/view — a signed-in user spent a while on this product page
// (the browser sends it after ~10 s on the page, once per product per day; see useTrackProductView).
// Guests are ignored: without an email there is nobody to remind.
// A repeat view within 6 h writes nothing, so D1 isn't billed for every page open.
export default defineEventHandler(async (event) => {
  setResponseStatus(event, 204)
  const user = await getSessionUser(event)
  if (!user) return

  const slug = getRouterParam(event, 'slug')
  if (!slug || slug.length > 200) return

  await useDb(event).prepare(`
    INSERT INTO product_views (user_id, product_id)
    SELECT ?1, id FROM products WHERE slug = ?2 AND is_active = 1
    ON CONFLICT (user_id, product_id) DO UPDATE SET viewed_at = datetime('now')
    WHERE product_views.viewed_at < datetime('now', '-6 hours')
  `).bind(user.id, slug).run()
})
