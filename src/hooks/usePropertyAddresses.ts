import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface PropertyAddress {
  id: string
  user_id: string
  address_line_1: string
  address_line_2?: string
  city: string
  state_province?: string
  postal_code?: string
  country: string
  nickname?: string
  is_current: boolean
  move_in_date: string
  move_out_date?: string
  has_day_night_meter: boolean
  created_at: string
  updated_at: string
}

export interface PropertyAddressInsert {
  user_id: string
  address_line_1: string
  address_line_2?: string
  city: string
  state_province?: string
  postal_code?: string
  country?: string
  nickname?: string
  is_current?: boolean
  move_in_date?: string
  move_out_date?: string
  has_day_night_meter?: boolean
}

export interface PropertyAddressUpdate {
  address_line_1?: string
  address_line_2?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  nickname?: string
  is_current?: boolean
  move_in_date?: string
  move_out_date?: string
  has_day_night_meter?: boolean
}

export interface ElectricityConsumptionHistory {
  bill_date: string
  reading_date: string
  total_usage: number
  day_usage: number
  night_usage: number
  amount_paid: number
  currency: string
  property_nickname: string
  forecasted_amount: number
  forecast_accuracy: number
}

export function usePropertyAddresses(userId?: string) {
  return useQuery({
    queryKey: ['property_addresses', userId],
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('property_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('move_in_date', { ascending: false })

      if (error) throw error
      return data as PropertyAddress[]
    },
    enabled: !!userId,
  })
}

export function useCurrentPropertyAddress(userId?: string) {
  return useQuery({
    queryKey: ['current_property_address', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const { data, error } = await supabase
        .from('property_addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_current', true)
        .order('move_in_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data as PropertyAddress | null
    },
    enabled: !!userId,
  })
}

export function useElectricityConsumptionHistory(userId?: string, months: number = 12) {
  return useQuery({
    queryKey: ['electricity_consumption_history', userId, months],
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase.rpc('get_electricity_consumption_history', {
        p_user_id: userId,
        p_months: months
      })

      if (error) throw error
      return data as ElectricityConsumptionHistory[]
    },
    enabled: !!userId,
  })
}

export function useCreatePropertyAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (address: PropertyAddressInsert) => {
      // If this is being set as current, update all other addresses to not be current
      if (address.is_current) {
        await supabase
          .from('property_addresses')
          .update({ is_current: false })
          .eq('user_id', address.user_id)
      }

      const { data, error } = await supabase
        .from('property_addresses')
        .insert(address)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property_addresses'] })
      queryClient.invalidateQueries({ queryKey: ['current_property_address'] })
    },
  })
}

export function useUpdatePropertyAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, user_id, ...updates }: PropertyAddressUpdate & { id: string; user_id: string }) => {
      // If this is being set as current, update all other addresses to not be current
      if (updates.is_current) {
        await supabase
          .from('property_addresses')
          .update({ is_current: false })
          .eq('user_id', user_id)
      }

      const { data, error } = await supabase
        .from('property_addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property_addresses'] })
      queryClient.invalidateQueries({ queryKey: ['current_property_address'] })
    },
  })
}

export function useDeletePropertyAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('property_addresses')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property_addresses'] })
      queryClient.invalidateQueries({ queryKey: ['current_property_address'] })
    },
  })
}