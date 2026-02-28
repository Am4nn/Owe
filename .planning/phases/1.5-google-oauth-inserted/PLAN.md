# Phase 1.5: Google OAuth [INSERTED] — Plan Index

**Phase goal:** Add Google OAuth as a sign-in option alongside the existing email/password flow — zero breaking changes, provider-agnostic architecture preserved

**Requirements:** AUTH-06, AUTH-07

**Depends on:** Phase 1 (Foundation — complete)

---

## Plans

| Plan | File | Wave | Objective | Requirements |
|------|------|------|-----------|-------------|
| 01 | [1.5-01-PLAN.md](./1.5-01-PLAN.md) | 1 | Install packages, add useSignInWithGoogle hook, patch DB trigger, wire Google button into both auth screens | AUTH-06, AUTH-07 |

**Total plans:** 1
**Total waves:** 1
**Has checkpoints:** Yes (human verify at end of plan 01)

---

## Wave Structure

```
Wave 1:
  1.5-01 — All OAuth work (install + hook + migration + UI)
            └── checkpoint:human-verify (Google flow + regression test)
```

All work is in a single plan because the three concerns (hook, migration, UI) have tight coupling — the UI imports the hook which uses the installed packages — and the total scope fits within the 50% context budget for a single plan with 2 auto tasks + 1 checkpoint.

---

## Success Criteria (from ROADMAP)

1. User can tap "Continue with Google" on the sign-in or sign-up screen, complete the OAuth flow in a browser, and land back in the app fully authenticated
2. A Google sign-in using an email that already has an email/password account links to the existing account — no duplicate user, no data loss
3. All existing email/password flows (sign up, sign in, sign out, session persistence) continue to work exactly as before
4. `handle_new_user` DB trigger correctly populates `display_name` and `avatar_url` from Google metadata for new OAuth users

---

## Required User Action Before Testing

**Supabase Dashboard → Auth → URL Configuration → Redirect URLs**
Add `nexus://**` to the allowlist (wildcard covers any path makeRedirectUri() appends to the nexus:// scheme).

Google OAuth is already enabled in Supabase dashboard with client ID and secret — no additional Supabase provider configuration needed.

---

*Phase: 1.5-google-oauth-inserted*
*Created: 2026-02-28*
