export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares'

export interface Expense {
  id: string
  group_id: string
  created_by: string | null
  description: string
  amount_cents: number
  currency: string
  base_currency: string
  fx_rate_at_creation: number
  amount_base_cents: number
  split_type: SplitType
  payer_id: string | null
  expense_date: string       // ISO date string YYYY-MM-DD
  category: string | null
  deleted_at: string | null
  idempotency_key: string
  version: number
  created_at: string
  updated_at: string
}

export interface ExpenseSplit {
  id: string
  expense_id: string
  member_id: string
  amount_cents: number
  created_at: string
}

export interface SplitInput {
  member_id: string
  amount_cents?: number   // exact mode
  percentage?: number     // percentage mode
  shares?: number         // shares mode
}

export interface CreateExpenseInput {
  group_id: string
  description: string
  amount_cents: number
  currency?: string
  split_type: SplitType
  payer_member_id: string
  expense_date: string
  category?: string
  splits: Array<{ member_id: string; amount_cents: number }>
  idempotency_key: string  // UUID generated client-side with crypto.randomUUID()
}

export interface UpdateExpenseInput {
  id: string
  group_id: string
  description?: string
  amount_cents?: number
  split_type?: SplitType
  payer_member_id?: string
  expense_date?: string
  category?: string
  splits?: Array<{ member_id: string; amount_cents: number }>
}
