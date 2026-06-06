'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { sendMessage, markAsRead } from '../actions'

export default function ChatBox({ 
  conversationId, 
  initialMessages, 
  currentUserId, 
  shopName 
}: { 
  conversationId: string, 
  initialMessages: any[], 
  currentUserId: string,
  shopName: string
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    setIsMounted(true)
    markAsRead(conversationId)
  }, [conversationId])

  useEffect(() => {
    if (isMounted) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages, isMounted])

  useEffect(() => {
    if (!isMounted) return

    const channel = supabase
      .channel(`room-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.conversation_id === conversationId) {
            setMessages((current) => {
              if (current.some(m => m.id === payload.new.id)) return current
              return [...current, payload.new]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, isMounted, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    const messageText = newMessage
    setNewMessage('')
    setIsSending(true)

    const result = await sendMessage(conversationId, messageText)
    
    if (result?.success && result?.message) {
      setMessages((current) => {
        if (current.some(m => m.id === result.message.id)) return current
        return [...current, result.message]
      })
    }
    setIsSending(false)
  }

  if (!isMounted) {
    return <div className="h-64 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-400">Chargement...</div>
  }

  return (
    <div className="flex flex-col bg-white border-2 border-black h-[600px] sm:h-[700px]">
      
      {/* HEADER DU CHAT */}
      <div className="bg-gray-50 border-b-2 border-black p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-montserrat font-black border border-black">
          {shopName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Support Marque</p>
          <h2 className="font-montserrat font-black text-black uppercase tracking-wide">{shopName}</h2>
        </div>
      </div>

      {/* ZONE DES MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest mt-10">
            Démarrez la conversation avec {shopName}.
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[70%] p-4 border-2 border-black ${isMe ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] block mt-3 font-bold uppercase tracking-widest ${isMe ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} /> 
      </div>

      {/* FORMULAIRE DE SAISIE */}
      <div className="p-4 bg-gray-50 border-t-2 border-black">
        <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="VOTRE MESSAGE..." 
            className="flex-1 p-4 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors rounded-none uppercase" 
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || isSending} 
            className="w-full sm:w-auto px-8 py-4 bg-black text-white font-montserrat font-black uppercase tracking-widest hover:bg-gray-900 border-2 border-black disabled:opacity-50 transition-colors shrink-0"
          >
            {isSending ? '...' : 'Envoyer'}
          </button>
        </form>
      </div>

    </div>
  )
}