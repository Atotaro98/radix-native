import React, { useContext } from 'react'
import {
  MenuCheckboxItem, MenuContent, MenuGroup, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuRootContext,
  MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, useMenuRoot,
  type MenuCheckboxItemProps, type MenuContentProps, type MenuItemProps, type MenuRadioGroupProps,
  type MenuRadioItemProps, type MenuSelectEvent, type MenuSize, type MenuSubProps, type MenuVariant,
} from '../internal/BaseMenu'
import { anchorSlot, type SlotChild } from '../internal/anchorSlot'
import type { Measurable } from '../internal/AnchoredContent'

export type {
  MenuCheckboxItemProps, MenuContentProps, MenuItemProps, MenuRadioGroupProps, MenuRadioItemProps, MenuSelectEvent,
  MenuSize, MenuSubProps, MenuVariant,
}

export interface DropdownMenuRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

function DropdownMenuRoot({ children, ...state }: DropdownMenuRootProps) {
  const root = useMenuRoot(state)
  return <MenuRootContext.Provider value={root}>{children}</MenuRootContext.Provider>
}
DropdownMenuRoot.displayName = 'DropdownMenu.Root'

/** One element; its `onPress` toggles the menu, and it is the anchor. */
function DropdownMenuTrigger({ children }: { children: SlotChild }) {
  const root = useContext(MenuRootContext)
  if (!root) throw new Error('DropdownMenu.Trigger must be used within DropdownMenu.Root')
  return anchorSlot(children, root.anchor as React.MutableRefObject<Measurable | null>, { onPress: () => root.setOpen(!root.open) })
}
DropdownMenuTrigger.displayName = 'DropdownMenu.Trigger'

/** Below the trigger, aligned to its start, 4px away (Radix Themes). */
function DropdownMenuContent(props: MenuContentProps) {
  return <MenuContent side="bottom" sideOffset={4} align="start" {...props} />
}
DropdownMenuContent.displayName = 'DropdownMenu.Content'

/**
 * Menu of actions or options opened from a button, like Radix Themes
 * `DropdownMenu`: solid / soft highlight, sizes 1 / 2, items, checkbox and radio
 * items, labels, groups, separators and sub-menus.
 */
export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
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
