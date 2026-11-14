import React, { useContext } from 'react'
import {
  MenuCheckboxItem, MenuContent, MenuGroup, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuRoot,
  MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger,
  type MenuCheckboxItemProps, type MenuContentProps, type MenuItemProps, type MenuRadioGroupProps,
  type MenuRadioItemProps, type MenuSelectEvent, type MenuSize, type MenuSubProps, type MenuVariant,
} from '../internal/BaseMenu'
import { slot, useOverlayState, type OverlayStateProps, type SlotChild } from '../internal/overlayRoot'

export type {
  MenuCheckboxItemProps, MenuContentProps, MenuItemProps, MenuRadioGroupProps, MenuRadioItemProps, MenuSelectEvent,
  MenuSize, MenuSubProps, MenuVariant,
}

export interface DropdownMenuRootProps extends OverlayStateProps {
  children?: React.ReactNode
}

function DropdownMenuRoot({ children, ...state }: DropdownMenuRootProps) {
  return <MenuRoot.Provider value={useOverlayState(state)}>{children}</MenuRoot.Provider>
}
DropdownMenuRoot.displayName = 'DropdownMenu.Root'

/** One element; its `onPress` toggles the menu, and it is the anchor. */
function DropdownMenuTrigger({ children }: { children: SlotChild }) {
  const root = useContext(MenuRoot.Context)
  if (!root) throw new Error('DropdownMenu.Trigger must be used within DropdownMenu.Root')
  return slot(children, { onPress: () => root.setOpen(!root.open) }, root.anchor)
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
