import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryClient as globalQueryClient } from '@/lib/queryClient'
import type { Profile, SignInInput, SignUpInput, UpdateProfileInput } from './types'

// AUTH-03: Session persistence — reads from expo-sqlite localStorage on mount
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load the persisted session from expo-sqlite localStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    // Subscribe to auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { session, isLoading }
}

// AUTH-01: Sign up with email + password + display name
export function useSignUp() {
  return useMutation({
    mutationFn: async ({ email, password, displayName }: SignUpInput) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName }, // Passed to handle_new_user trigger
        },
      })
      if (error) throw error
      return data
    },
  })
}

// AUTH-02: Sign in with email + password
export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: SignInInput) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    },
  })
}

// AUTH-04: Sign out — clears session AND React Query cache (prevents stale data leakage)
export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      // Clear ALL cached server state when user signs out
      // This prevents stale data from one user leaking to the next session
      globalQueryClient.clear()
    },
  })
}

// AUTH-05: Read the current user's profile
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data as Profile
    },
    staleTime: 60_000, // Profile data is stable — refresh every minute
  })
}

// AUTH-05: Update display name and/or avatar
export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      return data as Profile
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
