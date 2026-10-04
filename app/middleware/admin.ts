// /admin/**: anyone who isn't an admin gets the regular 404, so the panel doesn't reveal it exists.
// Hard loads are already answered with a 404 by server/middleware/03.admin.ts; this covers in-app navigation.
export default defineNuxtRouteMiddleware(() => {
  if (!useAuth().isAdmin.value) {
    return abortNavigation(createError({ statusCode: 404, statusMessage: 'Page Not Found' }))
  }
})
