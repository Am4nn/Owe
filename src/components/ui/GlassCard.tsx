import { View, Pressable, ViewProps, StyleProp, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'dashed';
  padding?: number;
  pressable?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Variant styles as explicit RN StyleSheet-compatible objects (CSS classes don't work on native)
const variantStyles = {
  default: {
    backgroundColor: 'rgba(22, 25, 40, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 20,
  },
  elevated: {
    backgroundColor: 'rgba(37, 40, 64, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
  },
  dashed: {
    backgroundColor: 'rgba(26, 29, 46, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'dashed' as const,
    borderRadius: 16,
  },
};

export function GlassCard({
  variant = 'default',
  padding = 16,
  pressable = false,
  onPress,
  style,
  children,
  ...props
}: GlassCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (pressable) scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    if (pressable) scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const cardStyle = variantStyles[variant];

  const content = Platform.OS === 'web' ? (
    <BlurView
      intensity={12}
      tint="dark"
      style={[cardStyle, { padding, overflow: 'hidden' } as any, style]}
      {...props as any}
    >
      {children}
    </BlurView>
  ) : (
    <View
      style={[cardStyle, { padding, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16 }, style]}
      {...props}
    >
      {children}
    </View>
  );

  if (pressable || onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

