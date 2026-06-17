import { Bot, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Message } from '@/types/chat'
import { motion } from 'framer-motion'

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <Avatar className={`size-8 mt-1 border ${isUser ? 'border-primary/20' : 'border-border'}`}>
        <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted/50 text-foreground rounded-tl-sm border border-border'
          }`}
        >
          {message.content ? (
            <div className="whitespace-pre-wrap leading-relaxed">
              {message.content}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 h-6 px-2 py-1">
              <motion.span 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                className="w-2 h-2 rounded-full bg-foreground opacity-60 block"
              />
              <motion.span 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-foreground opacity-60 block"
              />
              <motion.span 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-foreground opacity-60 block"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
