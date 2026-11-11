# AlertDialog

> Modal confirmation dialog that interrupts the user and expects a response.

## Import

```tsx
import { AlertDialog } from 'radix-native'
```

Same parts and props as [Dialog](dialog.md), with **Action** and **Cancel** instead of Close. Differences:

- A backdrop press does nothing; the Android back button still closes it (Radix: Escape).
- Announced as an alert.

## Examples

```tsx
<AlertDialog.Root>
  <AlertDialog.Trigger><Button color="red">Revoke access</Button></AlertDialog.Trigger>
  <AlertDialog.Content maxWidth={450}>
    <AlertDialog.Title>Revoke access</AlertDialog.Title>
    <AlertDialog.Description size={2}>Are you sure? This application will no longer be accessible.</AlertDialog.Description>
    <Flex direction="row" gap={3} mt={4} justify="end">
      <AlertDialog.Cancel><Button variant="soft" color="gray">Cancel</Button></AlertDialog.Cancel>
      <AlertDialog.Action><Button variant="solid" color="red" onPress={revoke}>Revoke access</Button></AlertDialog.Action>
    </Flex>
  </AlertDialog.Content>
</AlertDialog.Root>
```
