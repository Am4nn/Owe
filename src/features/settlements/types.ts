export interface Settlement {
  id: string
  group_id: string
  payer_id: string       // group_members.id of person paying
  payee_id: string       // group_members.id of person receiving
  amount_cents: number
  currency: string
  note: string | null
  idempotency_key: string
  settled_at: string
  created_at: string
}

export interface CreateSettlementInput {
  group_id: string
  payer_member_id: string
  payee_member_id: string
  amount_cents: number
  currency?: string
  note?: string
  idempotency_key: string
}
