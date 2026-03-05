import { Tabs } from 'expo-router'
import { View } from 'react-native'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ExpandableFAB } from '@/components/ui/ExpandableFAB'
import { Home, Clock, Users, User } from 'lucide-react-native'
import { theme } from '@/lib/theme'

export default function AppLayout() {
  return (
    <ErrorBoundary fallbackTitle="This screen encountered an error">
      <View className="flex-1">
        <Tabs
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.dark.bg, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
            headerTintColor: theme.colors.text.primary,
            headerTitleStyle: { fontWeight: '600' },
            tabBarStyle: {
              backgroundColor: theme.colors.dark.bg,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.05)',
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: theme.colors.brand.primary,
            tabBarInactiveTintColor: theme.colors.text.tertiary,
            tabBarLabelStyle: { fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold' }
          }}
        >
          {/* Main Tabs */}
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <Home color={color} size={24} />
            }}
          />
          <Tabs.Screen
            name="activity"
            options={{
              title: 'Activity',
              tabBarIcon: ({ color }) => <Clock color={color} size={24} />
            }}
          />
          {/* Center Space for FAB */}
          <Tabs.Screen
            name="_fake_fab_space"
            options={{
              title: '',
              tabBarIcon: () => null,
            }}
            listeners={{ tabPress: (e) => e.preventDefault() }}
          />
          <Tabs.Screen
            name="groups/index"
            options={{
              title: 'Groups',
              tabBarIcon: ({ color }) => <Users color={color} size={24} />
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <User color={color} size={24} />
            }}
          />

          {/* Hidden Modals & Nested Screens */}
          <Tabs.Screen name="invites" options={{ href: null, title: 'Invites' }} />
          <Tabs.Screen name="groups/new" options={{ href: null, title: 'New group' }} />
          <Tabs.Screen name="groups/[id]" options={{ href: null, headerShown: false }} />
          <Tabs.Screen name="expenses/new" options={{ href: null, title: 'Add expense' }} />
          <Tabs.Screen name="expenses/[id]/index" options={{ href: null, title: 'Expense' }} />
          <Tabs.Screen name="expenses/[id]/edit" options={{ href: null, title: 'Edit Expense' }} />
          <Tabs.Screen name="settlement/new" options={{ href: null, title: 'Record settlement' }} />
          <Tabs.Screen name="settlement/success" options={{ href: null, headerShown: false }} />
          <Tabs.Screen name="friends/index" options={{ href: null, headerShown: false }} />
          <Tabs.Screen name="friends/[id]" options={{ href: null, headerShown: false }} />
        </Tabs>

        <View className="absolute bottom-[20px] self-center pointer-events-box-none z-50">
          <ExpandableFAB />
        </View>
      </View>
    </ErrorBoundary>
  )
}
