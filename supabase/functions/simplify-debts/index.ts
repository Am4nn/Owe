import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Split {
  member_id: string
  amount_cents: number
  expense: {
    payer_id: string
    group_id: string
    deleted_at: string | null
  }
}

interface Settlement {
  payer_id: string
  payee_id: string
  amount_cents: number
}

interface DebtSuggestion {
  from_member_id: string
  to_member_id: string
  amount_cents: number
}

Deno.serve(async (req: Request) => {
  try {
    const { group_id } = await req.json()

    if (!group_id) {
      return new Response(
        JSON.stringify({ error: 'group_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Use anon key + forwarded user JWT — NOT service_role — so RLS applies
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization')

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    })

    // Fetch expense_splits with payer info
    const { data: splits, error: splitsError } = await supabase
      .from('expense_splits')
      .select('member_id, amount_cents, expense:expenses!inner(payer_id, group_id, deleted_at)')
      .eq('expenses.group_id', group_id)
      .is('expenses.deleted_at', null)

    if (splitsError) throw splitsError

    // Fetch settlements for this group
    const { data: settlements, error: settlementsError } = await supabase
      .from('settlements')
      .select('payer_id, payee_id, amount_cents')
      .eq('group_id', group_id)

    if (settlementsError) throw settlementsError

    // Build net balance Map using same logic as client-side useGroupBalances
    // payer gains positive (they fronted money), split member loses (they owe)
    const balances = new Map<string, number>()

    for (const split of (splits as Split[]) ?? []) {
      const payerId = split.expense.payer_id
      balances.set(payerId, (balances.get(payerId) ?? 0) + split.amount_cents)
      balances.set(split.member_id, (balances.get(split.member_id) ?? 0) - split.amount_cents)
    }

    for (const s of (settlements as Settlement[]) ?? []) {
      balances.set(s.payer_id, (balances.get(s.payer_id) ?? 0) + s.amount_cents)
      balances.set(s.payee_id, (balances.get(s.payee_id) ?? 0) - s.amount_cents)
    }

    // Greedy debt simplification algorithm
    // creditors: members owed money (net > 0), sorted descending
    // debtors: members who owe money (net < 0, stored as positive amount), sorted descending
    const creditors: Array<{ id: string; amount: number }> = []
    const debtors: Array<{ id: string; amount: number }> = []

    for (const [id, net] of balances.entries()) {
      if (net > 0) {
        creditors.push({ id, amount: net })
      } else if (net < 0) {
        debtors.push({ id, amount: Math.abs(net) })
      }
      // net === 0: already settled, skip
    }

    const suggestions: DebtSuggestion[] = []

    while (creditors.length > 0 && debtors.length > 0) {
      // Sort both descending by amount
      creditors.sort((a, b) => b.amount - a.amount)
      debtors.sort((a, b) => b.amount - a.amount)

      const creditor = creditors[0]
      const debtor = debtors[0]

      // Payment is the minimum of what the creditor is owed and what the debtor owes
      const payment = Math.min(creditor.amount, debtor.amount)

      suggestions.push({
        from_member_id: debtor.id,
        to_member_id: creditor.id,
        amount_cents: payment,
      })

      creditor.amount -= payment
      debtor.amount -= payment

      // Remove fully-settled entries
      if (creditor.amount === 0) creditors.shift()
      if (debtor.amount === 0) debtors.shift()
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
