import React from 'react'
import { AspectRatio, Box, Code, Em, Kbd, Quote, ScrollArea, Strong, Text, useColor } from 'radix-native'
import { ComponentSection, PhotoPlaceholder } from '../ui'

/** Radix playground sink/scroll-area: a 300 × 350 area scrolling both ways over wide and tall content. */
function Both() {
  const accent3 = useColor('accent-3')
  return (
    <Box width={300} height={350} mb={6}>
      <ScrollArea>
        <Box mb={3} style={{ height: 200, width: 600, backgroundColor: accent3 }} />
        <Box width={300}>
          <Text>
            The goal of typography is to relate font size, line height, and line width in a proportional way that
            maximizes beauty and makes reading easier and more pleasant. The question is: What proportion(s) will give
            us the best results? The golden ratio is often observed in nature where beauty and utility intersect;
            perhaps we can use this &quot;divine&quot; proportion to enhance these attributes in our typography.
          </Text>
          <Box my={3}>
            <AspectRatio ratio={16 / 9}><PhotoPlaceholder /></AspectRatio>
          </Box>
          <Text size={3}>
            The CSS rule <Code>-webkit-font-smoothing: antialiased;</Code> has been applied to all fonts.google.com
            pages where fonts are rendered. This results in browsers using the <Strong>greyscale antialiasing
            method</Strong> rather than default <Em>subpixel rendering</Em> of fonts. Press <Kbd>⌘ Q</Kbd> to quit.{' '}
            <Quote>I believe this was probably introduced to get around inconsistencies in rendering between browsers</Quote>,
            particular between Chrome and Safari on MacOS.
          </Text>
          <Box mt={3}>
            <AspectRatio ratio={1}><PhotoPlaceholder /></AspectRatio>
          </Box>
        </Box>
      </ScrollArea>
    </Box>
  )
}

/** One axis only: the omitted axis doesn't scroll (Radix `scrollbars`). */
function Axes() {
  const accent3 = useColor('accent-3')
  return (
    <Box>
      <Text size={1}>scrollbars="vertical"</Text>
      <Box height={120} my={2}>
        <ScrollArea scrollbars="vertical" type="always">
          <Box style={{ height: 400, backgroundColor: accent3 }} />
        </ScrollArea>
      </Box>
      <Text size={1}>scrollbars="horizontal"</Text>
      <Box height={80} my={2}>
        <ScrollArea scrollbars="horizontal" type="always">
          <Box style={{ height: 80, width: 900, backgroundColor: accent3 }} />
        </ScrollArea>
      </Box>
    </Box>
  )
}

export function ScrollAreaSection() {
  return (
    <ComponentSection
      title="ScrollArea"
      tabs={[
        { id: 'both', label: 'Both', render: () => <Both /> },
        { id: 'axes', label: 'Axes', render: () => <Axes /> },
      ]}
    />
  )
}
