import { Construction } from 'lucide-react'
import './ComingSoon.css'

interface ComingSoonProps {
  title: string
  description?: string
}

function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="coming-soon">
      <div className="coming-soon-content">
        <div className="coming-soon-icon">
          <Construction size={48} />
        </div>
        <h1 className="coming-soon-title">{title}</h1>
        <p className="coming-soon-description">
          {description || '该功能正在开发中，敬请期待！'}
        </p>
        <div className="coming-soon-badge">
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  )
}

export default ComingSoon
