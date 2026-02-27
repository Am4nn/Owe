// IMPORTANT: This import must be at the top — it installs the localStorage polyfill
import 'expo-sqlite/localStorage/install'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// SECURITY: Only the anon key goes here. NEVER import or use the Supabase service role key
// in any client-side file. It belongs only in Supabase Vault and CI secrets.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,      // expo-sqlite localStorage polyfill — no 2048-byte limit
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,  // Not a web app; URL-based OAuth not used
  },
})
