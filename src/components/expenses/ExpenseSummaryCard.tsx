import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { type LucideIcon, Calendar, User } from 'lucide-react-native'
import { CategoryPill } from '@/components/ui/CategoryPill'
import { theme } from '@/lib/theme'

/**
 * ExpenseSummaryCard
 *
 * Prominent card displayed at the top of expense_detail and split_confirmation screens.
 * Shows the expense title, category, total amount prominently, and payer + date metadata.
 *
 * Used in:
 * - expense_detail_dark_theme
 * - split_confirmation
 *
 * Design:
 * - Glass card with subtle gradient top accent
 * - CategoryPill (top-left)
 * - Large amount display (centre, primary colour)
 * - Title below amount
 * - Payer and date metadata row at bottom
 *
 * Usage:
 *   <ExpenseSummaryCard
 *     title="Grocery Store"
 *     totalCents={6000}
 *     categoryLabel="Food"
 *     categoryIcon={ShoppingCart}
 *     payerName="Sarah"
 *     date="Mar 5, 2026"
 *   />
 */

export interface ExpenseSummaryCardProps {
  title: string
  totalCents: number
  currency?: string
  categoryLabel?: string
  categoryIcon?: LucideIcon
  categoryColor?: string
  payerName?: string
  date?: string
  /** Optional descriptive note */
  note?: string
}

export function ExpenseSummaryCard({
  title,
  totalCents,
  currency = '$',
  categoryLabel,
  categoryIcon,
  categoryColor,
  payerName,
  date,
  note,
}: ExpenseSummaryCardProps) {
  return (
    <View
      style={{
        borderRadius: theme.radii.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
      }}
    >
      {/* Thin gradient top bar */}
      <LinearGradient
        colors={['#9B7BFF', '#7B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 3 }}
      />

      <View
        style={{
          backgroundColor: theme.colors.dark.surface,
          padding: theme.spacing.xl,
          gap: theme.spacing.md,
        }}
      >
        {/* Category pill (optional) */}
        {categoryLabel && categoryIcon && (
          <View style={{ alignSelf: 'flex-start' }}>
            <CategoryPill
              label={categoryLabel}
              icon={categoryIcon}
              selected={false}
            />
          </View>
        )}

        {/* Amount — main focus */}
        <View style={{ alignItems: 'center', paddingVertical: theme.spacing.sm }}>
          <Text
            style={{
              fontSize: 42,
              fontWeight: '800',
              color: theme.colors.text.primary,
              letterSpacing: -1,
              lineHeight: 48,
            }}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            numberOfLines={1}
          >
            {currency}{(totalCents / 100).toFixed(2)}
          </Text>

          <Text
            style={{
              fontSize: theme.typography.body,
              fontWeight: '500',
              color: theme.colors.text.secondary,
              marginTop: 4,
              textAlign: 'center',
            }}
            numberOfLines={2}
          >
            {title}
          </Text>

          {note ? (
            <Text
              style={{
                fontSize: theme.typography.caption,
                color: theme.colors.text.tertiary,
                marginTop: 4,
                textAlign: 'center',
              }}
              numberOfLines={2}
            >
              {note}
            </Text>
          ) : null}
        </View>

        {/* Divider */}
        {(payerName || date) && (
          <View
            style={{
              height: 1,
              backgroundColor: theme.colors.glass.divider,
              marginVertical: 4,
            }}
          />
        )}

        {/* Metadata row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {payerName ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: 'rgba(123, 92, 246, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={12} color={theme.colors.brand.primary} />
              </View>
              <Text style={{ fontSize: theme.typography.caption, color: theme.colors.text.secondary }}>
                Paid by{' '}
                <Text style={{ fontWeight: '600', color: theme.colors.text.primary }}>{payerName}</Text>
              </Text>
            </View>
          ) : (
            <View />
          )}

          {date ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Calendar size={12} color={theme.colors.text.tertiary} />
              <Text style={{ fontSize: theme.typography.caption, color: theme.colors.text.tertiary }}>
                {date}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  )
}
