import { supabase } from '@/lib/supabase'

/** Returns the current authenticated user. Throws if not authenticated. */
export async function requireUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user
}

/** Convenience: returns just the user ID string. Throws if not authenticated. */
export async function requireUserId(): Promise<string> {
  return (await requireUser()).id
}
