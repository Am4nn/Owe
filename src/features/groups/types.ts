export interface Group {
  id: string
  name: string
  base_currency: string
  created_by: string | null
  version: number
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string | null    // null = named-only (non-app) member (GRUP-03)
  display_name: string
  role: 'admin' | 'member'
  joined_at: string
  created_at: string
}

export interface CreateGroupInput {
  name: string
  base_currency?: string
  named_members?: string[]  // Display names for non-app members (GRUP-03)
}

export interface AddNamedMemberInput {
  group_id: string
  display_name: string
}

export interface InviteMemberInput {
  group_id: string
  email: string
}
