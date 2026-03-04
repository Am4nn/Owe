import * as WebBrowser from 'expo-web-browser'
export const isNativePlatform = true
export const warmUpBrowser = () => WebBrowser.warmUpAsync()
export const coolDownBrowser = () => WebBrowser.coolDownAsync()
