import React, { useContext } from 'react'
import { Pressable } from 'react-native'
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import {
  MenuCheckboxItem, MenuContent, MenuGroup, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuRootContext,
  MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, useMenuRoot, type MenuContentProps,
} from '../internal/BaseMenu'

export interface ContextMenuRootProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export interface ContextMenuTriggerProps {
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  testID?: string
  children?: React.ReactNode
}

// Radix's touch long-press opens the menu after 700ms
const LONG_PRESS_MS = 700

function ContextMenuRoot({ children, ...state }: ContextMenuRootProps) {
  const root = useMenuRoot(state)
  return <MenuRootContext.Provider value={root}>{children}</MenuRootContext.Provider>
}
ContextMenuRoot.displayName = 'ContextMenu.Root'

/**
 * The area that opens the menu. Radix opens it with a right click, or a 700ms
 * touch long-press at the touch point — here the long-press, anchored to where
 * the finger is. Screen readers get an "Open menu" action.
 */
function ContextMenuTrigger({ disabled, style, testID, children }: ContextMenuTriggerProps) {
  const root = useContext(MenuRootContext)
  if (!root) throw new Error('ContextMenu.Trigger must be used within ContextMenu.Root')
  const openAt = (x: number, y: number) => {
    root.anchor.current = { x, y, width: 0, height: 0 }
    root.setOpen(true)
  }
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      delayLongPress={LONG_PRESS_MS}
      onLongPress={(e: GestureResponderEvent) => openAt(e.nativeEvent.pageX, e.nativeEvent.pageY)}
      accessibilityActions={disabled ? [] : [{ name: 'longpress', label: 'Open menu' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'longpress') openAt(0, 0)
      }}
      style={style}
    >
      {children}
    </Pressable>
  )
}
ContextMenuTrigger.displayName = 'ContextMenu.Trigger'

/** At the touch point, to its right, the first item at the finger (Radix: right / start / 2 / −4·size). */
function ContextMenuContent({ size = 2, ...props }: MenuContentProps) {
  return <MenuContent side="right" sideOffset={2} align="start" alignOffset={-4 * size} size={size} {...props} />
}
ContextMenuContent.displayName = 'ContextMenu.Content'

/** DropdownMenu with a long-press trigger at the touch point, like Radix Themes `ContextMenu`. */
export const ContextMenu = Object.assign(ContextMenuRoot, {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Label: MenuLabel,
  Group: MenuGroup,
  Separator: MenuSeparator,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
})
