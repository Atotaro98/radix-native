import React from 'react'
import { ScrollView, Pressable } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Box, Flex, Text, useThemeContext, useResolveColor, ThemeControls } from 'radix-native'
import { FONT_PRESETS } from './fonts'
import { BlockquoteSection } from './playground/sections/BlockquoteSection'
import { ButtonSection } from './playground/sections/ButtonSection'
import { CheckboxSection } from './playground/sections/CheckboxSection'
import { CheckboxGroupSection } from './playground/sections/CheckboxGroupSection'
import { CheckboxCardsSection } from './playground/sections/CheckboxCardsSection'
import { CodeSection } from './playground/sections/CodeSection'
import { EmSection } from './playground/sections/EmSection'
import { GridSection } from './playground/sections/GridSection'
import { HeadingSection } from './playground/sections/HeadingSection'
import { KbdSection } from './playground/sections/KbdSection'
import { LinkSection } from './playground/sections/LinkSection'
import { QuoteSection } from './playground/sections/QuoteSection'
import { StrongSection } from './playground/sections/StrongSection'
import { TextSection } from './playground/sections/TextSection'

interface PlaygroundProps {
  fontIndex: number
  onFontChange: (index: number) => void
}

export function Playground({ fontIndex, onFontChange }: PlaygroundProps) {
  const { appearance } = useThemeContext()
  const rc = useResolveColor()

  return (
    <Box style={{ flex: 1 }}>
      <StatusBar style={appearance === 'dark' ? 'light' : 'dark'} />
      <ScrollView style={{ backgroundColor: rc('gray-1') }} contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 60 }}>
        {/* Font selector */}
        <Flex mb={6} gap={2}>
          <Text
            size={1}
            weight="bold"
            style={{ color: rc('gray-9'), textTransform: 'uppercase', letterSpacing: 0.6 }}
          >
            Font
          </Text>
          <Flex direction="row" wrap="wrap" gap={2}>
            {FONT_PRESETS.map((preset, i) => {
              const active = i === fontIndex
              return (
                <Pressable
                  key={preset.label}
                  onPress={() => onFontChange(i)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: active ? rc('accent-9') : rc('gray-a3'),
                    borderRadius: 6,
                  }}
                >
                  <Text
                    size={1}
                    weight={active ? 'bold' : 'regular'}
                    style={{ color: active ? rc('accent-contrast') : rc('gray-11') }}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              )
            })}
          </Flex>
        </Flex>

        {/* Alphabetical order matching Radix playground */}
        <BlockquoteSection />
        <ButtonSection />
        <CheckboxSection />
        <CheckboxGroupSection />
        <CheckboxCardsSection />
        <CodeSection />
        <EmSection />
        <GridSection />
        <HeadingSection />
        <KbdSection />
        <LinkSection />
        <QuoteSection />
        <StrongSection />
        <TextSection />
      </ScrollView>
      <ThemeControls />
    </Box>
  )
}
