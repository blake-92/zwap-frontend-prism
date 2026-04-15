export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('zwap_token')
  if (!token.value) {
    return navigateTo('/login')
  }
})
