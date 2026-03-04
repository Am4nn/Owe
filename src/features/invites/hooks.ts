import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { GroupInvite } from './types'

// INVT-E2E-02: Claim pending invites on login (silent background auto-claim)
// Called once after auth session is established — claims ALL invites matching user's email
export function useClaimInvites() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return 0
      const { data, error } = await supabase.rpc('claim_pending_invites', {
        target_user_id: user.id,
        target_email: user.email,
      })
      if (error) throw error
      return data as number
    },
    onSuccess: (count) => {
      if (count && count > 0) {
        qc.invalidateQueries({ queryKey: ['groups'] })
        qc.invalidateQueries({ queryKey: ['invites', 'pending'] })
      }
    },
  })
}

// INVT-E2E-03: Fetch pending invites for the current user
export function usePendingInvites() {
  return useQuery({
    queryKey: ['invites', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_invites')
        .select(`
          id,
          group_id,
          invited_email,
          invited_by,
          accepted_at,
          expires_at,
          created_at,
          groups ( id, name ),
          inviter:profiles!group_invites_invited_by_fkey ( display_name )
        `)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as GroupInvite[]
    },
    staleTime: 30_000,
  })
}

// INVT-E2E-03: Accept a single invite — per-invite UI action
export function useAcceptInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase.rpc('accept_single_invite', {
        p_invite_id: inviteId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invites', 'pending'] })
      qc.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

// INVT-E2E-03: Decline an invite — deletes the invite row
export function useDeclineInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('group_invites')
        .delete()
        .eq('id', inviteId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invites', 'pending'] })
    },
  })
}
