import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Investment = Database['public']['Tables']['investments']['Row']
type InvestmentInsert = Database['public']['Tables']['investments']['Insert']
type InvestmentUpdate = Database['public']['Tables']['investments']['Update']

export function useInvestments(userId?: string, dateRange?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['investments', userId, dateRange],
    queryFn: async () => {
      if (!userId) return []
      
      let query = supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)

      if (dateRange?.from) {
        query = query.gte('purchase_date', dateRange.from)
      }
      if (dateRange?.to) {
        query = query.lte('purchase_date', dateRange.to)
      }

      const { data, error } = await query.order('purchase_date', { ascending: false })

      if (error) throw error
      return data as Investment[]
    },
    enabled: !!userId,
  })
}

export function useCreateInvestment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (investment: InvestmentInsert) => {
      const { data, error } = await supabase
        .from('investments')
        .insert(investment)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
    },
  })
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: InvestmentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
    },
  })
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
    },
  })
}