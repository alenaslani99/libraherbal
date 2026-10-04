// /prijava and /registracija: nothing to do there when already signed in.
export default defineNuxtRouteMiddleware(() => {
  if (useAuth().loggedIn.value) return navigateTo('/')
})
