import React from 'react'
import { Text, Blockquote, Flex, useResolveColor } from 'radix-native'
import type { FontSizeToken, TextWeight } from 'radix-native'
import { ComponentSection, LabeledRow, RowLabel } from '../ui'
import { ALL_COLORS } from '../constants'

const SIZES: FontSizeToken[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const WEIGHTS: TextWeight[] = ['light', 'regular', 'medium', 'bold']
const BQ_TEXT = 'Perfect typography is certainly the most elusive of all arts.\nSculpture in stone alone comes near it in obstinacy.'
const BQ_TEXT_SHORT = 'Perfect typography is certainly\nthe most elusive of all arts.'

// ─── Theme colors (Radix: Accent/Gray grid at sizes 4, 3, 2) ────────────────

function ThemeColors() {
  return (
    <Flex direction="row" gapX={4}>
      <Flex gapY={4} style={{ flex: 1 }}>
        <RowLabel label="Accent" />
        <Blockquote size={4}>{BQ_TEXT}</Blockquote>
        <Blockquote size={3}>{BQ_TEXT}</Blockquote>
        <Blockquote size={2}>{BQ_TEXT}</Blockquote>
      </Flex>
      <Flex gapY={4} style={{ flex: 1 }}>
        <RowLabel label="Gray" />
        <Blockquote size={4} color="gray">{BQ_TEXT}</Blockquote>
        <Blockquote size={3} color="gray">{BQ_TEXT}</Blockquote>
        <Blockquote size={2} color="gray">{BQ_TEXT}</Blockquote>
      </Flex>
    </Flex>
  )
}

// ─── All colors (normal + highContrast per color) ────────────────────────────

function AllColors() {
  const rc = useResolveColor()
  return (
    <Flex gapY={3}>
      {ALL_COLORS.map(color => (
        <Flex key={color} direction="row" align="start" gapX={3}>
          <Text size={1} style={{ width: 56, flexShrink: 0, color: rc('gray-9') }}>
            {color.charAt(0).toUpperCase() + color.slice(1)}
          </Text>
          <Flex gap={1} style={{ flex: 1 }}>
            <Blockquote size={3} color={color}>{BQ_TEXT}</Blockquote>
            <Blockquote size={3} color={color} highContrast>{BQ_TEXT}</Blockquote>
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}

// ─── All sizes ───────────────────────────────────────────────────────────────

function AllSizes() {
  return (
    <Flex gapY={3}>
      {SIZES.map(size => (
        <LabeledRow key={size} label={`Size ${size}`} labelWidth={48}>
          <Blockquote size={size}>{BQ_TEXT_SHORT}</Blockquote>
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
          <Blockquote size={3} weight={weight}>{BQ_TEXT}</Blockquote>
        </LabeledRow>
      ))}
    </Flex>
  )
}

export function BlockquoteSection() {
  return (
    <ComponentSection
      title="Blockquote"
      tabs={[
        { id: 'theme-colors', label: 'Theme colors', render: () => <ThemeColors /> },
        { id: 'all-colors',   label: 'All colors',   render: () => <AllColors /> },
        { id: 'all-sizes',    label: 'All sizes',     render: () => <AllSizes /> },
        { id: 'all-weights',  label: 'All weights',   render: () => <AllWeights /> },
      ]}
    />
  )
}
