import React from 'react'
import { ScrollView } from 'react-native'
import { RadioCards, Flex, Box, Text, useResolveColor } from 'radix-native'
import type { RadioSize, RadioCardsVariant, AccentColor } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: RadioCardsVariant[] = ['surface', 'classic']
const SIZES: RadioSize[] = [1, 2, 3]

function ColHeader({ label, center }: { label: string; center?: boolean }) {
  const rc = useResolveColor()
  return (
    <Text
      size={1}
      weight="medium"
      style={{ color: rc('gray-9'), textAlign: center ? 'center' : undefined }}
    >
      {label}
    </Text>
  )
}

function RowLbl({ label }: { label: string }) {
  const rc = useResolveColor()
  return (
    <Box width={72} flexShrink={0}>
      <Text size={2} style={{ color: rc('gray-11') }}>
        {label}
      </Text>
    </Box>
  )
}

function CardContent({ icon, label, size = 2 }: { icon: string; label: string; size?: RadioSize }) {
  return (
    <Flex direction="row" gap={2} align="center">
      <Text size={size} style={{ opacity: 0.7 }}>
        {icon}
      </Text>
      <Text size={size} weight="medium">
        {label}
      </Text>
    </Flex>
  )
}

function Cards({
  variant,
  color,
  highContrast,
  size = 2,
}: {
  variant: RadioCardsVariant
  color?: AccentColor
  highContrast?: boolean
  size?: RadioSize
}) {
  return (
    <RadioCards.Root
      columns={2}
      variant={variant}
      color={color}
      highContrast={highContrast}
      size={size}
      defaultValue="1"
    >
      <RadioCards.Item value="1">
        <CardContent icon={'\u25B3'} label="Next.js" size={size} />
      </RadioCards.Item>
      <RadioCards.Item value="2">
        <CardContent icon={'\u2B21'} label="Remix" size={size} />
      </RadioCards.Item>
    </RadioCards.Root>
  )
}

function ThemeColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={4}>
        <Flex direction="row" align="center" gap={3}>
          <Box flexShrink={0} />
          <Box>
            <ColHeader label="Accent" center />
          </Box>
          <Box>
            <ColHeader label="Gray" center />
          </Box>
        </Flex>

        {VARIANTS.map((variant) => (
          <Flex key={variant} direction="row" align="start" gap={3}>
            <RowLbl label={capitalize(variant)} />
            <Flex gap={2}>
              <Cards variant={variant} />
              <Cards variant={variant} highContrast />
            </Flex>
            <Flex gap={2}>
              <Cards variant={variant} color="gray" />
              <Cards variant={variant} color="gray" highContrast />
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
        <Flex direction="row" align="center" gap={3}>
          <Box width={72} flexShrink={0} />
          {VARIANTS.map((v) => (
            <Box key={v}>
              <ColHeader label={capitalize(v)} center />
            </Box>
          ))}
        </Flex>

        {ALL_COLORS.map((color) => (
          <Flex key={color} direction="row" align="start" gap={3}>
            <RowLbl label={capitalize(color)} />
            {VARIANTS.map((variant) => (
              <Flex key={variant} direction="row" gap={2}>
                <Cards variant={variant} color={color as AccentColor} />
                <Cards variant={variant} color={color as AccentColor} highContrast />
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={4}>
        <Flex direction="row" align="center" gap={3}>
          <Box width={72} flexShrink={0} />
          {VARIANTS.map((v) => (
            <Box key={v}>
              <ColHeader label={capitalize(v)} />
            </Box>
          ))}
        </Flex>

        {SIZES.map((size) => (
          <Flex key={size} direction="row" align="start" gap={3}>
            <RowLbl label={`Size ${size}`} />
            {VARIANTS.map((variant) => (
              <Cards key={variant} variant={variant} size={size} />
            ))}
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

export function RadioCardsSection() {
  return (
    <ComponentSection
      title="Radio Cards"
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
