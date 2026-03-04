import React, { Component, ErrorInfo, ReactNode } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

interface Props { children: ReactNode; fallbackTitle?: string }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-dark-bg items-center justify-center px-6">
          <Text className="text-white text-xl font-bold mb-2">
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </Text>
          <Text className="text-white/50 text-sm text-center mb-6">
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity onPress={this.handleReset} className="bg-brand-primary px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Try again</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return this.props.children
  }
}
