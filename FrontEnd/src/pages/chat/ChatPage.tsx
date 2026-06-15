import React from 'react'
import { Bot } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { useChat } from '@/hooks/useChat'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { motion } from 'framer-motion'

export default function ChatPage() {
  const { messages, isStreaming, scrollAreaRef, submitMessage } = useChat()

  return (
    <div className="flex h-full flex-col max-w-4xl mx-auto w-full gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold tracking-tight">Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ask questions about the indexed documents in your knowledge base.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden shadow-card border-border">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex h-[400px] flex-col items-center justify-center text-center text-muted-foreground">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4"
              >
                <Bot size={32} />
              </motion.div>
              <h3 className="text-lg font-medium text-foreground">How can I help you today?</h3>
              <p className="max-w-sm mt-2">
                Type your question below to search through the company's knowledge base and documents.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-4 px-2">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
            </div>
          )}
        </ScrollArea>

        <ChatInput onSend={submitMessage} isStreaming={isStreaming} />
      </Card>
    </div>
  )
}
