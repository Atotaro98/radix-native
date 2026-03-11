import React from 'react'
import { Heading, Text, Flex, useResolveColor } from 'radix-native'
import type { HeadingSize, TextWeight } from 'radix-native'
import { ComponentSection, LabeledRow } from '../ui'
import { ALL_COLORS, HEADING_TEXT, BODY_TEXT } from '../constants'

const SIZES: HeadingSize[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const WEIGHTS: TextWeight[] = ['light', 'regular', 'medium', 'bold']
const FOX = 'The quick brown fox jumps over the lazy dog'

function Specimen() {
  return (
    <Flex gapY={6}>
      <Heading size={9}>{HEADING_TEXT}</Heading>
      <Flex gapY={5}>
        <Flex gapY={2}>
          <Heading size={5}>{HEADING_TEXT}</Heading>
          <Text size={3}>{BODY_TEXT}</Text>
        </Flex>
        <Flex gapY={2}>
          <Heading size={4}>{HEADING_TEXT}</Heading>
          <Text size={3}>{BODY_TEXT}</Text>
        </Flex>
        <Flex gapY={2}>
          <Heading size={3}>{HEADING_TEXT}</Heading>
          <Text size={2}>{BODY_TEXT}</Text>
        </Flex>
        <Flex gapY={2}>
          <Heading size={2}>{HEADING_TEXT}</Heading>
          <Text size={1}>{BODY_TEXT}</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

function AllColors() {
  const rc = useResolveColor()
  return (
    <Flex gapY={3}>
      {ALL_COLORS.map(color => (
        <Flex key={color} direction="row" align="center" gapX={3}>
          <Text size={1} style={{ width: 56, flexShrink: 0, color: rc('gray-9') }}>
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
        { id: 'specimen',    label: 'Specimen',    render: () => <Specimen /> },
        { id: 'all-colors',  label: 'All colors',  render: () => <AllColors /> },
        { id: 'all-sizes',   label: 'All sizes',   render: () => <AllSizes /> },
        { id: 'all-weights', label: 'All weights', render: () => <AllWeights /> },
      ]}
    />
  )
}
