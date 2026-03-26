import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import { Radio, Flex, Box, Text, useColor } from 'radix-native'
import type { RadioSize, RadioVariant, AccentColor } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: RadioVariant[] = ['classic', 'surface', 'soft']
const SIZES: RadioSize[] = [1, 2, 3]

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

function RadioPair({ variant, size = 2, color, highContrast, disabled }: {
  variant: RadioVariant
  size?: RadioSize
  color?: AccentColor
  highContrast?: boolean
  disabled?: boolean
}) {
  const [checked, setChecked] = useState(true)
  return (
    <>
      <Radio
        size={size} variant={variant} color={color} highContrast={highContrast}
        disabled={disabled} checked={checked} onPress={() => setChecked(true)}
      />
      <Radio
        size={size} variant={variant} color={color} highContrast={highContrast}
        disabled={disabled} checked={!checked} onPress={() => setChecked(false)}
      />
    </>
  )
}

function ThemeColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3}>
        <Flex direction="row" align="center" gap={2}>
          <Box width={72} flexShrink={0} />
          <Flex align="center" style={{ flex: 1 }}><ColHeader label="Accent" center /></Flex>
          <Flex align="center" style={{ flex: 1 }}><ColHeader label="Gray" center /></Flex>
          <Flex align="center" style={{ flex: 1 }}><ColHeader label="Disabled" center /></Flex>
        </Flex>

        {VARIANTS.map(variant => (
          <Flex key={variant} direction="row" align="center" gap={2}>
            <RowLbl label={capitalize(variant)} />
            <Flex direction="row" gap={3} align="center" style={{ flex: 1 }}>
              <RadioPair variant={variant} />
              <RadioPair variant={variant} highContrast />
            </Flex>
            <Flex direction="row" gap={3} align="center" style={{ flex: 1 }}>
              <RadioPair variant={variant} color="gray" />
              <RadioPair variant={variant} color="gray" highContrast />
            </Flex>
            <Flex direction="row" gap={3} align="center" style={{ flex: 1 }}>
              <RadioPair variant={variant} disabled />
            </Flex>
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

function AllSizes() {
  return (
    <Flex gap={3}>
      {SIZES.map(size => (
        <Flex key={size} direction="row" align="center" gap={4}>
          <RowLbl label={`Size ${size}`} />
          <RadioPair variant="surface" size={size} />
        </Flex>
      ))}
    </Flex>
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
              <Flex key={variant} direction="row" gap={3} align="center" style={{ flex: 1 }}>
                <RadioPair variant={variant} color={color as AccentColor} />
                <RadioPair variant={variant} color={color as AccentColor} highContrast />
              </Flex>
            ))}
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

export function RadioSection() {
  return (
    <ComponentSection
      title="Radio"
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
