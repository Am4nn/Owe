import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Settlement, CreateSettlementInput } from './types'

/**
 * Create a settlement payment between two group members.
 * Inserts into settlements table and records an activity row.
 */
export function useCreateSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['settlements', 'create'],
    mutationFn: async (input: CreateSettlementInput) => {
      const {
        group_id,
        payer_member_id,
        payee_member_id,
        amount_cents,
        currency = 'USD',
        note,
        idempotency_key,
      } = input

      // Step 1: Insert the settlement
      const { data: settlement, error: settlementError } = await supabase
        .from('settlements')
        .insert({
          group_id,
          payer_id: payer_member_id,
          payee_id: payee_member_id,
          amount_cents,
          currency,
          note: note ?? null,
          idempotency_key,
          settled_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (settlementError) throw settlementError

      // Step 2: Resolve actor_id (current user's member_id in this group)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: actorMember, error: actorError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group_id)
        .eq('user_id', user.id)
        .single()
      if (actorError) throw actorError

      // Step 3: Insert activity row
      const { error: activityError } = await supabase
        .from('activities')
        .insert({
          action_type: 'settlement_recorded',
          group_id,
          actor_id: actorMember.id,
          expense_id: null,
          metadata: { amount_cents },
        })
      if (activityError) throw activityError

      return settlement as Settlement
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ['settlements', input.group_id] })
      qc.invalidateQueries({ queryKey: ['balances'] })
      qc.invalidateQueries({ queryKey: ['activity', input.group_id] })
      qc.invalidateQueries({ queryKey: ['activity', 'all'] })
    },
  })
}

type SettlementWithNames = Settlement & {
  payer_display_name: string
  payee_display_name: string
}

/**
 * Fetch settlement history for a group, enriched with payer and payee display names.
 * Returns settlements ordered by settled_at DESC.
 */
export function useSettlementHistory(groupId: string) {
  return useQuery({
    queryKey: ['settlements', groupId],
    queryFn: async () => {
      // Fetch settlements
      const { data: settlements, error: settlementsError } = await supabase
        .from('settlements')
        .select('*')
        .eq('group_id', groupId)
        .order('settled_at', { ascending: false })
      if (settlementsError) throw settlementsError

      if (!settlements || settlements.length === 0) return [] as SettlementWithNames[]

      // Fetch all group members to resolve display names
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('id, display_name')
        .eq('group_id', groupId)
      if (membersError) throw membersError

      const memberMap = new Map<string, string>(
        (members ?? []).map(m => [m.id, m.display_name])
      )

      return settlements.map(s => ({
        ...s,
        payer_display_name: memberMap.get(s.payer_id) ?? 'Unknown',
        payee_display_name: memberMap.get(s.payee_id) ?? 'Unknown',
      })) as SettlementWithNames[]
    },
    staleTime: 30_000,
  })
}
