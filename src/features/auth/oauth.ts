import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from '@/lib/supabase'


export function useOAuthGoogle() {
  async function signInWithGoogle() {
    const redirectUri = makeRedirectUri({
      path: '/(app)',
    })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    })

    if (error) throw error
    return data
  }

  return { signInWithGoogle }
}
