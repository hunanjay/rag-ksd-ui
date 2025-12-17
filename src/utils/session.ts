/**
 * Session 管理工具 - 使用 localStorage 存储
 */
const SESSION_KEY = 'chat_ksd_session'
const USER_KEY = 'chat_ksd_user'

export interface UserInfo {
  username: string
  is_admin: boolean
  session_id: string
}

export function saveSession(sessionId: string, userInfo: { username: string; is_admin: boolean }): void {
  localStorage.setItem(SESSION_KEY, sessionId)
  localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function getUserInfo(): UserInfo | null {
  const sessionId = getSession()
  const userStr = localStorage.getItem(USER_KEY)
  if (!sessionId || !userStr) {
    return null
  }
  try {
    const userInfo = JSON.parse(userStr)
    return {
      ...userInfo,
      session_id: sessionId,
    }
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isSessionValid(): boolean {
  return getSession() !== null
}
