import React from 'react'
import { Text, Flex, useColor } from 'radix-native'
import type { TextSize, TextWeight } from 'radix-native'
import { ComponentSection, LabeledRow } from '../ui'
import { ALL_COLORS } from '../constants'

const SIZES: TextSize[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const WEIGHTS: TextWeight[] = ['light', 'regular', 'medium', 'bold']
const FOX = 'The quick brown fox jumps over the lazy dog'
// Radix uses "jumped" (past tense) in All sizes tab
const FOX_JUMPED = 'The quick brown fox jumped over the lazy dog'

function AllColors() {
  const gray9 = useColor('gray-9')
  return (
    <Flex gapY={3}>
      {ALL_COLORS.map(color => (
        <Flex key={color} direction="row" align="center" gapX={3}>
          <Text size={1} style={{ width: 56, flexShrink: 0, color: gray9 }}>
            {color.charAt(0).toUpperCase() + color.slice(1)}
          </Text>
          <Text size={3} color={color} style={{ flex: 1 }}>{FOX}</Text>
          <Text size={3} color={color} highContrast style={{ flex: 1 }}>{FOX}</Text>
        </Flex>
      ))}
    </Flex>
  )
}

function AllSizes() {
  return (
    <Flex gapY={3}>
      {SIZES.map(size => (
        <LabeledRow key={size} label={`Size ${size}`} labelWidth={48}>
          <Text size={size}>{FOX_JUMPED}</Text>
        </LabeledRow>
      ))}
    </Flex>
  )
}

function AllWeights() {
  return (
    <Flex gapY={3}>
      {WEIGHTS.map(weight => (
        <LabeledRow key={weight} label={weight.charAt(0).toUpperCase() + weight.slice(1)}>
          <Text size={3} weight={weight}>{FOX}</Text>
        </LabeledRow>
      ))}
    </Flex>
  )
}

export function TextSection() {
  return (
    <ComponentSection
      title="Text"
      tabs={[
        { id: 'all-colors',  label: 'All colors',  render: () => <AllColors /> },
        { id: 'all-sizes',   label: 'All sizes',   render: () => <AllSizes /> },
        { id: 'all-weights', label: 'All weights', render: () => <AllWeights /> },
      ]}
    />
  )
}
