import React from 'react'
import { ScrollView } from 'react-native'
import { Text, Code, Flex, Box, useColor } from 'radix-native'
import type { FontSizeToken, CodeVariant, TextWeight } from 'radix-native'
import { ComponentSection, LabeledRow } from '../ui'
import { ALL_COLORS } from '../constants'

const SIZES: FontSizeToken[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const VARIANTS: CodeVariant[] = ['solid', 'soft', 'outline', 'ghost']
const WEIGHTS: TextWeight[] = ['regular', 'bold']
const CODE_TEXT = 'console.log()'

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
      <Text size={2} style={{ color }}>
        {label}
      </Text>
    </Box>
  )
}

// ─── Theme colors (variant rows × Accent/HC + Gray/HC) ──────────────────────

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
            <RowLbl label={variant.charAt(0).toUpperCase() + variant.slice(1)} />
            <Flex direction="row" gap={2} align="center" style={{ flex: 1 }}>
              <Code variant={variant}>{CODE_TEXT}</Code>
              <Code variant={variant} highContrast>{CODE_TEXT}</Code>
            </Flex>
            <Flex direction="row" gap={2} align="center" style={{ flex: 1 }}>
              <Code variant={variant} color="gray">{CODE_TEXT}</Code>
              <Code variant={variant} color="gray" highContrast>{CODE_TEXT}</Code>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

// ─── All colors (per color, per variant: normal + HC) ────────────────────────

function AllColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3}>
        <Flex direction="row" align="center" gap={2}>
          <Box width={72} flexShrink={0} />
          {VARIANTS.map(v => (
            <Flex key={v} align="center" style={{ flex: 1 }}>
              <ColHeader label={v.charAt(0).toUpperCase() + v.slice(1)} center />
            </Flex>
          ))}
        </Flex>

        {ALL_COLORS.map(color => (
          <Flex key={color} direction="row" align="center" gap={2}>
            <RowLbl label={color.charAt(0).toUpperCase() + color.slice(1)} />
            {VARIANTS.map(variant => (
              <Flex key={variant} direction="row" gap={2} align="center" style={{ flex: 1 }}>
                <Code variant={variant} color={color}>{CODE_TEXT}</Code>
                <Code variant={variant} color={color} highContrast>{CODE_TEXT}</Code>
              </Flex>
            ))}
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

// ─── All sizes ───────────────────────────────────────────────────────────────

function AllSizes() {
  return (
    <Flex gapY={3}>
      {SIZES.map(size => (
        <LabeledRow key={size} label={`Size ${size}`} labelWidth={48}>
          <Code size={size}>{CODE_TEXT}</Code>
        </LabeledRow>
      ))}
    </Flex>
  )
}

// ─── All weights ─────────────────────────────────────────────────────────────

function AllWeights() {
  return (
    <Flex gapY={3}>
      {WEIGHTS.map(weight => (
        <LabeledRow key={weight} label={weight.charAt(0).toUpperCase() + weight.slice(1)}>
          <Code weight={weight}>{CODE_TEXT}</Code>
        </LabeledRow>
      ))}
    </Flex>
  )
}

export function CodeSection() {
  return (
    <ComponentSection
      title="Code"
      tabs={[
        { id: 'theme-colors', label: 'Theme colors', render: () => <ThemeColors /> },
        { id: 'all-colors',   label: 'All colors',   render: () => <AllColors /> },
        { id: 'all-sizes',    label: 'All sizes',     render: () => <AllSizes /> },
        { id: 'all-weights',  label: 'All weights',   render: () => <AllWeights /> },
      ]}
    />
  )
}
