export interface FxRate {
  currency: string      // e.g. 'EUR'
  rate_to_usd: number   // e.g. 1.087 (1 EUR = 1.087 USD)
  fetched_at: string
}

export interface CurrencyOption {
  code: string    // ISO 4217 e.g. 'EUR'
  name: string    // e.g. 'Euro'
  symbol: string  // e.g. '€'
}
