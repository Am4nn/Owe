import { Image, ImageProps, ImageStyle, StyleProp } from 'react-native'

type OweLogoProps = Omit<ImageProps, 'source'> & {
  size?: number
  style?: StyleProp<ImageStyle>
}

function OweLogo({ size = 60, style, ...props }: OweLogoProps) {
  return (
    <Image
      source={require('@/assets/images/logo/owe.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      {...props}
    />
  )
}

export default OweLogo
