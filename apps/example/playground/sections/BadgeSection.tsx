import React from 'react'
import { ScrollView } from 'react-native'
import { Badge, Flex, Box, Text, useColor } from 'radix-native'
import type { BadgeSize, BadgeVariant, AccentColor } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: BadgeVariant[] = ['solid', 'soft', 'surface', 'outline']
const SIZES: BadgeSize[] = [1, 2, 3]

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

function ThemeColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3}>
        <Flex direction="row" align="center" gap={2}>
          <Box width={72} flexShrink={0} />
          <Flex align="center" style={{ flex: 1 }}><ColHeader label="Accent" center /></Flex>
          <Flex align="center" style={{ flex: 1 }}><ColHeader label="Gray" center /></Flex>
        </Flex>

        {VARIANTS.map(variant => (
          <Flex key={variant} direction="row" align="center" gap={2}>
            <RowLbl label={capitalize(variant)} />
            <Flex direction="row" gap={2} align="center" style={{ flex: 1 }}>
              <Badge size={2} variant={variant}>New</Badge>
              <Badge size={2} variant={variant} highContrast>New</Badge>
            </Flex>
            <Flex direction="row" gap={2} align="center" style={{ flex: 1 }}>
              <Badge size={2} variant={variant} color="gray">New</Badge>
              <Badge size={2} variant={variant} color="gray" highContrast>New</Badge>
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
                <Badge size={2} variant={variant} color={color as AccentColor}>New</Badge>
                <Badge size={2} variant={variant} color={color as AccentColor} highContrast>New</Badge>
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
    <Flex gap={3}>
      <Flex direction="row" align="center" gap={2}>
        <Box width={72} flexShrink={0} />
        {VARIANTS.map(v => (
          <Flex key={v} minWidth={60} align="start">
            <ColHeader label={capitalize(v)} />
          </Flex>
        ))}
      </Flex>

      {SIZES.map(size => (
        <Flex key={size} direction="row" align="center" gap={2}>
          <RowLbl label={`Size ${size}`} />
          {VARIANTS.map(variant => (
            <Flex key={variant} minWidth={60} align="start">
              <Badge size={size} variant={variant}>New</Badge>
            </Flex>
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

export function BadgeSection() {
  return (
    <ComponentSection
      title="Badge"
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
