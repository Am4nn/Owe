export interface MemberBalance {
  member_id: string
  display_name: string
  net_cents: number   // positive = owed to them; negative = they owe
}

export interface BalanceSummary {
  total_owed_cents: number      // sum of all positive net positions for current user (across all groups)
  total_owing_cents: number     // sum of all negative net positions (absolute value)
}

export interface DebtSuggestion {
  from_member_id: string
  from_display_name: string
  to_member_id: string
  to_display_name: string
  amount_cents: number
}
