import { View, Text, TouchableOpacity } from 'react-native'
import { useState, useEffect } from 'react'
import { router } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { TextInputField } from '@/components/ui/inputs/TextInputField'
import { SocialDivider } from '@/components/auth/SocialDivider'
import { OTPInput } from '@/components/auth/OTPInput'
import { supabase } from '@/lib/supabase'
import { showAlert } from '@/lib/alert'
import { Mail, ArrowLeft } from 'lucide-react-native'
import { ScreenContainer } from '@/components/ui/ScreenContainer'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [countdown, setCountdown] = useState(60)

  // Countdown timer for resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isEmailSent && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((c) => c - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isEmailSent, countdown])

  const handleSendLink = async () => {
    if (!email) {
      showAlert('Error', 'Please enter your email address')
      return
    }

    setIsPending(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setIsPending(false)

    if (error) {
      showAlert('Error', error.message)
    } else {
      setIsEmailSent(true)
      setCountdown(60)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length < 6) return

    setIsPending(true)
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery'
    })
    setIsPending(false)

    if (error) {
      showAlert('Invalid Code', error.message)
    } else {
      showAlert('Success', 'Code verified. You can now reset your password.')
      // Technically should route to a reset-password screen, but for now just back to sign-in
      // or standard session recovery will auto-login
      router.replace('/(auth)/sign-in')
    }
  }

  const handleResend = () => {
    if (countdown > 0) return
    handleSendLink()
  }

  return (
    <ScreenContainer padded scrollable>
      <View className="py-6 flex-row items-center">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-[rgba(255,255,255,0.05)]"
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text className="text-lg text-white font-semibold ml-2">Reset Password</Text>
      </View>

      <View className="flex-1 mt-6">
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-dark-elevated border border-[rgba(255,255,255,0.08)] items-center justify-center mb-6 shadow-[0_0_24px_rgba(123,92,246,0.15)]">
            <Mail size={32} color="#7B5CF6" />
          </View>
          <Text className="text-[28px] text-white font-bold mb-2 text-center">
            {isEmailSent ? 'Check Your Email' : 'Forgot Password?'}
          </Text>
          <Text className="text-text-secondary text-base text-center px-4">
            {isEmailSent
              ? `We've sent a 6-digit verification code to \n${email}`
              : 'No worries, we\'ll send you recovery instructions to your email account.'}
          </Text>
        </View>

        {!isEmailSent ? (
          <View className="gap-6 w-full">
            <TextInputField
              icon={Mail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Button
              title={isPending ? 'Sending Link...' : 'Send Reset Link'}
              onPress={handleSendLink}
              disabled={isPending || !email}
            />
          </View>
        ) : (
          <View className="items-center w-full">
            <OTPInput value={otp} onChangeText={setOtp} />

            <Button
              title={isPending ? 'Verifying...' : 'Verify Code'}
              onPress={handleVerifyOTP}
              disabled={isPending || otp.length < 6}
              className="mt-2 w-full"
            />

            <View className="flex-row justify-center mt-8">
              <Text className="text-text-secondary">Didn't receive code? </Text>
              <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
                <Text className={`font-semibold ${countdown > 0 ? 'text-text-tertiary' : 'text-brand-primary'}`}>
                  Resend Code {countdown > 0 ? `(00:${countdown.toString().padStart(2, '0')})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  )
}
