import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          amount: number
          category: string
          type: 'income' | 'expense'
          created_at: string
          updated_at: string
          currency: string
          exchange_rate: number | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          amount: number
          category: string
          type: 'income' | 'expense'
          created_at?: string
          updated_at?: string
          currency?: string
          exchange_rate?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          amount?: number
          category?: string
          type?: 'income' | 'expense'
          created_at?: string
          updated_at?: string
          currency?: string
          exchange_rate?: number | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          default_currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          default_currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          default_currency?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}