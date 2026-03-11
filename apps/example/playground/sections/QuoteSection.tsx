import React from 'react'
import { Text, Quote, Box } from 'radix-native'
import { ComponentSection } from '../ui'

function Specimen() {
  return (
    <Box style={{ rowGap: 20 }}>
      <Text size={4}>
        <Quote>{'A man who would letterspace lower case would steal sheep,'}</Quote>
        {' Frederic Goudy liked to say. The reason for not letterspacing lower case is that it hampers legibility. But there are some lowercase alphabets to which this principle doesn\u2019t apply. Moderate letterspacing can make a face such as lowercase Univers bold condensed more legible rather than less'}
      </Text>
    </Box>
  )
}

export function QuoteSection() {
  return (
    <ComponentSection title="Quote">
      <Specimen />
    </ComponentSection>
  )
}
