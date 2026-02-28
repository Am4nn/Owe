import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Group, GroupMember, CreateGroupInput, AddNamedMemberInput, InviteMemberInput } from './types'

// Helper to get current user ID
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

// GRUP-04: List all groups the current user belongs to
// Offline: React Query reads from MMKV cache when network is unavailable (OFFL-01)
export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          group_id,
          role,
          groups (
            id,
            name,
            base_currency,
            created_by,
            version,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', await getCurrentUserId())
      if (error) throw error
      return data?.map(row => row.groups as unknown as Group).filter(Boolean) ?? []
    },
    staleTime: 30_000, // Show stale groups, refetch in background after 30s
    // gcTime defaults to 24h from queryClient.ts — keeps cache alive across sessions (OFFL-01)
  })
}

// Get a single group with its members
export function useGroup(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: async () => {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()
      if (groupError) throw groupError

      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
      if (membersError) throw membersError

      return { group: group as Group, members: members as GroupMember[] }
    },
    staleTime: 30_000,
  })
}

// GRUP-01: Create a group — creator is automatically added as admin in the same operation
export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, base_currency = 'USD', named_members = [] }: CreateGroupInput) => {
      const userId = await getCurrentUserId()

      // Fetch current user's display name for the group_members row
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single()

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({ name, base_currency, created_by: userId })
        .select()
        .single()
      if (groupError) throw groupError

      // Add creator as admin (GRUP-01 requirement — creator must be in the group)
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: userId,
          display_name: profile?.display_name ?? 'You',
          role: 'admin',
        })
      if (memberError) throw memberError

      // GRUP-03: Add named-only (non-app) members in the same operation
      if (named_members.length > 0) {
        const namedRows = named_members.map(displayName => ({
          group_id: group.id,
          user_id: null,           // NULL = named-only member
          display_name: displayName,
          role: 'member' as const,
        }))
        const { error: namedError } = await supabase
          .from('group_members')
          .insert(namedRows)
        if (namedError) throw namedError
      }

      return group as Group
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

// GRUP-03: Add a named-only (non-app) member to an existing group
export function useAddNamedMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ group_id, display_name }: AddNamedMemberInput) => {
      const { data, error } = await supabase
        .from('group_members')
        .insert({
          group_id,
          user_id: null,        // NULL = named-only
          display_name,
          role: 'member',
        })
        .select()
        .single()
      if (error) throw error
      return data as GroupMember
    },
    onSuccess: (_data, { group_id }) => {
      qc.invalidateQueries({ queryKey: ['groups', group_id] })
    },
  })
}

// GRUP-02: Invite a member by email
export function useInviteMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ group_id, email }: InviteMemberInput) => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('group_invites')
        .insert({
          group_id,
          invited_email: email.toLowerCase().trim(),
          invited_by: userId,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, { group_id }) => {
      qc.invalidateQueries({ queryKey: ['groups', group_id] })
    },
  })
}

// GRUP-05: Leave a group
export function useLeaveGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (groupId: string) => {
      const userId = await getCurrentUserId()
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
