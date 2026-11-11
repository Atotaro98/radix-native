import React from 'react'
import { Box, Code, Container, Text, useColor } from 'radix-native'
import { ComponentSection } from '../ui'

function Panel({ children }: { children: React.ReactNode }) {
  const bg = useColor('gray', 'panel')
  const border = useColor('gray-a4')
  return (
    <Box p={2} radius="small" style={{ backgroundColor: bg, borderWidth: 1, borderColor: border }}>
      <Text>{children}</Text>
    </Box>
  )
}

/** Radix playground sink/container: nested Containers keep their own size. */
function Nested() {
  return (
    <Box>
      <Text my={5}>
        <Code>size</Code> can be set on nested <Code>Container</Code> instances:
      </Text>
      <Container size={4}>
        <Panel>This should be size 4</Panel>
        <Container size={1}>
          <Panel>This should be size 1</Panel>
        </Container>
      </Container>
    </Box>
  )
}

export function ContainerSection() {
  return <ComponentSection title="Container" tabs={[{ id: 'nested', label: 'Nested', render: () => <Nested /> }]} />
}
