import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import './Layout.css'

interface LayoutProps {
  userInfo: {
    username: string
    is_admin: boolean
  } | null
  onLogout: () => void
}

function Layout({ userInfo, onLogout }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="layout">
      <Header 
        userInfo={userInfo} 
        onLogout={onLogout}
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="layout-body">
        <Sidebar collapsed={sidebarCollapsed} />
        <main className={`layout-content ${sidebarCollapsed ? 'expanded' : ''}`}>
          <Outlet />
        </main>
      </div>
      <footer className="layout-footer">
        <span>© 2026 Chat-Ksd. All rights reserved.</span>
        <span className="footer-status">
          <span className="status-dot online"></span>
          系统正常运行
        </span>
      </footer>
    </div>
  )
}

export default Layout
