import { View, Text, TouchableOpacity, Image } from 'react-native'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { TextInputField } from '@/components/ui/inputs/TextInputField'
import { SocialDivider } from '@/components/auth/SocialDivider'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { useSignUp, useSignInWithGoogle } from '@/features/auth/hooks'
import { useOAuthWarmUp } from '@/hooks/useOAuthWarmUp'
import { showAlert } from '@/lib/alert'
import { Mail, Lock, User, Camera, Check } from 'lucide-react-native'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import { GlowWrapper } from '@/components/ui/GlowWrapper'
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

interface SignUpInputProps {
  control: any
  name: keyof SignUpForm
  icon: any
  placeholder: string
  secureTextEntry?: boolean
  keyboardType?: any
  autoCapitalize?: any
  errors: any
}

const SignUpInput = ({ control, name, icon, placeholder, secureTextEntry, keyboardType, autoCapitalize, errors }: SignUpInputProps) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { onChange, value } }) => (
      <TextInputField
        variant='secondary'
        borderRadius={20}
        iconGap={4}
        icon={icon}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        value={value}
        onChangeText={onChange}
        error={errors[name]?.message}
      />
    )}
  />
)

const AvatarPicker = ({ avatarUri, pickImage }: { avatarUri: string | null, pickImage: () => void }) => (
  <View className="items-center mb-8">
    <TouchableOpacity
      onPress={pickImage}
      className="w-[120px] h-[120px] rounded-full border-2 border-brand-primary items-center justify-center bg-dark-elevated relative overflow-visible"
    >
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} className="w-full h-full rounded-full" />
      ) : (
        <Image
          source={require('@/assets/images/placeholders/avatar.png')}
          style={{ width: '100%', height: '100%' }}
        />
      )}
      <View className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary rounded-full items-center justify-center border-2 border-[#0f172a]">
        <Text className="text-white text-lg font-bold leading-none">+</Text>
      </View>
    </TouchableOpacity>
  </View>
);

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
    <ScreenContainer padded>
      <View className="flex-1 justify-center">
        <View className="items-center mb-8 justify-center flex-row gap-2">
          <Text style={{ fontSize: 34, fontWeight: '800', color: '#FFFFFF', marginBottom: 8, letterSpacing: -0.5 }}>
            Create Account
          </Text>
        </View>

        <View pointerEvents="box-none" style={{ alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <GlowWrapper>
            <AvatarPicker avatarUri={avatarUri} pickImage={pickImage} />
          </GlowWrapper>
        </View>

        <View className="gap-5 w-full">
          <SignUpInput
            control={control}
            name="displayName"
            icon={User}
            placeholder="How should we call you?"
            errors={errors}
          />
          <SignUpInput
            control={control}
            name="email"
            icon={Mail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            errors={errors}
          />
          <SignUpInput
            control={control}
            name="password"
            icon={Lock}
            placeholder="8+ characters"
            secureTextEntry
            errors={errors}
          />
          <SignUpInput
            control={control}
            name="confirmPassword"
            icon={Lock}
            placeholder="Confirm password"
            secureTextEntry
            errors={errors}
          />
        </View>

        <TouchableOpacity
          className="flex-row items-center mt-10 mb-10 gap-3"
          activeOpacity={0.7}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          <View className={`w-5 h-5 rounded-full border items-center justify-center ${termsAccepted ? 'bg-brand-primary border-brand-primary' : 'border-[rgba(255,255,255,0.3)] bg-transparent'}`}>
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

        <SocialDivider className='mt-8 mb-8' />

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
