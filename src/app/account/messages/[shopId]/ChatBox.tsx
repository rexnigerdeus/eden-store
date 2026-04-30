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
  // 🛡️ L'ARME NUCLÉAIRE ANTI-HYDRATATION
  const [isMounted, setIsMounted] = useState(false)
  
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()

  useEffect(() => {
    setIsMounted(true)
    markAsRead(conversationId) // <-- NOUVEAU : Marquer comme lu à l'ouverture
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
        { event: 'INSERT', schema: 'public', table: 'messages' }, // On écoute tout
        (payload) => {
          // Filtrage JS Ultra fiable
          if (payload.new.conversation_id === conversationId) {
            console.log("📥 [CLIENT] Message reçu :", payload.new)
            setMessages((current) => {
              if (current.some(m => m.id === payload.new.id)) return current
              return [...current, payload.new]
            })
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('✅ WebSockets Client OK !')
      })

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

  // 🛡️ Écran d'attente serveur
  if (!isMounted) {
    return (
      <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-gray-200 shadow-sm items-center justify-center">
        <div className="w-8 h-8 border-4 border-walmart-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Connexion sécurisée en cours...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center">
        <div className="w-10 h-10 bg-walmart-blue text-white rounded-full flex items-center justify-center font-bold text-lg mr-3">
          {shopName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-bold text-gray-900">{shopName}</h2>
          <p className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            En ligne
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>Démarrez la conversation avec {shopName} !</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    isMe ? 'bg-walmart-blue text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <span className={`text-[10px] block mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} /> 
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Écrivez votre message..." className="flex-1 px-4 py-3 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-walmart-blue focus:ring-2 focus:ring-walmart-blue outline-none transition-all" />
          <button type="submit" disabled={!newMessage.trim() || isSending} className="w-12 h-12 bg-walmart-blue text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1"><path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" /></svg>
          </button>
        </form>
      </div>
    </div>
  )
}