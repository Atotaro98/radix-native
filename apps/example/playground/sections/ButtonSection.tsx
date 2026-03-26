import React from 'react'
import { ScrollView } from 'react-native'
import { Text, Button, Flex, Box, useColor } from 'radix-native'
import type { ButtonSize, ButtonVariant, RadiusToken, AccentColor } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: ButtonVariant[] = ['classic', 'solid', 'soft', 'surface', 'outline', 'ghost']
const SIZES: ButtonSize[] = [1, 2, 3, 4]
const RADII: { label: string; value: RadiusToken }[] = [
  { label: 'No radius', value: 'none' },
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
  { label: 'Full', value: 'full' },
]

const LABEL = 'Next \u2192'

function ColHeader({ label, center }: { label: string; center?: boolean }) {
  const color = useColor('gray-9')
  return (
    <Text
      size={1}
      weight="medium"
      style={{ color, textAlign: center ? 'center' : undefined }}
    >
      {label}
    </Text>
  )
}

function RowLbl({ label }: { label: string }) {
  const color = useColor('gray-11')
  return (
    <Box width={72} flexShrink={0}>
      <Text size={2} style={{ color }}>
        {label}
      </Text>
    </Box>
  )
}

// ─── Theme colors tab ────────────────────────────────────────────────────────
// Columns: Accent (×2 centered), Gray (×2 centered), Disabled, Loading

function ThemeColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3}>
        <Flex direction="row" align="center" gap={2}>
          <Box width={72} flexShrink={0} />
          <Flex align="center" style={{ flex: 1 }}>
            <ColHeader label="Accent" center />
          </Flex>
          <Flex align="center" style={{ flex: 1 }}>
            <ColHeader label="Gray" center />
          </Flex>
          <Flex minWidth={100} align="start">
            <ColHeader label="Disabled" />
          </Flex>
          <Flex minWidth={100} align="start">
            <ColHeader label="Loading" />
          </Flex>
        </Flex>

        {VARIANTS.map((variant) => (
          <Flex key={variant} direction="row" align="center" gap={2}>
            <RowLbl label={capitalize(variant)} />
            <Flex direction="row" gap={2} align="center" style={{ flex: 1 }}>
              <Button size={2} variant={variant}>
                {LABEL}
              </Button>
              <Button size={2} variant={variant} highContrast>
                {LABEL}
              </Button>
            </Flex>
            <Flex direction="row" gap={2} align="center" style={{ flex: 1 }}>
              <Button size={2} variant={variant} color="gray">
                {LABEL}
              </Button>
              <Button size={2} variant={variant} color="gray" highContrast>
                {LABEL}
              </Button>
            </Flex>
            <Flex minWidth={100} align="start">
              <Button size={2} variant={variant} disabled>
                {LABEL}
              </Button>
            </Flex>
            <Flex minWidth={100} align="start">
              <Button size={2} variant={variant} loading>
                {LABEL}
              </Button>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

// ─── All colors tab ──────────────────────────────────────────────────────────

function AllColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3}>
        <Flex direction="row" align="center" gap={2}>
          <Box width={72} flexShrink={0} />
          {VARIANTS.map((v) => (
            <Flex key={v} align="center" style={{ flex: 1 }}>
              <ColHeader label={capitalize(v)} center />
            </Flex>
          ))}
        </Flex>

        {ALL_COLORS.map((color) => (
          <Flex key={color} direction="row" align="center" gap={2}>
            <RowLbl label={capitalize(color)} />
            {VARIANTS.map((variant) => (
              <Flex key={variant} direction="row" gap={2} align="center" style={{ flex: 1 }}>
                <Button size={2} variant={variant} color={color as AccentColor}>
                  {LABEL}
                </Button>
                <Button size={2} variant={variant} color={color as AccentColor} highContrast>
                  {LABEL}
                </Button>
              </Flex>
            ))}
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

// ─── All sizes tab ───────────────────────────────────────────────────────────

function AllSizes() {
  return (
    <Flex gap={6}>
      {VARIANTS.map((variant) => (
        <ScrollView key={variant} horizontal showsHorizontalScrollIndicator={false}>
          <Flex gap={3}>
            <Flex direction="row" align="center" gap={2}>
              <Box width={72} flexShrink={0}>
                <ColHeader label={capitalize(variant)} />
              </Box>
              {RADII.map((r) => (
                <Flex key={r.value} minWidth={100} align="start">
                  <ColHeader label={r.label} />
                </Flex>
              ))}
            </Flex>

            {SIZES.map((size) => (
              <Flex key={size} direction="row" align="center" gap={2}>
                <RowLbl label={`Size ${size}`} />
                {RADII.map((r) => (
                  <Flex key={r.value} minWidth={100} align="start">
                    <Button size={size} variant={variant} radius={r.value}>
                      {LABEL}
                    </Button>
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

export function ButtonSection() {
  return (
    <ComponentSection
      title="Button"
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
