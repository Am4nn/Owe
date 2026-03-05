import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, router } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SocialDivider } from '@/components/auth/SocialDivider'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { useSignUp, useSignInWithGoogle } from '@/features/auth/hooks'
import { useOAuthWarmUp } from '@/hooks/useOAuthWarmUp'
import { showAlert } from '@/lib/alert'
import { Infinity, Mail, Lock, User, Camera, Check } from 'lucide-react-native'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import * as ImagePicker from 'expo-image-picker'

const signUpSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpScreen() {
  const { mutate: signUp, isPending } = useSignUp()
  const { control, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  })

  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  useOAuthWarmUp()
  const { mutate: signInWithGoogle, isPending: isPendingGoogle } = useSignInWithGoogle()

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri)
    }
  }

  const onSubmit = (data: SignUpForm) => {
    if (!termsAccepted) {
      showAlert('Terms Required', 'Please accept the Terms of Service to continue.')
      return
    }

    // Pass avatarUri if needed by your signUp mutation API
    signUp({ ...data }, {
      onSuccess: () => {
        // Auth state change triggers navigation
      },
      onError: (error: any) => {
        showAlert('Sign Up Failed', error.message)
      },
    })
  }

  return (
    <ScreenContainer padded scrollable>
      <View className="flex-1 justify-center py-10 min-h-screen">
        <View className="items-center mb-8">
          <View className="w-12 h-12 rounded-xl bg-dark-elevated border border-[rgba(255,255,255,0.08)] items-center justify-center mb-6 shadow-[0_0_24px_rgba(123,92,246,0.15)]">
            <Infinity size={24} color="#7B5CF6" />
          </View>
          <Text className="text-[28px] text-white font-bold mb-1">Create Account</Text>
        </View>

        {/* Avatar Picker */}
        <View className="items-center mb-8">
          <TouchableOpacity
            onPress={pickImage}
            className="w-[120px] h-[120px] rounded-full border-2 border-brand-primary items-center justify-center bg-dark-elevated relative overflow-visible"
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} className="w-full h-full rounded-full" />
            ) : (
              <Camera size={40} color="rgba(255,255,255,0.4)" />
            )}
            <View className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary rounded-full items-center justify-center border-2 border-[#0e1117]">
              <Text className="text-white text-lg font-bold leading-none">+</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="gap-4 w-full">
          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, value } }) => (
              <Input
                icon={User}
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
                icon={Mail}
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
                icon={Lock}
                placeholder="8+ characters"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                icon={Lock}
                placeholder="Confirm password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </View>

        {/* Terms Checkbox */}
        <TouchableOpacity
          className="flex-row items-center mt-6 mb-8 gap-3"
          activeOpacity={0.7}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          <View className={`w-5 h-5 rounded border items-center justify-center ${termsAccepted ? 'bg-brand-primary border-brand-primary' : 'border-[rgba(255,255,255,0.3)] bg-transparent'}`}>
            {termsAccepted && <Check size={14} color="#FFF" />}
          </View>
          <Text className="text-text-secondary pr-4 flex-1 leading-tight">
            I agree to the <Text className="text-brand-primary">Terms of Service</Text> and <Text className="text-brand-primary">Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        <Button
          title={isPending ? 'Creating Account...' : 'Create Account'}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        />

        <SocialDivider />

        <GoogleButton
          label={isPendingGoogle ? 'Opening Google...' : 'Continue with Google'}
          onPress={() => signInWithGoogle(undefined, {
            onError: (error: any) => showAlert('Google Sign-In Failed', error.message),
          })}
          disabled={isPendingGoogle}
        />

        <View className="flex-row justify-center mt-10">
          <Text className="text-text-secondary">Already have an account? </Text>
          <Link href="/(auth)/sign-in">
            <Text className="text-brand-primary font-semibold">Sign In</Text>
          </Link>
        </View>
      </View>
    </ScreenContainer>
  )
}
