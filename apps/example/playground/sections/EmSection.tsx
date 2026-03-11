import React from 'react'
import { Text, Em, Box } from 'radix-native'
import { ComponentSection } from '../ui'

function Specimen() {
  return (
    <Box>
      <Text size={3}>
        {'Versions of the '}
        <Em>Lorem ipsum</Em>
        {' text have been used in typesetting at least since the 1960s, when it was popularized by advertisements for Letraset transfer sheets. It is typically a corrupted version of '}
        <Em>De finibus bonorum et malorum</Em>
        {', a 1st-century BC text by the Roman statesman and philosopher Cicero, with words altered, added, and removed to make it nonsensical and improper Latin.'}
      </Text>
    </Box>
  )
}

export function EmSection() {
  return (
    <ComponentSection title="Em">
      <Specimen />
    </ComponentSection>
  )
}
