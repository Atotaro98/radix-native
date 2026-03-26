import React from 'react'
import { ScrollView } from 'react-native'
import { TextField, Flex, Box, Text, useColor } from 'radix-native'
import type { TextFieldSize, TextFieldVariant, AccentColor } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: TextFieldVariant[] = ['classic', 'surface', 'soft']
const SIZES: TextFieldSize[] = [1, 2, 3]

function ColHeader({ label }: { label: string }) {
  const color = useColor('gray-11')
  return (
    <Text size={2} weight="medium" maxFontSizeMultiplier={1} style={{ color, textAlign: 'center' }}>
      {label}
    </Text>
  )
}

function RowLbl({ label }: { label: string }) {
  const color = useColor('gray-11')
  return (
    <Text size={2} maxFontSizeMultiplier={1} style={{ color }}>
      {label}
    </Text>
  )
}

function ThemeColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3}>
        {/* Column headers */}
        <Flex direction="row" align="center" gap={2}>
          <Box minWidth={72} flexShrink={0} />
          <Flex style={{ flex: 1 }} align="center"><ColHeader label="Accent" /></Flex>
          <Flex style={{ flex: 1 }} align="center"><ColHeader label="Gray" /></Flex>
          <Flex style={{ flex: 1 }} align="center"><ColHeader label="Disabled" /></Flex>
          <Flex style={{ flex: 1 }} align="center"><ColHeader label="Read-only" /></Flex>
        </Flex>

        {/* Rows */}
        {VARIANTS.map(variant => (
          <Flex key={variant} direction="row" align="center" gap={2}>
            <Box minWidth={72} flexShrink={0}>
              <RowLbl label={capitalize(variant)} />
            </Box>
            <Box style={{ flex: 1 }}>
              <TextField variant={variant} placeholder="Search" />
            </Box>
            <Box style={{ flex: 1 }}>
              <TextField variant={variant} placeholder="Search" color="gray" />
            </Box>
            <Box style={{ flex: 1 }}>
              <TextField variant={variant} disabled value="Quick brown fox" />
            </Box>
            <Box style={{ flex: 1 }}>
              <TextField variant={variant} editable={false} value="Quick brown fox" />
            </Box>
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

function AllColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3}>
        {ALL_COLORS.map(color => (
          <Flex key={color} direction="row" align="center" gap={2}>
            <Box minWidth={72} flexShrink={0}>
              <RowLbl label={capitalize(color)} />
            </Box>
            {VARIANTS.map(variant => (
              <Box key={variant} style={{ flex: 1 }}>
                <TextField variant={variant} color={color as AccentColor} placeholder="Search" />
              </Box>
            ))}
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

function AllSizes() {
  return (
    <Flex gap={5}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={3}>
          <Text size={1} weight="bold" maxFontSizeMultiplier={1} style={{ textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.5 }}>
            {variant}
          </Text>
          {SIZES.map(size => (
            <TextField key={size} size={size} variant={variant} placeholder={`Size ${size}`} />
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

export function TextFieldSection() {
  return (
    <ComponentSection
      title="Text Field"
      tabs={[
        { id: 'theme-colors', label: 'Theme colors', render: () => <ThemeColors /> },
        { id: 'all-colors', label: 'All colors', render: () => <AllColors /> },
        { id: 'all-sizes', label: 'All sizes', render: () => <AllSizes /> },
      ]}
    />
  )
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
