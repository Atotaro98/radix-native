import React from 'react'
import { Box, Section, useColor } from 'radix-native'
import { ComponentSection } from '../ui'

/** Radix docs: `<Box py="8" gray-a2 radius-3><DecorativeBox asChild><Section size="2" /></DecorativeBox></Box>`. */
function Docs() {
  const border = useColor('gray-a5')
  return (
    <Box py={8} bg="gray-a2" radius="medium">
      <Section size={2} bg="gray-a3" style={{ borderWidth: 1, borderColor: border }} />
    </Box>
  )
}

export function SectionSection() {
  return <ComponentSection title="Section" tabs={[{ id: 'docs', label: 'Example', render: () => <Docs /> }]} />
}
