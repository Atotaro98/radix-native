# TabNav

> Navigation menu with links styled as tabs.

## Import

```tsx
import { TabNav } from 'radix-native'
```

## Parts and props

- **TabNav.Root**: same as Tabs.List — `size`, `wrap`, `justify`, `color`, `highContrast`, margins; pass `accessibilityLabel` (Radix hard-codes "Main").
- **TabNav.Link**: `active` (default false), `onPress`. TabNav keeps no state: your router decides which link is active (Radix uses `href` / `asChild` for router links).

## Examples

```tsx
<TabNav.Root accessibilityLabel="Main">
  <TabNav.Link active={route === 'account'} onPress={() => navigate('account')}>Account</TabNav.Link>
  <TabNav.Link active={route === 'documents'} onPress={() => navigate('documents')}>Documents</TabNav.Link>
  <TabNav.Link active={route === 'settings'} onPress={() => navigate('settings')}>Settings</TabNav.Link>
</TabNav.Root>
```

Links are announced as links, the active one as selected (Radix `aria-current="page"`).
