import { View, Text, ScrollView, Alert, Image, TouchableOpacity } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as ImagePicker from 'expo-image-picker'
import { Stack } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useProfile, useUpdateProfile, useSignOut } from '@/features/auth/hooks'
import { supabase } from '@/lib/supabase'

const profileSchema = z.object({
  display_name: z.string().min(2).max(50),
})
type ProfileForm = z.infer<typeof profileSchema>

export default function ProfileScreen() {
  const { data: profile, isLoading } = useProfile()
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile()
  const { mutate: signOut } = useSignOut()
  const { control, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { display_name: profile?.display_name ?? '' },
  })

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (result.canceled || !result.assets[0]) return

    // Upload to Supabase Storage (avatars bucket — create this in Supabase dashboard as private)
    const uri = result.assets[0].uri
    const ext = uri.split('.').pop()
    const { data: { user } } = await supabase.auth.getUser()
    const fileName = `${user?.id}/avatar.${ext}`

    const response = await fetch(uri)
    const blob = await response.blob()
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, { upsert: true })

    if (uploadError) {
      Alert.alert('Upload Failed', uploadError.message)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    updateProfile({ avatar_url: publicUrl })
  }

  const onSubmit = (data: ProfileForm) => {
    updateProfile(data, {
      onSuccess: () => Alert.alert('Saved', 'Profile updated'),
      onError: (e) => Alert.alert('Error', e.message),
    })
  }

  if (isLoading) return null

  return (
    <ScrollView className="flex-1 bg-dark-bg" contentContainerClassName="px-6 py-8">
      <Stack.Screen options={{ title: 'Profile' }} />

      {/* Avatar */}
      <TouchableOpacity onPress={pickAvatar} className="self-center mb-6">
        {profile?.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            className="w-24 h-24 rounded-full"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-dark-surface border-2 border-brand-primary items-center justify-center">
            <Text className="text-brand-primary text-3xl font-bold">
              {profile?.display_name?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <Text className="text-brand-accent text-center mt-2 text-sm">Change photo</Text>
      </TouchableOpacity>

      {/* Display name */}
      <Controller
        control={control}
        name="display_name"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Display name"
            placeholder="How should friends see you?"
            value={value}
            onChangeText={onChange}
            error={errors.display_name?.message}
          />
        )}
      />

      <Button
        title={isSaving ? 'Saving...' : 'Save profile'}
        onPress={handleSubmit(onSubmit)}
        disabled={isSaving}
        className="mt-6"
      />

      {/* AUTH-04: Sign out — accessible from profile screen */}
      <Button
        title="Sign out"
        variant="secondary"
        onPress={() => {
          signOut(undefined, {
            onError: (e) => Alert.alert('Sign Out Error', e.message),
          })
        }}
        className="mt-4"
      />
    </ScrollView>
  )
}
