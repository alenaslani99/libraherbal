// POST /api/auth/logout — ends this device's session (others stay signed in).
export default defineEventHandler(async (event) => {
  await deleteSession(event)
  return sendNoContent(event)
})
