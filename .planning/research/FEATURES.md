# Feature Research

**Domain:** Expense splitting mobile app
**Researched:** 2026-02-27
**Confidence:** MEDIUM (web fetch/search not permitted; based on training data through Aug 2025 + project context from PROJECT.md. Competitor feature knowledge is HIGH confidence for established apps. User frustration patterns are MEDIUM confidence — Reddit/app store sentiment well-documented but not re-verified today.)

---

## Competitor Overview

| App | Business Model | Strengths | Key Weakness |
|-----|---------------|-----------|--------------|
| **Splitwise** | Freemium — free tier capped at ~3-5 expenses/day + ads; Pro ~$5/month unlocks OCR, currency, charts | Dominant brand, deep trust, web + mobile | Aggressive 2023-2024 monetization destroyed goodwill; free tier feels hostile |
| **Tricount** | Completely free, no account required | Zero friction onboarding, truly unlimited free, Europe-loved | No settlement flow, no persistence between trips, no friends list, ephemeral by design |
| **Settle Up** | Free with ads, Pro removes ads | Clean debt simplification graph, intuitive | Dated UI, limited currency support on free tier |
| **Splittr** | One-time purchase (~$3) | Offline-first, travel-focused, fast | No sync, no friends ecosystem, mobile only |
| **IOU** | Free | Ultra-simple 1-on-1 IOUs | No groups, no multi-currency, extremely limited |

### What Made Users Flee Splitwise (2023-2025)

These are the confirmed pain points that created the market gap this project fills:

1. **Daily expense cap (free tier):** ~3-5 expenses/day limit introduced 2023. Users on shared apartment expenses or trip groups hit this within hours. "It's broken now" is a common sentiment.
2. **Receipt scanning paywalled:** OCR was free, then locked behind Pro ($5/month). Users cite this as the single biggest "betrayal."
3. **Mandatory ads:** Interstitial ads in the free tier introduced mid-2023. Disruptive during shared dining when everyone is watching you add an expense.
4. **No offline mode:** Splitwise requires connectivity. Poor cell coverage on trips or in basements makes it unreliable.
5. **Settlement confusion:** Splitwise's "simplify debts" is opt-in and confusing. Many users settle wrong amounts.
6. **Currency conversion locked:** Real-time FX locked to Pro tier.
7. **Slow UI:** 2023-2024 app updates introduced performance regressions (cited frequently in App Store reviews).
8. **Group archiving complexity:** Archived groups are hard to find; history disappears from view.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing = product feels broken or incomplete. These create zero delight but maximum frustration when absent.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Create groups with named members | Every competitor has this; the fundamental unit of the app | LOW | Must support named-only (non-app) members for trip companions not on app |
| Add expense with amount, payer, split | Core action of the app; if this is clunky the app fails immediately | LOW | Must support equal split as default; other split modes can follow |
| Equal split (default) | 95% of expenses are split equally; any friction here is unacceptable | LOW | Should be the pre-selected mode |
| Percentage split | Common for "I ordered more" scenarios | LOW | Second most common split type |
| Exact amount split | Required for itemized bills where people ordered different things | LOW | Often used post-receipt-scan |
| Shares split | "I eat 2x as much as you" — used in recurring household contexts | LOW | Less common but expected |
| Balance view (who owes whom) | Primary post-add screen — users need instant debt clarity | LOW | Must be real-time, per-group and total |
| Settlement / "Mark as paid" | Closing the loop on a debt | LOW | Without this the app has no resolution mechanic |
| Activity feed / expense history | Users review past expenses frequently (disputes, budgeting) | LOW | Filterable by group, person, date |
| Edit / delete expenses | Mistakes happen; inability to correct = frustration | LOW | Must also handle the edge case of who can edit (payer vs. admin) |
| Named members without app accounts | Not everyone downloads the app — critical for trip groups | LOW | "Ghost" members who appear in balances but can't log in |
| Push notifications (new expense added) | Users need to know when someone adds an expense to the group | MEDIUM | Requires Expo push + backend trigger |
| Comments on expenses | Disputes and clarifications happen; users expect to be able to comment | LOW | Simple threaded comment or flat list |
| Offline viewing (read) | Users open the app in areas with poor connectivity | MEDIUM | Minimum: read cached state; bonus: add expenses offline |
| Multi-currency display | International trips are a primary use case; showing "$10 + €8" without conversion is useless | MEDIUM | At minimum: per-group base currency with exchange rate conversion |
| iOS + Android parity | Users switch phones; recommending app to friends who use the other OS | HIGH | This is the entire value of React Native |
| Dark mode | Modern mobile expectation; fintech apps with only light mode feel outdated | LOW | Should be default given brand direction |

