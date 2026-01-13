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

export interface MicrosoftLoginResponse {
  access_token: string
  id_token: string
  token_type: string
  expires_in: number
  username: string
  email?: string
  is_admin: boolean
  avatar_url?: string
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

/**
 * 获取 Microsoft 登录授权 URL
 */
export async function getMicrosoftAuthUrl(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/microsoft/login`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error('获取 Microsoft 登录链接失败')
  }

  const data = await response.json()
  return data.auth_url
}

/**
 * Microsoft 登录回调处理
 * 注意：这个函数通常在回调页面被调用，用于解析 URL 参数并获取 session
 */
export async function handleMicrosoftCallback(code: string, state: string): Promise<MicrosoftLoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/microsoft/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
    {
      method: 'GET',
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Microsoft 登录失败' }))
    throw new Error(error.detail || 'Microsoft 登录失败')
  }

  return response.json()
}

/**
 * 检查 Microsoft OAuth 配置状态
 */
export async function getMicrosoftAuthStatus(): Promise<{ configured: boolean }> {
  const response = await fetch(`${API_BASE_URL}/auth/microsoft/status`, {
    method: 'GET',
  })

  if (!response.ok) {
    return { configured: false }
  }

  return response.json()
}
