import { useEffect } from 'react'
import { View, Text, ScrollView, Alert, Platform } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'expo-router'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSignIn, useSignInWithGoogle, createSessionFromUrl } from '@/features/auth/hooks'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignInScreen() {
  const { mutate: signIn, isPending } = useSignIn()
  const { control, handleSubmit, formState: { errors } } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  // AUTH-06: WebBrowser warmup — pre-warms Chrome Custom Tabs on Android for faster open
  // Not available on web
  useEffect(() => {
    if (Platform.OS === 'web') return
    WebBrowser.warmUpAsync()
    return () => { WebBrowser.coolDownAsync() }
  }, [])

  // AUTH-06: Cold-start deep link handler — catches OAuth redirect if Android cold-started the app
  // WebBrowser.openAuthSessionAsync returns 'cancel' on cold-start; Linking.useURL() catches it
  const url = Linking.useURL()
  useEffect(() => {
    if (url) createSessionFromUrl(url)
  }, [url])

  const { mutate: signInWithGoogle, isPending: isPendingGoogle } = useSignInWithGoogle()

  const onSubmit = (data: SignInForm) => {
    signIn(data, {
      onError: (error) => {
        Alert.alert('Sign In Failed', error.message)
      },
    })
  }

  return (
    <ScrollView
      className="flex-1 bg-dark-bg"
      contentContainerClassName="px-6 py-12"
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-brand-primary text-4xl font-bold mb-2">Owe</Text>
      <Text className="text-white text-2xl font-bold mb-1">Welcome back</Text>
      <Text className="text-white/50 text-base mb-8">Sign in to continue</Text>

      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Password"
              placeholder="Your password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />
      </View>

      <Button
        title={isPending ? 'Signing in...' : 'Sign in'}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
        className="mt-8"
      />

      {/* Divider */}
      <View className="my-6 flex-row items-center gap-3">
        <View className="flex-1 h-px bg-white/10" />
        <Text className="text-white/40 text-sm">or</Text>
        <View className="flex-1 h-px bg-white/10" />
      </View>

      {/* AUTH-06: Google OAuth sign-in button */}
      <Button
        title={isPendingGoogle ? 'Opening Google...' : 'Continue with Google'}
        onPress={() => signInWithGoogle(undefined, {
          onError: (error) => Alert.alert('Google Sign-In Failed', error.message),
        })}
        disabled={isPendingGoogle}
        variant="secondary"
      />

      <View className="flex-row justify-center mt-6">
        <Text className="text-white/50">New here? </Text>
        <Link href="/(auth)/sign-up">
          <Text className="text-brand-primary font-semibold">Create account</Text>
        </Link>
      </View>
    </ScrollView>
  )
}