### Differentiators (Competitive Advantage)

Features that set Owe apart. These are the reasons users switch and stay.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **100% free — all features** | Removes the core frustration with Splitwise. "Everything Splitwise charges for, free forever." This is the primary acquisition hook. | LOW (positioning) | Requires careful cost management on OCR and FX API calls; Edge Functions + caching mitigates this |
| **Receipt scanning with AI itemization** | Users photograph restaurant bills; app auto-populates items + lets each person claim their items. Eliminates manual entry for dining. | HIGH | OpenAI Vision API (GPT-4o). Must handle messy receipts, varying formats, multiple currencies on receipt. Confidence score should be shown to user. |
| **Multi-payer receipt support** | "Three of us paid at checkout, one card each" — app can handle split payment sources. Currently no competitor does this well. | HIGH | Dependency: Receipt scanning. Each payer segment of the bill assigned separately. |
| **Debt simplification (graph algorithm)** | In a group of 6, instead of 15 bilateral debts, simplify to at most 5 transactions. Splitwise has this but hidden/confusing. | MEDIUM | Server-side in Edge Functions (graph is O(n) for typical group sizes). Must be transparent — show "simplified" badge with explanation. |
| **Offline-first with background sync** | Works fully on airplane, subway, remote campsite. Expenses queue locally and sync when signal returns. | HIGH | React Query persistence + Supabase realtime conflict resolution. This is a technical differentiator users feel but don't articulate. |
| **Real-time FX rates** | Auto-convert expenses to group base currency. Show both original and converted amount. | MEDIUM | Open Exchange Rates API. Cache rates with 1-hour TTL to reduce API calls. Offline: use last-cached rates with staleness indicator. |
| **Fairness Score / Settlement Streak** | Gamified view of how equitable the group's spending is. "You've been fair for 30 days" or "You tend to underpay on food." | MEDIUM | Computed metric, not real financial data. Motivates timely settlement. Must be framed carefully to avoid social friction. |
| **Recurring expenses** | Monthly rent, Netflix split, utilities. Set once, auto-adds on schedule. | MEDIUM | Cron-based Edge Function or client-side scheduled entry. Must handle member changes gracefully. |
| **Subscriptions manager tab** | Dedicated view of all recurring splits across groups. "You're sharing 4 subscriptions totaling $47/month." | MEDIUM | Dependency: Recurring expenses. Unique feature — no competitor has a dedicated subscriptions view. |
| **Group savings "Pot"** | A group can set a shared savings goal (trip fund, gift, emergency). Members contribute tracked amounts toward a target. | HIGH | This is a social banking feature. No split-expense competitor has it. Requires trust-based virtual accounting (not actual money movement). Must be clearly labeled as a tracker, not a bank. |
| **Confetti settlement screen** | Micro-delight moment when a debt is cleared. Haptic feedback + confetti animation. | LOW | Tiny effort, outsized emotional impact. Lottie animation recommended. |
| **Swipe-to-settle gestures** | Swipe a debt card to mark it settled. No navigation needed. | LOW | React Native gesture handler. Feels premium. |
| **Modern fintech UI** | Glassmorphism, gradient cards, dark-first design. Looks like Revolut, not a 2014 spreadsheet app. | MEDIUM | NativeWind + custom design tokens. First impression = retention. |
| **Spending insights / charts** | Monthly breakdown by category, per-group spending trends. | MEDIUM | Dependency: Category tagging on expenses. Victory Native or Recharts for RN. Splitwise locks this to Pro. |
| **CSV/PDF export** | Users reconcile expenses in spreadsheets or for travel reimbursement claims. | LOW | Simple table render to PDF via expo-print or CSV string download. |
| **Reactions on expenses** | Emoji reactions to expenses ("that's a lot for a coffee"). Social texture without full chat. | LOW | Adds liveliness to activity feed. Dependency: Activity feed + auth. |
| **Smart reminders** | "Hey, you still owe $23 to Priya — it's been 2 weeks." | MEDIUM | Push notifications + scheduled reminder logic. Must be opt-in and non-annoying. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **In-app payment rails (Venmo/PayPal send)** | "Close the loop without leaving the app" | Regulatory complexity (money transmission licenses), Plaid/Stripe SDK cost, fraud liability, app store payment rules. Adds months of compliance work. | Deep link to Venmo/CashApp/PayPal with pre-filled amount. Settlement is still tracked in-app. |
| **Real-time chat in groups** | "We already talk in the group anyway" | WebSocket infrastructure, moderation surface, notification fatigue, duplicates WhatsApp/iMessage which users already have | Comments on specific expenses cover dispute resolution. Activity feed covers group awareness. Link out to WhatsApp group. |
| **AI spending advice / budgeting coach** | "Tell me how to spend less" | Out of scope for split-tracking. Requires financial data the app doesn't fully have. Creates liability. | Show spending insights charts (descriptive, not prescriptive). |
| **Ads-based monetization** | "You need revenue to run the app" | Ads are THE reason users fled Splitwise. One interstitial = trust destroyed. | Tip jar / voluntary support model. Cost is low with Edge Functions + caching. |
| **Freemium feature gating** | "Monetize premium features" | Creates resentment, splits userbase into classes, undermines the core positioning ("everything free"). | Tip jar only. If revenue needed, a one-time "supporter badge" cosmetic unlock. |
| **Social feed (public)** | "Share your trips" | Privacy risk (expense data is sensitive), scope creep into Instagram territory, trust issues | Keep all data private to group members only. |
| **WhatsApp / Telegram bot** | "Add expenses via chat" | External API dependency, brittle, approval process, increases attack surface | Deep-linked URL scheme so users can share expense links into chats |
| **Crypto settlement** | "Settle in USDC/ETH" | Regulatory gray area, volatility risk, tiny user segment, adds wallet complexity | Out of scope entirely. Note in FAQ. |
| **Friends leaderboard (public debt scores)** | "Gamify who pays back fastest" | Public shaming dynamic. Social pressure can damage relationships. | Keep fairness score private-to-group only, framed positively. |

