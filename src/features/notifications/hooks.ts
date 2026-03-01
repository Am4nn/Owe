// Notification hooks for Phase 03-01 — push token lifecycle and smart reminders
// NOTF-01, NOTF-02 (push-notify), NOTF-03 (reminder_config)

import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import type { ReminderConfig, UpsertReminderConfigInput } from './types'

// ---------------------------------------------------------------------------
// Foreground notification handler — show alerts/sounds while app is active
// Set at module-top so it is registered before any component mounts
// Skip on web — expo-notifications is native-only
// ---------------------------------------------------------------------------
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })
}

// ---------------------------------------------------------------------------
// registerPushToken — called once on authenticated app launch
// Requests permission, obtains the Expo push token, and upserts it on the
// authenticated user's profile row. Registers a listener for mid-session
// token rotation (rare, but possible after reinstall on same device).
// ---------------------------------------------------------------------------
export async function registerPushToken(): Promise<void> {
  // Web does not support expo-notifications
  if (Platform.OS === 'web') return
  // Physical device required — simulators cannot obtain push tokens
  if (!Device.isDevice) return

  // Android: notification channel must exist before requesting the token
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default notifications',
      importance: Notifications.AndroidImportance.MAX,
    })
  }

  // Request push permission — never block the app if denied
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return

  // Obtain the Expo push token using the EAS project ID from app.json
  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  let token: string
  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
  } catch {
    // Token fetch can fail in development without a valid projectId — skip silently
    return
  }

  // Upsert token onto the authenticated user's profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .update({ push_token: token })
    .eq('id', user.id)

  // Listen for mid-session token rotation and upsert the new token immediately
  Notifications.addPushTokenListener(async (newToken) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return
    await supabase
      .from('profiles')
      .update({ push_token: newToken.data })
      .eq('id', currentUser.id)
  })
}

// ---------------------------------------------------------------------------
// useNotificationDeepLink — handles deep-link navigation on notification tap
// Call unconditionally in root layout — works for foreground and cold-start taps.
// ---------------------------------------------------------------------------
export function useNotificationDeepLink(): void {
  const router = useRouter()

  useEffect(() => {
    // Web does not support expo-notifications
    if (Platform.OS === 'web') return

    // Handle cold-start: app was not running when the notification was tapped
    Notifications.getLastNotificationResponseAsync().then((response) => {
      const url = response?.notification?.request?.content?.data?.url
      if (url && typeof url === 'string') {
        router.push(url as never)
      }
    })

    // Handle foreground/background tap: app was already running
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url
      if (url && typeof url === 'string') {
        router.push(url as never)
      }
    })

    return () => subscription.remove()
  }, [router])
}

// ---------------------------------------------------------------------------
// useReminderConfig — React Query hook for per-group reminder settings
// Exposes the current config and an upsert mutation (INSERT ... ON CONFLICT).
// ---------------------------------------------------------------------------
export function useReminderConfig(groupId: string) {
  const qc = useQueryClient()

  const query = useQuery<ReminderConfig | null>({
    queryKey: ['reminder_config', groupId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('reminder_config')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (error) throw error
      return data as ReminderConfig | null
    },
    staleTime: 60_000,
  })

  const mutation = useMutation({
    mutationFn: async (input: UpsertReminderConfigInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('reminder_config')
        .upsert(
          {
            user_id: user.id,
            group_id: input.group_id,
            enabled: input.enabled,
            delay_days: input.delay_days,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,group_id' }
        )
        .select()
        .single()
      if (error) throw error
      return data as ReminderConfig
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminder_config', groupId] })
    },
  })

  return {
    reminderConfig: query.data ?? null,
    isLoadingConfig: query.isLoading,
    upsertReminderConfig: mutation.mutate,
    isUpsertingConfig: mutation.isPending,
  }
}
