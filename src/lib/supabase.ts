import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

const webStorage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value)
    return Promise.resolve()
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key)
    return Promise.resolve()
  },
}

const authStorage = Platform.OS === 'web' ? webStorage : secureStoreAdapter

// SECURITY: Only the anon key goes here. NEVER import or use the Supabase service role key
// in any client-side file. It belongs only in Supabase Vault and CI secrets.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
