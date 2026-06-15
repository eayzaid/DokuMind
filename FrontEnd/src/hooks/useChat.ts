import { useState, useRef, useEffect } from 'react'
import { apiClient } from '@/services/apiClient'
import type { Message } from '@/types/chat'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const submitMessage = async (question: string) => {
    if (!question.trim() || isStreaming) return

    const userMessage: Message = { role: 'user', content: question }
    const historyPayload = [...messages]
    
    setMessages(prev => [...prev, userMessage, { role: 'assistant', content: '' }])
    setIsStreaming(true)

    try {
      let lastLength = 0;

      await apiClient.post('/documents/chat', {
        question: question,
        history: historyPayload
      }, {
        responseType: 'text',
        onDownloadProgress: (progressEvent: any) => {
          const target = progressEvent.event.target;
          if (target && target.status >= 400) {
            return;
          }

          if (target && typeof target.responseText === 'string') {
            const currentText = target.responseText;
            const newChunk = currentText.substring(lastLength);
            lastLength = currentText.length;
            
            const lines = newChunk.split('\n')
            let extractedText = ''
            
            for (const line of lines) {
              if (line.startsWith('data:')) {
                const data = line.slice(5).trim()
                if (data) {
                  extractedText += data + ' '
                }
              } else if (line.trim() !== '') {
                extractedText += line
              }
            }

            setMessages(prev => {
              const newMessages = [...prev]
              const lastIndex = newMessages.length - 1
              if (newMessages[lastIndex].role === 'assistant') {
                newMessages[lastIndex] = {
                  ...newMessages[lastIndex],
                  content: newMessages[lastIndex].content + (extractedText ? extractedText : newChunk)
                }
              }
              return newMessages
            })
          }
        }
      })
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => {
        const newMessages = [...prev]
        const lastIndex = newMessages.length - 1
        if (newMessages[lastIndex].role === 'assistant' && !newMessages[lastIndex].content) {
          newMessages[lastIndex].content = "Sorry, I encountered an error while processing your request."
        }
        return newMessages
      })
    } finally {
      setIsStreaming(false)
    }
  }

  return {
    messages,
    isStreaming,
    scrollAreaRef,
    submitMessage
  }
}
