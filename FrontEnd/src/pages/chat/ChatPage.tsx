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
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-5">
      <Card className="glass-surface border-border/60">
        <div className="flex flex-col gap-2 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
            Grounded assistant
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Assistant</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Ask questions about the indexed documents in your knowledge base.
          </p>
        </div>
      </Card>

      <Card className="flex flex-1 flex-col overflow-hidden border-border/60 bg-card/80 shadow-[0_20px_50px_rgba(70,53,53,0.10)] backdrop-blur">
        <ScrollArea className="flex-1 p-5 sm:p-6" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center text-muted-foreground">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
              >
                <Bot size={32} />
              </motion.div>
              <h3 className="text-lg font-medium text-foreground">
                How can I help you today?
              </h3>
              <p className="mt-2 max-w-sm">
                Type your question below to search through the company's knowledge base and documents.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 py-2">
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
