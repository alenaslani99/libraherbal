import { heroSchema } from '#shared/schemas/site'

// PUT /api/admin/hero — the whole hero
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const hero = await readValidatedForm(event, heroSchema)

  await useDb(event).prepare(`
    INSERT INTO site_settings (key, value) VALUES ('hero', ?1)
    ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `).bind(JSON.stringify(hero)).run()

  return { ok: true }
})
