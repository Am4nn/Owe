import { View, Text, ScrollView, Alert } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, router } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSignUp } from '@/features/auth/hooks'

const signUpSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpScreen() {
  const { mutate: signUp, isPending } = useSignUp()
  const { control, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = (data: SignUpForm) => {
    signUp(data, {
      onSuccess: () => {
        // Auth state change triggers navigation automatically via Stack.Protected
      },
      onError: (error) => {
        Alert.alert('Sign Up Failed', error.message)
      },
    })
  }

  return (
    <ScrollView
      className="flex-1 bg-dark-bg"
      contentContainerClassName="px-6 py-12"
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-white text-3xl font-bold mb-2">Create account</Text>
      <Text className="text-white/50 text-base mb-8">Split expenses, settle up fair.</Text>

      <View className="gap-4">
        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Your name"
              placeholder="How should we call you?"
              value={value}
              onChangeText={onChange}
              error={errors.displayName?.message}
            />
          )}
        />
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
              placeholder="8+ characters"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />
      </View>

      <Button
        title={isPending ? 'Creating account...' : 'Create account'}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
        className="mt-8"
      />

      <View className="flex-row justify-center mt-6">
        <Text className="text-white/50">Already have an account? </Text>
        <Link href="/(auth)/sign-in">
          <Text className="text-brand-primary font-semibold">Sign in</Text>
        </Link>
      </View>
    </ScrollView>
  )
}
