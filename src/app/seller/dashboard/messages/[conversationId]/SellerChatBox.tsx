'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { sendSellerMessage, markAsRead } from '../actions'

export default function SellerChatBox({ 
  conversationId, 
  initialMessages, 
  currentUserId, 
  customerName 
}: { 
  conversationId: string, 
  initialMessages: any[], 
  currentUserId: string,
  customerName: string
}) {
  // 🛡️ L'ARME NUCLÉAIRE ANTI-HYDRATATION
  const [isMounted, setIsMounted] = useState(false)
  
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()

  // On attend que le composant soit monté sur le navigateur
  useEffect(() => {
    setIsMounted(true)
    markAsRead(conversationId) // <-- NOUVEAU : On marque les messages comme lus !
  }, [conversationId])

  // Auto-scroll
  useEffect(() => {
    if (isMounted) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages, isMounted])

  // L'Écouteur Temps Réel (Simplifié pour éviter les bugs de filtre Supabase)
  useEffect(() => {
    if (!isMounted) return

    const channel = supabase
      .channel(`room-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' }, // On écoute tout
        (payload) => {
          // On filtre manuellement en Javascript (C'est 100x plus fiable)
          if (payload.new.conversation_id === conversationId) {
            console.log("📥 [VENDEUR] Message reçu :", payload.new)
            setMessages((current) => {
              if (current.some(m => m.id === payload.new.id)) return current
              return [...current, payload.new]
            })
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('✅ WebSockets Vendeur OK !')
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

    const result = await sendSellerMessage(conversationId, messageText)
    
    if (result?.success && result?.message) {
      setMessages((current) => {
        if (current.some(m => m.id === result.message.id)) return current
        return [...current, result.message]
      })
    }
    setIsSending(false)
  }

  // 🛡️ Si on est sur le serveur, on affiche un écran d'attente
  if (!isMounted) {
    return (
      <div className="flex flex-col h-[80vh] min-h-[400px] sm:h-[600px] bg-white rounded-2xl border border-gray-200 shadow-sm items-center justify-center">
        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-walmart-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-500 font-medium">Connexion sécurisée en cours...</p>
      </div>
    )
  }

  // Le vrai affichage une fois le navigateur prêt
  return (
    <div className="flex flex-col h-[80vh] min-h-[400px] sm:h-[600px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-3 sm:p-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-base sm:text-lg mr-2 sm:mr-3">
            {customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-1">{customerName}</h2>
            <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 inline-block"></span>
              Client EDEN store
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50 space-y-3 sm:space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-xl sm:rounded-2xl ${
                  isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <span className={`text-[10px] block mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} /> 
      </div>

      <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2 sm:gap-3">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Répondre au client..." className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
          <button type="submit" disabled={!newMessage.trim() || isSending} className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 sm:ml-1"><path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" /></svg>
          </button>
        </form>
      </div>
    </div>
  )
}