import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row']
type RecurringTransactionInsert = Database['public']['Tables']['recurring_transactions']['Insert']
type RecurringTransactionUpdate = Database['public']['Tables']['recurring_transactions']['Update']

export function useRecurringTransactions(userId?: string) {
  return useQuery({
    queryKey: ['recurring_transactions', userId],
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('next_occurrence', { ascending: true })

      if (error) throw error
      return data as RecurringTransaction[]
    },
    enabled: !!userId,
  })
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transaction: RecurringTransactionInsert) => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert(transaction)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] })
    },
  })
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: RecurringTransactionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] })
    },
  })
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] })
    },
  })
}