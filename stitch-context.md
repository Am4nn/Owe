# Owe App — Stitch Design Context

> **Use this file** as context when starting a new chat about the Stitch design project.

## Project
- **App Name:** Owe (expense splitting app)
- **Stitch URL:** https://stitch.withgoogle.com/projects/11301907081262369590
- **Status:** In progress — dark mode screen set being built (target: 20 screens)

---

## Design System

| Token | Value | Notes |
|-------|-------|-------|
| Background | `#0F172A` | Dark navy — EVERY screen must use this |
| Card | `rgba(255,255,255,0.05)` + blur | Glassmorphism cards |
| Card Border | `rgba(124,58,237,0.3)` | Purple glow border |
| Primary CTA | `#8B5CF6` | Electric violet/purple buttons |
| Accent | `#F59E0B` | Amber/gold for trust highlights |
| Owed to You | `#10B981` | Emerald green — positive balances |
| You Owe | `#EF4444` | Red — negative balances |
| Text | `#F8FAFC` | White primary text |
| Muted Text | `#94A3B8` | Slate secondary text |
| Font | Inter (300/400/500/600) | All text — Google Fonts |
| Effects | backdrop-blur(16px), 1px rgba(white,0.2) border, Z-depth | Cards |
| Logo | ∞ infinity loop, glowing purple | Brand mark |
| Bottom Nav | 5 tabs: Home, Activity, + FAB (center), Groups, Profile | FAB = purple |

**Style:** Glassmorphism + Dark Mode OLED (from ui-ux-pro-max fintech recommendation)
**Anti-pattern:** Light backgrounds — BANNED. No white, no warm gradients.

---

## Complete Screen List (Target: 20)

### Group A — Core Auth Flow (4 screens)
| # | Screen | Status | Key Elements |
|---|--------|--------|-------------|
| 1 | Splash / Onboarding | ✅ Done | ∞ logo, "Split Anything", Get Started + Sign In |
| 2 | Sign Up | ✅ Done | Photo upload circle, Display Name, Email, Password, Confirm, Terms, Google/Apple |
| 3 | Sign In | ✅ Done | ∞ logo, "Welcome Back", Email, Password, Forgot Password, Google/Apple |
| 4 | Forgot Password / OTP | 🔲 Needed | Email input → OTP 6-digit → Reset Password flow |

### Group B — Core App Screens (7 screens)
| # | Screen | Status | Key Elements |
|---|--------|--------|-------------|
| 5 | Dashboard (Home) | ✅ Done | "You Are Owed" (teal) / "You Owe" (red) cards, My Groups, Recent Activity, FAB |
| 6 | Group Detail | ✅ Done | Dark gradient header, balance banner, Settle All, member list, simplified debts |
| 7 | Add Expense | ✅ Done | $ input, description, category icons, Paid By, Equal/Exact/%/Shares, Save |
| 8 | Activity Feed | ✅ Done | All/Groups/Friends/Settlements tabs, color-coded feed |
| 9 | Settlement Success | ✅ Done | Purple ✓, "All Clear!", names + amount, transaction ID, Back to Group |
| 10 | Create / Edit Group | 🔲 Needed | Group name, cover photo picker, add members, currency selector |
| 11 | Expense Detail | 🔲 Needed | Full expense breakdown, participants, comments, receipt image, edit/delete |

### Group C — Social / People (2 screens)
| # | Screen | Status | Key Elements |
|---|--------|--------|-------------|
| 12 | Add Friends / Invite | 🔲 Needed | Search by email/username, QR code, invite link, pending invites |
| 13 | 1-on-1 Friend Balance | 🔲 Needed | Full history with one person, individual settle button, debt chart |

### Group D — Advanced Features (5 screens)
| # | Screen | Status | Key Elements |
|---|--------|--------|-------------|
| 14 | Receipt Scanner | ✅ Done | Camera viewfinder, AI-parsed line items, assign-to avatars |
| 15 | Subscriptions | ✅ Done | Netflix/Spotify cards, cost per member, Leave Next Cycle |
| 16 | Savings Pot | ✅ Done | Progress ring (65% funded), $3,250/$5,000, pledge list |
| 17 | Insights & Charts | ✅ Done | Donut chart, $2,845 total, Week/Month/Trip toggle |

### Group E — Account (2 screens)
| # | Screen | Status | Key Elements |
|---|--------|--------|-------------|
| 18 | Settings & Profile | ✅ Done | Avatar, stats, account settings, export, sign out |
| 19 | Notifications Center | 🔲 Needed | Categorized alerts, smart reminders, Pay Now quick action |
| 20 | Empty State / First Use | 🔲 Needed | Dashboard with 0 groups — onboarding nudge to create first group |

---

## Session History

### Session 1 (Feb 28 2026)
- Analysed original 7-screen Stitch design
- Submitted refinement prompt to align all 7 screens with dark glassmorphism system
- Generated 5 new screens: Receipt Scanner, Subscriptions, Savings Pot, Insights, Settings & Profile

### Session 2 (Feb 28–Mar 1 2026)
- Identified 4 light-theme screens (Group Detail, Add Expense, Sign Up card, Dashboard group cards)
- Decision: Dark mode only; Light mode deferred to Phase 2
- Fixed 4 screens to strict dark `#0F172A` theme
- Split combined Sign Up/Sign In into 2 dedicated screens
- Sign Up now includes: photo upload, display name, email, password, confirm password, terms

### Current Progress (as of Mar 1 2026)
- **Screens confirmed in Stitch: 16**
- Dark theme fixes applied to: Group Detail, Add Expense, Sign Up card, Dashboard group cards
- Sign Up and Sign In split into 2 separate dedicated screens
- New screens added: Friend Balance, Notifications Center, Forgot Password, Create Group, Expense Detail, Add Friends
- Still needed: Empty State / First Use (prompt submitted, verify in Stitch)
- Next action: Open Stitch and verify Empty State screen exists, then do final QA pass of all 16 screens

---

## Future Phases (Post dark-mode completion)
- **Light Mode** — Mirror all 20 screens in light theme
- **Micro-interactions** — Tap/swipe/transition animations  
- **FAB Expanded State** — + button expanded showing Scan / Manual / Transfer options
- **Push Notification Templates** — Smart reminder designs
- **Error States** — No internet, failed payment, empty search
- **Tablet / iPad Layout** — Wider breakpoint designs

---

## Key Decisions Made
1. **Dark mode only** — Light mode is Phase 2 (avoid doubling work to 40 screens)
2. **Infinity loop (∞) as logo** — appears on Splash, Sign Up, Sign In
3. **Bottom nav: 5 tabs** — Home | Activity | FAB(+) | Groups | Profile
4. **Color coding balances** — teal/green = owed to you, red = you owe
5. **Glassmorphism cards** — `rgba(255,255,255,0.05)` with purple border glow
6. **Inter font** — all weights 300–600
