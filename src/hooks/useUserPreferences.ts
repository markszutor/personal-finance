import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert']
type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update']

export function useUserPreferences(userId?: string) {
  return useQuery({
    queryKey: ['user_preferences', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        throw error
      }
      
      return data as UserPreferences | null
    },
    enabled: !!userId,
  })
}

export function useCreateUserPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (preferences: UserPreferencesInsert) => {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert(preferences)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_preferences'] })
    },
  })
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ user_id, ...updates }: UserPreferencesUpdate & { user_id: string }) => {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user_id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_preferences'] })
    },
  })
}