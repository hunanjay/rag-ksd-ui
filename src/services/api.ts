const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface ChatRequest {
  q: string
  session_id?: string | null
  use_rag?: boolean  // 是否使用 RAG 检索
  top_k?: number     // 检索返回的文档数量
  similarity_threshold?: number  // 相似度阈值
}

export interface StreamChunk {
  type: 'session_id' | 'content' | 'done' | 'retrieved_docs' | 'error'
  data?: string | { count?: number } | { session_id?: string; agent_name?: string; intermediate_steps?: any[] }
}

export interface ChatResponse {
  answer: string
  session_id: string
}

export type StreamCallback = (chunk: StreamChunk) => void

export async function sendMessageStream(
  message: string,
  sessionId: string | null | undefined,
  onChunk: StreamCallback,
  options?: {
    useRag?: boolean
    topK?: number
    similarityThreshold?: number
  }
): Promise<string> {
  const requestBody: ChatRequest = { 
    q: message,
    use_rag: options?.useRag !== false,  // 默认启用 RAG
    top_k: options?.topK || 5,
    similarity_threshold: options?.similarityThreshold || 0.1
  }
  if (sessionId) {
    requestBody.session_id = sessionId
  }

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  if (!response.body) {
    throw new Error('Response body is null')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullContent = ''
  let receivedSessionId: string | null = null

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      
      // 保留最后一个不完整的行
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6) // 移除 'data: ' 前缀
          
          if (data.trim() === '') {
            continue
          }

          try {
            const chunk: StreamChunk = JSON.parse(data)
            
            if (chunk.type === 'session_id' && typeof chunk.data === 'string') {
              receivedSessionId = chunk.data
              onChunk(chunk)
            } else if (chunk.type === 'content' && typeof chunk.data === 'string') {
              fullContent += chunk.data
              onChunk(chunk)
            } else if (chunk.type === 'retrieved_docs' || chunk.type === 'done') {
              onChunk(chunk)
            }
          } catch (e) {
            console.error('Failed to parse chunk:', e, data)
          }
        }
      }
    }

    // 处理剩余的 buffer
    if (buffer.trim()) {
      const lines = buffer.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data.trim()) {
            try {
              const chunk: StreamChunk = JSON.parse(data)
              if (chunk.type === 'content' && typeof chunk.data === 'string') {
                fullContent += chunk.data
                onChunk(chunk)
              } else if (chunk.type === 'retrieved_docs' || chunk.type === 'done') {
                onChunk(chunk)
              }
            } catch (e) {
              console.error('Failed to parse remaining buffer:', e)
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return receivedSessionId || ''
}

export async function clearHistory(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

export interface AgentChatRequest {
  q: string
  session_id?: string | null
  agent_name?: string
}

export interface AgentChatResponse {
  answer: string
  session_id: string
  agent_name: string
  intermediate_steps?: any[]
}

/**
 * 使用指定的 Agent 发送消息（流式）
 */
export async function sendAgentMessage(
  agentName: string,
  message: string,
  sessionId: string | null | undefined,
  onChunk: StreamCallback
): Promise<string> {
  const requestBody: AgentChatRequest = {
    q: message,
    agent_name: agentName,
  }
  if (sessionId) {
    requestBody.session_id = sessionId
  }

  const response = await fetch(`${API_BASE_URL}/chat/run/${agentName}/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  if (!response.body) {
    throw new Error('Response body is null')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let receivedSessionId: string | null = null

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      
      // 保留最后一个不完整的行
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6) // 移除 'data: ' 前缀
          
          if (data.trim() === '') {
            continue
          }

          try {
            const chunk: StreamChunk = JSON.parse(data)
            
            if (chunk.type === 'session_id' && typeof chunk.data === 'string') {
              receivedSessionId = chunk.data
              onChunk(chunk)
            } else if (chunk.type === 'content' && typeof chunk.data === 'string') {
              onChunk(chunk)
            } else if (chunk.type === 'done' || chunk.type === 'error') {
              onChunk(chunk)
            }
          } catch (e) {
            console.error('Failed to parse chunk:', e, data)
          }
        }
      }
    }

    // 处理剩余的 buffer
    if (buffer.trim()) {
      const lines = buffer.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data.trim()) {
            try {
              const chunk: StreamChunk = JSON.parse(data)
              if (chunk.type === 'content' && typeof chunk.data === 'string') {
                onChunk(chunk)
              } else if (chunk.type === 'done' || chunk.type === 'error') {
                onChunk(chunk)
              }
            } catch (e) {
              console.error('Failed to parse remaining buffer:', e)
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return receivedSessionId || ''
}

/**
 * 清除 Agent 对话历史
 */
export async function clearAgentHistory(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat/agent/${sessionId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}
