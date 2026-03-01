# Phase 6: Google OAuth Verification - Research

**Researched:** 2026-03-01
**Domain:** Documentation audit trail — writing a missing VERIFICATION.md for Phase 1.5 (Google OAuth)
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-06 | User can sign in (or create an account) with Google OAuth — one tap, no password required | `useSignInWithGoogle` hook in `src/features/auth/hooks.ts` (lines 146–169) implements the full signInWithOAuth + WebBrowser.openAuthSessionAsync pattern; "Continue with Google" button wired on both auth screens |
| AUTH-07 | A Google sign-in using an email that already exists as an email/password account is automatically linked — no duplicate user created | Supabase server-side identity linking handles this; migration `20260228000002_google_oauth.sql` documents the AUTH-07 note explicitly (lines 13–16); no client code needed |
</phase_requirements>

---

## Summary

Phase 6 is a pure documentation task. All Phase 1.5 code is confirmed correct — the integration checker verified it, and the SUMMARY.md records clean execution with no deviations. The only gap is the absence of a `1.5-VERIFICATION.md` in `.planning/phases/01.5-google-oauth-inserted/`. Writing that file completes the audit trail for AUTH-06 and AUTH-07.

This research identifies the exact format, content, and evidence required to write that VERIFICATION.md correctly. The format is sourced directly from `01-VERIFICATION.md` (Phase 1) and `02-VERIFICATION.md` (Phase 2). The code evidence is sourced directly from `src/features/auth/hooks.ts`, `app/(auth)/sign-in.tsx`, `app/(auth)/sign-up.tsx`, and `supabase/migrations/20260228000002_google_oauth.sql`. All files exist and are substantive.

The resulting VERIFICATION.md should have `status: passed` (not `human_needed`), because the code wiring is fully verified statically. Two human verification items are appropriate: the cold-start OAuth flow (requires a live device), and account linking (requires a test with a pre-existing email/password account and a Google account sharing the same email address).

**Primary recommendation:** Write `1.5-VERIFICATION.md` to `.planning/phases/01.5-google-oauth-inserted/` using the Phase 1 VERIFICATION.md as the exact template. The evidence is all available in the codebase — no code changes are required.

---

## VERIFICATION.md Format (Sourced from Phase 1 and Phase 2 Templates)

### YAML Front Matter

Both existing VERIFICATION.md files open with a YAML front matter block. The exact fields are:

```yaml
---
phase: {phase-slug}
verified: {ISO-8601 datetime}
status: passed | human_needed | gaps_found
score: {N}/{N} must-haves verified
re_verification:          # omit if first and only verification pass
  previous_status: ...
  previous_score: ...
  gaps_closed: [...]
  gaps_remaining: []
  regressions: []
human_verification:       # list only items that cannot be verified statically
  - test: "..."
    expected: "..."
    why_human: "..."
---
```

For Phase 1.5:
- `phase`: `01.5-google-oauth-inserted`
- `verified`: `2026-02-28T00:00:00Z` (Phase 1.5 completed 2026-02-28)
- `status`: `human_needed` (code is verified; OAuth flow and account linking require device runtime)
- `score`: `4/4 must-haves verified` (the 4 Phase 1.5 success criteria from ROADMAP.md)
- `re_verification`: omit (this is the first and only verification pass)
- `human_verification`: 2 items — cold-start OAuth flow and account linking

### Body Structure

The body follows this exact order (confirmed from both template files):

1. **Phase Goal + Status header** (sentence paragraph, not a list)
2. **`## Goal Achievement`** — observable truths table mapping each ROADMAP.md success criterion
3. **`## Required Artifacts`** — table of files created/modified, with Exists/Lines/Substantive/Wired/Status columns
4. **`## Key Link Verification`** — table verifying the wiring between components
5. **`## Requirements Coverage`** — table mapping requirement IDs to evidence
6. **`## Anti-Patterns Found`** — any stubs, TODOs, console.logs found (or "none found" statement)
7. **`## Human Verification Required`** — numbered sections with Test/Expected/Why human for each item
8. **`## Gaps Summary`** — explicit "No gaps remain" or enumerated gap descriptions
9. **Footer** — `_Verified: {date}_`, `_Verifier: Claude (gsd-verifier)_`

