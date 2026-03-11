import type { ThemeFonts } from 'radix-native'

export const FONT_PRESETS: { label: string; fonts: ThemeFonts }[] = [
  {
    label: 'System (default)',
    fonts: {},
  },
  {
    label: 'Open Sans',
    fonts: {
      light: 'OpenSans_300Light',
      regular: 'OpenSans_400Regular',
      medium: 'OpenSans_500Medium',
      bold: 'OpenSans_700Bold',
      heading: 'OpenSans_700Bold',
    },
  },
  {
    label: 'Lato',
    fonts: {
      light: 'Lato_300Light',
      regular: 'Lato_400Regular',
      medium: 'Lato_400Regular',
      bold: 'Lato_700Bold',
      heading: 'Lato_700Bold',
    },
  },
  {
    label: 'Playfair Display',
    fonts: {
      light: 'PlayfairDisplay_400Regular',
      regular: 'PlayfairDisplay_400Regular',
      medium: 'PlayfairDisplay_500Medium',
      bold: 'PlayfairDisplay_700Bold',
      heading: 'PlayfairDisplay_700Bold',
    },
  },
]
