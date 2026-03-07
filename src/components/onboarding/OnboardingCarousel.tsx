import { View, Text, TouchableOpacity } from 'react-native'
import { useState, useRef } from 'react'
import PagerView from 'react-native-pager-view'
import { PaginationDots } from './PaginationDots'
import { OnboardingSlide, OnboardingSlideDef } from './OnboardingSlide'
import { Button } from '@/components/ui/Button'
import { theme } from '@/lib/theme'

/**
 * OnboardingCarousel
 *
 * Full-screen swipeable onboarding experience built on top of
 * react-native-pager-view (already installed). Composes:
 *   - OnboardingSlide pages
 *   - PaginationDots indicator
 *   - Previous / Next / Skip navigation
 *   - "Get Started" CTA on the last slide
 *
 * Used in:
 * - splash_onboarding_owe_new_logo
 *
 * Usage:
 *   <OnboardingCarousel
 *     slides={[
 *       { icon: Wallet, title: 'Split easily', subtitle: '...' },
 *       { icon: Users, title: 'Track groups', subtitle: '...' },
 *       { icon: Zap, title: 'Settle fast', subtitle: '...' },
 *     ]}
 *     onComplete={() => router.replace('/(auth)/sign-in')}
 *     onSkip={() => router.replace('/(auth)/sign-in')}
 *   />
 */

export interface OnboardingCarouselProps {
  slides: OnboardingSlideDef[]
  onComplete: () => void
  onSkip?: () => void
}

export function OnboardingCarousel({ slides, onComplete, onSkip }: OnboardingCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const pagerRef = useRef<PagerView>(null)

  const isLast = activeIndex === slides.length - 1
  const isFirst = activeIndex === 0

  const goNext = () => {
    if (isLast) {
      onComplete()
    } else {
      const next = activeIndex + 1
      pagerRef.current?.setPage(next)
      setActiveIndex(next)
    }
  }

  const goPrev = () => {
    if (activeIndex > 0) {
      const prev = activeIndex - 1
      pagerRef.current?.setPage(prev)
      setActiveIndex(prev)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.dark.bg }}>
      {/* Skip button */}
      {onSkip && !isLast && (
        <TouchableOpacity
          onPress={onSkip}
          activeOpacity={0.7}
          style={{
            position: 'absolute',
            top: 52,
            right: theme.spacing.xl,
            zIndex: 10,
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: theme.radii.pill,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.bodySm,
              fontWeight: '600',
              color: theme.colors.text.secondary,
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        {slides.map((slide, i) => (
          <OnboardingSlide key={i} {...slide} />
        ))}
      </PagerView>

      {/* Bottom controls */}
      <View
        style={{
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: 44,
          paddingTop: theme.spacing.xl,
          gap: theme.spacing.lg,
          backgroundColor: theme.colors.dark.bg,
        }}
      >
        {/* Dots */}
        <View style={{ alignItems: 'center' }}>
          <PaginationDots count={slides.length} activeIndex={activeIndex} />
        </View>

        {/* Navigation row */}
        {isLast ? (
          <Button title="Get Started" onPress={onComplete} size="lg" />
        ) : (
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            {!isFirst && (
              <Button
                title="Back"
                onPress={goPrev}
                variant="secondary"
                fullWidth={false}
                style={{ minWidth: 80 }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Button title="Next" onPress={goNext} />
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
