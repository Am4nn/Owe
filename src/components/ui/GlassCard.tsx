import { View, Pressable, ViewProps, StyleProp, ViewStyle, Platform } from 'react-native';
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

export const shadows = {

  /* -------------------------------------------------- */
  /* Basic Elevation */
  /* -------------------------------------------------- */

  sm: '0 2px 4px rgba(0,0,0,0.35)',

  md: '0 6px 12px rgba(0,0,0,0.35), 0 12px 24px rgba(0,0,0,0.40)',

  lg: '0 12px 24px rgba(0,0,0,0.40), 0 24px 48px rgba(0,0,0,0.45)',

  xl: '0 24px 48px rgba(0,0,0,0.45), 0 48px 96px rgba(0,0,0,0.55)',


  /* -------------------------------------------------- */
  /* Premium SaaS / Dashboard */
  /* -------------------------------------------------- */

  card: '0 0 0 1px rgba(255,255,255,0.04), 0 6px 12px rgba(0,0,0,0.35), 0 16px 32px rgba(0,0,0,0.45), 0 32px 64px rgba(0,0,0,0.55)',

  soft: '0 10px 25px rgba(0,0,0,0.30), 0 20px 40px rgba(0,0,0,0.40)',

  smooth: '0 8px 16px rgba(0,0,0,0.30), 0 20px 40px rgba(0,0,0,0.35)',

  floating: '0 14px 28px rgba(0,0,0,0.35), 0 28px 60px rgba(0,0,0,0.45)',


  /* -------------------------------------------------- */
  /* Inner Depth (Inset Shadows) */
  /* -------------------------------------------------- */

  inset: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -2px 8px rgba(0,0,0,0.40)',

  insetSoft: 'inset 0 2px 4px rgba(0,0,0,0.35)',


  /* -------------------------------------------------- */
  /* Glow Effects */
  /* -------------------------------------------------- */

  glowSubtle: '0 0 0 1px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.40)',

  glowBlue: '0 0 0 1px rgba(59,130,246,0.15), 0 0 20px rgba(59,130,246,0.25)',

  glowPurple: '0 0 0 1px rgba(168,85,247,0.18), 0 0 22px rgba(168,85,247,0.28)',

  glowCyan: '0 0 0 1px rgba(34,211,238,0.15), 0 0 20px rgba(34,211,238,0.25)',


  /* -------------------------------------------------- */
  /* Glass / Frosted UI */
  /* -------------------------------------------------- */

  glass: '0 8px 32px rgba(0,0,0,0.35)',

  glassStrong: '0 20px 60px rgba(0,0,0,0.45)',


  /* -------------------------------------------------- */
  /* Interactive / Hover */
  /* -------------------------------------------------- */

  hoverLift: '0 14px 28px rgba(0,0,0,0.40), 0 30px 60px rgba(0,0,0,0.50)',

  hoverSoft: '0 8px 16px rgba(0,0,0,0.35), 0 18px 36px rgba(0,0,0,0.40)',


  /* -------------------------------------------------- */
  /* Dramatic / Hero Cards */
  /* -------------------------------------------------- */

  dramatic: '0 30px 80px rgba(0,0,0,0.55)',

  deep: '0 40px 120px rgba(0,0,0,0.65)',


  /* -------------------------------------------------- */
  /* Neumorphism Dark */
  /* -------------------------------------------------- */

  neu: '6px 6px 12px rgba(0,0,0,0.5), -6px -6px 12px rgba(255,255,255,0.03)',

};

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

