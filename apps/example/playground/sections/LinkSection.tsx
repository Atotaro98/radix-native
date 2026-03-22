import React from 'react'
import { Text, Link, Flex, useResolveColor } from 'radix-native'
import type { TextSize, TextWeight, LinkUnderline } from 'radix-native'
import { ComponentSection, LabeledRow, RowLabel } from '../ui'
import { ALL_COLORS } from '../constants'

const SIZES: TextSize[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const WEIGHTS: TextWeight[] = ['light', 'regular', 'medium', 'bold']

function InlineParagraph({ size, gray, underline }: { size: TextSize; gray?: boolean; underline?: LinkUnderline }) {
  const color = gray ? 'gray' : undefined
  return (
    <Text size={size} color={color}>
      {'Susan Kare is an American artist and '}
      <Link size={size} color={color} underline={underline}>graphic designer</Link>
      {', who contributed '}
      <Link size={size} color={color} underline={underline}>interface</Link>
      {' elements and '}
      <Link size={size} color={color} underline={underline}>typefaces</Link>
      {' for the first '}
      <Link size={size} color={color} underline={underline}>Apple Macintosh</Link>
      {' personal computer from 1983 to 1986.'}
    </Text>
  )
}

function Specimen() {
  return (
    <Flex direction="row" gapX={4}>
      {/* Accent column */}
      <Flex gapY={4} style={{ flex: 1 }}>
        <RowLabel label="Accent" />
        <InlineParagraph size={4} />
        <InlineParagraph size={3} />
        <InlineParagraph size={2} />
      </Flex>
      {/* Gray column — underline="always" so gray links are distinguishable inline */}
      <Flex gapY={4} style={{ flex: 1 }}>
        <RowLabel label="Gray" />
        <InlineParagraph size={4} gray underline="always" />
        <InlineParagraph size={3} gray underline="always" />
        <InlineParagraph size={2} gray underline="always" />
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
          <Link size={3} color={color}>Radix Themes</Link>
          <Link size={3} color={color} highContrast>Radix Themes</Link>
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
          <Link size={size}>Radix Themes</Link>
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
          <Link size={3} weight={weight}>Radix Themes</Link>
        </LabeledRow>
      ))}
    </Flex>
  )
}

export function LinkSection() {
  return (
    <ComponentSection
      title="Link"
      tabs={[
        { id: 'example',     label: 'Example',     render: () => <Specimen /> },
        { id: 'all-colors',  label: 'All colors',  render: () => <AllColors /> },
        { id: 'all-sizes',   label: 'All sizes',   render: () => <AllSizes /> },
        { id: 'all-weights', label: 'All weights', render: () => <AllWeights /> },
      ]}
    />
  )
}