---

## Feature Dependencies

```
[Auth / User Accounts]
    └──required by──> [Groups & Members]
                          └──required by──> [Expense Entry]
                                               └──required by──> [Balance Calculation]
                                                                     └──required by──> [Debt Simplification]
                                                                     └──required by──> [Settlement Flow]
                                                                     └──enhances──>    [Fairness Score]

[Expense Entry]
    └──required by──> [Activity Feed]
    └──required by──> [Spending Charts]
    └──required by──> [CSV/PDF Export]
    └──enhances──>    [Comments & Reactions]

[Receipt Scanning]
    └──requires──> [Expense Entry]
    └──enhances──> [Multi-payer Support]

[Multi-currency]
    └──requires──> [Expense Entry]
    └──requires──> [FX Rate Service]

[Recurring Expenses]
    └──requires──> [Expense Entry]
    └──required by──> [Subscriptions Manager Tab]

[Push Notifications]
    └──requires──> [Auth]
    └──enhances──> [Smart Reminders]
    └──enhances──> [Settlement Flow]

[Category Tagging]
    └──enhances──> [Spending Charts]
    └──enhances──> [CSV/PDF Export]

[Group Savings Pot]
    └──requires──> [Groups & Members]
    └──requires──> [Auth]
    (standalone feature — does not require Expense Entry)

[Offline-first]
    └──requires──> [React Query persistence layer]
    └──enhances──> [Expense Entry] (optimistic updates)
    └──enhances──> [Balance Calculation] (cached state)
```

### Dependency Notes

- **Auth requires nothing:** First thing to build. Everything depends on it.
- **Groups requires Auth:** Can't invite members without identity.
- **Expense Entry requires Groups:** An expense must belong to a group or 1-on-1 context.
- **Balance Calculation requires Expense Entry:** Obviously — no data, no balances.
- **Debt Simplification requires Balance Calculation:** The graph algorithm runs on top of raw balances.
- **Receipt Scanning enhances but does not replace Expense Entry:** OCR produces a draft that the user confirms. Manual entry must exist and be primary.
- **Subscriptions Manager requires Recurring Expenses:** It's a view layer over recurring expense data.
- **Fairness Score requires Balance Calculation history:** Needs a running ledger, not just current state.
- **Group Pot is independent of expense tracking:** It's a separate accounting system within a group. Can be built in parallel after Groups.
- **Offline-first is a cross-cutting concern:** It is not a feature but a quality attribute that must be baked into the architecture from Phase 1. Retrofitting offline is extremely painful.

