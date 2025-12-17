import { useEffect, useState } from 'react'
import ChatInterface from './components/ChatInterface'
import Login from './components/Login'
import { isSessionValid, getUserInfo, clearSession } from './utils/session'
import { logout, getCurrentUser } from './services/auth'
import type { UserInfo } from './services/auth'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function App() {
  const [agents, setAgents] = useState<string[]>([])
  const [healthStatus, setHealthStatus] = useState<'unknown' | 'ok' | 'error'>('unknown')
  const [activePage, setActivePage] = useState<'chat-ksd'>('chat-ksd')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // 检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      if (!isSessionValid()) {
        setCheckingAuth(false)
        return
      }

      const sessionInfo = getUserInfo()
      if (!sessionInfo) {
        clearSession()
        setCheckingAuth(false)
        return
      }

      try {
        // 验证 session 是否有效
        const user = await getCurrentUser(sessionInfo.session_id)
        setUserInfo(user)
        setIsAuthenticated(true)
      } catch (e) {
        // Session 无效，清除本地存储
        clearSession()
        setIsAuthenticated(false)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    // 加载 Agent 列表
    const fetchAgents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chat/agents`)
        if (res.ok) {
          const data = await res.json()
          setAgents(data.agents || [])
        }
      } catch (e) {
        console.error('加载 agents 失败', e)
      }
    }

    // 检查后端健康状态
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`)
        if (res.ok) {
          const data = await res.json()
          setHealthStatus(data.status === 'ok' ? 'ok' : 'error')
        } else {
          setHealthStatus('error')
        }
      } catch (e) {
        console.error('检查后端健康状态失败', e)
        setHealthStatus('error')
      }
    }

    fetchAgents()
    checkHealth()
  }, [isAuthenticated])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    const sessionInfo = getUserInfo()
    if (sessionInfo) {
      getCurrentUser(sessionInfo.session_id)
        .then(setUserInfo)
        .catch(() => {
          clearSession()
          setIsAuthenticated(false)
        })
    }
  }

  const handleLogout = async () => {
    const sessionInfo = getUserInfo()
    if (sessionInfo) {
      try {
        await logout(sessionInfo.session_id)
      } catch (e) {
        console.error('登出失败', e)
      }
    }
    clearSession()
    setIsAuthenticated(false)
    setUserInfo(null)
  }

  // 显示加载状态
  if (checkingAuth) {
    return (
      <div className="app">
        <div className="auth-loading-container">
          <div className="auth-loading-text">
            正在验证登录状态...
          </div>
        </div>
      </div>
    )
  }

  // 未登录，显示登录页面
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  // 已登录，显示主应用
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <h1>Chat-Ksd</h1>
        </div>
        <div className="app-header-right">
          <div className="user-info">
            <span className="username">{userInfo?.username || '用户'}</span>
            {userInfo?.is_admin && <span className="admin-badge">管理员</span>}
          </div>
          <button className="logout-button" type="button" onClick={handleLogout}>
            登出
          </button>
          <div className="health-status">
            <span className={`health-indicator health-${healthStatus}`} />
            <span className="health-text">
              {healthStatus === 'ok'
                ? '8000 Healthy'
                : healthStatus === 'error'
                ? '8000 Unhealthy'
                : '8000 Checking...'}
            </span>
          </div>
        </div>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <h2>导航栏</h2>
          <ul className="nav-list">
            <li
              className={`nav-item ${activePage === 'chat-ksd' ? 'active' : ''}`}
              onClick={() => setActivePage('chat-ksd')}
            >
              Chat-Ksd
            </li>
          </ul>
        </aside>
        <main className="app-main">
          {activePage === 'chat-ksd' && <ChatInterface agents={agents} />}
        </main>
      </div>
    </div>
  )
}

export default App
