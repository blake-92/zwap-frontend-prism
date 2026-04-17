export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('zwap_token', {
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
  })
  if (!token.value) {
    const redirect = to.fullPath && to.fullPath !== '/' ? to.fullPath : undefined
    return navigateTo({
      path: '/login',
      query: redirect ? { redirect } : undefined,
    })
  }
})