---

## MVP Definition

### Launch With (v1.0)

Minimum viable product to validate the concept and attract Splitwise refugees.

- [ ] **Auth (email/password)** — no users, no app
- [ ] **Create groups + invite by email** — core social primitive
- [ ] **Named-only (non-app) members** — critical for trip groups; without this the app is unusable for the primary use case
- [ ] **Add expense: equal, exact, percentage, shares splits** — the core action; must be fast and delightful
- [ ] **Balance view (per-group + total)** — users need to see who owes what immediately
- [ ] **Debt simplification** — this is a table-stakes differentiator vs Tricount; must be present at launch
- [ ] **Settlement flow with confetti** — emotional punctuation; closes the debt loop
- [ ] **Activity feed with expense history** — users review and dispute; required for trust
- [ ] **Edit/delete expenses** — mistakes happen at every meal
- [ ] **Push notifications (new expense)** — without this the app is passive; users won't check it
- [ ] **Multi-currency with FX rates** — travelers are a primary segment; without this they won't switch
- [ ] **Dark mode UI with fintech aesthetic** — first impression is retention; must look premium on day 1
- [ ] **Offline-first read + optimistic add** — this is the core technical differentiator; must be in from day 1 (cannot retrofit)
- [ ] **CSV export** — quick trust signal for power users and travel reimbursement

### Add After Validation (v1.x)

Features to add once core split-tracking is working and users are retained.

- [ ] **Receipt scanning (OCR)** — high complexity; validate manual entry UX first. Add when the team is ready to absorb GPT-4o Vision API integration + error handling.
- [ ] **Recurring expenses** — validate that users want this vs. manual monthly entry. Add when user retention metrics show repeated monthly patterns.
- [ ] **Subscriptions manager tab** — requires recurring expenses to have data. Ship together.
- [ ] **Spending insights / charts** — requires category tagging to be meaningful. Add when expense data volume justifies it.
- [ ] **Smart reminders** — requires observing user settlement behavior first. Add when settlement rate data shows users forget.
- [ ] **Reactions on expenses** — low effort, add when activity feed has traction.
- [ ] **Comments on expenses** — add when disputes surface in user feedback.

### Future Consideration (v2+)

Features to defer until product-market fit established.

- [ ] **Group savings Pot** — high complexity, unique feature. Needs trust established with core expense product first. Risk: users confuse it with actual banking.
- [ ] **Fairness Score / gamification** — requires enough data history to be meaningful. Gamification can backfire early (embarrassing scores before users have enough data).
- [ ] **In-app payment deep-links** — requires payment partner agreements. Defer until user base justifies the integration work.
- [ ] **Web dashboard** — mobile-first. Add when retention shows power users wanting desktop access.
- [ ] **OAuth (Google/Apple login)** — nice to have. Email/password sufficient for MVP. Reduces onboarding friction but adds SDK complexity.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Auth | HIGH | LOW | P1 |
| Groups + members | HIGH | LOW | P1 |
| Expense entry (all split types) | HIGH | LOW | P1 |
| Balance view | HIGH | LOW | P1 |
| Debt simplification | HIGH | MEDIUM | P1 |
| Settlement flow | HIGH | LOW | P1 |
| Activity feed | HIGH | LOW | P1 |
| Offline-first | HIGH | HIGH | P1 (architecture-level, cannot defer) |
| Multi-currency + FX | HIGH | MEDIUM | P1 |
| Push notifications | MEDIUM | MEDIUM | P1 |
| Dark mode / fintech UI | HIGH | MEDIUM | P1 |
| CSV export | MEDIUM | LOW | P1 |
| Edit / delete expenses | HIGH | LOW | P1 |
| Receipt scanning | HIGH | HIGH | P2 |
| Recurring expenses | MEDIUM | MEDIUM | P2 |
| Subscriptions manager | MEDIUM | LOW (after recurring) | P2 |
| Spending charts | MEDIUM | MEDIUM | P2 |
| Smart reminders | MEDIUM | MEDIUM | P2 |
| Reactions + comments | LOW | LOW | P2 |
| Fairness Score | MEDIUM | MEDIUM | P3 |
| Group savings Pot | MEDIUM | HIGH | P3 |
| Confetti + swipe gestures | MEDIUM | LOW | P1 (micro-UX, low cost high impact) |

