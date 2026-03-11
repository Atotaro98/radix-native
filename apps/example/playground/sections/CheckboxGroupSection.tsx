import React from 'react'
import { CheckboxGroup, Flex } from 'radix-native'
import type { CheckboxSize } from 'radix-native'
import { ComponentSection } from '../ui'

const SIZES: CheckboxSize[] = [1, 2, 3]

export function CheckboxGroupSection() {
  return (
    <ComponentSection title="Checkbox Group">
      <Flex direction="column" style={{ gap: 20 }}>
        {SIZES.map(size => (
          <CheckboxGroup.Root key={size} defaultValue={['1']} size={size}>
            <CheckboxGroup.Item value="1">Agree to Terms and Conditions</CheckboxGroup.Item>
            <CheckboxGroup.Item value="2">Agree to Privacy Policy</CheckboxGroup.Item>
          </CheckboxGroup.Root>
        ))}
      </Flex>
    </ComponentSection>
  )
}
