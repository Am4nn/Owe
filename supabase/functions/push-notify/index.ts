// =============================================================================
// push-notify — Supabase DB Webhook handler for NOTF-01 and NOTF-02
// =============================================================================
// Receives POST requests from Supabase Database Webhooks on INSERT events for
// the `expenses` and `settlements` tables.
//
// SETUP REQUIRED (one-time, Supabase Dashboard):
//   Database → Webhooks → Create webhook
//     - Name: notify-new-expense    Table: expenses    Events: INSERT
//     - Name: notify-new-settlement Table: settlements Events: INSERT
//   Both webhooks should point to: /functions/v1/push-notify
//
// ENVIRONMENT VARIABLES (set in Supabase Dashboard → Edge Functions → Secrets):
//   SUPABASE_URL            — auto-injected by Supabase runtime
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected; intentionally server-only (not in mobile bundle)
//   EXPO_ACCESS_TOKEN       — from expo.dev Account → Access Tokens (for authenticated push)
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

Deno.serve(async (req: Request) => {
  const payload = await req.json()
  const { table, record } = payload

  // Service role intentional: webhook runs server-side, never in mobile bundle
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  let recipientUserIds: string[] = []
  let title = ''
  let body = ''
  let dataUrl = ''

  if (table === 'expenses') {
    // NOTF-01: notify all group members except the expense creator
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', record.group_id)
      .neq('user_id', record.created_by)
      .not('user_id', 'is', null)

    recipientUserIds = (members ?? []).map((m: { user_id: string }) => m.user_id)
    title = 'New expense added'
    body = record.description ?? 'An expense was added to your group'
    dataUrl = `/expenses/${record.id}`
  } else if (table === 'settlements') {
    // NOTF-02: notify the payee (the group member who received the payment)
    const { data: payeeMember } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('id', record.payee_id)
      .maybeSingle()

    if (payeeMember?.user_id) recipientUserIds = [payeeMember.user_id]
    title = 'Settlement recorded'
    body = 'You received a payment in your group'
    dataUrl = `/groups/${record.group_id}/settlements`
  }

  if (recipientUserIds.length === 0) {
    return new Response(JSON.stringify({ skipped: 'no recipients' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fetch push tokens — filter rows with null token at DB level
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, push_token')
    .in('id', recipientUserIds)
    .not('push_token', 'is', null)

  const tokenToUserId = new Map<string, string>()
  ;(profiles ?? []).forEach((p: { id: string; push_token: string }) => {
    if (p.push_token) tokenToUserId.set(p.push_token, p.id)
  })

  if (tokenToUserId.size === 0) {
    return new Response(JSON.stringify({ skipped: 'no tokens' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Batch at most 100 per Expo Push API limit per request
  const tokenList = Array.from(tokenToUserId.keys()).slice(0, 100)
  const messages = tokenList.map((to) => ({
    to,
    title,
    body,
    sound: 'default',
    data: { url: dataUrl },
  }))

  const pushRes = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // EXPO_ACCESS_TOKEN scopes push sends to this project — prevents token abuse
      'Authorization': `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN') ?? ''}`,
    },
    body: JSON.stringify(messages),
  })
  const pushJson = await pushRes.json()

  // Handle DeviceNotRegistered receipts: null out stale tokens to keep the DB clean
  // Expo returns tickets[i].status === 'error' with details.error === 'DeviceNotRegistered'
  const tickets: Array<{ status: string; details?: { error?: string } }> = pushJson.data ?? []
  const staleTokens = tickets
    .map((t, i) =>
      t.status === 'error' && t.details?.error === 'DeviceNotRegistered' ? tokenList[i] : null
    )
    .filter(Boolean) as string[]

  if (staleTokens.length > 0) {
    await supabase
      .from('profiles')
      .update({ push_token: null })
      .in('push_token', staleTokens)
  }

  return new Response(
    JSON.stringify({ sent: messages.length, stale_cleared: staleTokens.length }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
