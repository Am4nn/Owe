import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { StatCard } from '@/components/profile/StatCard'
import { SettingsMenu, SettingsSection } from '@/components/profile/SettingsMenu'
import { useProfile, useUpdateProfile, useSignOut } from '@/features/auth/hooks'
import { useSession } from '@/features/auth/hooks'
// Component handles loading internally
import { supabase } from '@/lib/supabase'
import { showAlert } from '@/lib/alert'
import { ArrowLeft, Share, Shield, Bell, User, LogOut } from 'lucide-react-native'
import { ScreenContainer } from '@/components/ui/ScreenContainer'

const profileSchema = z.object({
  display_name: z.string().min(2).max(50),
})
type ProfileForm = z.infer<typeof profileSchema>

export default function ProfileScreen() {
  const { session } = useSession()
  const profileQuery = useProfile()
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile()
  const { mutate: signOut } = useSignOut()

  const { control, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { display_name: profileQuery.data?.display_name ?? '' },
  })

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (result.canceled || !result.assets[0]) return

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
      showAlert('Upload Failed', uploadError.message)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    updateProfile({ avatar_url: publicUrl })
  }

  const onSubmit = (data: ProfileForm) => {
    updateProfile(data, {
      onSuccess: () => showAlert('Saved', 'Profile updated'),
      onError: (e: any) => showAlert('Error', e.message),
    })
  }

  const handleSignOut = () => {
    signOut(undefined, {
      onError: (e: any) => showAlert('Sign Out Error', e.message),
    })
  }

  const settingsData: SettingsSection[] = [
    {
      title: 'ACCOUNT SETTINGS',
      items: [
        { id: '1', icon: User, label: 'Personal Information', onPress: () => { } },
        { id: '2', icon: Shield, label: 'Security', onPress: () => { } },
      ]
    },
    {
      title: 'NOTIFICATIONS',
      items: [
        { id: '3', icon: Bell, label: 'Push Notifications', onPress: () => { }, value: 'On' },
        { id: '4', icon: Bell, label: 'Email Notifications', onPress: () => { }, value: 'Off' },
      ]
    }
  ]

  const profile = profileQuery.data
  const isLoading = profileQuery.isLoading

  if (isLoading) return <ScreenContainer padded><View /></ScreenContainer>

  return (
    <ScreenContainer scrollable={false} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Profile</Text>
        <TouchableOpacity className="p-2 -mr-2">
          <Share size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerClassName="pb-32 px-4" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center mt-6 mb-8">
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} className="mb-4">
            <Avatar
              size="xl"
              uri={profile?.avatar_url}
              fallback={profile?.display_name || session?.user?.email}
              bordered
              showEdit="pencil"
            />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">{profile?.display_name || 'Anonymous'}</Text>
          <Text className="text-brand-primary text-base mt-1">{session?.user?.email}</Text>
        </View>

        {/* Stats Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 -mx-4 px-4">
          <StatCard label="TOTAL SPENT" value="$2,450.00" valueColor="text-status-error" />
          <StatCard label="SETTLED" value="$1,800.00" valueColor="text-status-success" />
          <StatCard label="GROUPS" value="12" valueColor="text-white" />
          <View className="w-4" /> {/* Right padding */}
        </ScrollView>

        {/* Edit Name Form */}
        <View className="mb-8">
          <Controller
            control={control}
            name="display_name"
            render={({ field: { onChange, value } }) => (
              <Input
                icon={User}
                label="Display Name"
                placeholder="How should friends see you?"
                value={value}
                onChangeText={onChange}
                error={errors.display_name?.message}
              />
            )}
          />
          <Button
            title={isSaving ? 'Saving...' : 'Update Name'}
            onPress={handleSubmit(onSubmit)}
            disabled={isSaving}
            size="sm"
            className="mt-4 self-end"
            fullWidth={false}
          />
        </View>

        {/* Settings Menu */}
        <SettingsMenu sections={settingsData} />

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          variant="danger"
          icon={LogOut}
          onPress={handleSignOut}
          className="mt-4 mb-8"
        />
      </ScrollView>
    </ScreenContainer>
  )
}
