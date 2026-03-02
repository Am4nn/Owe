// =============================================================================
// send-invite-email — DB Webhook handler for Phase 14 (Email Invite Delivery)
// =============================================================================
// Receives POST from Supabase DB Webhook on group_invites INSERT.
// Sends a branded invite email via Resend API, then stamps email_sent_at.
//
// SETUP REQUIRED (one-time, Supabase Dashboard):
//   Database → Webhooks → Create webhook
//     Name:   send-invite-email
//     Table:  group_invites
//     Events: INSERT
//     URL:    https://<project-ref>.supabase.co/functions/v1/send-invite-email
//
// SECRETS (Supabase Dashboard → Edge Functions → Secrets):
//   RESEND_API_KEY   — from resend.com → API Keys
//   RESEND_FROM      — e.g. "Owe <invites@yourdomain.com>" (verified in Resend)
//   SUPABASE_URL     — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected; server-only, never in mobile bundle
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_URL = 'https://api.resend.com/emails'

Deno.serve(async (req: Request) => {
  const payload = await req.json()
  const { record } = payload  // group_invites row

  // Safety net: skip if email was already sent (manual re-trigger guard)
  if (record.email_sent_at) {
    return new Response(
      JSON.stringify({ skipped: 'already_sent' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Service role: webhook runs server-side, never in mobile bundle
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Fetch group name + inviter display name
  const [{ data: group }, { data: inviter }] = await Promise.all([
    supabase.from('groups').select('name').eq('id', record.group_id).single(),
    supabase.from('profiles').select('display_name').eq('id', record.invited_by).single(),
  ])

  const groupName = group?.name ?? 'a group'
  const inviterName = inviter?.display_name ?? 'Someone'
  const expiresDate = new Date(record.expires_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  // Build branded HTML email
  const html = buildInviteEmail({ groupName, inviterName, invitedEmail: record.invited_email, expiresDate })

  // Send via Resend
  const resendRes = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('RESEND_FROM') ?? 'Owe <invites@resend.dev>',
      to: [record.invited_email],
      subject: `${inviterName} invited you to "${groupName}" on Owe`,
      html,
    }),
  })

  if (!resendRes.ok) {
    const err = await resendRes.text()
    console.error('Resend error:', err)
    return new Response(JSON.stringify({ error: 'resend_failed', detail: err }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Stamp email_sent_at — audit trail + duplicate guard
  await supabase
    .from('group_invites')
    .update({ email_sent_at: new Date().toISOString() })
    .eq('id', record.id)

  return new Response(
    JSON.stringify({ sent: 1, to: record.invited_email }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})

// ─── Email template ──────────────────────────────────────────────────────────

interface TemplateVars {
  groupName: string
  inviterName: string
  invitedEmail: string
  expiresDate: string
}

function buildInviteEmail({ groupName, inviterName, invitedEmail, expiresDate }: TemplateVars): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to ${groupName} on Owe</title>
</head>
<body style="margin:0;padding:0;background-color:#0e1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0e1117;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#1a1d2e;border-radius:16px;overflow:hidden;border:1px solid #2a2d3e;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;background:linear-gradient(135deg,#1a1d2e 0%,#0e1117 100%);">
              <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#7B5CF6,#6D28D9);border-radius:12px;line-height:48px;font-size:24px;margin-bottom:16px;">∞</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">You're invited to Owe</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0 0 8px;color:#94a3b8;font-size:14px;">Hey there,</p>
              <p style="margin:0 0 24px;color:#e2e8f0;font-size:16px;line-height:1.6;">
                <strong style="color:#ffffff;">${inviterName}</strong> invited you to join
                <strong style="color:#7B5CF6;">${groupName}</strong> on Owe — the free expense splitting app.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="https://owe.app" style="display:inline-block;background:linear-gradient(135deg,#7B5CF6,#6D28D9);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 32px;border-radius:10px;letter-spacing:0.2px;">
                      Open Owe to Accept
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Details card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0e1117;border-radius:10px;border:1px solid #2a2d3e;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:8px;">Invite details</td>
                      </tr>
                      <tr>
                        <td style="color:#94a3b8;font-size:13px;padding:4px 0;">Group: <span style="color:#e2e8f0;font-weight:500;">${groupName}</span></td>
                      </tr>
                      <tr>
                        <td style="color:#94a3b8;font-size:13px;padding:4px 0;">Invited by: <span style="color:#e2e8f0;font-weight:500;">${inviterName}</span></td>
                      </tr>
                      <tr>
                        <td style="color:#94a3b8;font-size:13px;padding:4px 0;">Expires: <span style="color:#e2e8f0;font-weight:500;">${expiresDate}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#475569;font-size:13px;line-height:1.5;">
                Don't have the Owe app yet? Download it free — no ads, no paywalls, all split modes included.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 40px;border-top:1px solid #2a2d3e;">
              <p style="margin:0;color:#334155;font-size:12px;text-align:center;">
                This invite was sent to ${invitedEmail}. If you weren't expecting this, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
