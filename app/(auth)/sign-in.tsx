import { View, Text } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SocialDivider } from '@/components/auth/SocialDivider'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { useSignIn, useSignInWithGoogle } from '@/features/auth/hooks'
import { useOAuthWarmUp } from '@/hooks/useOAuthWarmUp'
import { showAlert } from '@/lib/alert'
import { Mail, Lock } from 'lucide-react-native'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import { GlowWrapper } from '@/components/ui/GlowWrapper'
import OweLogo from '@/components/icon/owe-logo'

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

  useOAuthWarmUp()

  const { mutate: signInWithGoogle, isPending: isPendingGoogle } = useSignInWithGoogle()

  const onSubmit = (data: SignInForm) => {
    signIn(data, {
      onError: (error: any) => {
        showAlert('Sign In Failed', error.message)
      },
    })
  }

  return (
    <ScreenContainer padded>
      <View className="flex-1 justify-center gap-5">
        <View className="items-center" style={{ marginBottom: 32 }}>
          <View pointerEvents="box-none" style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 24, zIndex: 1 }}>
            <GlowWrapper>
              <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
                <OweLogo size={64} />
              </View>
            </GlowWrapper>
          </View>
          <Text style={{ fontSize: 34, fontWeight: '800', color: '#FFFFFF', marginBottom: 8, letterSpacing: -0.5 }}>
            Welcome Back
          </Text>
          <Text style={{ fontSize: 17, color: '#94A3B8', letterSpacing: 0.2 }}>
            Sign in to continue
          </Text>
        </View>

        <GlassCard padding={28}>
          <View style={{ gap: 20 }}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email Address"
                  icon={Mail}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />

            <View>
              <View className="flex-row justify-between items-center" style={{ marginBottom: 6 }}>
                <Text className="text-text-secondary text-sm font-medium">Password</Text>
                <Link href={"/(auth)/forgot-password" as any}>
                  <Text className="text-brand-primary font-medium text-sm">Forgot Password?</Text>
                </Link>
              </View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    icon={Lock}
                    placeholder="••••••••"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    error={errors.password?.message}
                  />
                )}
              />
            </View>

            <View style={{ marginTop: 4 }}>
              <Button
                title={isPending ? 'Signing In...' : 'Sign In'}
                onPress={handleSubmit(onSubmit)}
                disabled={isPending}
                size="lg"
              />
            </View>

            <SocialDivider />

            <GoogleButton
              label={isPendingGoogle ? 'Opening Google...' : 'Continue with Google'}
              onPress={() => signInWithGoogle(undefined, {
                onError: (error: any) => showAlert('Google Sign-In Failed', error.message),
              })}
              disabled={isPendingGoogle}
            />
          </View>
        </GlassCard>

        <View className="flex-row justify-center" style={{ marginTop: 32 }}>
          <Text style={{ fontSize: 15, color: '#94A3B8' }}>
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/sign-up">
            <Text style={{ fontSize: 15, color: '#7B5CF6', fontWeight: '600' }}>
              Sign Up
            </Text>
          </Link>
        </View>
      </View>
    </ScreenContainer>
  )
}


