import { formatMoney, formatDate } from './format'

describe('formatMoney', () => {
  it('formats USD with dollar sign by default', () => {
    expect(formatMoney(1500)).toBe('$15.00')
  })

  it('formats USD with dollar sign when specified explicitly', () => {
    expect(formatMoney(2550, 'USD')).toBe('$25.50')
  })

  it('formats non-USD with currency code prefix', () => {
    expect(formatMoney(1500, 'EUR')).toBe('EUR 15.00')
  })

  it('handles zero cents correctly', () => {
    expect(formatMoney(0)).toBe('$0.00')
    expect(formatMoney(0, 'GBP')).toBe('GBP 0.00')
  })

  it('handles negative cents by using the absolute value', () => {
    expect(formatMoney(-1500)).toBe('$15.00')
    expect(formatMoney(-2550, 'CAD')).toBe('CAD 25.50')
  })

  it('handles large amounts properly', () => {
    expect(formatMoney(123456789)).toBe('$1234567.89')
  })

  it('handles single cents correctly', () => {
    expect(formatMoney(5)).toBe('$0.05')
  })
})

describe('formatDate', () => {
  it('formats standard ISO date string', () => {
    // using 12:00:00Z ensures the local date remains the same across most timezones
    expect(formatDate('2023-10-15T12:00:00Z')).toBe('Oct 15, 2023')
  })

  it('handles dates with time components', () => {
    expect(formatDate('2023-12-25T14:30:00Z')).toBe('Dec 25, 2023')
  })

  it('formats different months correctly', () => {
    expect(formatDate('2024-01-01T00:00:00Z')).toBe('Jan 1, 2024')
    expect(formatDate('2024-02-15T00:00:00Z')).toBe('Feb 15, 2024')
  })
})
