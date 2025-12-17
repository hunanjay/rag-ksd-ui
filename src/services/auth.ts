/**
 * 认证相关的 API 调用
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
}

export interface LoginResponse {
  session_id: string
  username: string
  is_admin: boolean
}

export interface UserInfo {
  user_id: number
  username: string
  is_admin: boolean
  is_active: boolean
}

/**
 * 用户登录
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '登录失败' }))
    throw new Error(error.detail || '登录失败')
  }

  return response.json()
}

/**
 * 用户注册
 */
export async function register(request: RegisterRequest): Promise<{ message: string; user_id: number }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '注册失败' }))
    throw new Error(error.detail || '注册失败')
  }

  return response.json()
}

/**
 * 用户登出
 */
export async function logout(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ session_id: sessionId }),
  })

  if (!response.ok) {
    throw new Error('登出失败')
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(sessionId: string): Promise<UserInfo> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${sessionId}`,
    },
  })

  if (!response.ok) {
    throw new Error('获取用户信息失败')
  }

  return response.json()
}
