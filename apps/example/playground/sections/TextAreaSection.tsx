import React from 'react'
import { TextArea, Flex, Text } from 'radix-native'
import type { TextAreaSize, TextAreaVariant } from 'radix-native'
import { ComponentSection } from '../ui'

const VARIANTS: TextAreaVariant[] = ['classic', 'surface', 'soft']
const SIZES: TextAreaSize[] = [1, 2, 3]

function Specimen() {
  return (
    <Flex gap={4}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={2}>
          <Text size={1} weight="bold" style={{ textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.5 }}>
            {variant}
          </Text>
          <TextArea variant={variant} placeholder={`${capitalize(variant)} text area — type here…`} />
        </Flex>
      ))}
    </Flex>
  )
}

function ThemeColors() {
  return (
    <Flex gap={3}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={2}>
          <Text size={2} weight="medium">{capitalize(variant)}</Text>
          <Flex gap={2}>
            <TextArea variant={variant} placeholder="Default" />
            <TextArea variant={variant} placeholder="Accent color" color="blue" />
            <TextArea variant={variant} placeholder="Gray color" color="gray" />
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}

function AllSizes() {
  return (
    <Flex gap={5}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={3}>
          <Text size={1} weight="bold" style={{ textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.5 }}>
            {variant}
          </Text>
          {SIZES.map(size => (
            <TextArea key={size} size={size} variant={variant} placeholder={`Size ${size}`} />
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

export function TextAreaSection() {
  return (
    <ComponentSection
      title="Text Area"
      tabs={[
        { id: 'example',  label: 'Example',  render: () => <Specimen /> },
        { id: 'theme-colors', label: 'Theme colors', render: () => <ThemeColors /> },
        { id: 'all-sizes', label: 'All sizes', render: () => <AllSizes /> },
      ]}
    />
  )
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
