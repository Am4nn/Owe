import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ActivityItem, Comment, Reaction } from './types'

// Helper to get current user ID
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

/**
 * Fetch the activity feed, optionally filtered by group.
 * With groupId: returns activities for that group (ACTY-02 — filtered view).
 * Without groupId: returns activities across all the user's groups (all-groups view).
 */
export function useActivityFeed(groupId?: string) {
  return useQuery({
    queryKey: ['activity', groupId ?? 'all'],
    queryFn: async () => {
      if (groupId) {
        // Filtered view: single group
        const { data, error } = await supabase
          .from('activities')
          .select('*, actor:group_members!actor_id(display_name)')
          .eq('group_id', groupId)
          .order('created_at', { ascending: false })
          .limit(100)
        if (error) throw error

        return (data ?? []).map(item => ({
          ...item,
          actor_display_name: (item.actor as { display_name: string } | null)?.display_name ?? null,
        })) as ActivityItem[]
      }

      // All-groups view: two-step query (PostgREST cannot express WHERE IN (subquery))
      const userId = await getCurrentUserId()
      const { data: memberships, error: membershipsError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId)
      if (membershipsError) throw membershipsError

      const groupIds = (memberships ?? []).map(m => m.group_id)
      if (groupIds.length === 0) return [] as ActivityItem[]

      const { data, error } = await supabase
        .from('activities')
        .select('*, actor:group_members!actor_id(display_name)')
        .in('group_id', groupIds)
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error

      return (data ?? []).map(item => ({
        ...item,
        actor_display_name: (item.actor as { display_name: string } | null)?.display_name ?? null,
      })) as ActivityItem[]
    },
    staleTime: 30_000,
  })
}

/**
 * Add a comment on an expense. Also inserts an activity row.
 */
export function useAddComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['comments', 'create'],
    mutationFn: async ({ expense_id, body }: { expense_id: string; body: string }) => {
      const userId = await getCurrentUserId()

      // Insert comment
      const { data: comment, error: commentError } = await supabase
        .from('expense_comments')
        .insert({ expense_id, author_id: userId, body })
        .select()
        .single()
      if (commentError) throw commentError

      // Fetch expense to get group_id for activity row
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .select('group_id')
        .eq('id', expense_id)
        .single()
      if (expenseError) throw expenseError

      // Resolve actor member_id
      const { data: actorMember, error: actorError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', expense.group_id)
        .eq('user_id', userId)
        .single()
      if (actorError) throw actorError

      // Insert activity row
      await supabase.from('activities').insert({
        action_type: 'comment_added',
        group_id: expense.group_id,
        actor_id: actorMember.id,
        expense_id,
        metadata: null,
      })

      return comment as Comment
    },
    onSuccess: (_data, { expense_id }) => {
      qc.invalidateQueries({ queryKey: ['comments', expense_id] })
      qc.invalidateQueries({ queryKey: ['activity'] })
    },
  })
}

/**
 * Fetch comments for an expense, ordered by created_at ASC.
 */
export function useComments(expenseId: string) {
  return useQuery({
    queryKey: ['comments', expenseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_comments')
        .select('*, author:profiles!author_id(display_name)')
        .eq('expense_id', expenseId)
        .order('created_at', { ascending: true })
      if (error) throw error

      return (data ?? []).map(c => ({
        ...c,
        author_display_name: (c.author as { display_name: string } | null)?.display_name ?? undefined,
      })) as Comment[]
    },
    staleTime: 30_000,
  })
}

/**
 * Add or update a reaction on an expense (upsert: one reaction per user per expense).
 * Also inserts a reaction_added activity row so the action appears in the group feed.
 */
export function useAddReaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['reactions', 'create'],
    mutationFn: async ({ expense_id, emoji }: { expense_id: string; emoji: string }) => {
      const userId = await getCurrentUserId()

      // Upsert the reaction
      const { data, error } = await supabase
        .from('expense_reactions')
        .upsert(
          { expense_id, user_id: userId, emoji },
          { onConflict: 'expense_id,user_id' }
        )
        .select()
        .single()
      if (error) throw error

      // Fetch expense to get group_id for activity row
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .select('group_id')
        .eq('id', expense_id)
        .single()
      if (expenseError) throw expenseError

      // Resolve actor member_id
      const { data: actorMember, error: actorError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', expense.group_id)
        .eq('user_id', userId)
        .single()
      if (actorError) throw actorError

      // Insert activity row
      const { error: activityError } = await supabase
        .from('activities')
        .insert({
          action_type: 'reaction_added',
          group_id: expense.group_id,
          actor_id: actorMember.id,
          expense_id,
          metadata: { emoji },
        })
      if (activityError) throw activityError

      return { ...(data as Reaction), group_id: expense.group_id }
    },
    onSuccess: (data, { expense_id }) => {
      qc.invalidateQueries({ queryKey: ['reactions', expense_id] })
      qc.invalidateQueries({ queryKey: ['activity', data.group_id] })
      qc.invalidateQueries({ queryKey: ['activity', 'all'] })
    },
  })
}

/**
 * Remove the current user's reaction from an expense.
 */
export function useRemoveReaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['reactions', 'delete'],
    mutationFn: async ({ expense_id }: { expense_id: string }) => {
      const userId = await getCurrentUserId()
      const { error } = await supabase
        .from('expense_reactions')
        .delete()
        .eq('expense_id', expense_id)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: (_data, { expense_id }) => {
      qc.invalidateQueries({ queryKey: ['reactions', expense_id] })
    },
  })
}

/**
 * Fetch all reactions for an expense.
 */
export function useReactions(expenseId: string) {
  return useQuery({
    queryKey: ['reactions', expenseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_reactions')
        .select('*')
        .eq('expense_id', expenseId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as Reaction[]
    },
    staleTime: 30_000,
  })
}
