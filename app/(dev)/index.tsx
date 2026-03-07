/**
 * Component Showcase — visual library of every design-system component.
 *
 * Navigate to this screen during development:
 *   router.push('/(dev)')   or   Expo Go URL  →  exp://.../(dev)
 *
 * Each section shows a component with every meaningful prop variant so you
 * can verify visual correctness, spacing, colours, and interactivity at a
 * glance without running individual screens.
 */
import { useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  Switch,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import {
  ShoppingCart, Utensils, Car, Plane, Home, Zap,
  Bell, Lock, CreditCard, HelpCircle, Trash2, ChevronLeft,
  ArrowDownLeft, TrendingUp, Receipt,
} from 'lucide-react-native'
import { theme } from '@/lib/theme'

// ── Component imports from barrel ────────────────────────────────────────────
import {
  Button,
  GlassCard,
  Avatar,
  AvatarStack,
  EmptyState,
  Divider,
  TextInputField,
  SearchBar,
  AmountInput,
  SegmentedControl,
  CategoryPill,
  FilterChip,
  FilterChipGroup,
  AmountText,
  AmountBadge,
  StatusBadge,
  SectionLabel,
  IconContainer,
  ListItem,
  BalanceIndicator,
  ExpenseItem,
  TransactionRow,
  NotificationItem,
} from '@/components/ui'

// ── Local helpers ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 32 }}>
      {/* Section header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
          gap: 10,
        }}
      >
        <View
          style={{
            height: 1,
            width: 12,
            backgroundColor: theme.colors.brand.primary,
          }}
        />
        <Text
          style={{
            color: theme.colors.brand.primary,
            fontSize: theme.typography.caption,
            fontWeight: '700',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(123,92,246,0.15)' }} />
      </View>
      {children}
    </View>
  )
}

function Variant({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text
        style={{
          color: theme.colors.text.tertiary,
          fontSize: theme.typography.tiny,
          fontWeight: '600',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  )
}

function Row({ children, gap = 8 }: { children: React.ReactNode; gap?: number }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, alignItems: 'flex-start' }}>
      {children}
    </View>
  )
}

function ColorSwatch({ color, name }: { color: string; name: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 4, width: 60 }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: theme.radii.md,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      />
      <Text
        style={{
          color: theme.colors.text.tertiary,
          fontSize: 9,
          textAlign: 'center',
          lineHeight: 12,
        }}
        numberOfLines={2}
      >
        {name}
      </Text>
    </View>
  )
}

// ── Main Showcase ─────────────────────────────────────────────────────────────

export default function ComponentShowcase() {
  const router = useRouter()

  // Interactive state
  const [segSelected, setSegSelected] = useState(0)
  const [seg3Selected, setSeg3Selected] = useState(1)
  const [filterSelected, setFilterSelected] = useState('all')
  const [categorySelected, setCategorySelected] = useState('food')
  const [searchValue, setSearchValue] = useState('')
  const [amountCents, setAmountCents] = useState(0)
  const [toggleOn, setToggleOn] = useState(true)
  const [textValue, setTextValue] = useState('')

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.dark.bg }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.glass.border,
          gap: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.h4, fontWeight: '700' }}>
            Component Library
          </Text>
          <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.caption }}>
            Stitch Design System · {new Date().toLocaleDateString()}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(123,92,246,0.15)',
            borderRadius: theme.radii.pill,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ color: theme.colors.brand.primary, fontSize: theme.typography.tiny, fontWeight: '700' }}>
            DEV
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── DESIGN TOKENS ──────────────────────────────────────────────── */}
        <Section title="Design Tokens — Colors">
          <Variant label="Brand">
            <Row>
              <ColorSwatch color={theme.colors.brand.primary} name="primary" />
              <ColorSwatch color={theme.colors.brand.secondary} name="secondary" />
              <ColorSwatch color={theme.colors.brand.accent} name="accent" />
              <ColorSwatch color={theme.colors.brand.danger} name="danger" />
              <ColorSwatch color={theme.colors.brand.success} name="success" />
              <ColorSwatch color={theme.colors.brand.warning} name="warning" />
            </Row>
          </Variant>

          <Variant label="Amount">
            <Row>
              <ColorSwatch color={theme.colors.amount.positive} name="positive" />
              <ColorSwatch color={theme.colors.amount.negative} name="negative" />
              <ColorSwatch color={theme.colors.amount.neutral} name="neutral" />
            </Row>
          </Variant>

          <Variant label="Text">
            <Row>
              <ColorSwatch color={theme.colors.text.primary} name="primary" />
              <ColorSwatch color={theme.colors.text.secondary} name="secondary" />
              <ColorSwatch color={theme.colors.text.tertiary} name="tertiary" />
              <ColorSwatch color={theme.colors.text.muted} name="muted" />
            </Row>
          </Variant>

          <Variant label="Dark Backgrounds">
            <Row>
              <ColorSwatch color={theme.colors.dark.bg} name="bg" />
              <ColorSwatch color={theme.colors.dark.surface} name="surface" />
              <ColorSwatch color={theme.colors.dark.elevated} name="elevated" />
            </Row>
          </Variant>
        </Section>

        {/* ── TYPOGRAPHY ────────────────────────────────────────────────── */}
        <Section title="Typography Scale">
          {(
            [
              ['display', 'Display 32px'],
              ['h1', 'Heading 1 · 28px'],
              ['h2', 'Heading 2 · 24px'],
              ['h3', 'Heading 3 · 20px'],
              ['h4', 'Heading 4 · 18px'],
              ['body', 'Body · 16px'],
              ['bodySm', 'Body Small · 14px'],
              ['caption', 'Caption · 12px'],
              ['tiny', 'Tiny · 10px'],
            ] as const
          ).map(([key, label]) => (
            <View key={key} style={{ marginBottom: 6 }}>
              <Text
                style={{
                  color: theme.colors.text.primary,
                  fontSize: theme.typography[key],
                  fontWeight: key === 'display' || key === 'h1' ? '700' : '400',
                  lineHeight: theme.typography[key] * 1.3,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </Section>

        {/* ── BUTTON ───────────────────────────────────────────────────── */}
        <Section title="Button">
          <Variant label="Variants">
            <View style={{ gap: 10 }}>
              <Button title="Primary Gradient" onPress={() => {}} />
              <Button title="Secondary" variant="secondary" onPress={() => {}} />
              <Button title="Ghost" variant="ghost" onPress={() => {}} />
              <Button title="Danger" variant="danger" onPress={() => {}} />
            </View>
          </Variant>
          <Variant label="States">
            <View style={{ gap: 10 }}>
              <Button title="Loading…" loading onPress={() => {}} />
              <Button title="Disabled" disabled onPress={() => {}} />
            </View>
          </Variant>
          <Variant label="Sizes">
            <View style={{ gap: 10 }}>
              <Button title="Full Width (default)" onPress={() => {}} />
              <Button title="Small" size="sm" onPress={() => {}} />
            </View>
          </Variant>
        </Section>

        {/* ── GLASS CARD ───────────────────────────────────────────────── */}
        <Section title="GlassCard">
          <Variant label="default">
            <GlassCard style={{ padding: 16 }}>
              <Text style={{ color: theme.colors.text.secondary }}>Default variant — subtle frosted glass</Text>
            </GlassCard>
          </Variant>
          <Variant label="elevated">
            <GlassCard variant="elevated" style={{ padding: 16 }}>
              <Text style={{ color: theme.colors.text.secondary }}>Elevated — brighter surface for modals</Text>
            </GlassCard>
          </Variant>
          <Variant label="dashed">
            <GlassCard variant="dashed" style={{ padding: 16 }}>
              <Text style={{ color: theme.colors.text.secondary }}>Dashed — invite / add placeholder areas</Text>
            </GlassCard>
          </Variant>
        </Section>

        {/* ── AVATAR ───────────────────────────────────────────────────── */}
        <Section title="Avatar">
          <Variant label="Sizes (initials fallback)">
            <Row>
              <Avatar size="sm" fallback="AB" />
              <Avatar size="md" fallback="CD" />
              <Avatar size="lg" fallback="EF" />
              <Avatar size="xl" fallback="GH" />
            </Row>
          </Variant>
          <Variant label="With online dot">
            <Row>
              <Avatar size="md" fallback="Jo" online />
              <Avatar size="lg" fallback="Sa" online />
            </Row>
          </Variant>
          <Variant label="Edit overlay">
            <Avatar size="xl" fallback="Me" showEditOverlay onEditPress={() => {}} />
          </Variant>
        </Section>

        {/* ── AVATAR STACK ─────────────────────────────────────────────── */}
        <Section title="AvatarStack">
          <Variant label="3 avatars">
            <AvatarStack
              avatars={[
                { fallback: 'Jo' },
                { fallback: 'Sa' },
                { fallback: 'Am' },
              ]}
            />
          </Variant>
          <Variant label="5 avatars (shows +N)">
            <AvatarStack
              avatars={[
                { fallback: 'Jo' },
                { fallback: 'Sa' },
                { fallback: 'Am' },
                { fallback: 'Ri' },
                { fallback: 'Ke' },
              ]}
              max={3}
            />
          </Variant>
        </Section>

        {/* ── EMPTY STATE ──────────────────────────────────────────────── */}
        <Section title="EmptyState">
          <Variant label="With CTA">
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Add your first expense to start tracking shared costs."
              primaryAction={{ label: 'Add Expense', onPress: () => {} }}
            />
          </Variant>
          <Variant label="Icon only">
            <EmptyState icon={Bell} title="All caught up" description="No new notifications." />
          </Variant>
        </Section>

        {/* ── DIVIDER ──────────────────────────────────────────────────── */}
        <Section title="Divider">
          <Variant label="Default">
            <Divider />
          </Variant>
          <Variant label="Purple tint + spacing">
            <Divider color="rgba(123,92,246,0.3)" marginVertical={8} />
          </Variant>
          <Variant label="Thick">
            <Divider thickness={2} color={theme.colors.brand.primary} />
          </Variant>
        </Section>

        {/* ── TEXT INPUT FIELD ─────────────────────────────────────────── */}
        <Section title="TextInputField">
          <Variant label="Basic">
            <TextInputField
              label="Email"
              value={textValue}
              onChangeText={setTextValue}
              placeholder="you@example.com"
            />
          </Variant>
          <Variant label="With icon">
            <TextInputField
              label="Search"
              value={textValue}
              onChangeText={setTextValue}
              placeholder="Search people…"
              icon={Bell}
            />
          </Variant>
          <Variant label="Password">
            <TextInputField
              label="Password"
              value={textValue}
              onChangeText={setTextValue}
              placeholder="••••••••"
              secureTextEntry
              icon={Lock}
            />
          </Variant>
          <Variant label="Error state">
            <TextInputField
              label="Email"
              value="bad@"
              onChangeText={() => {}}
              placeholder="you@example.com"
              error="Please enter a valid email address"
            />
          </Variant>
        </Section>

        {/* ── SEARCH BAR ───────────────────────────────────────────────── */}
        <Section title="SearchBar">
          <Variant label="Interactive">
            <SearchBar value={searchValue} onChange={setSearchValue} placeholder="Search expenses…" />
          </Variant>
          <Variant label="Empty">
            <SearchBar value="" onChange={() => {}} placeholder="Search friends…" />
          </Variant>
        </Section>

        {/* ── AMOUNT INPUT ─────────────────────────────────────────────── */}
        <Section title="AmountInput">
          <Variant label={`Current value: ${amountCents} cents ($${(amountCents / 100).toFixed(2)})`}>
            <AmountInput value={amountCents} onChange={setAmountCents} />
          </Variant>
          <Variant label="Pre-filled">
            <AmountInput value={4550} onChange={() => {}} />
          </Variant>
        </Section>

        {/* ── SEGMENTED CONTROL ────────────────────────────────────────── */}
        <Section title="SegmentedControl">
          <Variant label="2 options">
            <SegmentedControl
              options={['You Owe', 'You Are Owed']}
              selected={segSelected}
              onSelect={setSegSelected}
            />
          </Variant>
          <Variant label="3 options">
            <SegmentedControl
              options={['All', 'Active', 'Settled']}
              selected={seg3Selected}
              onSelect={setSeg3Selected}
            />
          </Variant>
        </Section>

        {/* ── CATEGORY PILL ────────────────────────────────────────────── */}
        <Section title="CategoryPill">
          <Variant label="Interactive (tap to toggle)">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Row gap={8}>
                {[
                  { key: 'food', label: 'Food', icon: Utensils },
                  { key: 'transport', label: 'Transport', icon: Car },
                  { key: 'travel', label: 'Travel', icon: Plane },
                  { key: 'home', label: 'Home', icon: Home },
                  { key: 'utilities', label: 'Bills', icon: Zap },
                ].map((cat) => (
                  <CategoryPill
                    key={cat.key}
                    icon={cat.icon}
                    label={cat.label}
                    selected={categorySelected === cat.key}
                    onPress={() => setCategorySelected(cat.key)}
                  />
                ))}
              </Row>
            </ScrollView>
          </Variant>
        </Section>

        {/* ── FILTER CHIP ──────────────────────────────────────────────── */}
        <Section title="FilterChip / FilterChipGroup">
          <Variant label="Single chips">
            <Row>
              <FilterChip label="All" selected onPress={() => {}} />
              <FilterChip label="This Month" selected={false} onPress={() => {}} />
              <FilterChip label="Settled" selected={false} onPress={() => {}} />
            </Row>
          </Variant>
          <Variant label="Interactive group">
            <FilterChipGroup
              options={['All', 'This Week', 'This Month', 'This Year', 'Settled']}
              selected={filterSelected}
              onSelect={setFilterSelected}
            />
          </Variant>
        </Section>

        {/* ── AMOUNT TEXT ──────────────────────────────────────────────── */}
        <Section title="AmountText">
          <Row gap={16}>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ color: theme.colors.text.tertiary, fontSize: 10 }}>positive</Text>
              <AmountText amount={12000} />
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ color: theme.colors.text.tertiary, fontSize: 10 }}>negative</Text>
              <AmountText amount={-5000} />
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ color: theme.colors.text.tertiary, fontSize: 10 }}>neutral</Text>
              <AmountText amount={0} />
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ color: theme.colors.text.tertiary, fontSize: 10 }}>large</Text>
              <AmountText amount={250000} size="lg" />
            </View>
          </Row>
        </Section>

        {/* ── AMOUNT BADGE ─────────────────────────────────────────────── */}
        <Section title="AmountBadge">
          <Variant label="Plain text">
            <Row gap={16}>
              <AmountBadge amount={12000} />
              <AmountBadge amount={-5000} />
              <AmountBadge amount={0} />
            </Row>
          </Variant>
          <Variant label="Pill variant">
            <Row>
              <AmountBadge amount={12000} pill />
              <AmountBadge amount={-5000} pill />
              <AmountBadge amount={0} pill />
            </Row>
          </Variant>
          <Variant label="Type override">
            <Row>
              <AmountBadge amount={5000} type="negative" pill />
              <AmountBadge amount={-3000} type="positive" pill />
              <AmountBadge amount={8000} type="neutral" pill />
            </Row>
          </Variant>
        </Section>

        {/* ── STATUS BADGE ─────────────────────────────────────────────── */}
        <Section title="StatusBadge">
          <Row>
            <StatusBadge label="Settled" variant="settled" />
            <StatusBadge label="Unpaid" variant="unpaid" />
            <StatusBadge label="Active" variant="active" />
            <StatusBadge label="Suspended" variant="suspended" />
            <StatusBadge label="Completed" variant="completed" />
            <StatusBadge label="Category" variant="category" />
            <StatusBadge label="Split" variant="split" />
          </Row>
        </Section>

        {/* ── SECTION LABEL ────────────────────────────────────────────── */}
        <Section title="SectionLabel">
          <Variant label="Label only">
            <SectionLabel label="Recent Expenses" />
          </Variant>
          <Variant label="With action">
            <SectionLabel label="Friends" action={{ label: 'See all', onPress: () => {} }} />
          </Variant>
        </Section>

        {/* ── ICON CONTAINER ───────────────────────────────────────────── */}
        <Section title="IconContainer">
          <Row>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <IconContainer icon={ShoppingCart} variant="positive" />
              <Text style={{ color: theme.colors.text.tertiary, fontSize: 10 }}>positive</Text>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <IconContainer icon={CreditCard} variant="negative" />
              <Text style={{ color: theme.colors.text.tertiary, fontSize: 10 }}>negative</Text>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <IconContainer icon={TrendingUp} variant="neutral" />
              <Text style={{ color: theme.colors.text.tertiary, fontSize: 10 }}>neutral</Text>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <IconContainer icon={Bell} variant="info" />
              <Text style={{ color: theme.colors.text.tertiary, fontSize: 10 }}>info</Text>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <IconContainer icon={Utensils} variant="positive" size={56} />
              <Text style={{ color: theme.colors.text.tertiary, fontSize: 10 }}>size 56</Text>
            </View>
          </Row>
        </Section>

        {/* ── LIST ITEM ────────────────────────────────────────────────── */}
        <Section title="ListItem">
          <GlassCard style={{ overflow: 'hidden', padding: 0 }}>
            <ListItem
              icon={Bell}
              iconColor={theme.colors.brand.primary}
              title="Notifications"
              subtitle="Push alerts and reminders"
              onPress={() => {}}
            />
            <ListItem
              icon={Lock}
              iconColor={theme.colors.brand.accent}
              title="Privacy"
              subtitle="Who can see your activity"
              onPress={() => {}}
            />
            <ListItem
              icon={CreditCard}
              iconColor={theme.colors.brand.warning}
              title="Payment Methods"
              onPress={() => {}}
            />
            <ListItem
              icon={HelpCircle}
              iconColor={theme.colors.text.secondary}
              title="Help & Support"
              onPress={() => {}}
            />
            <ListItem
              icon={Lock}
              title="Private Group"
              right={<Switch value={toggleOn} onValueChange={setToggleOn} thumbColor={theme.colors.brand.primary} />}
              showDivider={false}
            />
          </GlassCard>
          <Variant label="Destructive">
            <GlassCard style={{ overflow: 'hidden', padding: 0 }}>
              <ListItem
                icon={Trash2}
                title="Delete Account"
                destructive
                onPress={() => {}}
                showDivider={false}
              />
            </GlassCard>
          </Variant>
        </Section>

        {/* ── BALANCE INDICATOR ────────────────────────────────────────── */}
        <Section title="BalanceIndicator">
          <Variant label="Positive (you are owed)">
            <BalanceIndicator amount={12350} label="Total owed to you" count={3} countLabel="people" />
          </Variant>
          <Variant label="Negative (you owe)">
            <BalanceIndicator amount={-4500} label="You owe" count={2} countLabel="people" />
          </Variant>
          <Variant label="Neutral (settled)">
            <BalanceIndicator amount={0} label="All settled" />
          </Variant>
        </Section>

        {/* ── EXPENSE ITEM ─────────────────────────────────────────────── */}
        <Section title="ExpenseItem">
          <Variant label="Owed (red) — with icon">
            <ExpenseItem
              title="Sushi Night"
              subtitle="6 people · equal split"
              amount={-2250}
              status="owed"
              timestamp="2h ago"
              icon={Utensils}
              iconColor={theme.colors.brand.primary}
              onPress={() => {}}
            />
          </Variant>
          <Variant label="Lent (green) — with avatar">
            <ExpenseItem
              title="Uber to Airport"
              subtitle="Sarah paid"
              amount={1800}
              status="lent"
              timestamp="Yesterday"
              avatarFallback="Sa"
              onPress={() => {}}
            />
          </Variant>
          <Variant label="Settled (muted)">
            <ExpenseItem
              title="Airbnb Split"
              subtitle="Fully settled"
              amount={0}
              status="settled"
              timestamp="Last week"
              icon={Home}
              iconColor={theme.colors.brand.accent}
            />
          </Variant>
        </Section>

        {/* ── TRANSACTION ROW ──────────────────────────────────────────── */}
        <Section title="TransactionRow">
          <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
            <TransactionRow
              title="Payment from Sarah"
              date="Mar 5, 2026"
              amount={3000}
              type="credit"
              onPress={() => {}}
            />
            <Divider />
            <TransactionRow
              title="Split for Groceries"
              date="Mar 4, 2026"
              amount={-1250}
              type="debit"
              onPress={() => {}}
            />
            <Divider />
            <TransactionRow
              title="Group Rebalance"
              date="Mar 2, 2026"
              amount={0}
              type="neutral"
            />
          </GlassCard>
        </Section>

        {/* ── NOTIFICATION ITEM ────────────────────────────────────────── */}
        <Section title="NotificationItem">
          <Variant label="Unread (purple tint)">
            <NotificationItem
              avatarFallback="Sa"
              text={
                <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.bodySm, lineHeight: 20 }}>
                  <Text style={{ fontWeight: '700' }}>Sarah</Text> added{' '}
                  <Text style={{ fontWeight: '700' }}>Sushi Night</Text> · $45.00
                </Text>
              }
              timestamp="2 hours ago"
              read={false}
              onPress={() => {}}
            />
          </Variant>
          <Variant label="Read">
            <NotificationItem
              avatarFallback="Jo"
              text="Josh settled up $30.00 with you"
              timestamp="Yesterday"
              read={true}
              onPress={() => {}}
            />
          </Variant>
          <Variant label="No press handler">
            <NotificationItem
              avatarFallback="Ri"
              text="Riya invited you to Weekend Trip"
              timestamp="3 days ago"
              read={true}
            />
          </Variant>
        </Section>

        {/* ── LAYOUT COMPONENTS NOTE ───────────────────────────────────── */}
        <Section title="Layout Components">
          <GlassCard style={{ padding: 16, gap: 12 }}>
            {[
              { name: 'ScreenContainer', note: 'Wraps every screen — SafeArea + optional scroll/keyboard-avoid' },
              { name: 'HeaderBar', note: 'Fixed 40px slots, auto back-arrow, transparent prop' },
              { name: 'BottomNavigation', note: 'Presentational tab bar (real nav via expo-router Tabs)' },
            ].map((item) => (
              <View key={item.name} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View
                  style={{
                    backgroundColor: 'rgba(123,92,246,0.15)',
                    borderRadius: theme.radii.sm,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    alignSelf: 'flex-start',
                    marginTop: 2,
                  }}
                >
                  <Text style={{ color: theme.colors.brand.primary, fontSize: theme.typography.tiny, fontWeight: '700' }}>
                    {item.name}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.bodySm, flex: 1, lineHeight: 20 }}>
                  {item.note}
                </Text>
              </View>
            ))}
          </GlassCard>
        </Section>

        {/* ── OVERLAYS NOTE ────────────────────────────────────────────── */}
        <Section title="Overlays & Interactive">
          <GlassCard style={{ padding: 16, gap: 12 }}>
            {[
              { name: 'ExpandableFAB', note: 'Radial FAB at bottom-right of every (app) screen — Scan / Manual / Transfer' },
              { name: 'ConfirmModal', note: 'Generic confirmation bottom sheet — pass title, body, and onConfirm' },
              { name: 'GlowWrapper', note: 'Purple glow decoration wrapper for hero elements' },
            ].map((item) => (
              <View key={item.name} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View
                  style={{
                    backgroundColor: 'rgba(123,92,246,0.15)',
                    borderRadius: theme.radii.sm,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    alignSelf: 'flex-start',
                    marginTop: 2,
                  }}
                >
                  <Text style={{ color: theme.colors.brand.primary, fontSize: theme.typography.tiny, fontWeight: '700' }}>
                    {item.name}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.bodySm, flex: 1, lineHeight: 20 }}>
                  {item.note}
                </Text>
              </View>
            ))}
          </GlassCard>
        </Section>

      </ScrollView>
    </SafeAreaView>
  )
}
