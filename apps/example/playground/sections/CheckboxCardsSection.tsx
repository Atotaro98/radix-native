import React from 'react'
import { Text, CheckboxCards, Flex, Grid, Box, useResolveColor } from 'radix-native'
import type { CheckboxSize, CheckboxCardsVariant } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: CheckboxCardsVariant[] = ['surface', 'classic']
const SIZES: CheckboxSize[] = [1, 2, 3]

// ─── Helper (matches Radix's ExampleCheckboxCards) ───────────────────────────

function ExampleCheckboxCards(props: React.ComponentPropsWithoutRef<typeof CheckboxCards.Root>) {
  return (
    <CheckboxCards.Root columns={2} defaultValue={['1']} {...props}>
      <CheckboxCards.Item value="1">
        <Text size={props.size ?? 2}>Next.js</Text>
      </CheckboxCards.Item>
      <CheckboxCards.Item value="2">
        <Text size={props.size ?? 2}>Remix</Text>
      </CheckboxCards.Item>
    </CheckboxCards.Root>
  )
}

function SectionLabel({ label }: { label: string }) {
  const rc = useResolveColor()
  return (
    <Text size={1} weight="medium" style={{ color: rc('gray-9'), marginBottom: 8 }}>
      {label}
    </Text>
  )
}

// ─── Theme colors ─────────────────────────────────────────────────────────────
// Variant groups, each with Accent + Gray, normal + highContrast

function ThemeColors() {
  return (
    <Flex gap={4}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={4}>
          <SectionLabel label={variant.charAt(0).toUpperCase() + variant.slice(1)} />
          <Grid columns={2} gap={3}>
            <ExampleCheckboxCards variant={variant} />
            <ExampleCheckboxCards variant={variant} highContrast />
          </Grid>
          <Grid columns={2} gap={3}>
            <ExampleCheckboxCards variant={variant} color="gray" />
            <ExampleCheckboxCards variant={variant} color="gray" highContrast />
          </Grid>
        </Flex>
      ))}
    </Flex>
  )
}

// ─── All colors ───────────────────────────────────────────────────────────────
// Each color: variant pairs (normal + highContrast)

function AllColors() {
  return (
    <Flex gap={4}>
      {ALL_COLORS.map(color => (
        <Flex key={color} gap={4}>
          <SectionLabel label={color.charAt(0).toUpperCase() + color.slice(1)} />
          {VARIANTS.map(variant => (
            <Grid key={variant} columns={2} gap={3}>
              <ExampleCheckboxCards color={color} variant={variant} />
              <ExampleCheckboxCards color={color} variant={variant} highContrast />
            </Grid>
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

// ─── All sizes ────────────────────────────────────────────────────────────────
// Each size: one example per variant

function AllSizes() {
  return (
    <Flex gap={4}>
      {SIZES.map(size => (
        <Flex key={size} gap={4}>
          <SectionLabel label={`Size ${size}`} />
          {VARIANTS.map(variant => (
            <Box key={variant}>
              <ExampleCheckboxCards variant={variant} size={size} />
            </Box>
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function CheckboxCardsSection() {
  return (
    <ComponentSection
      title="Checkbox Cards"
      tabs={[
        { id: 'theme-colors', label: 'Theme colors', render: () => <ThemeColors /> },
        { id: 'all-colors', label: 'All colors', render: () => <AllColors /> },
        { id: 'all-sizes', label: 'All sizes', render: () => <AllSizes /> },
      ]}
    />
  )
}
