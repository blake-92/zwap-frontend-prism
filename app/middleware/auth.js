import { isSafeInternalPath } from '~/utils/routes'

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('zwap_token', {
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
  })
  if (!token.value) {
    const candidate = to.fullPath
    const redirect = candidate && candidate !== '/' && isSafeInternalPath(candidate) ? candidate : undefined
    return navigateTo({
      path: '/login',
      query: redirect ? { redirect } : undefined,
    })
  }
})
