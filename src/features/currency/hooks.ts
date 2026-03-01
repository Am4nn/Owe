import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { FxRate, CurrencyOption } from './types'

// Curated list of ~50 most common currencies (CURR-01/02 picker)
export const COMMON_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'din' },
]

/**
 * Fetch all FX rates from the fx_rates table (populated hourly by fx-rates-cache Edge Function).
 * staleTime 30 min — rates are only updated hourly by cron; no need to refetch frequently.
 */
export function useFxRates() {
  return useQuery<Record<string, number>>({
    queryKey: ['fx_rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fx_rates')
        .select('currency, rate_to_usd')
      if (error) throw error
      const rateMap: Record<string, number> = {}
      ;(data as FxRate[]).forEach((r) => { rateMap[r.currency] = r.rate_to_usd })
      return rateMap
    },
    staleTime: 30 * 60 * 1000,  // 30 minutes
  })
}

/**
 * Compute amount_base_cents from amount_cents using the rate map.
 * Returns { amountBaseCents, fxRate }.
 * Uses Math.round for integer cents — never float arithmetic on monetary values.
 */
export function computeBaseCents(
  amountCents: number,
  expenseCurrency: string,
  baseCurrency: string,
  rates: Record<string, number>  // currency -> rate_to_usd
): { amountBaseCents: number; fxRate: number } {
  if (expenseCurrency === baseCurrency) return { amountBaseCents: amountCents, fxRate: 1.0 }
  const expenseRate = rates[expenseCurrency] ?? 1
  const baseRate = rates[baseCurrency] ?? 1
  const fxRate = expenseRate / baseRate
  const amountBaseCents = Math.round(amountCents * fxRate)
  return { amountBaseCents, fxRate }
}
