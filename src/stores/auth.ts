import { AppState, AppStateStatus, Platform } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthStore {
  session: Session | null
  status: AuthStatus
  isAuthenticated: boolean
  setSessionState: (session: Session | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  status: 'loading',
  isAuthenticated: false,
  setSessionState: (session) =>
    set({
      session,
      isAuthenticated: Boolean(session?.user?.id),
      status: session?.user?.id ? 'authenticated' : 'unauthenticated',
    }),
}))

let initialized = false
let appStateSubscription: { remove: () => void } | null = null

export function initializeAuthStore() {
  if (initialized) return
  initialized = true

  const { setSessionState } = useAuthStore.getState()

  supabase.auth.getSession().then(({ data: { session } }) => {
    setSessionState(session)
  })

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      queryClient.clear()
    }
    setSessionState(session)
  })

  if (Platform.OS !== 'web') {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh()
      } else {
        supabase.auth.stopAutoRefresh()
      }
    }

    appStateSubscription = AppState.addEventListener('change', handleAppState)
    handleAppState(AppState.currentState)
  }
}

export function cleanupAuthStore() {
  appStateSubscription?.remove()
  appStateSubscription = null
  initialized = false
}
