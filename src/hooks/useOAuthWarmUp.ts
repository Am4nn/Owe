import { useEffect } from 'react'
import * as Linking from 'expo-linking'
import { warmUpBrowser, coolDownBrowser } from '@/lib/platform'
import { createSessionFromUrl } from '@/features/auth/hooks'

/**
 * Handles OAuth cold-start redirect + WebBrowser warm-up.
 * Uses platform adapter — no-op on web, real warm-up on native.
 */
export function useOAuthWarmUp() {
  useEffect(() => {
    warmUpBrowser()
    return () => { coolDownBrowser() }
  }, [])

  const url = Linking.useLinkingURL()
  useEffect(() => {
    if (url) createSessionFromUrl(url)
  }, [url])
}
