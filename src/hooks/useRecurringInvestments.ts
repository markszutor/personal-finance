import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type RecurringInvestment = Database['public']['Tables']['recurring_investments']['Row']
type RecurringInvestmentInsert = Database['public']['Tables']['recurring_investments']['Insert']
type RecurringInvestmentUpdate = Database['public']['Tables']['recurring_investments']['Update']

export function useRecurringInvestments(userId?: string) {
  return useQuery({
    queryKey: ['recurring_investments', userId],
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('recurring_investments')
        .select('*')
        .eq('user_id', userId)
        .order('next_occurrence', { ascending: true })

      if (error) throw error
      return data as RecurringInvestment[]
    },
    enabled: !!userId,
  })
}

export function useCreateRecurringInvestment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (investment: RecurringInvestmentInsert) => {
      const { data, error } = await supabase
        .from('recurring_investments')
        .insert(investment)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_investments'] })
    },
  })
}

export function useUpdateRecurringInvestment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: RecurringInvestmentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('recurring_investments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_investments'] })
    },
  })
}

export function useDeleteRecurringInvestment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_investments')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_investments'] })
    },
  })
}