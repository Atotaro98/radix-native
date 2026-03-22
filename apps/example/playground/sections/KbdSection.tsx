import React from 'react'
import { Kbd, Flex } from 'radix-native'
import type { FontSizeToken } from 'radix-native'
import { ComponentSection, LabeledRow } from '../ui'

const SIZES: FontSizeToken[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

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
        { id: 'all-sizes', label: 'All sizes', render: () => <AllSizes /> },
      ]}
    />
  )
}
