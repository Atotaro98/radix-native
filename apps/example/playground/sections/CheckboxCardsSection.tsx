import React from 'react'
import { Text, CheckboxCards, Flex, Box, useColor } from 'radix-native'
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
  const color = useColor('gray-9')
  return (
    <Text size={1} weight="medium" style={{ color, marginBottom: 8 }}>
      {label}
    </Text>
  )
}

// ─── Theme colors ─────────────────────────────────────────────────────────────
// Variant groups, each with Accent + Gray, normal + highContrast.
// Radix's sink lays these groups side by side at 400px each; a phone is
// ~400pt wide in total, so they stack here instead (side by side, each card
// would be ~80pt and the label would wrap per character).

function ThemeColors() {
  return (
    <Flex gap={4}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={4}>
          <SectionLabel label={variant.charAt(0).toUpperCase() + variant.slice(1)} />
          <ExampleCheckboxCards variant={variant} />
          <ExampleCheckboxCards variant={variant} highContrast />
          <ExampleCheckboxCards variant={variant} color="gray" />
          <ExampleCheckboxCards variant={variant} color="gray" highContrast />
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
            <React.Fragment key={variant}>
              <ExampleCheckboxCards color={color} variant={variant} />
              <ExampleCheckboxCards color={color} variant={variant} highContrast />
            </React.Fragment>
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
