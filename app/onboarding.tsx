import { View, Text, Image } from 'react-native'
import { useState, useRef } from 'react'
import { router } from 'expo-router'
import PagerView from '@/components/ui/PagerView'
import { createMMKV } from 'react-native-mmkv'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Infinity } from 'lucide-react-native'

const SLIDES = [
  {
    id: 1,
    title: 'Split any expense with anyone',
    description: 'Track shared debts, rent, and dinner bills seamlessly with friends and roommates.',
    image: require('@/assets/images/onboarding_wallet.png'),
  },
  {
    id: 2,
    title: 'No limits, no paywalls',
    description: 'Create unlimited groups, add unlimited members, and settle up without hidden fees.',
    image: require('@/assets/images/onboarding_split.png'),
  },
  {
    id: 3,
    title: 'Bank-grade experience',
    description: 'A beautiful, fast, and offline-ready app that feels like your favorite modern bank.',
    image: require('@/assets/images/onboarding_growth.png'),
  },
]

const storage = createMMKV()

export default function OnboardingScreen() {
  const [activePage, setActivePage] = useState(0)
  const pagerRef = useRef<PagerView>(null)

  function completeOnboarding(target: '/sign-in' | '/sign-up') {
    storage.set('hasOnboarded', true)
    router.replace(`/(auth)${target}`)
  }

  return (
    <ScreenContainer padded edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between mt-4">
        <View className="flex-row items-center gap-2">
          <Infinity size={28} color="#7B5CF6" />
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
        className="flex-1 mt-8"
        initialPage={0}
        onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} className="flex-1 px-1">
            <GlassCard padding={0} className="w-full aspect-square rounded-3xl overflow-hidden mb-8 shadow-elevated">
              <Image
                source={slide.image}
                className="w-full h-full"
                resizeMode="cover"
              />
            </GlassCard>
            <Text className="text-[28px] font-bold text-white mb-4 leading-[36px]">
              {slide.title}
            </Text>
            <Text className="text-base text-text-secondary leading-relaxed">
              {slide.description}
            </Text>
          </View>
        ))}
      </PagerView>

      {/* Footer Controls */}
      <View className="pb-4 pt-6">
        {/* Pagination Dots */}
        <View className="flex-row justify-center gap-2 mb-8">
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              className={`h-2 rounded-full ${activePage === idx ? 'w-5 bg-brand-primary' : 'w-2 bg-[rgba(255,255,255,0.2)]'
                }`}
            />
          ))}
        </View>

        <View className="gap-3 mb-6">
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
