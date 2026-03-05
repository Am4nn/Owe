import { View, ScrollView, ViewProps } from 'react-native'
import { SafeAreaView, Edge } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

interface ScreenContainerProps extends ViewProps {
  scrollable?: boolean
  edges?: Edge[]
  padded?: boolean
  children: React.ReactNode
}

export function ScreenContainer({
  scrollable = false,
  edges = ['top', 'bottom', 'left', 'right'],
  padded = true,
  children,
  style,
  className,
  ...props
}: ScreenContainerProps) {
  const paddingClass = padded ? 'px-6' : ''
  const baseClass = `flex-1 bg-dark-bg ${className ?? ''}`

  const content = scrollable ? (
    <ScrollView
      contentContainerClassName={paddingClass}
      className="flex-1"
      showsVerticalScrollIndicator={false}
      {...props as any}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${paddingClass}`} {...props}>
      {children}
    </View>
  )

  return (
    <SafeAreaView edges={edges} className={baseClass} style={style}>
      <StatusBar style="light" />
      {content}
    </SafeAreaView>
  )
}
