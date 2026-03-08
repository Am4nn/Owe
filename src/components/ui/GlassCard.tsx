import { View, Pressable, ViewProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '@/lib/theme';

interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'dashed';
  padding?: number;
  pressable?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Re-export theme shadows so callers can import from this module if needed.
export const shadows = theme.shadows;

const borders = {
  subtle: 'rgba(255,255,255,0.10)',
  strong: 'rgba(255,255,255,0.12)',
  dashed: 'rgba(255,255,255,0.15)',
  highlight: 'rgba(255,255,255,0.18)',
};

const baseCard = {
  borderWidth: 1,
  borderRadius: 20,
};

export const variantStyles = {
  default: {
    ...baseCard,
    backgroundColor: 'rgba(25, 35, 53, 0.92)',

    borderColor: borders.subtle,
    borderTopColor: borders.highlight,

    boxShadow: shadows.neu,
  },

  floating: {
    backgroundColor: 'rgba(25, 35, 53, 0.92)',
    borderRadius: 20,
    boxShadow: shadows.floating
  },


  elevated: {
    ...baseCard,
    backgroundColor: 'rgba(37, 40, 64, 0.9)',

    borderColor: borders.strong,

    boxShadow: shadows.glass,
  },

  dashed: {
    ...baseCard,
    borderRadius: 16,

    backgroundColor: 'rgba(26, 29, 46, 0.7)',
    boxShadow: shadows.dramatic,

    borderColor: borders.dashed,
    borderStyle: 'dashed' as const,
  },
};

// TODO: Add more variants based on elevation

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

  const content = (
    <View
      style={[cardStyle, { padding, overflow: 'hidden' }, style]}
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

