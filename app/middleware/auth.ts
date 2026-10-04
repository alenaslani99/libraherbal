// Account pages (/nalog/**): guests go to /prijava and come back after signing in.
export default defineNuxtRouteMiddleware((to) => {
  if (!useAuth().loggedIn.value) {
    return navigateTo({ path: '/prijava', query: { redirect: to.fullPath } })
  }
})
