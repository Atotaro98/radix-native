import React from 'react'
import { ScrollView } from 'react-native'
import { Progress, Flex, Box, Text, useResolveColor } from 'radix-native'
import type { ProgressSize, ProgressVariant, AccentColor } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: ProgressVariant[] = ['classic', 'surface', 'soft']
const SIZES: ProgressSize[] = [1, 2, 3]
const VARIANT_VALUE: Record<ProgressVariant, number> = { classic: 33, surface: 50, soft: 67 }

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
      <Flex gap={4} style={{ minWidth: 500 }}>
        <Flex direction="row" align="center" gap={2}>
          <Box width={72} flexShrink={0} />
          <Flex align="center" style={{ flex: 1 }}><ColHeader label="Accent" center /></Flex>
          <Flex align="center" style={{ flex: 1 }}><ColHeader label="Gray" center /></Flex>
        </Flex>

        {VARIANTS.map(variant => {
          const val = VARIANT_VALUE[variant]
          return (
            <Flex key={variant} direction="row" align="center" gap={2}>
              <RowLbl label={capitalize(variant)} />
              <Flex direction="row" gap={3} align="center" style={{ flex: 1 }}>
                <Flex style={{ flex: 1 }}><Progress size={2} variant={variant} value={val} /></Flex>
                <Flex style={{ flex: 1 }}><Progress size={2} variant={variant} value={val} highContrast /></Flex>
              </Flex>
              <Flex direction="row" gap={3} align="center" style={{ flex: 1 }}>
                <Flex style={{ flex: 1 }}><Progress size={2} variant={variant} value={val} color="gray" /></Flex>
                <Flex style={{ flex: 1 }}><Progress size={2} variant={variant} value={val} color="gray" highContrast /></Flex>
              </Flex>
            </Flex>
          )
        })}
      </Flex>
    </ScrollView>
  )
}

function AllColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3} style={{ minWidth: 500 }}>
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
                <Flex style={{ flex: 1 }}><Progress size={2} variant={variant} value={50} color={color as AccentColor} /></Flex>
                <Flex style={{ flex: 1 }}><Progress size={2} variant={variant} value={50} color={color as AccentColor} highContrast /></Flex>
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
    <Flex gap={5}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={3}>
          <Text size={1} weight="bold" style={{ textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.5 }}>
            {variant}
          </Text>
          {SIZES.map(size => (
            <Flex key={size} gap={1}>
              <Text size={1} style={{ opacity: 0.5 }}>Size {size}</Text>
              <Progress size={size} variant={variant} value={50} />
            </Flex>
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

export function ProgressSection() {
  return (
    <ComponentSection
      title="Progress"
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
