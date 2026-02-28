/**
 * Pure split calculation functions for all four split modes.
 * All functions maintain the invariant: splits.reduce((s, m) => s + m.amount_cents, 0) === totalCents
 * No external dependencies — safe to use in tests and offline contexts.
 */

export interface SplitResult {
  member_id: string
  amount_cents: number
}

/**
 * Equal split: base = floor(total/n), remainder distributed to first n members.
 * Invariant: sum of all amounts === totalCents
 */
export function computeEqualSplits(
  totalCents: number,
  memberIds: string[]
): SplitResult[] {
  const n = memberIds.length
  if (n === 0) return []

  const base = Math.floor(totalCents / n)
  const remainder = totalCents - base * n

  const splits = memberIds.map((member_id, i) => ({
    member_id,
    amount_cents: i < remainder ? base + 1 : base,
  }))

  // Assert invariant
  const sum = splits.reduce((s, r) => s + r.amount_cents, 0)
  if (sum !== totalCents) {
    throw new Error(`computeEqualSplits: sum ${sum} !== totalCents ${totalCents}`)
  }

  return splits
}

/**
 * Exact split: validates that the provided amounts sum to totalCents.
 * Throws if validation fails. Returns input amounts directly.
 */
export function computeExactSplits(
  totalCents: number,
  memberAmounts: Array<{ member_id: string; amount_cents: number }>
): SplitResult[] {
  const sum = memberAmounts.reduce((s, m) => s + m.amount_cents, 0)
  if (sum !== totalCents) {
    throw new Error('Exact splits do not sum to total')
  }
  return memberAmounts.map(({ member_id, amount_cents }) => ({ member_id, amount_cents }))
}

/**
 * Percentage split: validates that percentages sum to 100 (±0.01 tolerance).
 * Delegates to computeSharesSplits using percentage values as share weights.
 * Throws if percentages do not sum to 100.
 */
export function computePercentageSplits(
  totalCents: number,
  memberPercentages: Array<{ member_id: string; percentage: number }>
): SplitResult[] {
  const percentageSum = memberPercentages.reduce((s, m) => s + m.percentage, 0)
  if (Math.abs(percentageSum - 100) > 0.01) {
    throw new Error(`Percentages must sum to 100, got ${percentageSum}`)
  }

  // Delegate to computeSharesSplits using percentage values as share weights
  return computeSharesSplits(
    totalCents,
    memberPercentages.map(m => ({ member_id: m.member_id, shares: m.percentage }))
  )
}

/**
 * Shares split: proportional allocation using integer (or float) share weights.
 * For all but the last member: amount = floor(shares/totalShares * totalCents).
 * Last member absorbs any remaining cents to ensure invariant holds.
 * Invariant: sum of all amounts === totalCents
 */
export function computeSharesSplits(
  totalCents: number,
  memberShares: Array<{ member_id: string; shares: number }>
): SplitResult[] {
  if (memberShares.length === 0) return []

  const totalShares = memberShares.reduce((s, m) => s + m.shares, 0)
  if (totalShares === 0) {
    throw new Error('computeSharesSplits: total shares cannot be zero')
  }

  let assigned = 0
  const splits: SplitResult[] = []

  for (let i = 0; i < memberShares.length; i++) {
    const m = memberShares[i]
    if (i < memberShares.length - 1) {
      const amount = Math.floor((m.shares / totalShares) * totalCents)
      splits.push({ member_id: m.member_id, amount_cents: amount })
      assigned += amount
    } else {
      // Last member absorbs remainder to ensure invariant
      splits.push({ member_id: m.member_id, amount_cents: totalCents - assigned })
    }
  }

  // Assert invariant
  const sum = splits.reduce((s, r) => s + r.amount_cents, 0)
  if (sum !== totalCents) {
    throw new Error(`computeSharesSplits: sum ${sum} !== totalCents ${totalCents}`)
  }

  return splits
}
