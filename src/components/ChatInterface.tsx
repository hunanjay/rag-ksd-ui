import { useState, useRef, useEffect } from 'react'
import { sendMessageStream, clearHistory as clearHistoryApi } from '../services/api'
import MarkdownRenderer from './MarkdownRenderer'
import './ChatInterface.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [useRag, setUseRag] = useState(true)  // 默认启用 RAG
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // 创建一个新的 assistant 消息用于流式更新
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const receivedSessionId = await sendMessageStream(
        userMessage.content,
        sessionId,
        (chunk) => {
          if (chunk.type === 'session_id') {
            // 保存 session_id
            if (typeof chunk.data === 'string') {
              setSessionId(chunk.data)
            }
          } else if (chunk.type === 'retrieved_docs') {
            // 检索到文档信息（可选：可以在这里显示提示）
            if (chunk.data && typeof chunk.data === 'object' && 'count' in chunk.data) {
              console.log(`检索到 ${chunk.data.count} 个相关文档`)
            }
          } else if (chunk.type === 'content' && typeof chunk.data === 'string') {
            // 更新最后一个 assistant 消息的内容
            setMessages(prev => {
              const newMessages = [...prev]
              const lastIndex = newMessages.length - 1
              if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
                newMessages[lastIndex] = {
                  ...newMessages[lastIndex],
                  content: newMessages[lastIndex].content + chunk.data
                }
              }
              return newMessages
            })
            // 流式更新时也自动滚动到底部
            setTimeout(() => scrollToBottom(), 0)
          } else if (chunk.type === 'done') {
            setLoading(false)
          }
        },
        {
          useRag: useRag
        }
      )

      // 如果没有通过流收到 session_id，使用返回值
      if (!sessionId && receivedSessionId) {
        setSessionId(receivedSessionId)
      }
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
          content: '抱歉，发送消息时出错，请稍后重试。'
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
    if (!sessionId) return
    
    try {
      await clearHistoryApi(sessionId)
      setMessages([])
      setSessionId(null)
    } catch (error) {
      console.error('清除历史失败:', error)
      // 即使清除失败，也在前端清除显示
      setMessages([])
      setSessionId(null)
    }
  }

  return (
    <div className="chat-interface">
      <div className="rag-toggle-container">
        <label className="rag-toggle-label">
          <input
            type="checkbox"
            checked={useRag}
            onChange={(e) => setUseRag(e.target.checked)}
            className="rag-toggle-input"
            disabled={loading}
          />
          <span className="rag-toggle-slider"></span>
          <span className="rag-toggle-text">启用 RAG 检索</span>
        </label>
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
