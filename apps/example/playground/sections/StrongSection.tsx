import React from 'react'
import { Text, Strong, Box } from 'radix-native'
import { ComponentSection } from '../ui'

function Specimen() {
  return (
    <Box>
      <Text size={3}>
        {'The most important thing to remember is, '}
        <Strong>stay positive</Strong>
        {'.'}
      </Text>
    </Box>
  )
}

export function StrongSection() {
  return (
    <ComponentSection title="Strong">
      <Specimen />
    </ComponentSection>
  )
}
