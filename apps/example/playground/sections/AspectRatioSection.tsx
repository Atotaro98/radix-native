import React from 'react'
import { AspectRatio, Box, Grid, Text, useColor } from 'radix-native'
import { ComponentSection, Photo } from '../ui'

// Radix playground sink/aspect-ratio, in its order
const RATIOS: [string, number | undefined][] = [['1x2', 1 / 2], ['1x1', undefined], ['16x9', 16 / 9], ['2x1', 2 / 1]]

function Ratios() {
  const gray = useColor('gray-11')
  return (
    <Grid columns={4} gap={5}>
      {RATIOS.map(([label, ratio]) => (
        <Box key={label}>
          <Text size={1} mb={2} style={{ color: gray }}>{label}</Text>
          <AspectRatio ratio={ratio}>
            <Photo radius={4} />
          </AspectRatio>
        </Box>
      ))}
    </Grid>
  )
}

export function AspectRatioSection() {
  return <ComponentSection title="AspectRatio" tabs={[{ id: 'ratios', label: 'Ratios', render: () => <Ratios /> }]} />
}