---

## Phase 1.5 Success Criteria (from ROADMAP.md)

These are the 4 must-haves that drive the Observable Truths table:

| # | Truth (from ROADMAP.md Phase 1.5 Success Criteria) |
|---|-----------------------------------------------------|
| 1 | User can tap "Continue with Google" on sign-in or sign-up screen, complete the OAuth flow in a browser, and land back in the app fully authenticated |
| 2 | A Google sign-in using an email that already has an email/password account links to the existing account — no duplicate user, no data loss |
| 3 | All existing email/password flows (sign up, sign in, sign out, session persistence) continue to work exactly as before |
| 4 | `handle_new_user` DB trigger correctly populates `display_name` and `avatar_url` from Google metadata for new OAuth users |

---

## Code Evidence Map

### Evidence for AUTH-06 (Google OAuth sign-in/sign-up)

**File:** `src/features/auth/hooks.ts`

Key code at lines 144–169:
```typescript
// AUTH-06: Google OAuth sign-in (also creates account for new Google users)
// AUTH-07: Account linking is handled server-side by Supabase — no client code needed
export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,  // Required: we open the browser manually below
        },
      })
      if (error) throw error
      const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo)
      if (res.type === 'success') {
        await createSessionFromUrl(res.url)
      }
    },
  })
}
```

Also at lines 7–15 (module-level setup):
```typescript
import { makeRedirectUri } from 'expo-auth-session'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()  // Required for web platform

const redirectTo = makeRedirectUri()
// Reads "owe" scheme from app.json automatically.
// Produces "owe://..." on EAS dev client. Register "owe://**" in Supabase dashboard.
```

And `createSessionFromUrl` helper at lines 129–142:
```typescript
export const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url)
  if (errorCode) throw new Error(errorCode)
  const { access_token, refresh_token } = params
  if (!access_token) return  // User cancelled OAuth — URL has no tokens
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? '',
  })
  if (error) throw error
  return data.session
}
```

**File:** `app/(auth)/sign-in.tsx`

Key wiring at lines 7–11, 27–37, 39, 98–113:
```typescript
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { useSignIn, useSignInWithGoogle, createSessionFromUrl } from '@/features/auth/hooks'

// AUTH-06: WebBrowser warmup
useEffect(() => {
  WebBrowser.warmUpAsync()
  return () => { WebBrowser.coolDownAsync() }
}, [])

// AUTH-06: Cold-start deep link handler
const url = Linking.useURL()
useEffect(() => {
  if (url) createSessionFromUrl(url)
}, [url])

const { mutate: signInWithGoogle, isPending: isPendingGoogle } = useSignInWithGoogle()
```

Google button JSX at lines 105–113:
```tsx
{/* AUTH-06: Google OAuth sign-in button */}
<Button
  title={isPendingGoogle ? 'Opening Google...' : 'Continue with Google'}
  onPress={() => signInWithGoogle(undefined, {
    onError: (error) => Alert.alert('Google Sign-In Failed', error.message),
  })}
  disabled={isPendingGoogle}
  variant="secondary"
/>
```

**File:** `app/(auth)/sign-up.tsx`

Identical wiring to sign-in.tsx (lines 7–11, 27–40, 121–129) — both screens have the full warmup + cold-start handler + Google button pattern.

### Evidence for AUTH-07 (Account Linking)

**File:** `supabase/migrations/20260228000002_google_oauth.sql`

The AUTH-07 mechanism is documented in the migration file at lines 13–16:
```sql
-- AUTH-07 note: This trigger fires ONLY on INSERT into auth.users (new user creation).
-- For linked accounts (existing email/password user signs in with Google for first time),
-- Supabase adds a row to auth.identities but does NOT INSERT into auth.users.
-- The existing profile.display_name and avatar_url are preserved for linked accounts.
```

