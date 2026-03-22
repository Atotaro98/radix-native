import React from 'react'
import { ScrollView } from 'react-native'
import { TextField, Flex, Box, Text, useResolveColor } from 'radix-native'
import type { TextFieldSize, TextFieldVariant, AccentColor } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: TextFieldVariant[] = ['classic', 'surface', 'soft']
const SIZES: TextFieldSize[] = [1, 2, 3]

function ColHeader({ label, center }: { label: string; center?: boolean }) {
  const rc = useResolveColor()
  return (
    <Text size={1} weight="medium" style={{ color: rc('gray-9'), textAlign: center ? 'center' : undefined }}>
      {label}
    </Text>
  )
}

function RowLbl({ label }: { label: string }) {
  const rc = useResolveColor()
  return (
    <Box width={72} flexShrink={0}>
      <Text size={2} style={{ color: rc('gray-11') }}>{label}</Text>
    </Box>
  )
}

function Specimen() {
  return (
    <Flex gap={4}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={2}>
          <Text size={1} weight="bold" style={{ textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.5 }}>
            {variant}
          </Text>
          <TextField variant={variant} placeholder={`${capitalize(variant)} text field`} />
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
          <RowLbl label={capitalize(variant)} />
          <Flex gap={2}>
            <TextField variant={variant} placeholder="Default" />
            <TextField variant={variant} placeholder="Accent color" color="blue" />
            <TextField variant={variant} placeholder="Gray color" color="gray" />
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
            <TextField key={size} size={size} variant={variant} placeholder={`Size ${size}`} />
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

export function TextFieldSection() {
  return (
    <ComponentSection
      title="Text Field"
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
