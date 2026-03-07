import { Platform } from 'react-native'
import { Session, User } from '@supabase/supabase-js'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryClient as globalQueryClient } from '@/lib/queryClient'
import type { Profile, SignInInput, SignUpInput, UpdateProfileInput } from './types'
import { makeRedirectUri } from 'expo-auth-session'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import * as WebBrowser from 'expo-web-browser'
import { AuthStatus, useAuthStore } from '@/stores/auth'

WebBrowser.maybeCompleteAuthSession()

const redirectTo = makeRedirectUri()
// Reads "owe" scheme from app.json automatically.
// Produces "owe://..." on EAS dev client. Register "owe://**" in Supabase dashboard.

export interface AuthSession {
  user: User | null,
  status: AuthStatus,
  isAuthenticated: boolean,
  isLoading: boolean,
}

export function useSession(): AuthSession {
  const user = useAuthStore((state) => state.session?.user || null)
  const status = useAuthStore((state) => state.status)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return { user, status, isAuthenticated, isLoading: status === 'loading' }
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

// Helper: extract tokens from OAuth redirect URL and call setSession
// Exported so auth screens can use it for cold-start deep link handling
export const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url)
  if (errorCode) throw new Error(errorCode)
  const { access_token, refresh_token } = params
  if (!access_token) return  // User cancelled OAuth — URL has no tokens
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? '',
  })
  if (error) throw error
  return data.session
  // onAuthStateChange in useSession fires automatically after setSession,
  // routing the user into the (app) stack. No manual navigation needed.
}

// AUTH-06: Google OAuth sign-in (also creates account for new Google users)
// AUTH-07: Account linking is handled server-side by Supabase — no client code needed
export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: async () => {
      // Step 1: Get the Google authorization URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })
      if (error) throw error

      // Step 2 & 3: Only for Native
      const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo)

      if (res.type === 'success') {
        await createSessionFromUrl(res.url)
      }
    },
  })
}

