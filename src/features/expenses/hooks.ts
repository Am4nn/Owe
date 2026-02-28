import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CreateExpenseInput, UpdateExpenseInput, Expense, ExpenseSplit } from './types'

// Helper to get current user ID
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

/**
 * Fetch all non-deleted expenses for a group, ordered by expense_date DESC.
 * staleTime 30s — keeps showing cached data while refetching in background.
 */
export function useExpenses(groupId: string) {
  return useQuery({
    queryKey: ['expenses', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', groupId)
        .is('deleted_at', null)
        .order('expense_date', { ascending: false })
      if (error) throw error
      return data as Expense[]
    },
    staleTime: 30_000,
  })
}

/**
 * Fetch a single expense with its splits via joined select.
 */
export function useExpense(expenseId: string) {
  return useQuery({
    queryKey: ['expenses', 'detail', expenseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, expense_splits(*)')
        .eq('id', expenseId)
        .single()
      if (error) throw error
      return data as Expense & { expense_splits: ExpenseSplit[] }
    },
    staleTime: 30_000,
  })
}

/**
 * Create an expense with splits.
 * Two-step insert: (a) INSERT into expenses, (b) INSERT all splits into expense_splits.
 * On split failure: DELETE the orphaned expense row, then throw.
 * mutationKey required for OFFL-02 offline queue (plan 02-03).
 */
export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['expenses', 'create'],
    mutationFn: async (input: CreateExpenseInput) => {
      const {
        group_id,
        description,
        amount_cents,
        currency = 'USD',
        split_type,
        payer_member_id,
        expense_date,
        category,
        splits,
        idempotency_key,
      } = input

      // Step 1: Insert the expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          group_id,
          description,
          amount_cents,
          currency,
          base_currency: currency,
          fx_rate_at_creation: 1.0,
          amount_base_cents: amount_cents,
          split_type,
          payer_id: payer_member_id,
          expense_date,
          category: category ?? null,
          idempotency_key,
          created_by: await getCurrentUserId(),
        })
        .select()
        .single()
      if (expenseError) throw expenseError

      // Step 2: Insert all splits
      const splitRows = splits.map(s => ({
        expense_id: expense.id,
        member_id: s.member_id,
        amount_cents: s.amount_cents,
      }))

      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(splitRows)

      if (splitsError) {
        // Rollback: delete the orphaned expense row
        await supabase.from('expenses').delete().eq('id', expense.id)
        throw splitsError
      }

      return expense as Expense
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ['expenses', input.group_id] })
      qc.invalidateQueries({ queryKey: ['balances'] })
    },
  })
}

/**
 * Update an existing expense and replace its splits.
 * Replaces splits by deleting existing ones and inserting new set.
 */
export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['expenses', 'update'],
    mutationFn: async (input: UpdateExpenseInput) => {
      const { id, description, amount_cents, split_type, payer_member_id, expense_date, category, splits } = input

      // Update expense fields (only include provided fields)
      const { data: updatedExpense, error: expenseError } = await supabase
        .from('expenses')
        .update({
          ...(description !== undefined && { description }),
          ...(amount_cents !== undefined && { amount_cents }),
          ...(split_type !== undefined && { split_type }),
          ...(payer_member_id !== undefined && { payer_id: payer_member_id }),
          ...(expense_date !== undefined && { expense_date }),
          ...(category !== undefined && { category }),
        })
        .eq('id', id)
        .select()
        .single()
      if (expenseError) throw expenseError

      // Replace splits if provided
      if (splits && splits.length > 0) {
        // Delete existing splits
        const { error: deleteError } = await supabase
          .from('expense_splits')
          .delete()
          .eq('expense_id', id)
        if (deleteError) throw deleteError

        // Insert new splits
        const splitRows = splits.map(s => ({
          expense_id: id,
          member_id: s.member_id,
          amount_cents: s.amount_cents,
        }))
        const { error: insertError } = await supabase
          .from('expense_splits')
          .insert(splitRows)
        if (insertError) throw insertError
      }

      return updatedExpense as Expense
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ['expenses', input.group_id] })
      qc.invalidateQueries({ queryKey: ['expenses', 'detail', input.id] })
      qc.invalidateQueries({ queryKey: ['balances'] })
    },
  })
}

/**
 * Soft-delete an expense: sets deleted_at = now().
 * Only the creator can delete their own expense.
 */
export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['expenses', 'delete'],
    mutationFn: async ({ id, group_id }: { id: string; group_id: string }) => {
      const userId = await getCurrentUserId()
      const { error } = await supabase
        .from('expenses')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('created_by', userId)
      if (error) throw error
      return { id, group_id }
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ['expenses', input.group_id] })
      qc.invalidateQueries({ queryKey: ['expenses', 'detail', input.id] })
      qc.invalidateQueries({ queryKey: ['balances'] })
    },
  })
}
