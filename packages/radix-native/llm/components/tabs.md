# Tabs

> Set of layered sections of content, displayed one at a time.

## Import

```tsx
import { Tabs } from 'radix-native'
```

## Parts and props

- **Tabs.Root**: `value`, `defaultValue` (default `''`, nothing selected), `onValueChange`, `activationMode` (keyboard focus only; on touch a press selects), margins.
- **Tabs.List**: `size` (`1 | 2`, default 2: 32 / 40 tall), `wrap` (`'nowrap' | 'wrap' | 'wrap-reverse'`; without it the list scrolls sideways), `justify` (`'start' | 'center' | 'end'`), `color`, `highContrast`, margins.
- **Tabs.Trigger**: `value` (required), `disabled`.
- **Tabs.Content**: `value` (required), `forceMount` (keep it mounted, hidden), margins.

## Examples

```tsx
<Tabs.Root defaultValue="account">
  <Tabs.List>
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="documents">Documents</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Box pt={3}>
    <Tabs.Content value="account"><Text size={2}>Make changes to your account.</Text></Tabs.Content>
    <Tabs.Content value="documents"><Text size={2}>Access and update your documents.</Text></Tabs.Content>
    <Tabs.Content value="settings"><Text size={2}>Edit your profile or update contact information.</Text></Tabs.Content>
  </Box>
</Tabs.Root>
```

## Behaviour

- The active trigger is gray-12 with a medium label and a 2px accent-indicator bar (accent-12 high contrast); the bar appears instantly, without sliding, as in Radix.
- A hidden medium copy of each label keeps triggers from changing width.
- Only the selected content is mounted (Radix Presence), unless `forceMount`.
