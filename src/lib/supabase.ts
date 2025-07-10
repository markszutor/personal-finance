import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.warn('VITE_SUPABASE_URL is not set')
}

if (!supabaseAnonKey) {
  console.warn('VITE_SUPABASE_ANON_KEY is not set')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

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
          transaction_date: string
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
          transaction_date?: string
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
          transaction_date?: string
          created_at?: string
          updated_at?: string
          currency?: string
          exchange_rate?: number | null
        }
      }
      investments: {
        Row: {
          id: string
          user_id: string
          symbol: string
          name: string
          type: 'stock' | 'bond' | 'crypto' | 'etf' | 'mutual_fund' | 'real_estate' | 'commodity' | 'other'
          quantity: number
          purchase_price: number
          current_price: number
          currency: string
          exchange_rate: number | null
          purchase_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          name: string
          type: 'stock' | 'bond' | 'crypto' | 'etf' | 'mutual_fund' | 'real_estate' | 'commodity' | 'other'
          quantity: number
          purchase_price: number
          current_price: number
          currency?: string
          exchange_rate?: number | null
          purchase_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          name?: string
          type?: 'stock' | 'bond' | 'crypto' | 'etf' | 'mutual_fund' | 'real_estate' | 'commodity' | 'other'
          quantity?: number
          purchase_price?: number
          current_price?: number
          currency?: string
          exchange_rate?: number | null
          purchase_date?: string
          created_at?: string
          updated_at?: string
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