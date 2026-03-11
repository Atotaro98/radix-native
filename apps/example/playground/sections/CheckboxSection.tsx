import React from 'react'
import { ScrollView } from 'react-native'
import { Text, Checkbox, Flex, Box, useResolveColor } from 'radix-native'
import type { CheckboxSize, CheckboxVariant, AccentColor } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: CheckboxVariant[] = ['classic', 'surface', 'soft']
const SIZES: CheckboxSize[] = [1, 2, 3]

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
      <Text size={2} style={{ color: rc('gray-11') }}>
        {label}
      </Text>
    </Box>
  )
}

// ─── Theme colors tab ────────────────────────────────────────────────────────
// Radix: Accent (unchecked + checked), Accent HC (checked), Gray (unchecked + checked), Gray HC (checked), Disabled (unchecked + checked)

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
            {/* Accent: unchecked, checked, checked+HC */}
            <Flex direction="row" gap={3} align="center" style={{ flex: 1 }}>
              <Checkbox size={2} variant={variant} />
              <Checkbox size={2} variant={variant} defaultChecked />
              <Checkbox size={2} variant={variant} defaultChecked highContrast />
            </Flex>
            {/* Gray: unchecked, checked, checked+HC */}
            <Flex direction="row" gap={3} align="center" style={{ flex: 1 }}>
              <Checkbox size={2} variant={variant} color="gray" />
              <Checkbox size={2} variant={variant} color="gray" defaultChecked />
              <Checkbox size={2} variant={variant} color="gray" defaultChecked highContrast />
            </Flex>
            {/* Disabled: unchecked, checked */}
            <Flex direction="row" gap={3} align="center" style={{ flex: 1 }}>
              <Checkbox size={2} variant={variant} disabled />
              <Checkbox size={2} variant={variant} defaultChecked disabled />
            </Flex>
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

// ─── All colors tab ──────────────────────────────────────────────────────────
// Radix: per color row, per variant: unchecked + checked + checked HC

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
                <Checkbox size={2} variant={variant} color={color} />
                <Checkbox size={2} variant={variant} color={color} defaultChecked />
                <Checkbox size={2} variant={variant} color={color} defaultChecked highContrast />
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
    <Flex gap={3}>
      <Flex direction="row" align="center" gap={2}>
        <Box width={72} flexShrink={0} />
        {VARIANTS.map(v => (
          <Flex key={v} minWidth={40} align="start">
            <ColHeader label={capitalize(v)} />
          </Flex>
        ))}
      </Flex>

      {SIZES.map(size => (
        <Flex key={size} direction="row" align="center" gap={2}>
          <RowLbl label={`Size ${size}`} />
          {VARIANTS.map(variant => (
            <Flex key={variant} minWidth={40} align="start">
              <Checkbox size={size} variant={variant} defaultChecked />
            </Flex>
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

export function CheckboxSection() {
  return (
    <ComponentSection
      title="Checkbox"
      tabs={[
        { id: 'theme-colors', label: 'Theme colors', render: () => <ThemeColors /> },
        { id: 'all-colors',   label: 'All colors',   render: () => <AllColors /> },
        { id: 'all-sizes',    label: 'All sizes',     render: () => <AllSizes /> },
      ]}
    />
  )
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
