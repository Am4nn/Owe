# Phase 15: Email Invite E2E Completion — Research

**Researched:** 2026-03-03
**Status:** Complete
**Method:** Web research (5 searches) + codebase analysis

---

## Key Findings

### 1. Invite Claim Pattern (Supabase)

**Industry standard:** Per-invite accept/decline is the expected UX (Splitwise, Venmo, etc.). Users should see individual invites and choose to accept or decline each one.

**Our plan assessment:** Plan 15-01 uses `claim_pending_invites()` which claims ALL at once. This is fine for the silent auto-claim on sign-up trigger, but the UI should offer **per-invite accept** for the manual flow.

**✅ Recommendation:** Add a separate `accept_single_invite(invite_id UUID)` function for the UI accept button. Keep `claim_pending_invites` for the sign-up trigger only.

**SECURITY DEFINER best practices confirmed:**
- Always `SET search_path = ''` — prevents schema hijacking
- Use fully-qualified table names (e.g., `public.group_members`)
- Validate all inputs
- Minimal logic — only the privileged operations

### 2. Deep Linking Strategy

**Industry standard:** Universal Links (iOS) and Android App Links are the recommended approach — use HTTPS URLs that open directly in the app if installed.

**Key requirements for Android App Links:**
- `intentFilters` in `app.json` with `autoVerify: true`
- `.well-known/assetlinks.json` hosted on the domain
- Requires EAS rebuild after config change

**Deferred deep linking** (new users: web → install → open → navigate to content) typically requires Branch.io or similar. For MVP, a simpler approach:
- Email CTA → web app URL → auth → invites screen
- "Open in App" button on web page uses `owe://invites` scheme

**Our plan assessment:** Plan 15-03's web-first approach is practical for MVP. Android App Links are a future enhancement (requires domain `.well-known` file + EAS rebuild).

**✅ Recommendation:** Keep web-first approach. Add `intentFilters` config to app.json for future App Links but don't block on `.well-known` file for MVP.

### 3. Splitwise/Venmo Patterns

**Splitwise:**
- Invite by email/phone → group link sharing
- Existing users can merge invitations into their account
- Per-invite accept with group context shown

**Venmo:**
- Deep links with pre-filled data (`venmo://paycharge?txn=pay&...`)
- Fallback to web login page (known friction point)
- Specialized deep linking platforms (URLGenius, etc.) used for reliable app-opening

**Our plan assessment:** Our approach aligns well with Splitwise's model — invite by email, per-invite accept, auto-claim for new signups.

### 4. RLS Policy Design

**Confirmed patterns:**
- UPDATE RLS for invitees: `invited_email = auth.email()` — ✅ Our plan is correct
- DELETE RLS for decline: Same pattern — ✅ Our plan is correct
- The `auth.email()` built-in is the right function (not `auth.users` subquery) — ✅ Already fixed in migration `20260302000009`

### 5. Expo Router Deep Link Handling

**Confirmed:** Expo Router automatically resolves file-based routes from incoming URLs. Creating `app/(app)/invites.tsx` means:
- `owe://invites` → opens invites screen (native)
- `https://you.owe.amanarya.com/invites` → opens invites screen (web or via App Links)

No custom deep link handler code needed — Expo Router handles it.

---

## Plan Improvements Required

Based on research, the following changes should be made to the plans:

### Plan 15-01 Changes
1. **Add `accept_single_invite(invite_id UUID)` function** — for per-invite accept in the UI
2. **Keep `claim_pending_invites`** — for sign-up auto-claim only
3. **Add `useAcceptSingleInvite` hook** — calls the per-invite RPC

### Plan 15-02 Changes
1. **Per-invite accept button** — calls `accept_single_invite`, not `claim_pending_invites`
2. **Keep silent auto-claim on login** — still uses `claim_pending_invites` for background claim

### Plan 15-03 Changes
1. **Add `intentFilters` to `app.json`** — prep for future App Links (doesn't hurt even without `.well-known`)
2. **Email CTA points to web app URL** — confirmed as the right approach
3. **Native `owe://invites` routing handled by Expo Router** — no custom code needed

---

*Phase: 15-email-invite-e2e-completion*
*Research completed: 2026-03-03 via web search + codebase analysis*
