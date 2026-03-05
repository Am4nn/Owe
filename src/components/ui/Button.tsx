import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, View, Platform } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { LucideIcon } from 'lucide-react-native'

interface ButtonProps extends TouchableOpacityProps {
  title: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  loading?: boolean
  fullWidth?: boolean
  borderRadius?: number
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  fullWidth = true,
  disabled,
  className,
  borderRadius = 16,
  style,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1)

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 300 })
    onPressIn?.(e)
  }

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
    onPressOut?.(e)
  }

  const sizeHeight = { sm: 40, md: 50, lg: 58 }[size]

  const textSizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }[size]

  const textWeightClass = size === 'lg' ? 'font-bold' : 'font-semibold'

  const widthClass = fullWidth ? "w-full" : "self-start"
  const opacityClass = disabled ? "opacity-50" : "opacity-100"

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }))

  const renderContent = () => (
    loading ? (
      <ActivityIndicator color={variant === 'primary' ? 'white' : '#7B5CF6'} />
    ) : (
      <View className="flex-row items-center justify-center">
        {Icon && (
          <Icon
            size={size === 'sm' ? 16 : 20}
            color={variant === 'primary' ? 'white' : (variant === 'danger' ? '#FF4D6D' : '#F8FAFC')}
            style={{ marginRight: 8 }}
          />
        )}
        <Text className={`text-center ${variant === 'primary' ? 'text-white' : variant === 'danger' ? 'text-[#FF4D6D]' : variant === 'ghost' ? 'text-brand-primary' : 'text-[#F8FAFC]'} ${textWeightClass} ${textSizeClass}`}>
          {title}
        </Text>
      </View>
    )
  )

  // Primary variant: use LinearGradient for proper gradient on both platforms
  if (variant === 'primary') {
    return (
      <Animated.View
        style={[
          animatedStyle,
          {
            borderRadius,
            shadowColor: '#7B5CF6',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.28,
            shadowRadius: 24,
            elevation: 9,
          },
        ]}
        className={`${widthClass} ${opacityClass}`}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.85}
          style={{ borderRadius, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={['#9B7BFF', '#7B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: sizeHeight,
              borderRadius,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: size === 'lg' ? 32 : size === 'md' ? 24 : 16,
            }}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  // Non-primary variants
  const variantStyle = {
    secondary: {
      backgroundColor: 'rgba(26, 29, 46, 0.7)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: 'rgba(255, 77, 109, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255, 77, 109, 0.3)',
    },
  }[variant] || {}

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center ${widthClass} ${opacityClass} ${className ?? ''}`}
      style={[
        animatedStyle,
        {
          height: sizeHeight,
          borderRadius,
          paddingHorizontal: size === 'lg' ? 32 : size === 'md' ? 24 : 16,
          ...variantStyle,
        },
        style,
      ]}
      {...props}
    >
      {renderContent()}
    </AnimatedTouchableOpacity>
  )
}

