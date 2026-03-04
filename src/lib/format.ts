export function formatMoney(cents: number, currencyCode = 'USD'): string {
  const amount = (Math.abs(cents) / 100).toFixed(2)
  return currencyCode === 'USD' ? `$${amount}` : `${currencyCode} ${amount}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
