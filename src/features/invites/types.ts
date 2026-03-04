export interface GroupInvite {
  id: string
  group_id: string
  invited_email: string
  invited_by: string
  accepted_at: string | null
  expires_at: string
  created_at: string
  groups: { id: string; name: string }
  inviter: { display_name: string }
}
