import { Bot, MessageSquare, Database, FileText, TrendingUp, Users } from 'lucide-react'
import './Dashboard.css'

interface StatCard {
  title: string
  value: string
  change: string
  changeType: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
}

const stats: StatCard[] = [
  {
    title: '今日对话',
    value: '128',
    change: '+12.5%',
    changeType: 'up',
    icon: <MessageSquare size={24} />
  },
  {
    title: '活跃 Agent',
    value: '5',
    change: '+2',
    changeType: 'up',
    icon: <Bot size={24} />
  },
  {
    title: '知识库文档',
    value: '1,234',
    change: '+56',
    changeType: 'up',
    icon: <Database size={24} />
  },
  {
    title: '总用户数',
    value: '89',
    change: '+5',
    changeType: 'up',
    icon: <Users size={24} />
  }
]

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">仪表盘</h1>
        <p className="dashboard-subtitle">欢迎回来！这是您的系统概览。</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon stat-icon-${index}`}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <span className="stat-title">{stat.title}</span>
              <span className="stat-value">{stat.value}</span>
              <span className={`stat-change ${stat.changeType}`}>
                <TrendingUp size={14} />
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card recent-activity">
          <div className="card-header">
            <h3>最近活动</h3>
            <button className="card-action">查看全部</button>
          </div>
          <div className="activity-list">
            {[
              { action: '新建对话', user: 'jian Luo', time: '5 分钟前' },
              { action: '上传文档', user: '系统', time: '15 分钟前' },
              { action: '创建 Agent', user: 'jian Luo', time: '1 小时前' },
              { action: '更新知识库', user: '系统', time: '2 小时前' },
            ].map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <span className="activity-action">{activity.action}</span>
                  <span className="activity-user">by {activity.user}</span>
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <h3>快捷操作</h3>
          </div>
          <div className="actions-grid">
            <button className="quick-action-btn">
              <MessageSquare size={20} />
              <span>新建对话</span>
            </button>
            <button className="quick-action-btn">
              <Bot size={20} />
              <span>创建 Agent</span>
            </button>
            <button className="quick-action-btn">
              <FileText size={20} />
              <span>上传文档</span>
            </button>
            <button className="quick-action-btn">
              <Database size={20} />
              <span>管理知识库</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
