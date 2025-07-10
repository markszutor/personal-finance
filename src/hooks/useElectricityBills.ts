import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface ElectricityBill {
  id: string
  user_id: string
  bill_date: string
  reading_date: string
  day_reading: number
  night_reading: number
  previous_day_reading?: number
  previous_night_reading?: number
  day_usage?: number
  night_usage?: number
  total_usage?: number
  amount_paid: number
  currency: string
  exchange_rate?: number
  day_rate?: number
  night_rate?: number
  standing_charge?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface ElectricityBillInsert {
  user_id: string
  bill_date: string
  reading_date: string
  day_reading: number
  night_reading: number
  previous_day_reading?: number
  previous_night_reading?: number
  amount_paid: number
  currency?: string
  exchange_rate?: number
  day_rate?: number
  night_rate?: number
  standing_charge?: number
  notes?: string
}

export interface ElectricityBillUpdate {
  bill_date?: string
  reading_date?: string
  day_reading?: number
  night_reading?: number
  previous_day_reading?: number
  previous_night_reading?: number
  amount_paid?: number
  currency?: string
  exchange_rate?: number
  day_rate?: number
  night_rate?: number
  standing_charge?: number
  notes?: string
}

export interface BillForecast {
  forecasted_amount: number
  forecasted_usage: number
  confidence_level: string
  based_on_bills: number
}

export function useElectricityBills(userId?: string, dateRange?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['electricity_bills', userId, dateRange],
    queryFn: async () => {
      if (!userId) return []
      
      let query = supabase
        .from('electricity_bills')
        .select('*')
        .eq('user_id', userId)

      if (dateRange?.from) {
        query = query.gte('reading_date', dateRange.from)
      }
      if (dateRange?.to) {
        query = query.lte('reading_date', dateRange.to)
      }

      const { data, error } = await query.order('reading_date', { ascending: false })

      if (error) throw error
      return data as ElectricityBill[]
    },
    enabled: !!userId,
  })
}

export function useElectricityBillForecast(userId?: string) {
  return useQuery({
    queryKey: ['electricity_bill_forecast', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const { data, error } = await supabase.rpc('forecast_next_electricity_bill', {
        p_user_id: userId
      })

      if (error) throw error
      return data?.[0] as BillForecast | null
    },
    enabled: !!userId,
  })
}

export function useCreateElectricityBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bill: ElectricityBillInsert) => {
      const { data, error } = await supabase
        .from('electricity_bills')
        .insert(bill)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electricity_bills'] })
      queryClient.invalidateQueries({ queryKey: ['electricity_bill_forecast'] })
    },
  })
}

export function useUpdateElectricityBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: ElectricityBillUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('electricity_bills')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electricity_bills'] })
      queryClient.invalidateQueries({ queryKey: ['electricity_bill_forecast'] })
    },
  })
}

export function useDeleteElectricityBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('electricity_bills')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electricity_bills'] })
      queryClient.invalidateQueries({ queryKey: ['electricity_bill_forecast'] })
    },
  })
}