import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { PaymentMethodRow, PaymentMethodRowProps } from './PaymentMethodRow'
import { Plus, CreditCard } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * PaymentMethodList
 *
 * Vertical list of stored payment methods with an "Add Payment Method"
 * button at the bottom. Handles empty state when no methods are saved.
 *
 * Used in:
 * - payment_methods
 *
 * Usage:
 *   <PaymentMethodList
 *     methods={paymentMethods}
 *     onPressMethod={(id) => editMethod(id)}
 *     onAddMethod={() => router.push('/payment-methods/new')}
 *   />
 */

export interface PaymentMethodListItem extends PaymentMethodRowProps {
  id: string
}

export interface PaymentMethodListProps {
  methods: PaymentMethodListItem[]
  onPressMethod?: (id: string) => void
  onSetDefault?: (id: string) => void
  onAddMethod?: () => void
}

function EmptyPaymentMethods({ onAdd }: { onAdd?: () => void }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: 'rgba(123, 92, 246, 0.10)',
          borderWidth: 1,
          borderColor: 'rgba(123, 92, 246, 0.18)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <CreditCard size={28} color={theme.colors.brand.primary} />
      </View>
      <Text
        style={{
          fontSize: theme.typography.h4,
          fontWeight: '600',
          color: theme.colors.text.primary,
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        No payment methods
      </Text>
      <Text
        style={{
          fontSize: theme.typography.bodySm,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          lineHeight: 20,
          marginBottom: 24,
        }}
      >
        Add a card, bank account, or wallet to settle expenses faster.
      </Text>
      {onAdd && (
        <TouchableOpacity onPress={onAdd} activeOpacity={0.8}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: theme.radii.pill,
              backgroundColor: 'rgba(123, 92, 246, 0.12)',
              borderWidth: 1,
              borderColor: 'rgba(123, 92, 246, 0.22)',
            }}
          >
            <Plus size={16} color={theme.colors.brand.primary} />
            <Text style={{ fontSize: theme.typography.bodySm, fontWeight: '600', color: theme.colors.brand.primary }}>
              Add Payment Method
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
}

export function PaymentMethodList({
  methods,
  onPressMethod,
  onSetDefault,
  onAddMethod,
}: PaymentMethodListProps) {
  return (
    <FlatList
      data={methods}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ marginBottom: theme.spacing.sm }}>
          <PaymentMethodRow
            {...item}
            onPress={onPressMethod ? () => onPressMethod(item.id) : undefined}
            onSetDefault={onSetDefault ? () => onSetDefault(item.id) : undefined}
          />
        </View>
      )}
      ListEmptyComponent={<EmptyPaymentMethods onAdd={onAddMethod} />}
      ListFooterComponent={
        methods.length > 0 && onAddMethod ? (
          <TouchableOpacity
            onPress={onAddMethod}
            activeOpacity={0.8}
            style={{ marginTop: theme.spacing.md }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.spacing.sm,
                height: 50,
                borderRadius: theme.radii.card,
                borderWidth: 1.5,
                borderColor: 'rgba(123, 92, 246, 0.25)',
                borderStyle: 'dashed',
              }}
            >
              <Plus size={18} color={theme.colors.brand.primary} />
              <Text
                style={{
                  fontSize: theme.typography.bodySm,
                  fontWeight: '600',
                  color: theme.colors.brand.primary,
                }}
              >
                Add Payment Method
              </Text>
            </View>
          </TouchableOpacity>
        ) : null
      }
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  )
}
