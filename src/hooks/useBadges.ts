'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

// ==========================================
// 1. BADGES POUR LE VENDEUR
// ==========================================
export function useSellerBadges(shopId: string | null, userId: string | null) {
  const [pendingOrders, setPendingOrders] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

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
      .subscribe()

    // Nettoyage à la destruction du composant
    return () => { 
      supabase.removeChannel(channel) 
    }
  }, [shopId, userId]) // Retrait de 'supabase' des dépendances pour éviter les re-rendus inutiles

  return { pendingOrders, unreadMessages }
}

// ==========================================
// 2. BADGES POUR L'ADMINISTRATEUR
// ==========================================
export function useAdminBadges() {
  const [pendingShops, setPendingShops] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    const fetchCounts = async () => {
      const { count } = await supabase
        .from('shops')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'pending_verification')
      setPendingShops(count || 0)
    }

    fetchCounts()

    const uniqueChannelName = `admin_badges_${Date.now()}`

    const channel = supabase.channel(uniqueChannelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, () => {
        fetchCounts() // Recharger dès qu'une boutique est modifiée
      })
      .subscribe()

    return () => { 
      supabase.removeChannel(channel) 
    }
  }, [])

  return { pendingShops }
}

// ==========================================
// 3. BADGES POUR LE CLIENT (Acheteur)
// ==========================================
export function useClientBadges(userId: string | null) {
  const [unreadMessages, setUnreadMessages] = useState(0)

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
      .subscribe()

    return () => { 
      supabase.removeChannel(channel) 
    }
  }, [userId])

  return { unreadMessages }
}