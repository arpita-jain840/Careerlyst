const TOKEN_KEY = 'careerlyst_access_token'
const USER_KEY = 'careerlyst_user'

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getAuthUser() {
  try {
    const value = localStorage.getItem(USER_KEY)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function setAuthSession(session) {
  if (!session?.access_token) throw new Error('The server did not return a login token.')
  localStorage.setItem(TOKEN_KEY, session.access_token)
  if (session.user) localStorage.setItem(USER_KEY, JSON.stringify(session.user))
  window.dispatchEvent(new Event('careerlyst:auth-updated'))
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('careerlyst:auth-updated'))
}
