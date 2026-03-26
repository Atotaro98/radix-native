import React from 'react'
import { ScrollView } from 'react-native'
import { Text, IconButton, Flex, Box, useColor } from 'radix-native'
import type { IconButtonSize, IconButtonVariant, RadiusToken, AccentColor } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: IconButtonVariant[] = ['classic', 'solid', 'soft', 'surface', 'outline', 'ghost']
const SIZES: IconButtonSize[] = [1, 2, 3, 4]
const RADII: { label: string; value: RadiusToken }[] = [
  { label: 'No radius', value: 'none' },
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
  { label: 'Full', value: 'full' },
]

const ICON = '\u2726'

function ColHeader({ label, center }: { label: string; center?: boolean }) {
  const color = useColor('gray-9')
  return (
    <Text size={1} weight="medium" style={{ color, textAlign: center ? 'center' : undefined }}>
      {label}
    </Text>
  )
}

function RowLbl({ label }: { label: string }) {
  const color = useColor('gray-11')
  return (
    <Box width={72} flexShrink={0}>
      <Text size={2} style={{ color }}>{label}</Text>
    </Box>
  )
}

function Icon({ color }: { color?: string }) {
  return <Text maxFontSizeMultiplier={1} style={{ color, fontSize: 14 }}>{ICON}</Text>
}

function ThemeColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3}>
        <Flex direction="row" align="center" gap={2}>
          <Box width={72} flexShrink={0} />
          <Flex align="center" style={{ flex: 1 }}><ColHeader label="Accent" center /></Flex>
          <Flex align="center" style={{ flex: 1 }}><ColHeader label="Gray" center /></Flex>
          <Flex minWidth={60} align="start"><ColHeader label="Disabled" /></Flex>
          <Flex minWidth={60} align="start"><ColHeader label="Loading" /></Flex>
        </Flex>

        {VARIANTS.map(variant => (
          <Flex key={variant} direction="row" align="center" gap={2}>
            <RowLbl label={capitalize(variant)} />
            <Flex direction="row" gap={2} align="center" style={{ flex: 1 }}>
              <IconButton size={2} variant={variant}><Icon /></IconButton>
              <IconButton size={2} variant={variant} highContrast><Icon /></IconButton>
            </Flex>
            <Flex direction="row" gap={2} align="center" style={{ flex: 1 }}>
              <IconButton size={2} variant={variant} color="gray"><Icon /></IconButton>
              <IconButton size={2} variant={variant} color="gray" highContrast><Icon /></IconButton>
            </Flex>
            <Flex minWidth={60} align="start">
              <IconButton size={2} variant={variant} disabled><Icon /></IconButton>
            </Flex>
            <Flex minWidth={60} align="start">
              <IconButton size={2} variant={variant} loading><Icon /></IconButton>
            </Flex>
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
        <Flex direction="row" align="center" gap={2}>
          <Box width={72} flexShrink={0} />
          {VARIANTS.map(v => (
            <Flex key={v} align="center" style={{ flex: 1 }}>
              <ColHeader label={capitalize(v)} center />
            </Flex>
          ))}
        </Flex>

        {ALL_COLORS.map(color => (
          <Flex key={color} direction="row" align="center" gap={2}>
            <RowLbl label={capitalize(color)} />
            {VARIANTS.map(variant => (
              <Flex key={variant} direction="row" gap={2} align="center" style={{ flex: 1 }}>
                <IconButton size={2} variant={variant} color={color as AccentColor}><Icon /></IconButton>
                <IconButton size={2} variant={variant} color={color as AccentColor} highContrast><Icon /></IconButton>
              </Flex>
            ))}
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

function AllSizes() {
  return (
    <Flex gap={6}>
      {VARIANTS.map(variant => (
        <ScrollView key={variant} horizontal showsHorizontalScrollIndicator={false}>
          <Flex gap={3}>
            <Flex direction="row" align="center" gap={2}>
              <Box width={72} flexShrink={0}>
                <ColHeader label={capitalize(variant)} />
              </Box>
              {RADII.map(r => (
                <Flex key={r.value} minWidth={60} align="start">
                  <ColHeader label={r.label} />
                </Flex>
              ))}
            </Flex>

            {SIZES.map(size => (
              <Flex key={size} direction="row" align="center" gap={2}>
                <RowLbl label={`Size ${size}`} />
                {RADII.map(r => (
                  <Flex key={r.value} minWidth={60} align="start">
                    <IconButton size={size} variant={variant} radius={r.value}><Icon /></IconButton>
                  </Flex>
                ))}
              </Flex>
            ))}
          </Flex>
        </ScrollView>
      ))}
    </Flex>
  )
}

export function IconButtonSection() {
  return (
    <ComponentSection
      title="Icon Button"
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
