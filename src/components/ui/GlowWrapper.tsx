import React, { useState } from 'react';
import { View, LayoutChangeEvent, StyleProp, ViewStyle, StyleSheet, Platform } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

interface GlowProps {
  children: React.ReactNode;
  /** The hex color of the glow effect */
  color?: string;
  /** Opacity/intensity of the glow. Keep it very low (e.g. 0.15) for a subtle effect */
  intensity?: number;
  /** How far the glow extends relative to the child's size. Large values = softer spread */
  glowScale?: number;
  /** X offset to shift the glow */
  offsetX?: number;
  /** Y offset to shift the glow */
  offsetY?: number;
  /** Optional style for the absolute glow wrapper */
  style?: StyleProp<ViewStyle>;
  /** Optional style for the outer container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Initial fallback size to render the glow before child layout is measured */
  fallbackSize?: number;
}

export function GlowWrapper({
  children,
  color = '#7B5CF6', // Uses the brand primary purple
  intensity = 0.15,  // Very subtle by default
  glowScale = 2.5,   // Reduced spread based on feedback
  offsetX = 0,
  offsetY = 0,
  style,
  containerStyle,
  fallbackSize = 100,
}: GlowProps) {
  const [size, setSize] = useState({ width: fallbackSize, height: fallbackSize });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize({ width, height });
    }
  };

  // We rely fully on an absolute wrapper that spans outward and centers its items.
  const glowWidth = size.width * glowScale;
  const glowHeight = size.height * glowScale;

  // Calculate top/left offset exactly rather than relying on center translations, 
  // as SVG bounds behavior can cause shifting on different native engines.
  const top = -(glowHeight - size.height) / 2 + offsetY;
  const left = -(glowWidth - size.width) / 2 + offsetX;

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.glowWrapper,
          {
            width: glowWidth,
            height: glowHeight,
            top,
            left,
            // Overflow visible is crucial to prevent hard clipping
            overflow: 'visible',
          },
          style,
        ]}
        pointerEvents="none"
      >
        <Svg width="100%" height="100%" style={{ overflow: 'visible' }}>
          <Defs>
            <RadialGradient
              id="glow"
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              fx="50%"
              fy="50%"
              // ObjectBoundingBox often scales gradients smoother without rendering rings compared to userSpaceOnUse
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor={color} stopOpacity={intensity * 2.5} />
              <Stop offset="15%" stopColor={color} stopOpacity={intensity * 1.5} />
              <Stop offset="30%" stopColor={color} stopOpacity={intensity * 0.5} />
              <Stop offset="65%" stopColor={color} stopOpacity={intensity * 0.15} />
              <Stop offset="100%" stopColor={color} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          {/* Background Diffusion */}
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
        </Svg>
      </View>
      <View onLayout={onLayout} style={styles.childContainer}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowWrapper: {
    position: 'absolute',
    ...Platform.select({
      android: { elevation: 0 },
      ios: { zIndex: -1 },
    }),
  },
  childContainer: {
    position: 'relative',
    zIndex: 1,
  },
});
