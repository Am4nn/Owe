import { View, Text, Image, useWindowDimensions, Platform, StyleSheet } from 'react-native'
import { useEffect, useRef } from 'react'
import { router } from 'expo-router'
import PagerView from '@/components/ui/PagerView'
import { createMMKV } from 'react-native-mmkv'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { GlowWrapper } from '@/components/ui/GlowWrapper'
import OweLogo from '@/components/icon/owe-logo'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  Easing,
  Extrapolation,
  SharedValue,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

const SLIDES = [
  {
    id: 1,
    title: 'Split Anything',
    description: 'The easiest way to divide expenses with friends, from dinner to travel.',
    image: require('@/assets/images/onboarding/split-anything.png'),
  },
  {
    id: 2,
    title: 'Fast. Beautiful. Clear.',
    description: 'Track balances in real time with a clean interface that always feels effortless.',
    image: require('@/assets/images/onboarding/fast-beautiful-reliable.png'),
  },
  {
    id: 3,
    title: 'No Limits. No Paywalls.',
    description: 'Create unlimited groups and members with zero hidden fees, ever.',
    image: require('@/assets/images/onboarding/no-limits.png'),
  },
]

const storage = createMMKV()
const AUTO_SCROLL_MS = 4200

type Slide = (typeof SLIDES)[number]

function OnboardingSlide({
  slide,
  index,
  progress,
}: {
  slide: Slide
  index: number
  progress: SharedValue<number>
}) {
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index)
    return {
      opacity: interpolate(distance, [0, 1], [1, 0.58], Extrapolation.CLAMP),
      transform: [
        { scale: interpolate(distance, [0, 1], [1, 0.94], Extrapolation.CLAMP) },
        { translateY: interpolate(distance, [0, 1], [0, 12], Extrapolation.CLAMP) },
      ],
    }
  })

  const textAnimatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index)
    return {
      opacity: interpolate(distance, [0, 1], [1, 0.45], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(distance, [0, 1], [0, 14], Extrapolation.CLAMP) }],
    }
  })

  return (
    <View key={slide.id} className="flex-1 px-1" collapsable={false}>
      <Animated.View style={imageAnimatedStyle}>
        <GlassCard padding={0} className="w-full aspect-square rounded-3xl overflow-hidden mb-8 shadow-elevated">
          <Image source={slide.image} className="w-full h-full" resizeMode="cover" />
        </GlassCard>
      </Animated.View>

      <Animated.Text style={textAnimatedStyle} className="text-[28px] font-bold text-white mb-4 leading-[36px]">
        {slide.title}
      </Animated.Text>
      <Animated.Text style={textAnimatedStyle} className="text-base text-text-secondary leading-relaxed">
        {slide.description}
      </Animated.Text>
    </View>
  )
}

