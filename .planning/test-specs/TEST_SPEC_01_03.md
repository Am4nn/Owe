# UI/UX Upgrade Test Specification (Plans 09-01 to 09-03)

**Target Environment**: Web Browser (via `pnpm start` or `pnpm web`)
**Objective**: Instruct an AI testing agent (or orchestrator) to systematically verify the design, functionality, and styling of the newly implemented Stitch UI/UX features for Phase 9, Waves 1 and 2.

## Prerequisites & Setup
1. **Start the Development Server**: Run `pnpm web` in the root directory.
2. **Access the Application**: Open the web url in the testing browser.
3. **Viewport Size**: Ensure the browser is sized to simulate a mobile device (e.g., iPhone 14 / Pixel 7 aspect ratio: ~390x844px) to properly evaluate responsive mobile-first layouts.

---

## Part 1: Core Design System & Components (Plan 09-01)

### 1.1 Color Palette & Theme Tokens
- **Action**: Inspect the computed styles of the `body` or root container.
- **Expected**: Background color should be `#0e1117` (Dark Background). Text color should be `#F8FAFC` (Text Primary).
- **Action**: Locate any primary `Button` component in the DOM.
- **Expected**: The button's background should match `#6C63FF` (Brand Primary).

### 1.2 Glassmorphism Elements (`GlassCard`)
- **Action**: Navigate to a screen containing a `GlassCard` (e.g., the Sign-In screen or Dashboard).
- **Expected**: The card must have a semi-transparent background (e.g., `rgba(30,30,36,0.6)`), a thin noticeable border (`rgba(255,255,255,0.05)` or similar), and a `backdrop-filter: blur` applied via the `backdrop-blur-xl` utility class.

### 1.3 `Button` Component Variations
- **Action**: Navigate to screens with various buttons (Sign In, Profile Sign Out).
- **Expected**: 
  - `Primary` variant has a solid purple background.
  - `Secondary` variant has a transparent background with a purple border.
  - `Ghost` variant has no background or border, only text.
  - `Danger` variant has a solid red background (e.g., Delete Expense, Sign Out).
- **Interaction**: Click/tap the buttons. 
- **Expected**: They should exhibit an opacity change or scaling animation (via Reanimated).

### 1.4 `Input` Component
- **Action**: Navigate to the Sign-In screen. Focus on an input field.
- **Expected**: The input should have a glassmorphic background. When focused, the border should glow/highlight with the `brand-primary` color. Placeholder text should be visible and legible (`rgba(255,255,255,0.3)`).

### 1.5 UI Sub-components
- **Avatar**: Verify avatars render as circular images or fallback initials with appropriate background colors. Check different sizes (`sm`, `md`, `lg`, `xl`).
- **SectionLabel**: Verify uppercase tracking text with an optional, right-aligned, clickable action link ("See All").
- **AmountText**: Verify tabular nums and correct coloring (Green for positive/owed, Red for negative/owe, White for neutral).
- **IconContainer**: Verify a rounded-square container with an icon centered inside.
- **EmptyState**: View an empty dashboard. Verify it displays a centered icon, title, description, and primary/secondary action buttons.

---

## Part 2: Auth & Onboarding Flow (Plan 09-02)

### 2.1 Onboarding Carousel (`/onboarding`)
- **Action**: Clear local storage/AsyncStorage and navigate to `/`. The app should redirect to `/onboarding`.
- **Expected**: A 3-slide carousel is visible.
- **Interaction**: Swipe or click through the slides. Verify pagination dots update to reflect the active slide.
- **Action**: Click "Skip" or complete the slides and click "Get Started".
- **Expected**: The user should be navigated to `/sign-in`.

### 2.2 Sign-In Screen (`/sign-in`)
- **Action**: Navigate to `/sign-in`.
- **Expected**: The background is dark. The Infinity logo is centered at the top. Two glass inputs (Email, Password) with Lucide icons are visible. The `SocialDivider` and `GoogleButton` are present.
- **Interaction**: Submit an empty form. 
- **Expected**: Zod validation error messages appear below the inputs.
- **Interaction**: Click "Forgot Password?".
- **Expected**: Navigates to `/forgot-password`.
- **Interaction**: Click "Sign Up".
- **Expected**: Navigates to `/sign-up`.

