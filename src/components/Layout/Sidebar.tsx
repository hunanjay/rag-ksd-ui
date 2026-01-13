import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Bot, 
  Mail, 
  Settings, 
  Database,
  FileText,
  Users
} from 'lucide-react'
import './Sidebar.css'

interface SidebarProps {
  collapsed: boolean
}

interface NavItem {
  path: string
  icon: React.ReactNode
  label: string
  badge?: string
}

const navItems: NavItem[] = [
  { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: '仪表盘' },
  { path: '/chat', icon: <MessageSquare size={20} />, label: 'AI 对话' },
  { path: '/agents', icon: <Bot size={20} />, label: 'Agent 管理' },
  { path: '/knowledge', icon: <Database size={20} />, label: '知识库' },
  { path: '/documents', icon: <FileText size={20} />, label: '文档管理' },
  { path: '/email', icon: <Mail size={20} />, label: '邮箱工具', badge: '新' },
]

const adminItems: NavItem[] = [
  { path: '/users', icon: <Users size={20} />, label: '用户管理' },
  { path: '/settings', icon: <Settings size={20} />, label: '系统设置' },
]

function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">{collapsed ? '' : '主导航'}</span>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-section">
          <span className="nav-section-title">{collapsed ? '' : '管理'}</span>
          <ul className="nav-list">
            {adminItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
