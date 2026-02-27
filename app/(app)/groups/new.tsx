import { View, Text, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Stack, router } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCreateGroup } from '@/features/groups/hooks'

const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100),
  base_currency: z.string().length(3, 'Use a 3-letter currency code').default('USD'),
})
type CreateGroupForm = z.infer<typeof createGroupSchema>

export default function NewGroupScreen() {
  const { mutate: createGroup, isPending } = useCreateGroup()
  const [namedMembers, setNamedMembers] = useState<string[]>([])
  const [newMemberName, setNewMemberName] = useState('')
  const { control, handleSubmit, formState: { errors } } = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { base_currency: 'USD' },
  })

  const addNamedMember = () => {
    const name = newMemberName.trim()
    if (name.length < 2) return
    setNamedMembers(prev => [...prev, name])
    setNewMemberName('')
  }

  const onSubmit = (data: CreateGroupForm) => {
    createGroup(
      { ...data, named_members: namedMembers },
      {
        onSuccess: (group) => {
          router.replace(`/(app)/groups/${group.id}`)
        },
        onError: (e) => Alert.alert('Error', e.message),
      }
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-dark-bg"
      contentContainerClassName="px-6 py-6"
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'New Group' }} />

      <View className="gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Group name"
              placeholder="Weekend trip, House expenses..."
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="base_currency"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Base currency"
              placeholder="USD"
              autoCapitalize="characters"
              maxLength={3}
              value={value}
              onChangeText={onChange}
              error={errors.base_currency?.message}
            />
          )}
        />

        {/* GRUP-03: Add named-only (non-app) members */}
        <View>
          <Text className="text-white/70 text-sm font-medium mb-2">
            Add friends who don't use the app (optional)
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              className="flex-1 bg-dark-surface border border-dark-border rounded-xl px-4 py-3.5 text-white"
              placeholder="Their name"
              placeholderTextColor="#ffffff40"
              value={newMemberName}
              onChangeText={setNewMemberName}
              onSubmitEditing={addNamedMember}
            />
            <TouchableOpacity
              onPress={addNamedMember}
              className="bg-dark-surface border border-dark-border rounded-xl px-4 items-center justify-center"
            >
              <Text className="text-brand-accent font-semibold">Add</Text>
            </TouchableOpacity>
          </View>

          {namedMembers.map((name, idx) => (
            <View key={idx} className="flex-row items-center justify-between mt-2 bg-dark-surface rounded-xl px-4 py-3">
              <Text className="text-white">{name}</Text>
              <TouchableOpacity onPress={() => setNamedMembers(prev => prev.filter((_, i) => i !== idx))}>
                <Text className="text-brand-danger text-sm">Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <Button
        title={isPending ? 'Creating...' : 'Create group'}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
        className="mt-8"
      />
    </ScrollView>
  )
}
