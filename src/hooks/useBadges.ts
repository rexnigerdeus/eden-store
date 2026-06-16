'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

// ==========================================
// 1. BADGES POUR LE VENDEUR
// ==========================================
export function useSellerBadges(shopId: string | null, userId: string | null) {
  const [pendingOrders, setPendingOrders] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  // Compteur de "nouveaux abonnés" depuis la dernière consultation de la page
  const [newSubscribers, setNewSubscribers] = useState(0)

  useEffect(() => {
    if (!shopId || !userId) return

    const supabase = createClient()

    // Fonction pour charger les totaux initiaux
    const fetchCounts = async () => {
      // Commandes en attente
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('status', 'pending')
      
      // Messages non lus (reçus du client)
      const { data: conversations } = await supabase.from('conversations').select('id').eq('shop_id', shopId)
      const convIds = conversations?.map(c => c.id) || []
      
      if (convIds.length > 0) {
        const { count: msgCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', convIds)
          .eq('is_read', false)
          .neq('sender_id', userId)
        
        setUnreadMessages(msgCount || 0)
      }
      setPendingOrders(ordersCount || 0)
    }

    fetchCounts()

    // CORRECTION : Création d'un nom de canal unique pour éviter les conflits de rechargement
    const uniqueChannelName = `seller_badges_${shopId}_${Date.now()}`

    // Écoute des changements en temps réel
    const channel = supabase.channel(uniqueChannelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `shop_id=eq.${shopId}` }, () => {
        setPendingOrders(prev => prev + 1)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.sender_id !== userId) {
          setUnreadMessages(prev => prev + 1)
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => {
         fetchCounts() // Recalculer si un message est marqué comme lu
      })
      // === NOTIFICATION : nouveau client abonné à la boutique ===
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subscriptions', filter: `shop_id=eq.${shopId}` }, () => {
        setNewSubscribers(prev => prev + 1)
      })
      .subscribe()

    // Nettoyage à la destruction du composant
    return () => { 
      supabase.removeChannel(channel) 
    }
  }, [shopId, userId]) // Retrait de 'supabase' des dépendances pour éviter les re-rendus inutiles

  // Pour "consommer" les notifs de nouveaux abonnés quand le vendeur visite la page
  const clearNewSubscribers = () => setNewSubscribers(0)

  return { pendingOrders, unreadMessages, newSubscribers, clearNewSubscribers }
}

// ==========================================
// 2. BADGES POUR L'ADMINISTRATEUR
// ==========================================
export function useAdminBadges() {
  const [pendingShops, setPendingShops] = useState(0)
  const [unreadSupportTickets, setUnreadSupportTickets] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    const fetchCounts = async () => {
      const { count } = await supabase
        .from('shops')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'pending_verification')
      setPendingShops(count || 0)

      // Tickets de support non lus côté admin :
      // - statut open OU pending
      // - dernière réponse est celle de l'utilisateur (last_user_reply_at > last_admin_reply_at)
      const { data: tickets } = await supabase
        .from('support_tickets')
        .select('id, status, last_user_reply_at, last_admin_reply_at')
        .in('status', ['open', 'pending'])
      const unread = (tickets || []).filter((t: any) => {
        if (!t.last_user_reply_at) return true
        if (!t.last_admin_reply_at) return true
        return new Date(t.last_user_reply_at).getTime() > new Date(t.last_admin_reply_at).getTime()
      }).length
      setUnreadSupportTickets(unread)
    }

    fetchCounts()

    const uniqueChannelName = `admin_badges_${Date.now()}`

    const channel = supabase.channel(uniqueChannelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, () => {
        fetchCounts() // Recharger dès qu'une boutique est modifiée
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        fetchCounts()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => {
        fetchCounts()
      })
      .subscribe()

    return () => { 
      supabase.removeChannel(channel) 
    }
  }, [])

  return { pendingShops, unreadSupportTickets }
}

// ==========================================
// 3. BADGES POUR LE CLIENT (Acheteur)
// ==========================================
export function useClientBadges(userId: string | null) {
  const [unreadMessages, setUnreadMessages] = useState(0)
  // Compteur de "notifications de commande" = nombre d'événements de statut
  // qui se sont produits depuis la dernière visite de l'utilisateur.
  const [orderUpdates, setOrderUpdates] = useState(0)

  useEffect(() => {
    if (!userId) return
    
    const supabase = createClient()

    const fetchCounts = async () => {
      const { data: conversations } = await supabase.from('conversations').select('id').eq('customer_id', userId)
      const convIds = conversations?.map(c => c.id) || []
      
      if (convIds.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', convIds)
          .eq('is_read', false)
          .neq('sender_id', userId)
        
        setUnreadMessages(count || 0)
      }
    }

    fetchCounts()

    const uniqueChannelName = `client_badges_${userId}_${Date.now()}`

    const channel = supabase.channel(uniqueChannelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.sender_id !== userId) setUnreadMessages(prev => prev + 1)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => {
        fetchCounts()
      })
      // === NOTIFICATION : changement de statut d'une de MES commandes ===
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `customer_id=eq.${userId}` }, (payload: any) => {
        // Incrémente le compteur de notifications à chaque changement d'état
        if (payload?.new && payload?.old && payload.new.status !== payload.old.status) {
          setOrderUpdates(prev => prev + 1)
        }
      })
      .subscribe()

    return () => { 
      supabase.removeChannel(channel) 
    }
  }, [userId])

  // Pour "consommer" les notifs quand l'utilisateur visite /account
  const clearOrderUpdates = () => setOrderUpdates(0)

  return { unreadMessages, orderUpdates, clearOrderUpdates }
}