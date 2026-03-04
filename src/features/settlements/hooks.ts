import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { requireUserId } from '@/lib/auth'
import { insertActivity } from '@/lib/activity'
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

      // Step 2: Insert activity row via shared helper
      const userId = await requireUserId()
      await insertActivity({
        userId,
        groupId: group_id,
        actionType: 'settlement_recorded',
        metadata: { amount_cents },
      })

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
