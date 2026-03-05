import { Text, TextProps } from 'react-native'

interface AmountTextProps extends TextProps {
  amount: number // in cents
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'display'
  showSign?: boolean
  variant?: 'auto' | 'positive' | 'negative' | 'neutral'
}

export function AmountText({
  amount,
  currency = '$',
  size = 'md',
  showSign = false,
  variant = 'auto',
  className,
  ...props
}: AmountTextProps) {
  const isZero = amount === 0
  const isPositive = amount > 0
  const isNegative = amount < 0

  let effectiveVariant = variant
  if (variant === 'auto') {
    if (isZero) effectiveVariant = 'neutral'
    else if (isPositive) effectiveVariant = 'positive'
    else if (isNegative) effectiveVariant = 'negative'
  }

  const sign = showSign ? (isPositive ? '+' : (isNegative ? '-' : '')) : (isNegative ? '-' : '')
  const displayAmount = (Math.abs(amount) / 100).toFixed(2)

  const sizeClass = {
    sm: "text-sm",       // 14px
    md: "text-base",     // 16px
    lg: "text-2xl",      // 24px
    display: "text-[32px] leading-[40px]" // 32px
  }[size]

  const colorClass = {
    positive: "text-amount-positive",
    negative: "text-amount-negative",
    neutral: "text-amount-neutral",
    auto: "text-amount-neutral", // Fallback, shouldn't be reached
  }[effectiveVariant]

  return (
    <Text
      className={`font-semibold ${sizeClass} ${colorClass} ${className ?? ''}`}
      {...props}
    >
      {sign}{currency}{displayAmount}
    </Text>
  )
}
