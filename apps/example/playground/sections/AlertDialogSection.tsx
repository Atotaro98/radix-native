import React from 'react'
import { AlertDialog, Button, Flex } from 'radix-native'
import { ComponentSection } from '../ui'

/** Radix playground sink/alert-dialog. */
function Playground() {
  return (
    <AlertDialog.Root>
      <Flex direction="row"><AlertDialog.Trigger><Button variant="solid">Open</Button></AlertDialog.Trigger></Flex>
      <AlertDialog.Content maxWidth={450}>
        <Flex gap={3}>
          <AlertDialog.Title mb={0}>Revoke setup link</AlertDialog.Title>
          <AlertDialog.Description>
            The setup link will no longer be accessible and any existing setup sessions will be revoked.
          </AlertDialog.Description>
          <Flex direction="row" gap={3} mt={4} justify="end">
            <AlertDialog.Cancel><Button variant="soft" color="gray">Cancel</Button></AlertDialog.Cancel>
            <AlertDialog.Action><Button variant="solid" color="red">Revoke link</Button></AlertDialog.Action>
          </Flex>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}

export function AlertDialogSection() {
  return <ComponentSection title="AlertDialog" tabs={[{ id: 'playground', label: 'Example', render: () => <Playground /> }]} />
}