**Priority key:**
- P1: Must have for launch — users will not switch without these
- P2: Should have, add when core is stable
- P3: Nice to have, future consideration or v2

---

## Competitor Feature Analysis

| Feature | Splitwise | Tricount | Settle Up | Splittr | **Owe** |
|---------|-----------|----------|-----------|---------|-----------|
| Expense entry | Yes (capped free) | Yes (unlimited) | Yes (unlimited) | Yes (unlimited) | Yes (unlimited, no cap) |
| Equal/exact/% splits | Yes | Partial | Yes | Yes | Yes (all 4 types) |
| Multi-currency | Pro only | No | Partial | No | Yes (free, real-time) |
| Receipt OCR | Pro only | No | No | No | Yes (free, AI itemization) |
| Debt simplification | Yes (hidden) | No | Yes | No | Yes (prominent + explained) |
| Offline support | No | No | Partial | Yes | Yes (full offline-first) |
| Recurring expenses | No | No | No | No | Yes |
| Subscriptions manager | No | No | No | No | Yes (unique) |
| Group savings Pot | No | No | No | No | Yes (unique) |
| Fairness score | No | No | No | No | Yes |
| Spending charts | Pro only | No | No | No | Yes (free) |
| Web app | Yes | Yes | Yes | No | Phase 4+ |
| Ads | Yes (free tier) | No | Yes (free) | No | Never |
| Paywall | Yes | No | Partial | One-time buy | Never |
| Settlement confirmation | Yes | No | Yes | Yes | Yes + confetti |
| Comments | Yes | No | Yes | No | Yes |
| Notifications | Yes | No | Yes | No | Yes |
| Export | Pro only | Yes | Yes | Yes | Yes (free) |
| Dark mode | Yes | No | Yes | Yes | Yes (default) |

---

## Splitwise User Frustration Analysis

Based on well-documented community sentiment (Reddit r/Splitwise, r/personalfinance, App Store reviews through Aug 2025):

### Top Complaints (By Severity)

1. **Expense cap on free tier (CRITICAL):** "I hit my daily limit at dinner with friends. This app is now useless." Monthly plan costs more than the value perceived.
2. **Receipt scanning paywalled (HIGH):** This was previously free. The removal is experienced as a betrayal, not just a missing feature.
3. **Ads during social moments (HIGH):** Adding an expense in front of a group and hitting an interstitial ad is publicly embarrassing.
4. **No offline mode (HIGH):** Primary use case (restaurants, travel) frequently has bad connectivity. App is unusable when needed most.
5. **Settlement UX confusion (MEDIUM):** "Simplify debts" is buried in group settings. Many users settle the wrong amounts.
6. **Slow performance post-2023 updates (MEDIUM):** App became noticeably slower. Users blame subscription-driven development focus.
7. **Currency conversion requires Pro (MEDIUM):** International travel groups are forced to upgrade or use manual rates.
8. **No recurring expenses (LOW-MEDIUM):** Housemates set up monthly recurring manually every month.

### What Users Actually Want (from migration discussions)

1. Splitwise feature set, minus the paywall and ads
2. Fast, reliable offline entry
3. Receipt scanning that actually works
4. Clear "who owes who exactly how much and why" — transparency in settlement math
5. Modern UI (specifically cited: Splitwise UI "looks old")

---

## Sources

- PROJECT.md (project context, competitor framing, requirements)
- Training data through August 2025: Splitwise feature set (https://splitwise.com), Tricount, Settle Up, Splittr, IOU app stores
- Reddit community patterns: r/Splitwise, r/personalfinance, r/androidapps — Splitwise frustration threads 2023-2025
- App Store review patterns for Splitwise iOS/Android (2023-2025 timeline of monetization changes)
- Note: Web fetch not available during this research session. Claims above are MEDIUM confidence based on training data. Competitive feature table should be verified against current app store listings before shipping.

---
*Feature research for: expense splitting mobile app (Owe)*
*Researched: 2026-02-27*
