import React from 'react'
import { TextArea, Flex, Box, Text, useResolveColor } from 'radix-native'
import type { TextAreaSize, TextAreaVariant, AccentColor } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: TextAreaVariant[] = ['classic', 'surface', 'soft']
const SIZES: TextAreaSize[] = [1, 2, 3]

function RowLbl({ label }: { label: string }) {
  const rc = useResolveColor()
  return (
    <Box width={72} flexShrink={0}>
      <Text size={2} style={{ color: rc('gray-11') }}>{label}</Text>
    </Box>
  )
}

function ThemeColors() {
  return (
    <Flex gap={3}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={2}>
          <RowLbl label={capitalize(variant)} />
          <Flex gap={2}>
            <TextArea variant={variant} placeholder="Default" />
            <TextArea variant={variant} placeholder="Accent color" color="blue" />
            <TextArea variant={variant} placeholder="Gray color" color="gray" />
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}

function AllColors() {
  return (
    <Flex gap={3}>
      {ALL_COLORS.map(color => (
        <Flex key={color} gap={1}>
          <RowLbl label={capitalize(color)} />
          <TextArea variant="soft" color={color as AccentColor} placeholder={capitalize(color)} />
        </Flex>
      ))}
    </Flex>
  )
}

function AllSizes() {
  return (
    <Flex gap={5}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={3}>
          <Text size={1} weight="bold" style={{ textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.5 }}>
            {variant}
          </Text>
          {SIZES.map(size => (
            <TextArea key={size} size={size} variant={variant} placeholder={`Size ${size}`} />
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

export function TextAreaSection() {
  return (
    <ComponentSection
      title="Text Area"
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
