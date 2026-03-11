import React from 'react'
import { Kbd, Text, Flex } from 'radix-native'
import type { FontSizeToken } from 'radix-native'
import { ComponentSection, LabeledRow } from '../ui'

const SIZES: FontSizeToken[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

// ─── Specimen (Radix: 4 inline paragraphs at sizes 2-5) ─────────────────────

function Specimen() {
  return (
    <Flex direction="column" gapY={4}>
      {([2, 3, 4, 5] as FontSizeToken[]).map(size => (
        <Text key={size} size={size}>
          {'Press '}
          <Kbd size={size}>⌘ C</Kbd>
          {' to show/hide the Theme Panel, or press '}
          <Kbd size={size}>⌘ D</Kbd>
          {' to toggle dark mode.'}
        </Text>
      ))}
    </Flex>
  )
}

// ─── All sizes (Radix: "⌥ J") ───────────────────────────────────────────────

function AllSizes() {
  return (
    <Flex direction="column" gapY={4}>
      {SIZES.map(size => (
        <LabeledRow key={size} label={`Size ${size}`} labelWidth={80}>
          <Kbd size={size}>⌥ J</Kbd>
        </LabeledRow>
      ))}
    </Flex>
  )
}

export function KbdSection() {
  return (
    <ComponentSection
      title="Kbd"
      tabs={[
        { id: 'specimen',  label: 'Specimen',  render: () => <Specimen /> },
        { id: 'all-sizes', label: 'All sizes', render: () => <AllSizes /> },
      ]}
    />
  )
}
