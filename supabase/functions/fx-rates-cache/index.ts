import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FX_API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const res = await fetch(FX_API_URL)
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'FX fetch failed', status: res.status }), { status: 502 })
  }
  const json = await res.json()
  const usdRates: Record<string, number> = json.usd  // { eur: 0.92, gbp: 0.79, jpy: 149.5, ... }

  // Convert to rate_to_usd: how many USD = 1 unit of currency
  // fawazahmed0 gives USD→OTHER so rate_to_usd = 1 / usdRates[currency]
  const rows = Object.entries(usdRates).map(([currency, usdPerUnit]) => ({
    currency: currency.toUpperCase(),
    rate_to_usd: usdPerUnit === 0 ? 1 : 1 / usdPerUnit,
    fetched_at: new Date().toISOString(),
  }))

  // Upsert all rows — fx_rates table primary key is currency
  const { error } = await supabase
    .from('fx_rates')
    .upsert(rows, { onConflict: 'currency' })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ updated: rows.length }), { status: 200 })
})
