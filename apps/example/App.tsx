import React, { useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useFonts } from 'expo-font'
import {
  OpenSans_300Light,
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans'
import { Lato_300Light, Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato'
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display'
import { Theme } from 'radix-native'
import { Playground } from './Playground'
import { FONT_PRESETS } from './fonts'

export default function App() {
  const [fontIndex, setFontIndex] = useState(0)

  const [fontsLoaded] = useFonts({
    OpenSans_300Light,
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_700Bold,
    Lato_300Light,
    Lato_400Regular,
    Lato_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_700Bold,
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Theme
      accentColor="indigo"
      appearance="inherit"
      fonts={FONT_PRESETS[fontIndex].fonts}
      maxFontSizeMultiplier={2}
    >
      <Playground fontIndex={fontIndex} onFontChange={setFontIndex} />
    </Theme>
  )
}
