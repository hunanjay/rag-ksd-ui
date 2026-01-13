import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import Login from './components/Login'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import ComingSoon from './pages/ComingSoon'
import { isSessionValid, getUserInfo, clearSession } from './utils/session'
import { logout, getCurrentUser } from './services/auth'
import type { UserInfo } from './services/auth'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // 检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      console.log('=== 检查认证状态 ===');
      console.log('Session Valid:', isSessionValid());
      
      if (!isSessionValid()) {
        console.log('❌ Session 无效，显示登录页');
        setCheckingAuth(false)
        return
      }

      const sessionInfo = getUserInfo()
      console.log('Session Info:', sessionInfo);
      
      if (!sessionInfo) {
        console.log('❌ 无法获取 sessionInfo，清除 session');
        clearSession()
        setCheckingAuth(false)
        return
      }

      try {
        console.log('🔄 验证 token...', sessionInfo.session_id.substring(0, 20) + '...');
        const user = await getCurrentUser(sessionInfo.session_id)
        console.log('✅ Token 验证成功:', user);
        setUserInfo(user)
        setIsAuthenticated(true)
      } catch (e) {
        console.error('❌ Token 验证失败:', e);
        clearSession()
        setIsAuthenticated(false)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

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
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>正在验证登录状态...</p>
      </div>
    )
  }

  // 未登录，显示登录页面
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  // 已登录，显示主应用
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <Layout 
              userInfo={userInfo ? { username: userInfo.username, is_admin: userInfo.is_admin } : null}
              onLogout={handleLogout}
            />
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="agents" element={<ComingSoon title="Agent 管理" description="管理和配置您的 AI Agent，创建自定义工作流。" />} />
          <Route path="knowledge" element={<ComingSoon title="知识库" description="管理 RAG 知识库，上传和索引文档。" />} />
          <Route path="documents" element={<ComingSoon title="文档管理" description="浏览、搜索和管理所有已上传的文档。" />} />
          <Route path="email" element={<ComingSoon title="邮箱工具" description="集成 Microsoft Graph API，管理邮箱和日历。" />} />
          <Route path="users" element={<ComingSoon title="用户管理" description="管理系统用户、角色和权限。" />} />
          <Route path="settings" element={<ComingSoon title="系统设置" description="配置系统参数、API 密钥和集成选项。" />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
