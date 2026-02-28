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
})

describe('computeSharesSplits', () => {
  it('allocates proportionally and sums exactly', () => {
    const result = computeSharesSplits(1000, [{ member_id: 'a', shares: 1 }, { member_id: 'b', shares: 2 }])
    expect(result.reduce((s, r) => s + r.amount_cents, 0)).toBe(1000)
    expect(result[1].amount_cents).toBe(667)
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
})

describe('computeExactSplits', () => {
  it('throws when amounts do not sum to total', () => {
    expect(() => computeExactSplits(1000, [{ member_id: 'a', amount_cents: 600 }, { member_id: 'b', amount_cents: 300 }])).toThrow('Exact splits do not sum to total')
  })
  it('returns inputs directly when sum matches', () => {
    const inputs = [{ member_id: 'a', amount_cents: 400 }, { member_id: 'b', amount_cents: 600 }]
    expect(computeExactSplits(1000, inputs)).toEqual(inputs)
  })
})
