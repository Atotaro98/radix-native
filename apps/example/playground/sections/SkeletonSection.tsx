import React from 'react'
import {
  Skeleton,
  Card,
  Flex,
  Box,
  Heading,
  Text,
  TextField,
  Button,
  Link,
} from 'radix-native'
import { ComponentSection } from '../ui'

function SignInCard({ loading }: { loading: boolean }) {
  return (
    <Card variant="classic" size={4}>
      <Box height={40} mb={4}>
        <Heading size={6} mt={-1}>
          <Skeleton loading={loading}>Sign in</Skeleton>
        </Heading>
      </Box>

      <Box mb={5}>
        <Flex direction="column">
          <Text size={2} weight="medium" mb={2}>
            <Skeleton loading={loading}>Email address</Skeleton>
          </Text>
          <Skeleton loading={loading}>
            <TextField variant="classic" placeholder="Enter your email" />
          </Skeleton>
        </Flex>
      </Box>

      <Box mb={5}>
        <Box style={{ position: 'absolute', top: 0, right: 0, marginTop: -2 }}>
          {loading ? (
            <Text size={2}>
              <Skeleton loading>Forgot password?</Skeleton>
            </Text>
          ) : (
            <Link size={2}>Forgot password?</Link>
          )}
        </Box>

        <Flex direction="column">
          <Text size={2} weight="medium" mb={2}>
            <Skeleton loading={loading}>Password</Skeleton>
          </Text>
          <Skeleton loading={loading}>
            <TextField variant="classic" placeholder="Enter your password" />
          </Skeleton>
        </Flex>
      </Box>

      <Flex mt={6} justify="end" gap={3} direction="row">
        <Skeleton loading={loading}>
          <Button variant="surface" highContrast color="gray">
            Create an account
          </Button>
        </Skeleton>
        <Skeleton loading={loading}>
          <Button variant="solid">Sign in</Button>
        </Skeleton>
      </Flex>
    </Card>
  )
}

export function SkeletonSection() {
  return (
    <ComponentSection title="Skeleton">
      <Flex gap={5} direction="column">
        {[false, true].map((isLoading, i) => (
          <SignInCard key={i} loading={isLoading} />
        ))}
      </Flex>
    </ComponentSection>
  )
}
