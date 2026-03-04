import { supabase } from '@/lib/supabase'

interface InsertActivityParams {
  userId: string
  groupId: string
  actionType: string
  expenseId?: string | null
  metadata?: Record<string, unknown> | null
}

/**
 * Resolves the actor's group_members.id from their auth user ID,
 * then inserts an activity row. Consolidates ~90 lines of duplicated
 * boilerplate across expenses, settlements, and activity hooks.
 */
export async function insertActivity({
  userId,
  groupId,
  actionType,
  expenseId = null,
  metadata = null,
}: InsertActivityParams): Promise<void> {
  // Resolve actor_id (current user's member_id in this group)
  const { data: actorMember, error: actorError } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()
  if (actorError) throw actorError

  // Insert activity row
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      action_type: actionType,
      group_id: groupId,
      actor_id: actorMember.id,
      expense_id: expenseId,
      metadata,
    })
  if (activityError) throw activityError
}
