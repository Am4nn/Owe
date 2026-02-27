// IMPORTANT: This import must be at the top — it installs the localStorage polyfill
import 'expo-sqlite/localStorage/install'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// SECURITY: Only the anon key goes here. NEVER import or use SUPABASE_SERVICE_ROLE_KEY
// in any client-side file. Service role key lives in Supabase Vault + CI secrets only.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,      // expo-sqlite localStorage polyfill — no 2048-byte limit
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,  // Not a web app; URL-based OAuth not used
  },
})
