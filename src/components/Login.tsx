import { useState, useEffect } from 'react'
import { login, register, getMicrosoftAuthUrl, getMicrosoftAuthStatus, type LoginRequest, type RegisterRequest } from '../services/auth'
import { saveSession } from '../utils/session'
import './Login.css'

interface LoginProps {
  onLoginSuccess: () => void
}

function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [microsoftConfigured, setMicrosoftConfigured] = useState(false)

  // 检查 Microsoft OAuth 是否配置
  useEffect(() => {
    const checkMicrosoftAuth = async () => {
      try {
        const status = await getMicrosoftAuthStatus()
        setMicrosoftConfigured(status.configured)
      } catch (err) {
        console.error('检查 Microsoft 配置失败:', err)
      }
    }
    checkMicrosoftAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        // 登录
        const request: LoginRequest = { username, password }
        const response = await login(request)
        saveSession(response.session_id, {
          username: response.username,
          is_admin: response.is_admin,
        })
        onLoginSuccess()
      } else {
        // 注册
        const request: RegisterRequest = { username, password, email: email || undefined }
        await register(request)
        // 注册成功后自动登录
        const loginResponse = await login({ username, password })
        saveSession(loginResponse.session_id, {
          username: loginResponse.username,
          is_admin: loginResponse.is_admin,
        })
        onLoginSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    setError(null)
    setLoading(true)
    
    try {
      const authUrl = await getMicrosoftAuthUrl()
      // 直接重定向到 Microsoft 登录页面
      // 回调会由 /microsoft-callback.html 处理
      window.location.href = authUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microsoft 登录失败')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Chat-Ksd</h1>
          <p className="login-subtitle">
            {isLogin ? '欢迎回来' : '创建新账户'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              用户名
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                邮箱（可选）
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                disabled={loading}
                autoComplete="email"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              密码
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              disabled={loading}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || !username || !password}
          >
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        {microsoftConfigured && isLogin && (
          <>
            <div className="login-divider">
              <span>或</span>
            </div>
            <button
              type="button"
              className="microsoft-login-button"
              onClick={handleMicrosoftLogin}
              disabled={loading}
            >
              <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              使用 Microsoft 账户登录
            </button>
          </>
        )}

        <div className="login-footer">
          <button
            type="button"
            className="login-switch"
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
              setPassword('')
              setEmail('')
            }}
            disabled={loading}
          >
            {isLogin ? '还没有账户？立即注册' : '已有账户？立即登录'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
