import { useState, useRef, useEffect } from 'react'
import { sendAgentMessage, clearAgentHistory, type StreamCallback } from '../services/api'
import MarkdownRenderer from './MarkdownRenderer'
import './ChatInterface.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  agents?: string[]
}

function ChatInterface({ agents = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  // 为每个 agent 维护独立的 session_id
  const [agentSessions, setAgentSessions] = useState<Record<string, string | null>>({})
  // 默认选中第一个 agent，如果没有则使用 'rag'
  const [selectedAgent, setSelectedAgent] = useState<string>(() => {
    return agents.length > 0 ? agents[0] : 'rag'
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 当 agents 列表更新时，如果当前选中的 agent 不在列表中，切换到第一个
  useEffect(() => {
    if (agents.length > 0 && !agents.includes(selectedAgent)) {
      setSelectedAgent(agents[0])
    }
  }, [agents, selectedAgent])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 当切换 agent 时，重置消息（可选：也可以保留历史）
  useEffect(() => {
    // 切换 agent 时可以选择清空消息或保留
    // 这里选择清空，如果需要保留历史可以注释掉
    // setMessages([])
  }, [selectedAgent])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // 创建一个新的 assistant 消息用于流式更新
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      // 获取当前 agent 的 session_id
      const currentSessionId = agentSessions[selectedAgent] || null

      // 流式回调处理
      const onChunk: StreamCallback = (chunk) => {
        if (chunk.type === 'session_id') {
          // 保存 session_id
          if (typeof chunk.data === 'string') {
            setAgentSessions(prev => ({
              ...prev,
              [selectedAgent]: chunk.data as string,
            }))
          }
        } else if (chunk.type === 'content' && typeof chunk.data === 'string') {
          // 更新最后一个 assistant 消息的内容
          setMessages(prev => {
            const newMessages = [...prev]
            const lastIndex = newMessages.length - 1
            if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: newMessages[lastIndex].content + chunk.data,
              }
            }
            return newMessages
          })
          // 流式更新时也自动滚动到底部
          setTimeout(() => scrollToBottom(), 0)
        } else if (chunk.type === 'done') {
          setLoading(false)
        } else if (chunk.type === 'error') {
          setLoading(false)
          // 移除空的 assistant 消息，添加错误消息
          setMessages(prev => {
            const newMessages = [...prev]
            if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant' && newMessages[newMessages.length - 1].content === '') {
              newMessages.pop()
            }
            const errorMsg = typeof chunk.data === 'string' ? chunk.data : '发送消息时出错，请稍后重试。'
            return [...newMessages, {
              role: 'assistant',
              content: errorMsg
            }]
          })
        }
      }

      // 调用流式 agent 接口
      await sendAgentMessage(
        selectedAgent,
        userMessage.content,
        currentSessionId,
        onChunk
      )

      scrollToBottom()
    } catch (error) {
      console.error('发送消息失败:', error)
      // 移除空的 assistant 消息，添加错误消息
      setMessages(prev => {
        const newMessages = [...prev]
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant' && newMessages[newMessages.length - 1].content === '') {
          newMessages.pop()
        }
        return [...newMessages, {
          role: 'assistant',
          content: error instanceof Error ? error.message : '抱歉，发送消息时出错，请稍后重试。'
        }]
      })
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearHistory = async () => {
    const currentSessionId = agentSessions[selectedAgent]
    if (!currentSessionId) {
      // 如果没有 session_id，直接清空消息
      setMessages([])
      return
    }
    
    try {
      await clearAgentHistory(currentSessionId)
      setMessages([])
      setAgentSessions(prev => ({
        ...prev,
        [selectedAgent]: null,
      }))
    } catch (error) {
      console.error('清除历史失败:', error)
      // 即使清除失败，也在前端清除显示
      setMessages([])
      setAgentSessions(prev => ({
        ...prev,
        [selectedAgent]: null,
      }))
    }
  }

  return (
    <div className="chat-interface">
      <div className="chat-toolbar">
        {agents.length > 0 && (
          <div className="agent-selector">
            <label htmlFor="agent-select">当前 Agent：</label>
            <select
              id="agent-select"
              value={selectedAgent}
              onChange={(e) => {
                setSelectedAgent(e.target.value)
                // 切换 agent 时可以选择清空消息或保留
                // 这里选择保留消息，如果需要清空可以取消注释下面这行
                // setMessages([])
              }}
              disabled={loading}
            >
              {agents.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>开始对话吧！输入您的问题...</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.role === 'assistant' ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        {messages.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="clear-button"
            title="清除对话历史"
          >
            清除
          </button>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="输入您的问题..."
          rows={1}
          disabled={loading}
          className="message-input"
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()}
          className="send-button"
        >
          发送
        </button>
      </div>
    </div>
  )
}

export default ChatInterface
