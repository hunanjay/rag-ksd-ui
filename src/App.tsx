import { useEffect, useState } from 'react'
import ChatInterface from './components/ChatInterface'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function App() {
  const [agents, setAgents] = useState<string[]>([])
  const [healthStatus, setHealthStatus] = useState<'unknown' | 'ok' | 'error'>('unknown')
  const [activePage, setActivePage] = useState<'chat-ksd'>('chat-ksd')

  useEffect(() => {
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
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <h1>Chat-Ksd</h1>
        </div>
        <div className="app-header-right">
          <button className="login-button" type="button">
            登录
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
