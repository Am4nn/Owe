import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Home, Clock, Users, User } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/lib/theme'

/**
 * BottomNavigation
 *
 * Presentational tab bar that matches the Stitch design.
 * The live app uses Expo Router Tabs (app/(app)/_layout.tsx),
 * but this component is available for isolated screens, storybook,
 * and custom navigation contexts.
 *
 * Tab order (matches Stitch HTML designs):
 *   Home | Activity | [FAB space] | Groups | Profile
 */
export type TabName = 'home' | 'activity' | 'groups' | 'profile'

export type BottomNavigationProps = {
  activeTab: TabName
  onTabPress?: (tab: TabName) => void
}

type TabConfig = {
  key: TabName
  label: string
  Icon: React.ComponentType<{ size: number; color: string }>
}

const TABS: TabConfig[] = [
  { key: 'home',     label: 'Home',    Icon: Home },
  { key: 'activity', label: 'Activity', Icon: Clock },
  { key: 'groups',   label: 'Groups',  Icon: Users },
  { key: 'profile',  label: 'Profile', Icon: User },
]

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        backgroundColor: theme.colors.dark.bg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.glass.divider,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingHorizontal: 8,
      }}
    >
      {/* First two tabs */}
      {TABS.slice(0, 2).map((tab) => (
        <TabButton
          key={tab.key}
          tab={tab}
          isActive={activeTab === tab.key}
          onPress={() => onTabPress?.(tab.key)}
        />
      ))}

      {/* Centre FAB placeholder (the real FAB is absolute-positioned above) */}
      <View style={{ width: 56, height: 40 }} />

      {/* Last two tabs */}
      {TABS.slice(2).map((tab) => (
        <TabButton
          key={tab.key}
          tab={tab}
          isActive={activeTab === tab.key}
          onPress={() => onTabPress?.(tab.key)}
        />
      ))}
    </View>
  )
}

function TabButton({
  tab,
  isActive,
  onPress,
}: {
  tab: TabConfig
  isActive: boolean
  onPress: () => void
}) {
  const color = isActive ? theme.colors.brand.primary : theme.colors.text.tertiary

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ alignItems: 'center', gap: 2, flex: 1, paddingVertical: 4 }}
      hitSlop={{ top: 4, bottom: 4 }}
    >
      <tab.Icon size={24} color={color} />
      <Text
        style={{
          fontSize: theme.typography.tiny,
          fontWeight: isActive ? '700' : '500',
          color,
          textTransform: 'uppercase',
          letterSpacing: 0.3,
        }}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  )
}
