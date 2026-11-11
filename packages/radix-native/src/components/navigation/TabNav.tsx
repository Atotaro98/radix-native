import React from 'react'
import type { GestureResponderEvent } from 'react-native'
import { BaseTabList, BaseTabTrigger, type BaseTabListProps } from '../internal/BaseTabList'
import type { NativeViewProps } from '../../types/nativeProps'

export type TabNavRootProps = BaseTabListProps

export interface TabNavLinkProps extends Omit<NativeViewProps, 'children'> {
  /** Marks the link of the current page. TabNav keeps no state: your router decides. */
  active?: boolean
  onPress?: (e: GestureResponderEvent) => void
  children?: React.ReactNode
}

/**
 * Navigation menu with links styled as tabs, like Radix Themes `TabNav`: the
 * same tab list as Tabs, but each Link only shows whether it is `active` and
 * calls `onPress` — routing stays with your router (Radix uses `href` / `asChild`).
 */
function TabNavRoot(props: TabNavRootProps) {
  return <BaseTabList {...props} />
}
TabNavRoot.displayName = 'TabNav.Root'

function TabNavLink({ active = false, onPress, ...rest }: TabNavLinkProps) {
  return <BaseTabTrigger role="link" active={active} onPress={onPress} {...rest} />
}
TabNavLink.displayName = 'TabNav.Link'

export const TabNav = Object.assign(TabNavRoot, {
  Root: TabNavRoot,
  Link: TabNavLink,
})
