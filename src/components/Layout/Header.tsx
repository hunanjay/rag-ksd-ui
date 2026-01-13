import { Menu, LogOut, User, ChevronDown, Settings } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import './Header.css'

interface HeaderProps {
  userInfo: {
    username: string
    is_admin: boolean
  } | null
  onLogout: () => void
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
}

function Header({ userInfo, onLogout, onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="header-menu-btn" 
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <Menu size={20} />
        </button>
        <div className="header-logo">
          <span className="logo-icon">🤖</span>
          <span className="logo-text">Chat-Ksd</span>
        </div>
      </div>

      <div className="header-right">
        {userInfo && (
          <div className="user-menu" ref={dropdownRef}>
            <button 
              className="user-menu-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar">
                <User size={18} />
              </div>
              <span className="user-name">{userInfo.username}</span>
              {userInfo.is_admin && <span className="admin-badge">管理员</span>}
              <ChevronDown size={16} className={`dropdown-icon ${showDropdown ? 'rotated' : ''}`} />
            </button>

            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    <User size={24} />
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-username">{userInfo.username}</span>
                    <span className="dropdown-role">
                      {userInfo.is_admin ? '管理员' : '普通用户'}
                    </span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <Settings size={16} />
                  <span>账号设置</span>
                </button>
                <button className="dropdown-item logout" onClick={onLogout}>
                  <LogOut size={16} />
                  <span>退出登录</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
