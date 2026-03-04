import { useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSignIn, useSignInWithGoogle } from '@/features/auth/hooks'
import { useOAuthWarmUp } from '@/hooks/useOAuthWarmUp'
import { showAlert } from '@/lib/alert'

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

  // AUTH-06: Shared OAuth cold-start deep link handler + WebBrowser warm-up
  useOAuthWarmUp()

  const { mutate: signInWithGoogle, isPending: isPendingGoogle } = useSignInWithGoogle()

  const onSubmit = (data: SignInForm) => {
    signIn(data, {
      onError: (error) => {
        showAlert('Sign In Failed', error.message)
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
          onError: (error) => showAlert('Google Sign-In Failed', error.message),
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