The account linking behavior is Supabase server-side — no client code is required. The `useSignInWithGoogle` hook calls `supabase.auth.signInWithOAuth` which routes through Supabase's identity management. Supabase automatically links a new Google identity to an existing user when the emails match, inserting into `auth.identities` rather than creating a new `auth.users` row.

### Evidence for DB Trigger (Success Criterion 4)

**File:** `supabase/migrations/20260228000002_google_oauth.sql` (full content):
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data ->> 'display_name',  -- email/password path
      new.raw_user_meta_data ->> 'full_name'       -- Google OAuth path
    ),
    new.raw_user_meta_data ->> 'avatar_url'        -- Google provides this; NULL for email/password
  );
  RETURN new;
END;
$$;
```

`CREATE OR REPLACE` preserves the existing `on_auth_user_created` trigger binding — no trigger DROP/RECREATE is needed.

### Evidence for Existing Flows Unaffected (Success Criterion 3)

The SUMMARY.md records that all 6 existing auth hooks (`useSession`, `useSignUp`, `useSignIn`, `useSignOut`, `useProfile`, `useUpdateProfile`) were left untouched — `useSignInWithGoogle` and `createSessionFromUrl` were added additively. Both auth screens had the Google-specific code added without touching the existing form logic, submit handlers, or navigation links. Package additions (expo-auth-session, expo-web-browser, expo-crypto) are additive to package.json.

---

## Required Artifacts Table (for VERIFICATION.md)

| Artifact | Expected | Exists | Lines | Substantive | Wired | Status |
|----------|----------|--------|-------|-------------|-------|--------|
| `src/features/auth/hooks.ts` | Added `useSignInWithGoogle`, `createSessionFromUrl`, module-level `WebBrowser.maybeCompleteAuthSession()`, `makeRedirectUri` imports | Yes | 169 | Yes — 3-step OAuth flow: `signInWithOAuth(skipBrowserRedirect:true)` → `openAuthSessionAsync` → `createSessionFromUrl`; cold-start URL extraction via `QueryParams.getQueryParams` | Yes — imported in `sign-in.tsx` line 11 and `sign-up.tsx` line 11 | VERIFIED |
| `supabase/migrations/20260228000002_google_oauth.sql` | `CREATE OR REPLACE FUNCTION handle_new_user` with `COALESCE(display_name, full_name)` and `avatar_url` | Yes | 37 | Yes — COALESCE covers both email/password and Google key names; `avatar_url` populated from Google metadata; `SECURITY DEFINER SET search_path = ''` preserved | Applied to Supabase project (manual `supabase db push` required per SUMMARY.md) | VERIFIED |
| `app/(auth)/sign-in.tsx` | WebBrowser warmup, `Linking.useURL()` cold-start handler, `useSignInWithGoogle`, divider JSX, Google button (`variant="secondary"`) | Yes | 123 | Yes — all four elements present; warmup in `useEffect` with cleanup; cold-start handler in second `useEffect`; Google button with loading state and error handling | Yes — rendered in the sign-in screen | VERIFIED |
| `app/(auth)/sign-up.tsx` | Same additions as sign-in.tsx; all existing form logic unchanged | Yes | 139 | Yes — identical Google OAuth wiring to sign-in.tsx; existing displayName/email/password form and nav links untouched | Yes — rendered in the sign-up screen | VERIFIED |

---

## Key Link Verification (for VERIFICATION.md)

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/(auth)/sign-in.tsx` | `src/features/auth/hooks.ts` | `import { useSignInWithGoogle, createSessionFromUrl }` (line 11) | WIRED | Both functions imported and called — `useSignInWithGoogle` on button press, `createSessionFromUrl` in cold-start `useURL` effect |
| `app/(auth)/sign-up.tsx` | `src/features/auth/hooks.ts` | `import { useSignInWithGoogle, createSessionFromUrl }` (line 11) | WIRED | Same imports and call pattern as sign-in.tsx |
| `useSignInWithGoogle` | `expo-web-browser` | `WebBrowser.openAuthSessionAsync(data.url, redirectTo)` | WIRED | `skipBrowserRedirect: true` in `signInWithOAuth` ensures Supabase does not auto-open browser; Expo controls browser lifecycle |
| `createSessionFromUrl` | `supabase.auth.setSession` | `access_token` + `refresh_token` extracted by `QueryParams.getQueryParams` | WIRED | `onAuthStateChange` in `useSession` fires automatically after `setSession`, routing user into `(app)` stack — no manual navigation needed |
| `makeRedirectUri()` | `app.json` scheme | Reads `owe` scheme automatically | WIRED | Produces `owe://...` deep link URL; requires `owe://**` wildcard in Supabase Auth URL Configuration Redirect URLs |
| `supabase/migrations/20260228000002_google_oauth.sql` | `auth.users` trigger | `CREATE OR REPLACE FUNCTION public.handle_new_user()` | WIRED | `on_auth_user_created` trigger binding preserved (no DROP/RECREATE); COALESCE populates `display_name` from either key; `avatar_url` populated from Google metadata |
| `sign-in.tsx` warmup | `sign-in.tsx` cooldown | `WebBrowser.warmUpAsync()` in useEffect with `WebBrowser.coolDownAsync()` cleanup | WIRED | Chrome Custom Tabs pre-warming on Android — improves browser open speed; cleanup prevents resource leaks |
| `sign-in.tsx` cold-start | `createSessionFromUrl` | `Linking.useURL()` → `useEffect` → `createSessionFromUrl(url)` | WIRED | Catches OAuth redirect URL when Android cold-starts the app process (OpenAuthSession returns 'cancel' on cold-start, but Linking.useURL() catches the deep link) |

