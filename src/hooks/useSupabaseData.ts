import { useState, useEffect, useCallback } from 'react'
import { supabase, Habit, UserStats, NotificationSettings } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useHabits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHabits = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setHabits(data || [])
    } catch (error) {
      console.error('Error fetching habits:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const addHabit = async (habit: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([{ ...habit, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setHabits(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('Error adding habit:', error)
      throw error
    }
  }

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setHabits(prev => prev.map(h => h.id === id ? data : h))
      return data
    } catch (error) {
      console.error('Error updating habit:', error)
      throw error
    }
  }

  const deleteHabit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)

      if (error) throw error
      setHabits(prev => prev.filter(h => h.id !== id))
    } catch (error) {
      console.error('Error deleting habit:', error)
      throw error
    }
  }

  return {
    habits,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    refetch: fetchHabits,
  }
}

export function useUserStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const updateStats = async (updates: Partial<UserStats>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      setStats(data)
      return data
    } catch (error) {
      console.error('Error updating stats:', error)
      throw error
    }
  }

  return {
    stats,
    loading,
    updateStats,
    refetch: fetchStats,
  }
}

export function useNotificationSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      setSettings(data)
    } catch (error) {
      console.error('Error fetching notification settings:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      setSettings(data)
      return data
    } catch (error) {
      console.error('Error updating notification settings:', error)
      throw error
    }
  }

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings,
  }
}