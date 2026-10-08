import { Platform } from 'react-native'

/** System monospace family used by Code / Kbd when `fonts.code` is not set. */
export const SYSTEM_MONOSPACE: string | undefined = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
})
