export interface ActivityItem {
  id: string
  group_id: string
  actor_id: string | null
  actor_display_name: string | null
  action_type: 'expense_added' | 'expense_edited' | 'expense_deleted' | 'settlement_recorded' | 'comment_added' | 'reaction_added'
  expense_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Comment {
  id: string
  expense_id: string
  author_id: string
  author_display_name?: string
  body: string
  created_at: string
}

export interface Reaction {
  id: string
  expense_id: string
  user_id: string
  emoji: string
  created_at: string
}