function PaginationDot({
  index,
  progress,
  activeIndex,
  cycleProgress,
}: {
  index: number
  progress: SharedValue<number>
  activeIndex: SharedValue<number>
  cycleProgress: SharedValue<number>
}) {
  const dotAnimatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index)
    return {
      width: interpolate(distance, [0, 1], [30, 9], Extrapolation.CLAMP),
    }
  })

  const gradientOpacityStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index)
    return {
      opacity: interpolate(distance, [0, 1], [1, 0], Extrapolation.CLAMP),
    }
  })

  const inactiveOpacityStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index)
    return {
      opacity: interpolate(distance, [0, 1], [0, 1], Extrapolation.CLAMP),
    }
  })

  const timerFillStyle = useAnimatedStyle(() => {
    const isActive = Math.round(activeIndex.value) === index
    return {
      opacity: withTiming(isActive ? 1 : 0, { duration: 160 }),
      width: isActive ? cycleProgress.value * 30 : 0,
    }
  })

  return (
    <Animated.View style={[styles.dotBase, dotAnimatedStyle]}>
      <Animated.View style={[styles.dotLayer, gradientOpacityStyle]}>
        <LinearGradient
          colors={['#4D93FF', '#8B5CFF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.dotLayer}
        />
      </Animated.View>
      <Animated.View style={[styles.dotLayer, styles.dotInactive, inactiveOpacityStyle]} />
      <Animated.View style={[styles.dotTimer, timerFillStyle]} />
    </Animated.View>
  )
}

export default function OnboardingScreen() {
  const pagerRef = useRef<any>(null)
  const currentPageRef = useRef(0)
  const autoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { width } = useWindowDimensions()
  const slideImageSize = Math.min(width - 50, 420)
  const pagerHeight = slideImageSize + 150
  const progress = useSharedValue(0)
  const activeIndex = useSharedValue(0)
  const cycleProgress = useSharedValue(0)

  function completeOnboarding(target: '/sign-in' | '/sign-up') {
    storage.set('hasOnboarded', true)
    router.replace(`/(auth)${target}`)
  }

  function clearAutoScrollTimer() {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current)
      autoScrollTimerRef.current = null
    }
  }

  function startAutoScrollCycle(fromPage: number) {
    clearAutoScrollTimer()
    cancelAnimation(cycleProgress)
    cycleProgress.value = 0
    cycleProgress.value = withTiming(1, { duration: AUTO_SCROLL_MS, easing: Easing.linear })

    autoScrollTimerRef.current = setTimeout(() => {
      const nextPage = (fromPage + 1) % SLIDES.length
      goToPage(nextPage)
    }, AUTO_SCROLL_MS)
  }

  function handlePageSelected(position: number) {
    currentPageRef.current = position
    activeIndex.value = position
    progress.value = withTiming(position, { duration: 240 })
    startAutoScrollCycle(position)
  }

  function goToPage(page: number) {
    const nativePager = pagerRef.current
    if (!nativePager) return

    if (typeof nativePager.setPage === 'function') {
      nativePager.setPage(page)
      return
    }

    if (typeof nativePager.scrollTo === 'function') {
      nativePager.scrollTo({ x: width * page, y: 0, animated: true })
      progress.value = withTiming(page, { duration: 240 })
      currentPageRef.current = page
    }
  }

  useEffect(() => {
    startAutoScrollCycle(0)

    return () => {
      clearAutoScrollTimer()
      cancelAnimation(cycleProgress)
    }
  }, [width])

  return (
    <ScreenContainer padded edges={['top', 'bottom']} className='px-2'>
      {/* Header */}
      <View className="flex-row items-center justify-between mt-4">
        <View className="flex-row items-center gap-2">
          <GlowWrapper intensity={0.22} glowScale={2.4} fallbackSize={30}>
            <OweLogo size={28} />
          </GlowWrapper>
          <Text className="text-white text-xl font-bold tracking-tight">Owe</Text>
        </View>
        <Button
          variant="ghost"
          title="Skip"
          size="sm"
          fullWidth={false}
          onPress={() => completeOnboarding('/sign-in')}
        />
      </View>

      {/* Pager */}
      <PagerView
        ref={pagerRef}
        style={{ height: pagerHeight, marginTop: 20 }}
        initialPage={0}
        onPageSelected={(e) => handlePageSelected(e.nativeEvent.position)}
        {...(Platform.OS !== 'web'
          ? {
            onPageScroll: (e: any) => {
              const { position, offset } = e.nativeEvent
              progress.value = position + offset
            },
          }
          : {})}
      >
        {SLIDES.map((slide, idx) => (
          <OnboardingSlide key={slide.id} slide={slide} index={idx} progress={progress} />
        ))}
      </PagerView>

      {/* Footer Controls */}
      <View className="pb-4 pt-6">
        {/* Pagination Dots */}
        <View className="flex-row items-center justify-start gap-2 mb-8 pl-1">
          {SLIDES.map((_, idx) => (
            <PaginationDot
              key={idx}
              index={idx}
              progress={progress}
              activeIndex={activeIndex}
              cycleProgress={cycleProgress}
            />
          ))}
        </View>

        <View className="gap-5 mb-8">
          <Button
            title="Get Started"
            size="lg"
            onPress={() => completeOnboarding('/sign-up')}
          />
          <Button
            variant="secondary"
            title="Sign In"
            size="lg"
            onPress={() => completeOnboarding('/sign-in')}
          />
        </View>

        <Text className="text-text-tertiary text-xs text-center px-4 leading-tight">
          By continuing, you agree to Owe's Terms of Service and Privacy Policy.
        </Text>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  dotBase: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
  },
  dotLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  dotInactive: {
    backgroundColor: 'rgba(148,163,184,0.5)',
  },
  dotTimer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
})
