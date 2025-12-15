const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface ChatRequest {
  q: string
  session_id?: string | null
}

export interface StreamChunk {
  type: 'session_id' | 'content' | 'done'
  data?: string
}

export interface ChatResponse {
  answer: string
  session_id: string
}

export type StreamCallback = (chunk: StreamChunk) => void

export async function sendMessageStream(
  message: string,
  sessionId: string | null | undefined,
  onChunk: StreamCallback
): Promise<string> {
  const requestBody: ChatRequest = { q: message }
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
            
            if (chunk.type === 'session_id' && chunk.data) {
              receivedSessionId = chunk.data
              onChunk(chunk)
            } else if (chunk.type === 'content' && chunk.data) {
              fullContent += chunk.data
              onChunk(chunk)
            } else if (chunk.type === 'done') {
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
              if (chunk.type === 'content' && chunk.data) {
                fullContent += chunk.data
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