---

## Human Verification Items (Cannot Be Verified Statically)

### 1. Cold-Start OAuth Flow (AUTH-06)

**What it is:** On Android, when the OS kills the app process during the OAuth browser session, the deep link redirect cold-starts a new app process instead of resuming the existing one. `WebBrowser.openAuthSessionAsync` returns `'cancel'` in this case. The `Linking.useURL()` handler in both auth screens catches the URL in this scenario and calls `createSessionFromUrl`.

**Why it cannot be verified statically:** Requires running the app on an Android device, initiating the Google OAuth flow, and simulating or observing process kill during the browser session. The code wiring is confirmed correct, but the runtime behavior of `Linking.useURL()` firing on cold-start requires a live device test.

**Test procedure:**
1. Run the app in EAS dev client on an Android device
2. Tap "Continue with Google" on the sign-in screen
3. Complete the Google account selection in the browser
4. Observe whether the app returns to the authenticated dashboard

**Expected:** App lands on the dashboard fully authenticated, regardless of whether Android killed the process during the OAuth flow.

### 2. Account Linking (AUTH-07)

**What it is:** When a user who already has an email/password account uses Google OAuth with the same email, Supabase should link the Google identity to the existing account (`auth.identities` row added, no new `auth.users` row inserted, existing `profiles` row preserved).

**Why it cannot be verified statically:** Requires a live Supabase project with a pre-existing email/password account, and a Google account sharing the same email address. The Supabase server-side linking behavior cannot be tested via static code analysis.

**Test procedure:**
1. Create an account with email `test@gmail.com` using email/password sign-up
2. Sign out
3. Sign in with Google using the same `test@gmail.com` Google account
4. Verify: same user ID in `auth.users`, no second row created, original profile data preserved

**Expected:** Google sign-in logs in as the existing user — same profile, same group memberships, no duplicate.

---

## Artifacts Created vs Modified (from SUMMARY.md)

**Files created:**
- `supabase/migrations/20260228000002_google_oauth.sql`

**Files modified:**
- `src/features/auth/hooks.ts` — additive (6 existing hooks untouched; 2 new exports added)
- `app/(auth)/sign-in.tsx` — additive (existing form logic untouched; 4 Google OAuth elements added)
- `app/(auth)/sign-up.tsx` — additive (identical to sign-in.tsx additions)
- `package.json` — added expo-auth-session@~55.0.6, expo-web-browser@~55.0.9, expo-crypto@~55.0.8
- `pnpm-lock.yaml` — updated lockfile