### 2.3 Sign-Up Screen (`/sign-up`)
- **Action**: Navigate to `/sign-up`.
- **Expected**: Includes an Avatar Picker at the top, Display Name, Email, Password, and Confirm Password fields. A Terms of Service checkbox is at the bottom before the submit button.
- **Interaction**: Submit invalid passwords.
- **Expected**: Zod flags matching errors and minimum length requirements.

### 2.4 Forgot Password & OTP (`/forgot-password`)
- **Action**: Navigate to `/forgot-password`.
- **Expected**: Prompts for an email address.
- **Interaction**: Enter a valid email and submit. 
- **Expected**: The UI switches to the OTP verification state. The custom `OTPInput` component is visible, and a countdown timer ("Resend code in 59s") begins.

---

## Part 3: Dashboard & Profile (Plan 09-03)

*Note: For these tests, you must be authenticated. Use an existing test user or mock the session context.*

### 3.1 Bottom Tab Navigation
- **Action**: Authenticate and load the main app layout.
- **Expected**: A bottom tab bar is visible at the very bottom of the viewport.
- **Content**: It should feature tabs for Home, Activity, a center placeholder space, Groups, and Profile. Active tabs should be colored `#6C63FF` and inactive tabs `#94A3B8`.

### 3.2 Floating Expandable FAB
- **Action**: Look directly above the center of the bottom tab bar.
- **Expected**: A prominent, gradient-filled circular Action Button (ExpandableFAB) is hovering.
- **Interaction**: Click the FAB.
- **Expected**: It expands smoothly to reveal sub-actions (Manual, Transfer, Scan). Clicking the background overlay or the FAB again closes it.

### 3.3 Dashboard - Empty State (`/`)
- **Action**: Ensure the test user has no groups or expenses. Navigate to the Dashboard (`/`).
- **Expected**: The `EmptyState` component is rendered prominently in the center, prompting the user to "Create Your First Group".
- **Interaction**: Click the primary action.
- **Expected**: Navigates to `/groups/new`.

### 3.4 Dashboard - Populated State (`/`)
- **Action**: Ensure the test user has at least one group and associated activity. (Mock data is currently utilized if the backend isn't seeded). Navigate to the Dashboard.
- **Expected Elements**:
  1. Top Header with user Avatar and "Owe" title.
  2. Two top horizontal `BalanceCard`s (one for "YOU ARE OWED", one for "YOU OWE").
  3. "YOUR GROUPS" section with a horizontal scrollable row of `GroupCardHorizontal` components.
  4. "RECENT ACTIVITY" section with a vertical list of `ActivityItem` components.

### 3.5 Profile & Settings (`/profile`)
- **Action**: Navigate to the Profile tab.
- **Expected Elements**:
  1. A large `xl` Avatar at the top with a "Change photo" prompt.
  2. A horizontal scroll list of `StatCard`s (Total Spent, Settled, Groups).
  3. A `display_name` edit form.
  4. A `SettingsMenu` group (Account Settings, Notifications).
  5. A red "Sign Out" bottom/danger button.
- **Interaction**: Change the display name and submit.
- **Expected**: The input successfully validates, shows a loading state, and fires the mutation.

### 3.6 Modal Screens (Add Friends & Friend Balance)
- **Action**: Navigate to `/friends/index`.
- **Expected**: A full-screen modal with a Search input at the top and a list of `ContactItem`s.
- **Interaction**: Type in the search box.
- **Expected**: The contact list filters down automatically.
- **Action**: Click a contact to navigate to `/friends/[id]`.
- **Expected**: The Friend Balance Detail screen opens, displaying an oversized Avatar, their name, current balance status (Settled/Owes), Action buttons (Settle Up, Remind), and a history of shared `ActivityItem`s.

---
**Verification Completion**: If an agent can successfully navigate through all the above endpoints and verify the presence/interaction of these Stitch components without console errors or missing routes, Plans 09-01 through 09-03 are considered successfully implemented.
