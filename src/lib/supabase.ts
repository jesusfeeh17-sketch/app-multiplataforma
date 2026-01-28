import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Habit {
  id: string
  user_id: string
  name: string
  category: 'health' | 'productivity' | 'mindfulness' | 'fitness' | 'learning' | 'social'
  color: string
  icon: string
  streak: number
  best_streak: number
  completed_dates: string[]
  created_at: string
  reminder_time?: string
  reminder_enabled: boolean
}

export interface UserStats {
  id: string
  user_id: string
  total_habits: number
  completed_today: number
  total_points: number
  level: number
  longest_streak: number
  updated_at: string
}

export interface NotificationSettings {
  id: string
  user_id: string
  enabled: boolean
  daily_reminder: boolean
  daily_reminder_time: string
  sound_enabled: boolean
  updated_at: string
}