**Task commits:**
- `ad387da` — feat: install OAuth packages, hook, migration
- `0410755` — feat: wire Google button and cold-start handler

---

## Anti-Patterns to Check (for VERIFICATION.md scan)

The VERIFICATION.md should scan for and confirm absence of:
- Stubs or `// TODO` comments in the new OAuth code
- Empty handlers (button press doing nothing)
- `console.log` used as OAuth debugging left in production code
- `skipBrowserRedirect` omitted from `signInWithOAuth` options (a critical pitfall that would bypass the Expo flow)
- Missing cold-start handler on either auth screen (if one screen has it and the other doesn't, Android cold-starts on that screen would fail)

Based on the code read, all four concern areas are clean:
- No TODO/stub comments in hooks.ts OAuth code or auth screens
- Button handlers call `signInWithGoogle` with error handling
- No console.log statements in the OAuth flow
- `skipBrowserRedirect: true` is present (hooks.ts line 154)
- Cold-start handler present in both `sign-in.tsx` (lines 34–37) and `sign-up.tsx` (lines 35–38)

---

## Standard Stack

### Core (already installed — no new installs needed for this documentation phase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-auth-session | ~55.0.6 | OAuth PKCE flow, `makeRedirectUri` | Expo SDK 55 official OAuth library |
| expo-web-browser | ~55.0.9 | Opens browser for OAuth, warmup/cooldown | Required companion to expo-auth-session for in-app browser |
| expo-crypto | ~55.0.8 | PKCE code verifier generation | Peer dep of expo-auth-session |
| @supabase/supabase-js | existing | `signInWithOAuth`, `setSession`, identity linking | Project-standard Supabase client |

---

## Architecture Patterns

### Pattern 1: Expo OAuth via WebBrowser (implemented in Phase 1.5)

**What:** Three-step pattern — `signInWithOAuth(skipBrowserRedirect:true)` to get the authorization URL, `WebBrowser.openAuthSessionAsync` to open and wait, `createSessionFromUrl` on success to extract tokens and establish session.

**Why `skipBrowserRedirect: true`:** Supabase's default behavior opens its own system browser. With `skipBrowserRedirect: true`, Supabase returns the URL without opening anything, and Expo controls the browser lifecycle via `WebBrowser.openAuthSessionAsync`.

**Pattern 2: Cold-Start Guard via Linking.useURL()**

`WebBrowser.openAuthSessionAsync` returns `'cancel'` when Android kills the app process during the OAuth flow (cold-start). The `Linking.useURL()` hook in both auth screens catches the deep-link URL in this scenario, calling `createSessionFromUrl` to complete authentication.

**Pattern 3: CREATE OR REPLACE for Trigger Function Migration**

`CREATE OR REPLACE FUNCTION` patches the function body while preserving the existing `on_auth_user_created` trigger binding. No DROP/RECREATE of the trigger is needed. This is the correct migration pattern when adding OAuth support to an existing email/password trigger.

---

## Common Pitfalls (documented for context; all avoided in Phase 1.5 implementation)

### Pitfall 1: Missing `skipBrowserRedirect: true`
**What goes wrong:** Supabase auto-opens its own browser, bypassing `WebBrowser.openAuthSessionAsync`. The Expo deep-link handling never fires.
**Status in codebase:** AVOIDED — `skipBrowserRedirect: true` present at hooks.ts line 154.

### Pitfall 2: Missing Cold-Start Handler
**What goes wrong:** On Android, process kill during OAuth flow means `openAuthSessionAsync` returns `'cancel'`. Without `Linking.useURL()`, the user is stuck on the auth screen even though the OAuth succeeded.
**Status in codebase:** AVOIDED — cold-start handler present on both `sign-in.tsx` and `sign-up.tsx`.

### Pitfall 3: Omitting `WebBrowser.maybeCompleteAuthSession()`
**What goes wrong:** Required for web platform OAuth completion. Missing it causes the OAuth window to not close correctly on web.
**Status in codebase:** AVOIDED — called at module level in hooks.ts line 11.

### Pitfall 4: Wrong Supabase Redirect URL Allowlist Entry
**What goes wrong:** `makeRedirectUri()` generates a URL with the app scheme. If Supabase's Redirect URL allowlist doesn't include `owe://**` (wildcard), Supabase rejects the redirect.
**Status:** Requires manual setup in Supabase dashboard — documented in SUMMARY.md as a user setup step. Cannot be verified statically.

---

## Open Questions

1. **Has the migration been applied to the hosted Supabase project?**
   - What we know: The migration file `20260228000002_google_oauth.sql` is correct and committed. SUMMARY.md documents that `supabase db push` requires manual `supabase link --project-ref <ref>` first.
   - What's unclear: Whether the user has run `supabase db push` after Phase 1.5.
   - Recommendation: Note in VERIFICATION.md that the migration must be applied before the `handle_new_user` trigger change takes effect for Google users. This is a setup item, not a code gap.

2. **Has `owe://**` been added to the Supabase Auth Redirect URL allowlist?**
   - What we know: SUMMARY.md documents this as a required user setup step.
   - What's unclear: Whether the user has completed it.
   - Recommendation: Note as a prerequisite in the human verification section. Without it, the OAuth redirect will fail with a Supabase error.

---

## Validation Architecture

`workflow.nyquist_validation` is not present in `.planning/config.json` — this section is skipped per the research agent instructions.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase read: `src/features/auth/hooks.ts` — full OAuth implementation (169 lines read)
- Direct codebase read: `supabase/migrations/20260228000002_google_oauth.sql` — trigger patch (37 lines read)
- Direct codebase read: `app/(auth)/sign-in.tsx` — Google button + cold-start handler (123 lines read)
- Direct codebase read: `app/(auth)/sign-up.tsx` — Google button + cold-start handler (139 lines read)
- Direct planning read: `.planning/phases/01.5-google-oauth-inserted/1.5-01-SUMMARY.md` — implementation record
- Direct planning read: `.planning/phases/01-foundation/01-VERIFICATION.md` — format template
- Direct planning read: `.planning/phases/02-core-expense-loop/02-VERIFICATION.md` — format template
- Direct planning read: `.planning/ROADMAP.md` — Phase 1.5 success criteria (4 truths)
- Direct planning read: `.planning/REQUIREMENTS.md` — AUTH-06 and AUTH-07 definitions

### Secondary (MEDIUM confidence)
- None required — all findings sourced from live codebase

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- What file to write: HIGH — confirmed from ROADMAP.md Phase 6 goal and output path `1.5-VERIFICATION.md`
- VERIFICATION.md format: HIGH — sourced from two existing template files (01-VERIFICATION.md, 02-VERIFICATION.md)
- Code evidence for AUTH-06: HIGH — read directly from hooks.ts, sign-in.tsx, sign-up.tsx
- Code evidence for AUTH-07: HIGH — documented in migration file + Supabase architecture knowledge
- Human verification scope: HIGH — two items clearly require runtime (cold-start flow, account linking)
- Migration apply status: LOW — cannot determine from static analysis whether `supabase db push` was run

**Research date:** 2026-03-01
**Valid until:** Stable — documentation task with no external dependencies

---

## Planner Action Summary

The planner needs one task:

**Task 1:** Write `1.5-VERIFICATION.md` to `.planning/phases/01.5-google-oauth-inserted/1.5-VERIFICATION.md`

Contents must include:
- YAML front matter: `status: human_needed`, `score: 4/4 must-haves verified`
- 4 observable truths (from ROADMAP.md Phase 1.5 success criteria), all VERIFIED
- Required artifacts table (4 files: hooks.ts, migration, sign-in.tsx, sign-up.tsx)
- Key link verification table (8 links documented above)
- Requirements coverage table (AUTH-06: SATISFIED, AUTH-07: SATISFIED)
- Anti-patterns scan result (clean — no stubs, no missing cold-start handlers)
- 2 human verification sections (cold-start OAuth, account linking)
- Gaps summary: no code gaps; migration apply and Supabase redirect URL allowlist are setup prerequisites documented in SUMMARY.md

No code changes. No migrations. Documentation only.
