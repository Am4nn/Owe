import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { MemberBalance, BalanceSummary, DebtSuggestion } from './types'

// Helper to get current user ID
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

/**
 * BALS-02: Fetch per-member net balances for a group.
 * Positive net_cents = that member is owed money.
 * Negative net_cents = that member owes money.
 */
export function useGroupBalances(groupId: string) {
  return useQuery({
    queryKey: ['balances', groupId],
    queryFn: async () => {
      // Step 1: expense_splits with payer info via inner join to expenses
      // NOTE: Supabase PostgREST requires filtering joined tables by original table name
      const { data: splits, error: splitsError } = await supabase
        .from('expense_splits')
        .select('member_id, amount_cents, expense:expenses!inner(payer_id, group_id, deleted_at)')
        .eq('expenses.group_id', groupId)
        .is('expenses.deleted_at', null)

      if (splitsError) throw splitsError

      // Step 2: settlements for this group
      const { data: settlements, error: settlementsError } = await supabase
        .from('settlements')
        .select('payer_id, payee_id, amount_cents')
        .eq('group_id', groupId)

      if (settlementsError) throw settlementsError

      // Step 3: net balance computation
      // payer gains positive (they fronted the money), split member loses (they owe)
      const balances = new Map<string, number>()

      for (const split of splits ?? []) {
        const expense = (split.expense as unknown) as { payer_id: string; group_id: string; deleted_at: string | null }
        const payerId = expense.payer_id
        balances.set(payerId, (balances.get(payerId) ?? 0) + split.amount_cents)
        balances.set(split.member_id, (balances.get(split.member_id) ?? 0) - split.amount_cents)
      }

      for (const s of settlements ?? []) {
        balances.set(s.payer_id, (balances.get(s.payer_id) ?? 0) + s.amount_cents)
        balances.set(s.payee_id, (balances.get(s.payee_id) ?? 0) - s.amount_cents)
      }

      // Step 4: fetch member display names
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('id, display_name')
        .eq('group_id', groupId)

      if (membersError) throw membersError

      const memberMap = new Map<string, string>()
      for (const m of members ?? []) {
        memberMap.set(m.id, m.display_name)
      }

      // Step 5: build MemberBalance array, sorted by net_cents descending
      const result: MemberBalance[] = []
      for (const [member_id, net_cents] of balances.entries()) {
        result.push({
          member_id,
          display_name: memberMap.get(member_id) ?? member_id,
          net_cents,
        })
      }

      return result.sort((a, b) => b.net_cents - a.net_cents)
    },
    staleTime: 30_000,
  })
}

/**
 * BALS-01: Fetch balance summary for the current user across all groups.
 * total_owed_cents = how much others owe the current user (positive net positions).
 * total_owing_cents = how much the current user owes (absolute value of negative positions).
 */
export function useBalanceSummary() {
  return useQuery({
    queryKey: ['balances', 'summary'],
    queryFn: async () => {
      const userId = await getCurrentUserId()

      // Get all group_member rows for this user
      const { data: memberships, error: membershipsError } = await supabase
        .from('group_members')
        .select('id, group_id')
        .eq('user_id', userId)

      if (membershipsError) throw membershipsError
      if (!memberships || memberships.length === 0) {
        return { total_owed_cents: 0, total_owing_cents: 0 } as BalanceSummary
      }

      let total_owed_cents = 0
      let total_owing_cents = 0

      // For each group the user is in, compute their net position
      for (const membership of memberships) {
        const memberId = membership.id
        const groupId = membership.group_id

        // Splits where this member is involved (as payer or split recipient)
        const { data: splits } = await supabase
          .from('expense_splits')
          .select('member_id, amount_cents, expense:expenses!inner(payer_id, group_id, deleted_at)')
          .eq('expenses.group_id', groupId)
          .is('expenses.deleted_at', null)

        // Settlements for this group
        const { data: settlements } = await supabase
          .from('settlements')
          .select('payer_id, payee_id, amount_cents')
          .eq('group_id', groupId)

        let netCents = 0

        for (const split of splits ?? []) {
          const expense = (split.expense as unknown) as { payer_id: string; group_id: string; deleted_at: string | null }
          if (expense.payer_id === memberId) {
            netCents += split.amount_cents
          }
          if (split.member_id === memberId) {
            netCents -= split.amount_cents
          }
        }

        for (const s of settlements ?? []) {
          if (s.payer_id === memberId) {
            netCents += s.amount_cents
          }
          if (s.payee_id === memberId) {
            netCents -= s.amount_cents
          }
        }

        if (netCents > 0) {
          total_owed_cents += netCents
        } else if (netCents < 0) {
          total_owing_cents += Math.abs(netCents)
        }
      }

      return { total_owed_cents, total_owing_cents } as BalanceSummary
    },
    staleTime: 30_000,
  })
}

/**
 * BALS-03: Fetch simplified debt suggestions from the Edge Function.
 * Calls the server-side greedy debt simplification algorithm.
 */
export function useSimplifiedDebts(groupId: string) {
  return useQuery({
    queryKey: ['simplifiedDebts', groupId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('simplify-debts', {
        body: { group_id: groupId },
      })
      if (error) throw error

      // data.suggestions contains the raw suggestions from the Edge Function
      const suggestions = (data?.suggestions ?? []) as Array<{
        from_member_id: string
        to_member_id: string
        amount_cents: number
      }>

      // Look up display names from group_members
      const { data: members } = await supabase
        .from('group_members')
        .select('id, display_name')
        .eq('group_id', groupId)

      const memberMap = new Map<string, string>()
      for (const m of members ?? []) {
        memberMap.set(m.id, m.display_name)
      }

      const result: DebtSuggestion[] = suggestions.map(s => ({
        from_member_id: s.from_member_id,
        from_display_name: memberMap.get(s.from_member_id) ?? s.from_member_id,
        to_member_id: s.to_member_id,
        to_display_name: memberMap.get(s.to_member_id) ?? s.to_member_id,
        amount_cents: s.amount_cents,
      }))

      return result
    },
    staleTime: 60_000,
  })
}

/**
 * BALS-01 Realtime: Subscribe to expense changes for a group and invalidate balance queries.
 * CRITICAL: Returns cleanup function to prevent channel accumulation (memory leak).
 */
export function useRealtimeExpenseSync(groupId: string) {
  const qc = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`expenses:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['expenses', groupId] })
          qc.invalidateQueries({ queryKey: ['balances', groupId] })
        }
      )
      .subscribe()

    // CRITICAL: remove channel on unmount to prevent channel accumulation
    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, qc])
}
