import React from 'react'
import { Heading, Text, Flex, useColor } from 'radix-native'
import type { HeadingSize, TextWeight } from 'radix-native'
import { ComponentSection, LabeledRow } from '../ui'
import { ALL_COLORS } from '../constants'

const SIZES: HeadingSize[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const WEIGHTS: TextWeight[] = ['light', 'regular', 'medium', 'bold']
const FOX = 'The quick brown fox jumps over the lazy dog'

function AllColors() {
  const gray9 = useColor('gray-9')
  return (
    <Flex gapY={3}>
      {ALL_COLORS.map(color => (
        <Flex key={color} direction="row" align="center" gapX={3}>
          <Text size={1} style={{ width: 56, flexShrink: 0, color: gray9 }}>
            {color.charAt(0).toUpperCase() + color.slice(1)}
          </Text>
          <Flex gapY={0} style={{ flex: 1, rowGap: 2 }}>
            <Heading size={4} color={color}>{FOX}</Heading>
            <Heading size={4} color={color} highContrast>{FOX}</Heading>
          </Flex>
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
          <Heading size={size}>{FOX}</Heading>
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
          <Heading size={5} weight={weight}>{FOX}</Heading>
        </LabeledRow>
      ))}
    </Flex>
  )
}

export function HeadingSection() {
  return (
    <ComponentSection
      title="Heading"
      tabs={[
        { id: 'all-colors',  label: 'All colors',  render: () => <AllColors /> },
        { id: 'all-sizes',   label: 'All sizes',   render: () => <AllSizes /> },
        { id: 'all-weights', label: 'All weights', render: () => <AllWeights /> },
      ]}
    />
  )
}
