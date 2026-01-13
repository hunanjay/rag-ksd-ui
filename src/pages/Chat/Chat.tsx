import { useState, useEffect } from 'react'
import ChatInterface from '../../components/ChatInterface'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function Chat() {
  const [agents, setAgents] = useState<string[]>([])

  useEffect(() => {
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
    fetchAgents()
  }, [])

  return (
    <div className="chat-page">
      <ChatInterface agents={agents} />
    </div>
  )
}

export default Chat
