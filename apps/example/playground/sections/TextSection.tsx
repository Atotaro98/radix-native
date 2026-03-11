import React from 'react'
import { Text, Button, Flex, useResolveColor } from 'radix-native'
import type { TextSize, TextWeight } from 'radix-native'
import { ComponentSection, LabeledRow } from '../ui'
import { ALL_COLORS, BODY_TEXT_LONG, BODY_TEXT_SHORT } from '../constants'

const SIZES: TextSize[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const WEIGHTS: TextWeight[] = ['light', 'regular', 'medium', 'bold']
const FOX = 'The quick brown fox jumps over the lazy dog'
// Radix uses "jumped" (past tense) in All sizes tab
const FOX_JUMPED = 'The quick brown fox jumped over the lazy dog'

// ─── Quick Look grid ────────────────────────────────────────────────────────

const QUICK_LOOK_PAIRS: { heading: TextSize; body: TextSize }[] = [
  { heading: 3, body: 2 },
  { heading: 2, body: 2 },
  { heading: 2, body: 1 },
  { heading: 1, body: 1 },
]

function QuickLookCard({ heading, body, weight, graySubtitle }: {
  heading: TextSize; body: TextSize; weight: TextWeight; graySubtitle?: boolean
}) {
  return (
    <Flex gapY={1}>
      <Text size={heading} weight={weight}>Quick Look</Text>
      <Text size={body} color={graySubtitle ? 'gray' : undefined}>{BODY_TEXT_SHORT}</Text>
    </Flex>
  )
}

function Specimen() {
  return (
    <Flex gapY={5}>
      {/* Paragraphs at decreasing sizes */}
      <Text size={5}>{BODY_TEXT_LONG}</Text>
      <Text size={4}>{BODY_TEXT_LONG}</Text>
      <Text size={3}>{BODY_TEXT_LONG}</Text>
      <Text size={2}>{BODY_TEXT_LONG}</Text>

      {/* Quick Look grids: left bold, right medium+gray */}
      <Flex direction="row" gapX={4}>
        <Flex style={{ flex: 1, rowGap: 20 }}>
          {QUICK_LOOK_PAIRS.map(({ heading, body }) => (
            <QuickLookCard key={`bold-${heading}-${body}`} heading={heading} body={body} weight="bold" />
          ))}
        </Flex>
        <Flex style={{ flex: 1, rowGap: 20 }}>
          {QUICK_LOOK_PAIRS.map(({ heading, body }) => (
            <QuickLookCard key={`med-${heading}-${body}`} heading={heading} body={body} weight="medium" graySubtitle />
          ))}
        </Flex>
      </Flex>

      {/* Button + Text combos (Radix: Button surface gray HC + "Opens in a new window") */}
      <Flex direction="row" wrap="wrap" gap={4}>
        <Flex align="center" gap={1}>
          <Button variant="surface" color="gray" highContrast size={1}>Quick Look</Button>
          <Text size={1} color="gray">Opens in a new window</Text>
        </Flex>
        <Flex align="center" gap={1}>
          <Button variant="surface" color="gray" highContrast size={2}>Quick Look</Button>
          <Text size={1} color="gray">Opens in a new window</Text>
        </Flex>
        <Flex align="center" gap={1}>
          <Button variant="surface" color="gray" highContrast size={2}>Quick Look</Button>
          <Text size={2} color="gray">Opens in a new window</Text>
        </Flex>
        <Flex align="center" gap={1}>
          <Button variant="surface" color="gray" highContrast size={3}>Quick Look</Button>
          <Text size={2} color="gray">Opens in a new window</Text>
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
        { id: 'specimen',    label: 'Specimen',    render: () => <Specimen /> },
        { id: 'all-colors',  label: 'All colors',  render: () => <AllColors /> },
        { id: 'all-sizes',   label: 'All sizes',   render: () => <AllSizes /> },
        { id: 'all-weights', label: 'All weights', render: () => <AllWeights /> },
      ]}
    />
  )
}
