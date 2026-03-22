import React from 'react'
import { ScrollView } from 'react-native'
import { Switch, Flex, Box, Text, useResolveColor } from 'radix-native'
import type { SwitchSize, SwitchVariant, AccentColor } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: SwitchVariant[] = ['classic', 'surface', 'soft']
const SIZES: SwitchSize[] = [1, 2, 3]

function ColHeader({ label, center }: { label: string; center?: boolean }) {
  const rc = useResolveColor()
  return (
    <Text size={1} weight="medium" style={{ color: rc('gray-9'), textAlign: center ? 'center' : undefined }}>
      {label}
    </Text>
  )
}

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
              <Switch size={2} variant={variant} />
              <Switch size={2} variant={variant} defaultChecked />
              <Switch size={2} variant={variant} defaultChecked highContrast />
            </Flex>
            <Flex direction="row" gap={3} align="center" style={{ flex: 1 }}>
              <Switch size={2} variant={variant} color="gray" />
              <Switch size={2} variant={variant} color="gray" defaultChecked />
              <Switch size={2} variant={variant} color="gray" defaultChecked highContrast />
            </Flex>
            <Flex direction="row" gap={3} align="center" style={{ flex: 1 }}>
              <Switch size={2} variant={variant} disabled />
              <Switch size={2} variant={variant} defaultChecked disabled />
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
              <Flex key={variant} direction="row" gap={3} align="center" style={{ flex: 1 }}>
                <Switch size={2} variant={variant} color={color as AccentColor} />
                <Switch size={2} variant={variant} color={color as AccentColor} defaultChecked />
                <Switch size={2} variant={variant} color={color as AccentColor} defaultChecked highContrast />
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
              <Switch size={size} variant={variant} defaultChecked />
            </Flex>
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

export function SwitchSection() {
  return (
    <ComponentSection
      title="Switch"
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
