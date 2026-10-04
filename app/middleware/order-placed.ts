// /hvala: only right after placing an order; anyone else goes to the home page.
export default defineNuxtRouteMiddleware(() => {
  const orderNumber = useLastOrder().value
  if (typeof orderNumber !== 'string' || !ORDER_NUMBER_PATTERN.test(orderNumber)) {
    return navigateTo('/', { replace: true })
  }
})
