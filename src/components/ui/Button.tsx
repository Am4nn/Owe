import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native'

interface ButtonProps extends TouchableOpacityProps {
  title: string
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ title, variant = 'primary', className, ...props }: ButtonProps) {
  const variantClass = {
    primary: 'bg-brand-primary',
    secondary: 'bg-dark-surface border border-dark-border',
    danger: 'bg-brand-danger',
  }[variant]

  return (
    <TouchableOpacity
      className={`px-6 py-4 rounded-2xl items-center ${variantClass} ${className ?? ''}`}
      {...props}
    >
      <Text className="text-white font-semibold text-base">{title}</Text>
    </TouchableOpacity>
  )
}
