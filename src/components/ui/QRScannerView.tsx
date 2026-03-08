import { View, Text, TouchableOpacity } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated'
import { useEffect } from 'react'
import { ScanLine, Camera } from 'lucide-react-native'
import { theme, rnGlow } from '@/lib/theme'

/**
 * QRScannerView
 *
 * Camera viewfinder UI shell for QR code payment scanning.
 *
 * ⚠️  NOTE: expo-camera is NOT installed in this project.
 *           This component renders the complete scanner UI (frame,
 *           animated scan line, instructions) but uses a dark placeholder
 *           instead of a live camera feed.
 *           To enable real scanning: install expo-camera and replace the
 *           placeholder view with <CameraView> from 'expo-camera'.
 *
 * Used in:
 * - qr_code_payment_navigation_fixed
 *
 * Usage:
 *   <QRScannerView
 *     onScan={(data) => handleQrData(data)}
 *     onRequestCamera={() => requestCameraPermission()}
 *   />
 */

export interface QRScannerViewProps {
  /** Called with the scanned QR code data string */
  onScan?: (data: string) => void
  /** Called when user taps "Enable Camera" */
  onRequestCamera?: () => void
  /** Instruction text shown below the frame */
  instructions?: string
  frameSize?: number
}

export function QRScannerView({
  onRequestCamera,
  instructions = 'Point your camera at a QR code to pay or receive money',
  frameSize = 240,
}: QRScannerViewProps) {
  const scanY = useSharedValue(0)

  useEffect(() => {
    scanY.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )
  }, [])

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value * (frameSize - 4) }],
  }))

  const cornerSize = 24
  const cornerWidth = 3
  const cornerColor = theme.colors.brand.primary

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(5, 8, 20, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing['2xl'],
      }}
    >
      {/* Dark camera placeholder + QR frame */}
      <View
        style={{
          width: frameSize + 60,
          height: frameSize + 60,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Camera background */}
        <View
          style={{
            width: frameSize,
            height: frameSize,
            backgroundColor: 'rgba(20, 20, 40, 0.9)',
            borderRadius: 8,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Animated scan line */}
          <Animated.View
            style={[
              scanLineStyle,
              {
                position: 'absolute',
                top: 2,
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: cornerColor,
                ...rnGlow(cornerColor, 6, 0.8, 4),
              },
            ]}
          />

          {/* Camera placeholder icon */}
          <Camera size={40} color="rgba(255,255,255,0.08)" />
        </View>

        {/* Corner brackets — top-left */}
        <View style={[cornerStyle('tl', cornerSize, cornerWidth, cornerColor)]} />
        {/* Corner brackets — top-right */}
        <View style={[cornerStyle('tr', cornerSize, cornerWidth, cornerColor)]} />
        {/* Corner brackets — bottom-left */}
        <View style={[cornerStyle('bl', cornerSize, cornerWidth, cornerColor)]} />
        {/* Corner brackets — bottom-right */}
        <View style={[cornerStyle('br', cornerSize, cornerWidth, cornerColor)]} />
      </View>

      {/* Instructions */}
      <View style={{ alignItems: 'center', paddingHorizontal: 32, gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ScanLine size={18} color={theme.colors.brand.primary} />
          <Text
            style={{
              fontSize: theme.typography.bodySm,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {instructions}
          </Text>
        </View>

        {/* Camera permission note */}
        <View
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: theme.radii.card,
            backgroundColor: 'rgba(123, 92, 246, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(123, 92, 246, 0.16)',
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.caption,
              color: theme.colors.text.tertiary,
              textAlign: 'center',
            }}
          >
            Camera access required for QR scanning
          </Text>
        </View>

        {onRequestCamera && (
          <TouchableOpacity
            onPress={onRequestCamera}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: theme.radii.pill,
              backgroundColor: theme.colors.brand.primary,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.bodySm,
                fontWeight: '700',
                color: '#FFFFFF',
              }}
            >
              Enable Camera
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

// ── Corner bracket helper ──────────────────────────────────────────────────────

type Corner = 'tl' | 'tr' | 'bl' | 'br'

function cornerStyle(corner: Corner, size: number, width: number, color: string) {
  const base = {
    position: 'absolute' as const,
    width: size,
    height: size,
    borderColor: color,
  }

  const positions: Record<Corner, object> = {
    tl: { top: 0, left: 0, borderTopWidth: width, borderLeftWidth: width, borderTopLeftRadius: 6 },
    tr: { top: 0, right: 0, borderTopWidth: width, borderRightWidth: width, borderTopRightRadius: 6 },
    bl: { bottom: 0, left: 0, borderBottomWidth: width, borderLeftWidth: width, borderBottomLeftRadius: 6 },
    br: { bottom: 0, right: 0, borderBottomWidth: width, borderRightWidth: width, borderBottomRightRadius: 6 },
  }

  return { ...base, ...positions[corner] }
}
