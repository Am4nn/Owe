import { computeEqualSplits, computeExactSplits, computePercentageSplits, computeSharesSplits } from './splits'

describe('computeEqualSplits', () => {
  it('distributes remainder to first members', () => {
    const result = computeEqualSplits(1000, ['a', 'b', 'c'])
    expect(result).toEqual([
      { member_id: 'a', amount_cents: 334 },
      { member_id: 'b', amount_cents: 333 },
      { member_id: 'c', amount_cents: 333 },
    ])
  })
  it('splits evenly with no remainder', () => {
    const result = computeEqualSplits(100, ['a', 'b'])
    expect(result.every(r => r.amount_cents === 50)).toBe(true)
  })
  it('always sums to totalCents', () => {
    const result = computeEqualSplits(997, ['a', 'b', 'c', 'd'])
    expect(result.reduce((s, r) => s + r.amount_cents, 0)).toBe(997)
  })
  it('returns empty array for empty member list', () => {
    expect(computeEqualSplits(1000, [])).toEqual([])
  })
  it('assigns entire amount to single member', () => {
    expect(computeEqualSplits(999, ['a'])).toEqual([{ member_id: 'a', amount_cents: 999 }])
  })
  it('handles totalCents smaller than member count (1 cent across 3 members)', () => {
    const result = computeEqualSplits(1, ['a', 'b', 'c'])
    expect(result.reduce((s, r) => s + r.amount_cents, 0)).toBe(1)
    expect(result[0].amount_cents).toBe(1)
    expect(result[1].amount_cents).toBe(0)
    expect(result[2].amount_cents).toBe(0)
  })
})

describe('computeSharesSplits', () => {
  it('allocates proportionally and sums exactly', () => {
    const result = computeSharesSplits(1000, [{ member_id: 'a', shares: 1 }, { member_id: 'b', shares: 2 }])
    expect(result.reduce((s, r) => s + r.amount_cents, 0)).toBe(1000)
    expect(result[1].amount_cents).toBe(667)
  })
  it('assigns entire amount to single member', () => {
    const result = computeSharesSplits(500, [{ member_id: 'a', shares: 5 }])
    expect(result).toEqual([{ member_id: 'a', amount_cents: 500 }])
  })
  it('throws when total shares is zero', () => {
    expect(() => computeSharesSplits(1000, [{ member_id: 'a', shares: 0 }])).toThrow()
  })
  it('handles float share weights summing to total', () => {
    const result = computeSharesSplits(1000, [{ member_id: 'a', shares: 1.5 }, { member_id: 'b', shares: 2.5 }])
    expect(result.reduce((s, r) => s + r.amount_cents, 0)).toBe(1000)
    expect(result[0].amount_cents).toBe(375)
  })
  it('returns empty array for empty member list', () => {
    expect(computeSharesSplits(1000, [])).toEqual([])
  })
})

describe('computePercentageSplits', () => {
  it('converts percentages to cent amounts summing to total', () => {
    const result = computePercentageSplits(1000, [{ member_id: 'a', percentage: 33 }, { member_id: 'b', percentage: 67 }])
    expect(result.reduce((s, r) => s + r.amount_cents, 0)).toBe(1000)
  })
  it('throws when percentages do not sum to 100', () => {
    expect(() => computePercentageSplits(1000, [{ member_id: 'a', percentage: 50 }])).toThrow()
  })
  it('accepts percentages within 0.01 tolerance (99.999)', () => {
    expect(() => computePercentageSplits(1000, [{ member_id: 'a', percentage: 50.0005 }, { member_id: 'b', percentage: 49.9985 }])).not.toThrow()
  })
  it('throws when percentages exceed tolerance (sum = 100.02)', () => {
    expect(() => computePercentageSplits(1000, [{ member_id: 'a', percentage: 60 }, { member_id: 'b', percentage: 40.02 }])).toThrow()
  })
  it('single member at 100% gets entire amount', () => {
    const result = computePercentageSplits(750, [{ member_id: 'a', percentage: 100 }])
    expect(result).toEqual([{ member_id: 'a', amount_cents: 750 }])
  })
})

describe('computeExactSplits', () => {
  it('throws when amounts do not sum to total', () => {
    expect(() => computeExactSplits(1000, [{ member_id: 'a', amount_cents: 600 }, { member_id: 'b', amount_cents: 300 }])).toThrow('Exact splits do not sum to total')
  })
  it('returns inputs directly when sum matches', () => {
    const inputs = [{ member_id: 'a', amount_cents: 400 }, { member_id: 'b', amount_cents: 600 }]
    expect(computeExactSplits(1000, inputs)).toEqual(inputs)
  })
  it('accepts single member when amount equals total', () => {
    expect(computeExactSplits(500, [{ member_id: 'a', amount_cents: 500 }])).toEqual([{ member_id: 'a', amount_cents: 500 }])
  })
  it('accepts empty array when totalCents is zero', () => {
    expect(computeExactSplits(0, [])).toEqual([])
  })
})
