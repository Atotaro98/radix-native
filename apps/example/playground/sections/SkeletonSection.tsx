import React from 'react'
import {
  Avatar, Badge, Blockquote, Box, Button, Card, Checkbox, Code, Flex, Grid, Heading, IconButton, Kbd, Link,
  RadioGroup, Skeleton, Switch, Text, TextArea, TextField,
} from 'radix-native'
import { ComponentSection } from '../ui'

/**
 * Radix playground sink/skeleton: the same form and components, loaded (left
 * column) and wrapped in Skeleton (right column), in Radix's order. Select,
 * Slider, Callout and Table join when they are implemented.
 */
function Showcase({ loading }: { loading: boolean }) {
  const S = ({ children }: { children: React.ReactNode }) => <Skeleton loading={loading}>{children}</Skeleton>
  return (
    <Box>
      <Card size={4}>
        <Flex gap={3}>
          <Grid gap={1}>
            <Text weight="bold"><S>Email</S></Text>
            <S><TextField variant="classic" placeholder="Your email" /></S>
          </Grid>
          <Grid gap={1}>
            <Text weight="bold"><S>Feedback</S></Text>
            <S><TextArea variant="classic" placeholder="Your feedback" /></S>
          </Grid>
          <Grid columns={2} gap={2}>
            <S><Button variant="surface">Back</Button></S>
            <S><Button variant="classic">Submit</Button></S>
          </Grid>
        </Flex>
      </Card>

      <Flex direction="row" gap={3} align="center" mt={6} wrap="wrap">
        <S><Avatar fallback="BG" /></S>
        <S><Badge size={2} color="green">New</Badge></S>
        <S><Button>Next {'→'}</Button></S>
        <S><Checkbox size={3} defaultChecked /></S>
        <S><Code>console.log()</Code></S>
        <S><IconButton accessibilityLabel="Star">{'★'}</IconButton></S>
        <S><Kbd>⌘ Q</Kbd></S>
        <S><Link onPress={() => {}}>This is a link</Link></S>
        <RadioGroup.Root defaultValue="value" size={3}>
          <S><RadioGroup.Item value="value" /></S>
        </RadioGroup.Root>
        <S><Switch defaultChecked /></S>
        <S><TextField placeholder="Your name" /></S>
        <S><TextArea placeholder="Your feedback" /></S>
        <S><Heading size={5}>Principles of the Typographic Craft</Heading></S>
        <S>
          <Blockquote size={2} color="gray">
            The goal of typography is to relate font size, line height, and line width in a proportional way that
            maximizes <Text highContrast>beauty</Text> and makes reading easier and more pleasant. The question is:
            What proportion(s) will give us the best results?
          </Blockquote>
        </S>
        <Box width="100%"><S><Card size={5} /></S></Box>
      </Flex>
    </Box>
  )
}

export function SkeletonSection() {
  return (
    <ComponentSection
      title="Skeleton"
      tabs={[
        { id: 'loaded', label: 'Loaded', render: () => <Showcase loading={false} /> },
        { id: 'skeleton', label: 'Skeleton', render: () => <Showcase loading /> },
      ]}
    />
  )
}
