// =============================================================================
// process-reminders — Daily pg_cron Edge Function for NOTF-03 smart reminders
// =============================================================================
// Triggered daily at 08:00 UTC by the pg_cron job in migration 20260301000005.
// Iterates all enabled reminder_config rows, checks whether the user has debts
// in that group older than delay_days, and sends a push reminder if so.
//
// ENVIRONMENT VARIABLES (auto-injected by Supabase runtime):
//   SUPABASE_URL              — project URL
//   SUPABASE_SERVICE_ROLE_KEY — service role (server-only; not in mobile bundle)
//   EXPO_ACCESS_TOKEN         — Expo push access token (set in Supabase Secrets)
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

Deno.serve(async (_req: Request) => {
  // Service role intentional: cron job runs server-side, not in mobile bundle
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Fetch all enabled reminder configurations
  const { data: configs, error } = await supabase
    .from('reminder_config')
    .select('user_id, group_id, delay_days')
    .eq('enabled', true)

  if (error || !configs || configs.length === 0) {
    return new Response(JSON.stringify({ skipped: 'no active configs' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const messages: Array<{
    to: string
    title: string
    body: string
    sound: string
    data: object
  }> = []

  for (const config of configs) {
    // Cutoff: splits created before this date count as "old enough to remind"
    const cutoff = new Date(Date.now() - config.delay_days * 86_400_000).toISOString()

    // Resolve this user's group_member.id for the given group
    const { data: member } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', config.group_id)
      .eq('user_id', config.user_id)
      .maybeSingle()

    if (!member) continue

    // Find expense_splits this member owes that are older than delay_days
    // Filter: split is old, expense is not deleted, belongs to this group,
    //         and the member is NOT the payer (they owe someone else)
    const { data: splits } = await supabase
      .from('expense_splits')
      .select('amount_cents, created_at, expense:expenses(payer_id, deleted_at, group_id)')
      .eq('member_id', member.id)
      .lt('created_at', cutoff)

    const unpaidSplits = (splits ?? []).filter((s: any) =>
      s.expense?.deleted_at === null &&
      s.expense?.group_id === config.group_id &&
      s.expense?.payer_id !== member.id   // member owes (they are NOT the payer)
    )

    if (unpaidSplits.length === 0) continue

    const totalOwedCents = unpaidSplits.reduce(
      (sum: number, s: any) => sum + s.amount_cents,
      0
    )
    if (totalOwedCents <= 0) continue

    // Fetch the user's push token
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', config.user_id)
      .maybeSingle()

    if (!profile?.push_token) continue

    messages.push({
      to: profile.push_token,
      title: 'Debt reminder',
      body: `You still owe $${(totalOwedCents / 100).toFixed(2)} in a group. Tap to settle up.`,
      sound: 'default',
      data: { url: `/groups/${config.group_id}` },
    })
  }

  if (messages.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Send in batches of 100 (Expo Push API limit per request)
  for (let i = 0; i < messages.length; i += 100) {
    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN') ?? ''}`,
      },
      body: JSON.stringify(messages.slice(i, i + 100)),
    })
  }

  return new Response(JSON.stringify({ sent: messages.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
