import { View, Text, TouchableOpacity } from 'react-native'
import { CreditCard, Building2, Wallet, ChevronRight, Star } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * PaymentMethodRow
 *
 * A single stored payment method row used in the payment_methods screen.
 * Shows a type icon, card brand/bank name, masked number, "Default" badge,
 * and a tappable chevron for editing.
 *
 * Used in:
 * - payment_methods
 *
 * Design:
 * - Glass card row with icon (40x28) left, name + masked number middle
 * - "Default" green badge if isDefault
 * - Chevron right to edit/options
 *
 * Usage:
 *   <PaymentMethodRow
 *     type="card"
 *     brand="Visa"
 *     last4="4242"
 *     isDefault
 *     onPress={() => editMethod(id)}
 *   />
 */

export type PaymentMethodType = 'card' | 'bank' | 'wallet'

export interface PaymentMethodRowProps {
  type: PaymentMethodType
  brand?: string
  last4?: string
  /** e.g. "Chase Checking", "PayPal" */
  label?: string
  isDefault?: boolean
  onPress?: () => void
  onSetDefault?: () => void
}

const TYPE_ICONS = {
  card: CreditCard,
  bank: Building2,
  wallet: Wallet,
}

const TYPE_COLORS = {
  card: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.22)' },
  bank: { color: '#06D6A0', bg: 'rgba(6, 214, 160, 0.12)', border: 'rgba(6, 214, 160, 0.22)' },
  wallet: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.22)' },
}

export function PaymentMethodRow({
  type,
  brand,
  last4,
  label,
  isDefault = false,
  onPress,
  onSetDefault,
}: PaymentMethodRowProps) {
  const Icon = TYPE_ICONS[type]
  const colorConfig = TYPE_COLORS[type]

  const displayName = label ?? (brand ? brand : type === 'card' ? 'Card' : type === 'bank' ? 'Bank Account' : 'Wallet')
  const displaySub = last4 ? `•••• ${last4}` : type === 'wallet' ? 'Digital wallet' : ''

  const row = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.base,
        borderRadius: theme.radii.card,
        backgroundColor: 'rgba(20, 20, 32, 0.8)',
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
      }}
    >
      {/* Icon container */}
      <View
        style={{
          width: 44,
          height: 36,
          borderRadius: theme.radii.sm,
          backgroundColor: colorConfig.bg,
          borderWidth: 1,
          borderColor: colorConfig.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={colorConfig.color} />
      </View>

      {/* Name + masked number */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: theme.typography.bodySm,
            fontWeight: '600',
            color: theme.colors.text.primary,
          }}
          numberOfLines={1}
        >
          {displayName}
        </Text>
        {displaySub ? (
          <Text
            style={{
              fontSize: theme.typography.caption,
              color: theme.colors.text.tertiary,
              marginTop: 2,
              letterSpacing: 0.5,
            }}
          >
            {displaySub}
          </Text>
        ) : null}
      </View>

      {/* Default badge */}
      {isDefault && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: theme.radii.pill,
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            borderWidth: 1,
            borderColor: 'rgba(34, 197, 94, 0.22)',
          }}
        >
          <Star size={10} color={theme.colors.brand.success} fill={theme.colors.brand.success} />
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: theme.colors.brand.success,
            }}
          >
            Default
          </Text>
        </View>
      )}

      {/* Chevron */}
      <ChevronRight size={16} color={theme.colors.text.tertiary} />
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {row}
      </TouchableOpacity>
    )
  }
  return row
}
